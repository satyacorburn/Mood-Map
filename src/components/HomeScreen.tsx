import React, { useState } from "react";
import { MapPin, Sparkles, Navigation, Compass, Info, RefreshCw } from "lucide-react";
import { PRESET_CITIRES } from "../constants";

interface HomeScreenProps {
  latitude: number | null;
  longitude: number | null;
  locationState: "prompt" | "requesting" | "granted" | "denied";
  errorMessage: string | null;
  resolvedArea: string;
  onRequestLocation: () => void;
  onSelectScreen: (screen: any) => void;
  customLocation: string;
  setCustomLocation: (val: string) => void;
  onSelectPreset: (name: string, lat: number, lng: number) => void;
  hasRecommendations: boolean;
}

export default function HomeScreen({
  latitude,
  longitude,
  locationState,
  errorMessage,
  resolvedArea,
  onRequestLocation,
  onSelectScreen,
  customLocation,
  setCustomLocation,
  onSelectPreset,
  hasRecommendations
}: HomeScreenProps) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="flex flex-col flex-grow p-6 justify-between animate-fade-in bg-natural-bg">
      {/* Top Header Card */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-natural-green text-white p-2 rounded-xl shadow-sm rotate-2">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <span className="font-sans font-bold text-[10px] tracking-wider text-natural-green uppercase">Space-Aware AI</span>
        </div>
        
        <h1 className="font-serif font-black text-3xl tracking-tight text-natural-dark leading-none">
          MoodMap AI
        </h1>
        <p className="text-natural-text text-xs mt-2 font-medium leading-relaxed">
          Find the perfect nearby cafe, trail, bookstore, or scenic spot matching exactly how you feel.
        </p>
      </div>

      {/* Interactive Location Hub Card */}
      <div className="my-5 bg-white rounded-2xl p-5 border border-natural-border shadow-xs flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-natural-softgreen/50 rounded-full blur-2xl z-0"></div>

        <div className="relative z-10 flex items-center justify-between">
          <span className="font-serif font-bold text-xs text-natural-dark">Active Baseline Position</span>
          
          {locationState === "granted" && (
            <span className="bg-natural-softgreen text-natural-dark text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-natural-green/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-natural-green animate-pulse"></span>
              Live GPS
            </span>
          )}
          {locationState === "denied" && (
            <span className="bg-natural-rust-soft text-natural-rust text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-natural-rust/20 flex items-center gap-1">
              Demo/Manual
            </span>
          )}
          {locationState === "requesting" && (
            <span className="bg-natural-panel text-natural-dark text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-natural-border flex items-center gap-1">
              Locating...
            </span>
          )}
          {locationState === "prompt" && (
            <span className="bg-natural-panel text-natural-muted text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-natural-border flex items-center gap-1">
              Pending
            </span>
          )}
        </div>

        {/* Selected Location readout */}
        <div className="relative z-10 flex items-start gap-3 bg-natural-bg rounded-xl p-3.5 border border-natural-border">
          <div className="bg-white p-2 rounded-lg border border-natural-border text-natural-green flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 flex-shrink-0" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] text-natural-muted font-bold uppercase tracking-wider font-mono">Resolved Area</p>
            <p className="font-serif font-bold text-natural-dark text-sm truncate">
              {resolvedArea || (latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : "Not detected yet")}
            </p>
            {latitude && longitude ? (
              <span className="text-[9px] text-natural-muted font-mono block mt-0.5">
                Lat: {latitude.toFixed(4)} | Lng: {longitude.toFixed(4)}
              </span>
            ) : (
              <span className="text-[9px] text-natural-muted block mt-0.5">Type or choose a city below</span>
            )}
          </div>
        </div>

        {/* GPS Request Trigger or Error Message */}
        <div className="relative z-10">
          {locationState !== "granted" ? (
            <button
              onClick={onRequestLocation}
              disabled={locationState === "requesting"}
              className="w-full bg-natural-dark hover:bg-natural-green active:scale-98 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5" />
              {locationState === "requesting" ? "Syncing hardware coordinates..." : "Search near My Location"}
            </button>
          ) : (
            <button
              onClick={onRequestLocation}
              className="w-full bg-natural-bg hover:bg-[#f1eee6] text-natural-dark border border-natural-border active:scale-98 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-natural-green" />
              Refresh Coordinates
            </button>
          )}

          {errorMessage && (
            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-natural-text bg-[#f5f3ec] border border-natural-border rounded-lg p-2.5">
              <Info className="w-3.5 h-3.5 text-natural-green flex-shrink-0 mt-0.5" />
              <span>
                Sandbox geolocation disabled. Please use manual selection or picker below!
              </span>
            </div>
          )}
        </div>

        {/* Custom Location / City presets panel */}
        <div className="relative z-10 border-t border-natural-border pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-natural-dark">Place or Nearby City</span>
            <button 
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs text-natural-green hover:text-natural-dark font-bold underline decoration-dotted"
            >
              {showPresets ? "Enter Text" : "Standard Cities"}
            </button>
          </div>

          {!showPresets ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter city or neighborhood (e.g. Austin, TX)"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="flex-1 bg-natural-bg border border-natural-border rounded-xl px-3.5 py-2 text-base sm:text-xs focus:outline-none focus:ring-1 focus:ring-natural-green"
              />
              {customLocation && (
                <button
                  onClick={() => setCustomLocation("")}
                  className="text-xs text-natural-muted hover:text-natural-dark px-1 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_CITIRES.map((pc) => (
                <button
                  key={pc.name}
                  onClick={() => {
                    onSelectPreset(pc.name, pc.coords.lat, pc.coords.lng);
                    setShowPresets(false);
                  }}
                  className={`text-[10px] py-1.5 px-1 text-center font-bold rounded-lg border transition-all ${
                    resolvedArea === pc.name 
                      ? "bg-natural-softgreen border-natural-green text-natural-dark" 
                      : "bg-white border-natural-border text-natural-text hover:bg-natural-bg"
                  }`}
                >
                  {pc.name.split(",")[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Decorative Natural Earth Theme Stat Card */}
      <div className="bg-[#eff2e8]/60 rounded-2xl p-4 border border-[#e5e1d8] mb-4 flex items-center gap-3">
        <div className="bg-natural-green text-white p-2.5 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="font-serif font-bold text-natural-dark text-sm leading-snug">Calm local alignment</p>
          <p className="text-[11px] text-natural-text leading-relaxed font-medium">
            State your headspace, filter your environmental options, and let neural-grounding recommend matching local sanctuaries.
          </p>
        </div>
      </div>

      {/* Resume matches list link if any exist */}
      {hasRecommendations && (
        <div className="mb-4">
          <button 
            onClick={() => onSelectScreen("results")}
            className="w-full bg-[#eff2e8] hover:bg-natural-softgreen border border-natural-green/20 text-natural-dark font-sans font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-natural-green animate-pulse"></span>
              <span>Active alignments loaded</span>
            </div>
            <span className="font-serif italic font-bold text-natural-green">View Matches →</span>
          </button>
        </div>
      )}

      {/* Large CTA Bottom Action */}
      <div className="mt-auto">
        <button
          onClick={() => onSelectScreen("mood-select")}
          className="w-full bg-natural-green hover:bg-natural-dark active:scale-99 text-white font-serif font-black py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group cursor-pointer"
        >
          <span>Share Your Mindset</span>
          <Navigation className="w-4 h-4 rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
        
        <p className="text-center text-[9px] text-natural-muted mt-3 font-semibold font-mono tracking-widest">
          ORGANIC ALIGNMENT • ZERO MAP NOISE
        </p>
      </div>
    </div>
  );
}
