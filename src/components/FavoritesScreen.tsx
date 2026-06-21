import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Trash2, 
  Navigation, 
  Bookmark, 
  MapPin, 
  DollarSign, 
  Clock, 
  Compass, 
  Heart,
  ArrowUp,
  ArrowDown,
  Car,
  Footprints,
  Calendar,
  Check,
  Plus,
  Minus,
  Sparkles
} from "lucide-react";
import { Recommendation } from "../types";

const isStoreOrRestaurant = (category: string, name: string) => {
  const cat = category.toLowerCase();
  const n = name.toLowerCase();
  return (
    cat.includes("store") ||
    cat.includes("shop") ||
    cat.includes("market") ||
    cat.includes("boutique") ||
    cat.includes("bookstore") ||
    cat.includes("pharmacy") ||
    cat.includes("roastery") ||
    cat.includes("bakery") ||
    cat.includes("cafe") ||
    cat.includes("restaurant") ||
    cat.includes("bistro") ||
    cat.includes("eatery") ||
    cat.includes("kitchen") ||
    cat.includes("dining") ||
    cat.includes("bbq") ||
    cat.includes("seafood") ||
    cat.includes("dim sum") ||
    cat.includes("palace") ||
    cat.includes("smokehouse") ||
    cat.includes("diner") ||
    cat.includes("grill") ||
    cat.includes("noodle") ||
    cat.includes("tacos") ||
    cat.includes("pizza") ||
    n.includes("bookstore") ||
    n.includes("market") ||
    n.includes("coop") ||
    n.includes("cooperative") ||
    n.includes("bistro") ||
    n.includes("kitchen") ||
    n.includes("eatery") ||
    n.includes("bbq") ||
    n.includes("cafe") ||
    n.includes("coffee")
  );
};

const determineHours = (category: string, name: string) => {
  const cat = category.toLowerCase();
  const n = name.toLowerCase();
  
  if (cat.includes("cafe") || cat.includes("coffee") || cat.includes("roastery") || n.includes("cafe") || n.includes("coffee")) {
    return {
      label: "7:00 AM - 6:00 PM",
      startHour: 7,
      endHour: 18
    };
  }
  if (cat.includes("restaurant") || cat.includes("bistro") || cat.includes("eatery") || cat.includes("kitchen") || cat.includes("dining") || cat.includes("bbq") || cat.includes("seafood") || cat.includes("dim sum") || cat.includes("palace") || cat.includes("smokehouse") || cat.includes("diner") || cat.includes("grill") || cat.includes("noodle") || cat.includes("tacos") || cat.includes("pizza") || n.includes("bistro") || n.includes("kitchen") || n.includes("eatery") || n.includes("bbq")) {
    return {
      label: "11:00 AM - 11:00 PM",
      startHour: 11,
      endHour: 23
    };
  }
  return {
    label: "9:00 AM - 8:00 PM",
    startHour: 9,
    endHour: 20
  };
};

function parseTimeRequiredToMinutes(timeStr?: string): number {
  if (!timeStr) return 60;
  const s = timeStr.toLowerCase();
  if (s.includes("hr") || s.includes("hour")) {
    const matches = s.match(/([0-9.]+)/g);
    if (matches && matches.length > 0) {
      const val1 = parseFloat(matches[0]);
      const val2 = matches[1] ? parseFloat(matches[1]) : val1;
      const avg = (val1 + val2) / 2;
      return Math.round(avg * 60);
    }
  }
  if (s.includes("min")) {
    const matches = s.match(/([0-9.]+)/);
    if (matches) return Math.round(parseFloat(matches[1]));
  }
  if (s.includes("half day")) return 240;
  if (s.includes("full day")) return 480;
  return 60;
}

function getDistanceBetween(rec1: Recommendation, rec2: Recommendation) {
  if (rec1.latitude && rec1.longitude && rec2.latitude && rec2.longitude) {
    const lat1 = rec1.latitude;
    const lon1 = rec1.longitude;
    const lat2 = rec2.latitude;
    const lon2 = rec2.longitude;
    
    if (lat1 === lat2 && lon1 === lon2) {
      return 0.3; // subtle custom placement offset
    }
    
    const R = 3958.8; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
  return 1.2; // default fallback route distance
}

function addMinutes(time24: string, minutes: number): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr || "9", 10);
  let m = parseInt(mStr || "0", 10);
  m += Math.round(minutes);
  h += Math.floor(m / 60);
  m = m % 60;
  h = h % 24;
  const ampm = h >= 12 ? "PM" : "AM";
  let displayH = h % 12;
  displayH = displayH ? displayH : 12;
  const displayM = m < 10 ? "0" + m : m;
  return `${displayH}:${displayM} ${ampm}`;
}

function addMinutesTimeValue(time24: string, minutes: number): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr || "9", 10);
  let m = parseInt(mStr || "0", 10);
  m += Math.round(minutes);
  h += Math.floor(m / 60);
  m = m % 60;
  h = h % 24;
  const hp = h < 10 ? "0" + h : h;
  const mp = m < 10 ? "0" + m : m;
  return `${hp}:${mp}`;
}

interface FavoritesScreenProps {
  favorites: Recommendation[];
  onRemoveFavorite: (rec: Recommendation) => void;
  onBack: () => void;
}

export default function FavoritesScreen({
  favorites,
  onRemoveFavorite,
  onBack
}: FavoritesScreenProps) {
  const [selectedRecForMap, setSelectedRecForMap] = useState<Recommendation | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "planner">("list");
  
  // Day Planner specific state variables
  const [plannerItems, setPlannerItems] = useState<Recommendation[]>([]);
  const [travelMode, setTravelMode] = useState<"walk" | "drive">("drive");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});
  const [excludedItemIds, setExcludedItemIds] = useState<Set<string>>(new Set());

  // Synchronize plannerItems with whatever exists in favorites list
  useEffect(() => {
    setPlannerItems((current) => {
      const filtered = current.filter(item => 
        favorites.some(f => f.name.toLowerCase() === item.name.toLowerCase())
      );
      const news = favorites.filter(f => 
        !filtered.some(item => item.name.toLowerCase() === f.name.toLowerCase())
      );
      return [...filtered, ...news];
    });
  }, [favorites]);

  const handleOpenDirections = (rec: Recommendation) => {
    const query = encodeURIComponent(rec.mapQuery || `${rec.name} ${rec.address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPlannerItems((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return list;
    });
  };

  const moveDown = (index: number) => {
    if (index === plannerItems.length - 1) return;
    setPlannerItems((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return list;
    });
  };

  const toggleExcluded = (id: string) => {
    setExcludedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTravelTimeMinutes = (distanceMiles: number, mode: "walk" | "drive") => {
    if (mode === "walk") {
      return Math.round(distanceMiles * 20); // standard 3 mph (approx 20 minutes per mile)
    } else {
      return Math.round(distanceMiles * 2 + (distanceMiles > 0 ? 2 : 0)); // approx 30 mph + traffic buffer
    }
  };

  // Generate dynamic, ordered, connected timeline nodes!
  const activeItems = plannerItems.filter(item => !excludedItemIds.has(item.id));
  
  const timeline: any[] = [];
  let currentTimestr = startTime;
  let totalTimeMins = 0;
  let totalDistanceMiles = 0;

  for (let i = 0; i < activeItems.length; i++) {
    const item = activeItems[i];
    const defaultDuration = parseTimeRequiredToMinutes(item.timeRequired);
    const duration = customDurations[item.id] !== undefined ? customDurations[item.id] : defaultDuration;
    
    const startLabel = addMinutes(currentTimestr, 0);
    const endLabel = addMinutes(currentTimestr, duration);
    
    currentTimestr = addMinutesTimeValue(currentTimestr, duration);
    totalTimeMins += duration;

    const node: any = {
      id: item.id,
      name: item.name,
      category: item.category,
      address: item.address,
      startTimeLabel: startLabel,
      endTimeLabel: endLabel,
      durationMinutes: duration,
      originalRec: item
    };

    if (i < activeItems.length - 1) {
      const nextItem = activeItems[i + 1];
      const distanceMiles = getDistanceBetween(item, nextItem);
      const travelMins = getTravelTimeMinutes(distanceMiles, travelMode);
      
      node.travelToNext = {
        distance: distanceMiles,
        timeMinutes: travelMins
      };

      currentTimestr = addMinutesTimeValue(currentTimestr, travelMins);
      totalTimeMins += travelMins;
      totalDistanceMiles += distanceMiles;
    }

    timeline.push(node);
  }

  const formatTotalTime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs === 0) return `${remainingMins} mins`;
    if (remainingMins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${remainingMins} min${remainingMins > 1 ? "s" : ""}`;
  };

  if (selectedRecForMap) {
    const isFav = favorites.some((f) => f.name.toLowerCase() === selectedRecForMap.name.toLowerCase());
    return (
      <div className="flex flex-col flex-grow animate-fade-in bg-natural-bg h-full relative">
        {/* Top sticky bar of Detail view */}
        <div className="bg-white border-b border-natural-border p-5 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedRecForMap(null)}
              className="flex items-center gap-1 text-xs text-natural-green hover:text-natural-dark font-black transition-all bg-[#eff2e8] px-3 py-1.5 rounded-full border border-natural-green/20 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Favorites</span>
            </button>

            <button
              onClick={() => {
                onRemoveFavorite(selectedRecForMap);
                setSelectedRecForMap(null); // Return to list since it's removed!
              }}
              className="p-2 rounded-full transition-all border border-[#f5d0c0] bg-natural-rust-soft text-natural-rust scale-105 cursor-pointer"
              title="Remove from favorites"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable details view */}
        <div className="p-5 flex-grow overflow-y-auto space-y-5 pb-12">
          {/* Tag & Title */}
          <div>
            <span className="bg-natural-softgreen text-natural-dark text-[10px] uppercase tracking-wider font-extrabold py-0.5 px-2 rounded-md font-sans">
              {selectedRecForMap.category}
            </span>
            <h2 className="font-serif font-black text-2xl text-natural-dark tracking-tight leading-snug mt-2">
              {selectedRecForMap.name}
            </h2>
            <p className="text-xs text-natural-muted mt-1.5 font-semibold flex items-start gap-1 leading-relaxed break-words">
              <MapPin className="w-3.5 h-3.5 text-natural-green shrink-0 mt-0.5" />
              <span>{selectedRecForMap.address}</span>
            </p>
          </div>

          {/* Real Live Map Embed */}
          <div className="relative">
            <p className="text-[10px] uppercase tracking-wider font-bold text-natural-green/70 mb-2 font-mono">Live Sanctuary Map</p>
            <div className="bg-white p-2 rounded-2xl border border-natural-border shadow-2xs">
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedRecForMap.name + ', ' + selectedRecForMap.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                className="w-full h-52 rounded-xl border border-natural-border"
                allowFullScreen={false} 
                loading="lazy"
                title={`Map of ${selectedRecForMap.name}`}
              ></iframe>
            </div>
          </div>

          {/* Operating Hours Alert block for stores/restaurants */}
          {isStoreOrRestaurant(selectedRecForMap.category, selectedRecForMap.name) && (() => {
            const hoursInfo = determineHours(selectedRecForMap.category, selectedRecForMap.name);
            const currentHour = new Date().getHours();
            const isOpenNow = currentHour >= hoursInfo.startHour && currentHour < hoursInfo.endHour;

            return (
              <div className="bg-white rounded-2xl border border-natural-border p-4 shadow-3xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-natural-green/10 text-natural-green">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider font-mono">Operating Hours</p>
                    <p className="text-xs font-semibold text-natural-dark mt-0.5">Today: {hoursInfo.label}</p>
                  </div>
                </div>
                {isOpenNow ? (
                  <span className="text-[10px] text-natural-green font-bold bg-[#eff2e8] px-2.5 py-1 rounded-full border border-natural-green/20">
                    Open Now
                  </span>
                ) : (
                  <span className="text-[10px] text-natural-rust font-bold bg-natural-rust-soft px-2.5 py-1 rounded-full border border-natural-rust/20">
                    Closed
                  </span>
                )}
              </div>
            );
          })()}

          {/* Facts bar */}
          <div className="bg-white rounded-2xl border border-natural-border p-4 shadow-3xs flex items-center justify-around text-center font-mono">
            <div>
              <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Distance</p>
              <p className="text-sm font-serif font-bold text-natural-dark mt-0.5">{selectedRecForMap.distance}</p>
            </div>
            <div className="h-8 w-[1px] bg-natural-border"></div>
            <div>
              <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Price Tier</p>
              <p className="text-sm font-serif font-bold text-natural-dark mt-0.5">{selectedRecForMap.priceLevel}</p>
            </div>
            {selectedRecForMap.timeRequired && (
              <>
                <div className="h-8 w-[1px] bg-natural-border"></div>
                <div>
                  <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Time Needed</p>
                  <p className="text-sm font-serif font-bold text-natural-dark mt-0.5">{selectedRecForMap.timeRequired}</p>
                </div>
              </>
            )}
          </div>

          {/* Vibe and description quote card */}
          <div className="bg-[#eff2e8]/80 rounded-2xl p-4 border border-[#e5e1d8] flex flex-col gap-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8a9a5b] font-mono leading-none">The Vibe Match</p>
            <p className="text-xs text-natural-dark font-serif italic leading-relaxed mt-1.5 text-[#5a5a40]">
              &ldquo;{selectedRecForMap.explanation}&rdquo;
            </p>
          </div>

          {/* Open Real Maps Button CTA */}
          <div className="pt-2">
            <button
              onClick={() => handleOpenDirections(selectedRecForMap)}
              className="w-full bg-natural-green hover:bg-natural-dark text-white font-serif font-black py-3.5 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer group"
            >
              <span>Launch GPS Navigation App</span>
              <Navigation className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <p className="text-center text-[9px] text-natural-muted mt-2 font-mono uppercase tracking-widest leading-none">
              opens google maps instructions in secondary tab
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow bg-natural-bg animate-fade-in p-6 pb-20">
      {/* Top Navbar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-natural-green hover:text-natural-dark transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <span className="text-[10px] font-bold uppercase tracking-widest text-natural-green bg-natural-softgreen px-2.5 py-1 rounded-full font-mono">
          Curated List
        </span>
      </div>

      <div className="mb-5">
        <h2 className="font-serif font-black text-2xl text-natural-dark leading-tight">
          Your Saved Sanctuary
        </h2>
        <p className="text-xs text-natural-muted mt-1 leading-relaxed">
          Access bookmarked matches or assemble a customized, real-time day trip itinerary.
        </p>
      </div>

      {/* Segmented Controller Tab Bar */}
      {favorites.length > 0 && (
        <div className="flex bg-[#f2ebd9]/40 border border-[#e5e1d8] rounded-2xl p-1 mb-6">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 text-center py-2 rounded-xl font-serif text-[11px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-natural-green text-white shadow-3xs"
                : "text-natural-muted hover:text-natural-dark"
            }`}
          >
            Saved List ({favorites.length})
          </button>
          <button
            onClick={() => setViewMode("planner")}
            className={`flex-1 text-center py-2 rounded-xl font-serif text-[11px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === "planner"
                ? "bg-natural-green text-white shadow-3xs"
                : "text-natural-muted hover:text-natural-dark"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day Planner</span>
          </button>
        </div>
      )}

      {/* RENDER CHOSEN SCREEN MODE */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-3xl border border-natural-border">
          <span className="text-3xl mb-3">🍃</span>
          <p className="font-semibold text-sm text-natural-dark">No favorites saved yet</p>
          <p className="text-xs text-natural-muted mt-1.5 leading-relaxed max-w-[220px]">
            Match your mood under the "Match Mood" flow and snap the heart badge to pin spots here.
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* STANDARD LIST VIEW CONTAINER */
        <div className="flex flex-col gap-5 pb-16">
          {plannerItems.map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedRecForMap(rec)}
              className="bg-white p-6 rounded-[32px] border-2 border-natural-border/80 hover:shadow-lg hover:border-natural-green/60 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3.5">
                  <span className="bg-natural-softgreen text-natural-dark text-[10px] uppercase tracking-wider font-extrabold py-0.5 px-2.5 rounded">
                    {rec.category}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(rec);
                    }}
                    className="p-2 rounded-full bg-natural-rust-soft border border-[#f5d0c0] text-natural-rust hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-serif font-black text-lg text-natural-dark tracking-tight leading-snug">
                  {rec.name}
                </h3>
                <p className="text-xs text-natural-muted mt-2 font-semibold flex items-start gap-1 leading-relaxed break-words">
                  <MapPin className="w-3.5 h-3.5 text-natural-green shrink-0 mt-0.5" />
                  <span>{rec.address}</span>
                </p>

                {/* Styled quote preview */}
                <div className="my-4 bg-[#fbfbf9] border-l-2 border-natural-green/70 p-3.5 rounded-r-xl">
                  <p className="text-xs italic leading-relaxed text-[#5a5a40]">
                    &ldquo;{rec.explanation}&rdquo;
                  </p>
                </div>
              </div>

              {/* Specs & Directions Row */}
              <div className="flex items-center justify-between border-t border-natural-border pt-4 mt-2">
                <div className="flex items-center gap-3.5 text-natural-text">
                  <span className="text-[10px] md:text-xs font-semibold flex items-center gap-1 font-mono">
                    <Compass className="w-4 h-4 text-natural-green" />
                    {rec.distance}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold flex items-center gap-1 font-mono">
                    <DollarSign className="w-4 h-4 text-natural-green" />
                    {rec.priceLevel}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecForMap(rec);
                  }}
                  className="bg-natural-green hover:bg-natural-dark text-white font-bold text-[10px] md:text-xs uppercase py-2 px-4 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-1xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-white" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EXQUISITE DAY PLANNER WORKBENCH */
        <div className="space-y-6 pb-20 animate-fade-in text-left">
          {/* Controls Toolbar Bar */}
          <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-3xs space-y-3">
            <h3 className="text-xs font-bold text-natural-dark font-sans uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-natural-green" />
              <span>Itinerary Parameters</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Start Time input */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-natural-muted uppercase tracking-wider font-mono">Start Day At</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value || "09:00")}
                  className="w-full bg-natural-bg border border-natural-border rounded-xl px-2.5 py-1.5 text-xs text-natural-dark focus:outline-none focus:ring-1 focus:ring-natural-green"
                />
              </div>

              {/* Transit selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-natural-muted uppercase tracking-wider font-mono">Transit Mode</label>
                <div className="flex bg-natural-bg border border-natural-border rounded-xl p-0.5">
                  <button 
                    onClick={() => setTravelMode("drive")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                      travelMode === "drive" ? "bg-natural-green text-white" : "text-natural-muted hover:text-natural-dark"
                    }`}
                  >
                    <Car className="w-3 h-3" />
                    <span>Drive</span>
                  </button>
                  <button 
                    onClick={() => setTravelMode("walk")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                      travelMode === "walk" ? "bg-natural-green text-white" : "text-natural-muted hover:text-natural-dark"
                    }`}
                  >
                    <Footprints className="w-3 h-3" />
                    <span>Walk</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select checklist for active planning */}
          <div className="bg-white px-4 py-3.5 rounded-2xl border border-natural-border shadow-3xs">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-natural-muted font-mono mb-2.5">
              Include / Exclude from today's plan
            </h4>
            <div className="flex flex-wrap gap-2">
              {plannerItems.map((rec) => {
                const isExcluded = excludedItemIds.has(rec.id);
                const activeIndex = activeItems.findIndex(item => item.id === rec.id);

                return (
                  <button
                    key={rec.id}
                    onClick={() => toggleExcluded(rec.id)}
                    className={`text-left text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      !isExcluded 
                        ? "bg-[#eff2e8] border-natural-green text-natural-dark" 
                        : "bg-white border-natural-border text-natural-muted line-through opacity-60"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${
                      !isExcluded ? "bg-natural-green border-natural-green text-white" : "border-natural-muted bg-white"
                    }`}>
                      {!isExcluded && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="truncate max-w-[130px]">{rec.name}</span>
                    {!isExcluded && activeIndex !== -1 && (
                      <span className="bg-natural-green text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0">
                        {activeIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC TIMELINE DISPLAY */}
          {activeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white rounded-2xl border border-natural-border">
              <span className="text-2xl mb-1.5">🗺️</span>
              <p className="font-semibold text-xs text-natural-dark">No places selected</p>
              <p className="text-[10px] text-natural-muted mt-1 max-w-[190px]">
                Toggle the badges above to insert your saved places into today's timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline overall stats bubble */}
              <div className="bg-[#eff2e8] rounded-xl px-4 py-2.5 border border-natural-green/20 flex items-center justify-between text-[11px] font-semibold text-natural-dark">
                <span className="flex items-center gap-1 font-mono text-[10px] text-natural-green uppercase font-black">
                  <Sparkles className="w-3.5 h-3.5 text-natural-green" /> Day Scope
                </span>
                <span className="font-mono">
                  {timeline.length} stop{timeline.length > 1 ? "s" : ""} • {formatTotalTime(totalTimeMins)} • {totalDistanceMiles.toFixed(1)} miles travel
                </span>
              </div>

              {/* Timeline steps loop */}
              <div className="space-y-4 pl-2.5 border-l-2 border-natural-green/20 relative">
                {timeline.map((node, idx) => {
                  return (
                    <div key={node.id} className="relative pl-6 animate-fade-in">
                      {/* Timeline Dot Indicator */}
                      <div className="absolute -left-[19px] top-6 w-3 h-3 rounded-full bg-natural-green border-2 border-white ring-4 ring-[#eff2e8]/85 flex items-center justify-center font-bold text-white shadow-3xs" />
                      
                      {/* Node container card */}
                      <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-3xs space-y-3 hover:border-natural-green transition-all">
                        {/* Time label and reordering row */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono leading-none bg-natural-dark text-white px-2.5 py-1 rounded-md font-bold">
                            {node.startTimeLabel} – {node.endTimeLabel}
                          </span>

                          <div className="flex items-center gap-1 bg-natural-bg p-0.5 rounded-lg border border-natural-border">
                            <button
                              onClick={() => moveUp(idx)}
                              disabled={idx === 0}
                              className={`p-1.5 rounded-md transition-all ${
                                idx === 0 
                                  ? "text-natural-muted/30 cursor-not-allowed" 
                                  : "text-natural-muted hover:text-natural-dark cursor-pointer hover:bg-white"
                              }`}
                              title="Move Stop Earlier"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveDown(idx)}
                              disabled={idx === timeline.length - 1}
                              className={`p-1.5 rounded-md transition-all ${
                                idx === timeline.length - 1 
                                  ? "text-natural-muted/30 cursor-not-allowed" 
                                  : "text-natural-muted hover:text-natural-dark cursor-pointer hover:bg-white"
                              }`}
                              title="Move Stop Later"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title, Category */}
                        <div onClick={() => setSelectedRecForMap(node.originalRec)} className="cursor-pointer group">
                          <span className="bg-natural-softgreen text-natural-dark text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded">
                            Stop {idx + 1}: {node.category}
                          </span>
                          <h4 className="font-serif font-black text-md text-natural-dark mt-1 hover:text-natural-green group-hover:underline decoration-natural-green">
                            {node.name}
                          </h4>
                          <p className="text-[10px] text-natural-muted mt-1 leading-normal truncate font-sans">
                            {node.address}
                          </p>
                        </div>

                        {/* Custom Duration tuning controls */}
                        <div className="pt-2 border-t border-dashed border-natural-border flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-natural-muted py-0.5">
                            <Clock className="w-3.5 h-3.5 text-natural-green" />
                            <span>Planned Stay:</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setCustomDurations(prev => {
                                  const current = prev[node.id] !== undefined ? prev[node.id] : parseTimeRequiredToMinutes(node.originalRec.timeRequired);
                                  const nextVal = Math.max(15, current - 15);
                                  return { ...prev, [node.id]: nextVal };
                                });
                              }}
                              className="p-1 rounded bg-natural-bg hover:bg-[#eff2e8] border border-natural-border text-natural-muted hover:text-natural-dark cursor-pointer flex items-center justify-center font-bold"
                              title="Decrease 15 mins"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold text-natural-dark select-none min-w-[55px] text-center bg-natural-bg px-2 py-0.5 rounded-lg border border-natural-border">
                              {formatTotalTime(node.durationMinutes)}
                            </span>
                            <button
                              onClick={() => {
                                setCustomDurations(prev => {
                                  const current = prev[node.id] !== undefined ? prev[node.id] : parseTimeRequiredToMinutes(node.originalRec.timeRequired);
                                  const nextVal = Math.min(360, current + 15);
                                  return { ...prev, [node.id]: nextVal };
                                });
                              }}
                              className="p-1 rounded bg-natural-bg hover:bg-[#eff2e8] border border-natural-border text-natural-muted hover:text-natural-dark cursor-pointer flex items-center justify-center font-bold"
                              title="Increase 15 mins"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Travel transition block linking nodes */}
                      {node.travelToNext && (
                        <div className="my-3 mx-2 pl-3 py-1 bg-[#fefefe]/45 border-l-2 border-dashed border-natural-green/20 text-[#5a5a40] text-[10px] font-medium flex items-center gap-2.5">
                          <div className="p-1 rounded bg-natural-softgreen text-natural-green flex items-center justify-center">
                            {travelMode === "drive" ? <Car className="w-3.5 h-3.5" /> : <Footprints className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-mono">
                            Transition: <strong className="text-natural-dark">{node.travelToNext.distance} mi</strong> away 
                            {travelMode === "drive" ? " (approx. " : " (leisurely walk "}{node.travelToNext.timeMinutes} mins)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action buttons (Google Maps Route compile) */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    const originQuery = timeline[0].originalRec.mapQuery || `${timeline[0].name}, ${timeline[0].address}`;
                    const stepsToJoin = timeline.slice(1).map(node => node.originalRec.mapQuery || `${node.name}, ${node.address}`);
                    let url = `https://www.google.com/maps/dir/${encodeURIComponent(originQuery)}`;
                    for (const step of stepsToJoin) {
                      url += `/${encodeURIComponent(step)}`;
                    }
                    window.open(url, "_blank");
                  }}
                  className="w-full bg-natural-green hover:bg-natural-dark text-white font-serif font-black py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer group"
                >
                  <span>Launch Google Maps Whole Multi-Stop Day</span>
                  <Navigation className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <p className="text-center text-[9px] text-natural-muted mt-1 font-mono uppercase tracking-widest leading-none">
                  compiles and starts multi-stop navigation in a new tab
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
