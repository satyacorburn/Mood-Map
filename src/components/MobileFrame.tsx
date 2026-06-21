import React from "react";
import { Sparkles, MapPin, Bookmark } from "lucide-react";
import { ACTIVE_SCREEN } from "../types";

interface MobileFrameProps {
  children: React.ReactNode;
  activeScreen: ACTIVE_SCREEN;
  setActiveScreen: (screen: ACTIVE_SCREEN) => void;
  favoritesCount: number;
}

export default function MobileFrame({
  children,
  activeScreen,
  setActiveScreen,
  favoritesCount
}: MobileFrameProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [activeScreen]);

  return (
    <div className="h-screen sm:h-auto sm:min-h-screen bg-natural-dark flex items-center justify-center py-0 sm:py-8 font-sans px-0 sm:px-4 overflow-hidden">
      {/* Phone Mockup Frame wrapper for desktop, standard screen for mobile */}
      <div className="w-full h-full sm:h-[880px] sm:max-w-[430px] bg-natural-bg sm:rounded-[50px] shadow-2xl relative overflow-hidden flex flex-col border-[6px] border-slate-900">
        
        {/* Dynamic Status Notch / Speaker bar for style */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-900 rounded-b-xl z-50 items-center justify-center">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
          <div className="w-2 h-2 bg-slate-800 rounded-full ml-3"></div>
        </div>

        {/* Outer Notification bar design */}
        <div className="bg-slate-900 text-[#e5e1d8] text-[11px] px-6 pt-3 pb-2 flex justify-between items-center z-40 select-none font-mono">
          <span>9:41 AM</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-[#8a9a5b]">● GPS ACTIVE</span>
            <div className="w-5 h-2.5 border border-[#8a9a5b]/30 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-4 bg-[#8a9a5b] rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Main Viewport */}
        <div ref={viewportRef} className="flex-1 overflow-y-auto bg-natural-bg flex flex-col relative">
          {children}
        </div>

        {/* Navigation Bar - Fixed Bottom iOS style navigation */}
        <div className="bg-white border-t border-natural-border px-6 py-2.5 flex justify-between items-center z-40">
          <button
            onClick={() => setActiveScreen("home")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeScreen === "home" ? "text-natural-green scale-105 font-semibold" : "text-natural-muted hover:text-natural-text"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeScreen === "home" ? "bg-natural-softgreen" : ""}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wide font-display">Explore</span>
          </button>

          <button
            onClick={() => setActiveScreen("mood-select")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeScreen === "mood-select" || activeScreen === "results"
                ? "text-natural-green scale-105 font-semibold"
                : "text-natural-muted hover:text-natural-text"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeScreen === "mood-select" || activeScreen === "results" ? "bg-natural-softgreen" : ""}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wide font-display">Match Mood</span>
          </button>

          <button
            onClick={() => setActiveScreen("favorites")}
            className={`flex flex-col items-center gap-1 transition-all relative ${
              activeScreen === "favorites" ? "text-natural-green scale-105 font-semibold" : "text-natural-muted hover:text-natural-text"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeScreen === "favorites" ? "bg-natural-softgreen" : ""}`}>
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-wide font-display">Favorites</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1 right-2 bg-natural-rust text-white font-bold text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-sm border border-white">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>

        {/* iOS Home Indicator Bar representation on widescreen */}
        <div className="hidden sm:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-350 rounded-full z-50"></div>
      </div>
    </div>
  );
}
