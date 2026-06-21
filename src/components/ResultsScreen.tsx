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
  const [selectedRecForMap, setSelectedRecForMap] = useState<Recommendation | null>(null);

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

  if (selectedRecForMap) {
    const isFav = isFavorited(selectedRecForMap);
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
              <span>Back to Matches</span>
            </button>

            <button
              onClick={() => onToggleFavorite(selectedRecForMap)}
              className={`p-2 rounded-full transition-all border cursor-pointer ${
                isFav 
                  ? "bg-natural-rust-soft border-[#f5d0c0] text-natural-rust scale-105" 
                  : "bg-[#fcfbf9] border-natural-border text-natural-muted hover:text-natural-text"
              }`}
              title={isFav ? "Saved to Favorites" : "Bookmark this spot"}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Scrollable details view */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 pb-12">
          {/* Tag & Title */}
          <div>
            <span className="bg-natural-rust-soft text-[#d27d56] text-[10px] uppercase tracking-wider font-extrabold py-0.5 px-2 rounded-md font-sans">
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

          {/* Facts bar */}
          <div className="bg-white rounded-2xl border border-natural-border p-4 shadow-3xs flex items-center justify-around text-center">
            <div>
              <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider font-mono">Distance</p>
              <p className="text-sm font-serif font-bold text-natural-dark mt-0.5">{selectedRecForMap.distance}</p>
            </div>
            <div className="h-8 w-[1px] bg-natural-border"></div>
            <div>
              <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider font-mono">Price Tier</p>
              <p className="text-sm font-serif font-bold text-natural-dark mt-0.5">{selectedRecForMap.priceLevel}</p>
            </div>
            <div className="h-8 w-[1px] bg-natural-border"></div>
            <div>
              <p className="text-[10px] text-natural-muted font-bold uppercase tracking-wider font-mono">Time Needed</p>
              <p className="text-sm font-serif font-bold text-natural-dark mt-0.5">{selectedRecForMap.timeRequired}</p>
            </div>
          </div>

          {/* Vibe and description quote card */}
          <div className="bg-[#eff2e8]/80 rounded-2xl p-4 border border-[#e5e1d8] flex flex-col gap-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8a9a5b] font-mono leading-none">The Vibe Match</p>
            <p className="text-xs text-natural-dark font-serif italic leading-relaxed mt-1.5 text-[#5a5a40]">
              &ldquo;{selectedRecForMap.explanation}&rdquo;
            </p>
          </div>

          {/* Navigation Paths / Alignment Steps */}
          <div className="space-y-3.5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-natural-green/70 font-mono">Aesthetic Aligning Directions</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-natural-green text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">1</span>
                <div>
                  <h4 className="text-xs font-bold text-natural-dark font-sans leading-tight">Position Aligning</h4>
                  <p className="text-[11px] text-natural-text mt-0.5 leading-snug">
                    Initiate transit from your location towards {selectedRecForMap.address}. Ensure dynamic breath loops to set a neutral, relaxed baseline.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-natural-green text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">2</span>
                <div>
                  <h4 className="text-xs font-bold text-natural-dark font-sans leading-tight">Mindful Sight Syncing</h4>
                  <p className="text-[11px] text-natural-text mt-0.5 leading-snug">
                    Opt for quiet neighborhood pathways or scenic roads during this {selectedRecForMap.distance} stretch, letting your sensory focus drift with the setting elements.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-natural-green text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">3</span>
                <div>
                  <h4 className="text-xs font-bold text-natural-dark font-sans leading-tight">Sanctuary Entrance</h4>
                  <p className="text-[11px] text-natural-text mt-0.5 leading-snug">
                    Arrive at {selectedRecForMap.name}. Spend approximately {selectedRecForMap.timeRequired} syncing your active mindset with this physical space to maximize cognitive alignment.
                  </p>
                </div>
              </div>
            </div>
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
    <div className="flex flex-col flex-grow pb-12 animate-fade-in bg-natural-bg">
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
            <p className="text-[11px] text-natural-muted font-serif italic mt-1 font-medium leading-relaxed break-all">
              in & around {resolvedArea}
            </p>
          </div>
        </div>
      </div>

      {/* Recs container - Natural Flow, Spaced & Larger matches area */}
      <div className="px-5 pt-5 flex flex-col gap-5 pb-16">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center text-center justify-center py-12 bg-white rounded-3xl border border-natural-border p-6 font-sans">
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
                onClick={() => setSelectedRecForMap(rec)}
                className="bg-white rounded-[32px] border-2 border-natural-border/80 hover:shadow-lg hover:border-natural-green/60 transition-all flex flex-col relative overflow-hidden cursor-pointer group"
              >
                <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category tag & Favorite Heart trigger */}
                    <div className="flex justify-between items-center gap-2 mb-3.5">
                      <span className="bg-natural-rust-soft text-[#d27d56] text-[10px] uppercase tracking-wider font-extrabold py-0.5 px-2.5 rounded font-sans">
                        {rec.category}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(rec);
                        }}
                        className={`p-2 rounded-full transition-all border cursor-pointer ${
                          isFav 
                            ? "bg-natural-rust-soft border-[#f5d0c0] text-natural-rust scale-105" 
                            : "bg-[#fcfbf9] border-natural-border text-natural-muted hover:text-natural-text"
                        }`}
                        title={isFav ? "Saved to Favorites" : "Bookmark this spot"}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Place Name and Address */}
                    <h3 className="font-serif font-black text-lg md:text-xl text-natural-dark tracking-tight leading-snug">
                      {rec.name}
                    </h3>
                    <p className="text-xs text-natural-muted mt-2 font-semibold flex items-start gap-1 leading-relaxed break-words">
                      <MapPin className="w-3.5 h-3.5 text-natural-green shrink-0 mt-0.5" />
                      <span>{rec.address}</span>
                    </p>

                    {/* Mini Vibe explanation generated by Gemini AI matching design */}
                    <div className="my-4 bg-[#fbfbf9] border-l-2 border-natural-green/70 p-3.5 rounded-r-xl">
                      <p className="text-xs italic leading-relaxed text-[#5a5a40]">
                        &ldquo;{rec.explanation}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Fact line: Distance, Price, Time stats */}
                  <div className="flex items-center justify-between border-t border-natural-border/60 pt-4 mt-2 justify-self-end">
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="text-[10px] md:text-xs font-semibold text-natural-muted flex items-center gap-1 font-mono">
                        <Compass className="w-4 h-4 text-natural-green" />
                        {rec.distance}
                      </span>
                      <span className="text-[10px] md:text-xs font-semibold text-natural-muted flex items-center gap-1 font-mono">
                        <DollarSign className="w-4 h-4 text-natural-green" />
                        {rec.priceLevel}
                      </span>
                      <span className="text-[10px] md:text-xs font-semibold text-natural-muted flex items-center gap-1 font-mono">
                        <Clock className="w-4 h-4 text-natural-green" />
                        {rec.timeRequired}
                      </span>
                    </div>

                    {/* Open Directions action button matching Design HTML outline */}
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
