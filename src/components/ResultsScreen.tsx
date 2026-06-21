import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Heart, 
  DollarSign, 
  Clock, 
  Compass, 
  Navigation, 
  AlertCircle, 
  RefreshCw 
} from "lucide-react";
import { Recommendation, MoodType } from "../types";
import { MOODS } from "../constants";

interface ResultsScreenProps {
  isLoading: boolean;
  recommendations: Recommendation[];
  error: string | null;
  selectedMood: MoodType;
  resolvedArea: string;
  onBack: () => void;
  onToggleFavorite: (rec: Recommendation) => void;
  favorites: Recommendation[];
  onRetry: () => void;
}

const LOADING_STATUS_MESSAGES = [
  "Resolving baseline coordinates...",
  "Querying OpenStreetMap regional records...",
  "Consulting Gemini location systems...",
  "Filtering nearby spots matching your vibe...",
  "Formulating organic recommendations...",
  "Wrapping maps navigation directions..."
];

export default function ResultsScreen({
  isLoading,
  recommendations,
  error,
  selectedMood,
  resolvedArea,
  onBack,
  onToggleFavorite,
  favorites,
  onRetry
}: ResultsScreenProps) {
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const moodConfig = MOODS.find((m) => m.id === selectedMood) || MOODS[0];

  const handleOpenDirections = (rec: Recommendation) => {
    const query = encodeURIComponent(rec.mapQuery || `${rec.name} ${rec.address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  const isFavorited = (rec: Recommendation) => {
    return favorites.some((f) => f.name.toLowerCase() === rec.name.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center bg-natural-dark text-white animate-fade-in h-full">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-natural-green animate-spin"></div>
          <span className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
            {moodConfig.emoji}
          </span>
        </div>
        
        <h3 className="font-serif font-black text-xl tracking-wide">Seeking Local Sanctuaries</h3>
        <p className="text-natural-softgreen font-mono text-[10px] uppercase tracking-widest mt-1">
          {moodConfig.label} Alignment
        </p>

        <div className="h-10 mt-6 max-w-xs px-4">
          <p className="text-[#eff2e8]/80 text-xs font-medium leading-relaxed animate-soft-pulse">
            {LOADING_STATUS_MESSAGES[loadingMessageIndex]}
          </p>
        </div>

        <p className="text-[9px] text-[#eff2e8]/40 mt-12 font-mono uppercase tracking-widest">
          powered by gemini-3.5-flash
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-natural-bg justify-between h-full">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-1.5 text-xs text-natural-green hover:text-natural-dark font-bold mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>

        <div className="my-auto flex flex-col items-center">
          <div className="bg-natural-rust-soft text-natural-rust p-4 rounded-full border border-[#f5d0c0] mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-extrabold text-lg text-natural-dark leading-tight">Sync Interrupted</h3>
          <p className="text-xs text-natural-text mt-2 max-w-xs leading-relaxed">
            {error || "An unexpected issue blocked the geocoder query. Please check parameters."}
          </p>
          
          <button
            onClick={onRetry}
            className="mt-6 bg-natural-green hover:bg-natural-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Custom Stream</span>
          </button>
        </div>

        <p className="text-[9px] text-natural-muted font-mono uppercase tracking-wider">
          check secrets & network state
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow pb-6 animate-fade-in bg-natural-bg h-full">
      {/* Sticky header bar */}
      <div className="bg-white border-b border-natural-border p-5 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-natural-green hover:text-natural-dark font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Vibes</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#eff2e8] px-2.5 py-1 rounded-full border border-natural-green/20">
            <span className="text-[9px] uppercase font-bold text-natural-dark tracking-wider">Map Centered</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-3xl p-1.5 bg-[#fdf2ed] rounded-xl border border-[#f5d0c0]/40">
            {moodConfig.emoji}
          </span>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-serif font-black text-lg text-natural-dark leading-none">
                {moodConfig.label} Matches
              </h2>
            </div>
            <p className="text-[11px] text-natural-muted font-serif italic mt-1 font-medium truncate max-w-[280px]">
              in & around {resolvedArea}
            </p>
          </div>
        </div>
      </div>

      {/* Recs container */}
      <div className="flex-grow px-5 pt-4 flex flex-col gap-4 overflow-y-auto max-h-[620px] pb-10">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center text-center justify-center py-12 bg-white rounded-3xl border border-natural-border p-6">
            <p className="text-sm font-semibold text-natural-dark">No matching spots found in area</p>
            <p className="text-xs text-natural-muted mt-1">Try relaxing filters or broadening your range parameters.</p>
            <button onClick={onBack} className="text-xs text-natural-green font-bold mt-3 hover:underline">
              Adjust Mindset
            </button>
          </div>
        ) : (
          recommendations.map((rec, index) => {
            const isFav = isFavorited(rec);
            return (
              <div 
                key={rec.id || `rec-${index}`}
                className="bg-white rounded-[28px] border border-natural-border hover:shadow-md transition-shadow flex flex-col relative overflow-hidden"
              >
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category tag & Favorite Heart trigger */}
                    <div className="flex justify-between items-center gap-2 mb-2.5">
                      <span className="bg-natural-rust-soft text-[#d27d56] text-[9px] uppercase tracking-tighter font-extrabold py-0.5 px-2 rounded font-sans">
                        {rec.category}
                      </span>
                      
                      <button
                        onClick={() => onToggleFavorite(rec)}
                        className={`p-1.5 rounded-full transition-all border ${
                          isFav 
                            ? "bg-natural-rust-soft border-[#f5d0c0] text-natural-rust" 
                            : "bg-[#fcfbf9] border-natural-border text-natural-muted hover:text-natural-text"
                        }`}
                        title={isFav ? "Saved to Favorites" : "Bookmark this spot"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Place Name and Address */}
                    <h3 className="font-serif font-bold text-base text-natural-dark tracking-tight leading-snug">
                      {rec.name}
                    </h3>
                    <p className="text-[10px] text-natural-muted mt-0.5 font-medium flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-natural-muted" />
                      {rec.address}
                    </p>

                    {/* Mini Vibe explanation generated by Gemini AI matching design */}
                    <div className="my-3 bg-natural-bg border-l-2 border-natural-green p-3">
                      <p className="text-[11px] italic leading-relaxed text-[#5a5a40]">
                        &ldquo;{rec.explanation}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Fact line: Distance, Price, Time stats */}
                  <div className="flex items-center justify-between border-t border-natural-border/60 pt-3 mt-1 justify-self-end">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-natural-muted flex items-center gap-0.5 font-mono">
                        <Compass className="w-3.5 h-3.5 text-natural-green" />
                        {rec.distance}
                      </span>
                      <span className="text-[10px] font-semibold text-natural-muted flex items-center gap-0.5 font-mono">
                        <DollarSign className="w-3.5 h-3.5 text-natural-green" />
                        {rec.priceLevel}
                      </span>
                      <span className="text-[10px] font-semibold text-natural-muted flex items-center gap-0.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-natural-green" />
                        {rec.timeRequired}
                      </span>
                    </div>

                    {/* Open Directions action button matching Design HTML outline */}
                    <button
                      onClick={() => handleOpenDirections(rec)}
                      className="bg-natural-green hover:bg-natural-dark text-white font-bold text-[10px] uppercase py-1.5 px-3 rounded-full flex items-center gap-1 transition-all"
                    >
                      <Navigation className="w-3 h-3 text-white" />
                      <span>Directions</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
