import React, { useState } from "react";
import { ArrowLeft, Trash2, Navigation, Bookmark, MapPin, DollarSign, Clock, Compass, Heart } from "lucide-react";
import { Recommendation } from "../types";

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
  
  const handleOpenDirections = (rec: Recommendation) => {
    const query = encodeURIComponent(rec.mapQuery || `${rec.name} ${rec.address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
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

        <span className="text-[10px] font-bold uppercase tracking-widest text-natural-green bg-natural-softgreen px-2.5 py-1 rounded-full">
          Bookmarked Spots
        </span>
      </div>

      <div className="mb-6">
        <h2 className="font-serif font-black text-2xl text-natural-dark leading-tight">
          Your Saved Sanctuary
        </h2>
        <p className="text-xs text-natural-muted mt-1 leading-relaxed">
          Quick access to your curated matching spots for varying daily moods.
        </p>
      </div>

      {/* Bookmarks List - Natural flow & Larger size match */}
      <div className="flex flex-col gap-5 pb-16">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-3xl border border-natural-border">
            <span className="text-3xl mb-3">🍃</span>
            <p className="font-semibold text-sm text-natural-dark">No favorites saved yet</p>
            <p className="text-xs text-natural-muted mt-1.5 leading-relaxed max-w-[220px]">
              Match your mood under the "Match Mood" flow and snap the heart badge to pin spots here.
            </p>
          </div>
        ) : (
          favorites.map((rec) => (
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
          ))
        )}
      </div>
    </div>
  );
}
