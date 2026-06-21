import React, { useState, useEffect } from "react";
import MobileFrame from "./components/MobileFrame";
import HomeScreen from "./components/HomeScreen";
import MoodSelectScreen from "./components/MoodSelectScreen";
import ResultsScreen from "./components/ResultsScreen";
import FavoritesScreen from "./components/FavoritesScreen";
import { ACTIVE_SCREEN, Recommendation, SearchPreferences, MoodType } from "./types";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ACTIVE_SCREEN>("home");
  const [favorites, setFavorites] = useState<Recommendation[]>(() => {
    try {
      const saved = localStorage.getItem("moodmap_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Location statuses: prompt, requesting, granted, denied
  const [locationState, setLocationState] = useState<"prompt" | "requesting" | "granted" | "denied">("prompt");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedArea, setResolvedArea] = useState<string>("San Francisco, CA");
  const [customLocation, setCustomLocation] = useState<string>("");

  // Search execution states
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<MoodType>("relaxed");

  const [searchPrefs, setSearchPrefs] = useState<SearchPreferences>({
    mood: "relaxed",
    budget: "Any",
    maxDistance: 10,
    locationPref: "Any",
    timeAvailable: "Any",
    customLocation: ""
  });

  // Sync favorites back to localStorage
  useEffect(() => {
    localStorage.setItem("moodmap_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Attempt to read current approximate location on mount
  useEffect(() => {
    requestBrowserLocation(true); // silent initial check
  }, []);

  const requestBrowserLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setErrorMessage("Geolocation API is not supported by this browser.");
      setLocationState("denied");
      return;
    }

    if (!silent) {
      setLocationState("requesting");
      setErrorMessage(null);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationState("granted");
        setErrorMessage(null);
        
        // Approximate city name mapping for immediate UX clarity
        if (lat && lng) {
          getApproxCity(lat, lng);
        }
      },
      (err) => {
        console.warn("Geolocation request failed / blocked by frame sandbox:", err.message);
        if (!silent) {
          setErrorMessage("Location permission was denied or couldn't be resolved in the sandboxed preview frame.");
        }
        setLocationState("denied");
      },
      { timeout: 7000 }
    );
  };

  const getApproxCity = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: {
          "User-Agent": "MoodMapAI/1.0"
        }
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const neighborhood = addr.neighborhood || addr.suburb || addr.village || "";
        const city = addr.city || addr.town || addr.municipality || "";
        const state = addr.state || "";
        
        const parts = [neighborhood, city, state].filter(Boolean);
        const name = parts.slice(0, 2).join(", ") || data.display_name;
        if (name) {
          setResolvedArea(name);
        }
      }
    } catch {
      // Keep existing coordinates text
      setResolvedArea(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
    }
  };

  const handleSelectPreset = (name: string, lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setResolvedArea(name);
    setCustomLocation(""); // clear custom input to prioritize preset coordinates
    setLocationState("granted");
  };

  const executeAIRecommendation = async (prefs: SearchPreferences) => {
    setSearchPrefs(prefs);
    setCurrentMood(prefs.mood);
    setIsLoading(true);
    setError(null);
    setActiveScreen("results");

    try {
      // Use customLocation typed input if provided, else use lat/lng coordinates
      const finalCustomLoc = customLocation.trim() || prefs.customLocation;
      
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude,
          mood: prefs.mood,
          budget: prefs.budget,
          maxDistance: prefs.maxDistance,
          locationPref: prefs.locationPref,
          timeAvailable: prefs.timeAvailable,
          customLocation: finalCustomLoc
        })
      });

      const data = await response.json();
      if (data.success) {
        // Assign unique IDs to recommendation objects for React render keys / favorites toggle
        const mapped = (data.recommendations || []).map((item: any, idx: number) => ({
          ...item,
          id: item.id || `rec-${item.name.replace(/\s+/g, "-").toLowerCase()}`
        }));
        setRecommendations(mapped);
        if (data.resolvedArea) {
          setResolvedArea(data.resolvedArea);
        }
      } else {
        throw new Error(data.message || "Failed to retrieve local matches.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong compiling places of interest.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (rec: Recommendation) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.name.toLowerCase() === rec.name.toLowerCase());
      if (exists) {
        return prev.filter((f) => f.name.toLowerCase() !== rec.name.toLowerCase());
      } else {
        return [...prev, rec];
      }
    });
  };

  return (
    <MobileFrame
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
      favoritesCount={favorites.length}
    >
      {activeScreen === "home" && (
        <HomeScreen
          latitude={latitude}
          longitude={longitude}
          locationState={locationState}
          errorMessage={errorMessage}
          resolvedArea={customLocation ? customLocation : resolvedArea}
          onRequestLocation={() => requestBrowserLocation(false)}
          onSelectScreen={setActiveScreen}
          customLocation={customLocation}
          setCustomLocation={(val) => {
            setCustomLocation(val);
            if (val) {
              setResolvedArea(val);
            }
          }}
          onSelectPreset={handleSelectPreset}
        />
      )}

      {activeScreen === "mood-select" && (
        <MoodSelectScreen
          onBack={() => setActiveScreen("home")}
          onSearch={executeAIRecommendation}
          initialPrefs={{
            ...searchPrefs,
            customLocation: customLocation
          }}
        />
      )}

      {activeScreen === "results" && (
        <ResultsScreen
          isLoading={isLoading}
          recommendations={recommendations}
          error={error}
          selectedMood={currentMood}
          resolvedArea={resolvedArea}
          onBack={() => setActiveScreen("mood-select")}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
          onRetry={() => executeAIRecommendation(searchPrefs)}
        />
      )}

      {activeScreen === "favorites" && (
        <FavoritesScreen
          favorites={favorites}
          onRemoveFavorite={handleToggleFavorite}
          onBack={() => setActiveScreen("home")}
        />
      )}
    </MobileFrame>
  );
}
