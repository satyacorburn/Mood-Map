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
  const [isAutoSearching, setIsAutoSearching] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<MoodType>("relaxed");
  const [initialSelectedRec, setInitialSelectedRec] = useState<Recommendation | null>(null);

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

  // Trigger automatic nearby search when a location is first resolved
  useEffect(() => {
    if (!hasAutoSearched && (latitude || customLocation || resolvedArea) && resolvedArea !== "San Francisco, CA") {
      setHasAutoSearched(true);
      executeAutoSearch(resolvedArea, latitude, longitude);
    }
  }, [latitude, longitude, resolvedArea, customLocation, hasAutoSearched]);

  const fetchIPLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.city && data.latitude && data.longitude) {
          const area = `${data.city}, ${data.region_code || data.region || ""}`;
          setLatitude(data.latitude);
          setLongitude(data.longitude);
          setResolvedArea(area);
          setLocationState("granted");
          setErrorMessage(null);
          return true;
        }
      }
    } catch (err) {
      console.warn("IP geolocation fallback failed:", err);
    }
    return false;
  };

  const requestBrowserLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setErrorMessage("Geolocation API is not supported by this browser. Attempting network location fallback...");
      setLocationState("denied");
      fetchIPLocation();
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
      async (err) => {
        console.warn("Geolocation request failed / blocked by frame sandbox:", err.message);
        // Fallback to IP-based location automatically in case of GPS blocks
        const success = await fetchIPLocation();
        if (!success) {
          if (!silent) {
            setErrorMessage("Location permission was denied. Defaulting to standard manual location.");
          }
          setLocationState("denied");
        }
      },
      { timeout: 5000 }
    );
  };

  const executeAutoSearch = async (area: string, lat: number | null, lng: number | null) => {
    setIsAutoSearching(true);
    try {
      const now = new Date();
      const userLocalTime = now.toLocaleString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });
      const userLocalHour = now.getHours();

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: lat,
          lng: lng,
          mood: "relaxed", // default mood for automatic discovery
          budget: "Any",
          maxDistance: 10,
          locationPref: "Any",
          timeAvailable: "Any",
          customLocation: area,
          userLocalTime,
          userLocalHour
        })
      });

      const data = await response.json();
      if (data.success) {
        const mapped = (data.recommendations || []).map((item: any, idx: number) => ({
          ...item,
          id: item.id || `rec-${item.name.replace(/\s+/g, "-").toLowerCase()}`
        }));
        setRecommendations(mapped);
        if (data.resolvedArea) {
          setResolvedArea(data.resolvedArea);
        }
      }
    } catch (err) {
      console.error("BG Auto-search failed:", err);
    } finally {
      setIsAutoSearching(false);
    }
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
      
      const now = new Date();
      const userLocalTime = now.toLocaleString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });
      const userLocalHour = now.getHours();
      
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
          customLocation: finalCustomLoc,
          userLocalTime,
          userLocalHour
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
          onSelectScreen={(screen) => {
            if (screen === "mood-select" || screen === "results") {
              setInitialSelectedRec(null);
            }
            setActiveScreen(screen);
          }}
          customLocation={customLocation}
          setCustomLocation={(val) => {
            setCustomLocation(val);
            if (val) {
              setResolvedArea(val);
            }
          }}
          onSelectPreset={(name, lat, lng) => {
            handleSelectPreset(name, lat, lng);
            // Re-trigger auto-search for newly selected preset
            setHasAutoSearched(true);
            executeAutoSearch(name, lat, lng);
          }}
          hasRecommendations={recommendations.length > 0}
          recommendations={recommendations}
          isAutoSearching={isAutoSearching}
          onSelectRecommendation={(rec) => {
            setInitialSelectedRec(rec);
            setActiveScreen("results");
          }}
        />
      )}

      {activeScreen === "mood-select" && (
        <MoodSelectScreen
          onBack={() => {
            setInitialSelectedRec(null);
            setActiveScreen("home");
          }}
          onSearch={(prefs) => {
            setInitialSelectedRec(null);
            executeAIRecommendation(prefs);
          }}
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
          onBack={() => {
            setInitialSelectedRec(null);
            setActiveScreen("mood-select");
          }}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
          onRetry={() => executeAIRecommendation(searchPrefs)}
          initialSelectedRec={initialSelectedRec}
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
