import React from "react";
import { ArrowLeft, Trash2, Navigation, Bookmark, MapPin, DollarSign, Clock, Compass } from "lucide-react";
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
  
  const handleOpenDirections = (rec: Recommendation) => {
    const query = encodeURIComponent(rec.mapQuery || `${rec.name} ${rec.address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col flex-grow bg-natural-bg h-full animate-fade-in p-6">
      {/* Top Navbar */}
      <div className="flex items-center justify-between mb-4">
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

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto space-y-4 max-h-[580px] pr-1">
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
              className="bg-white p-5 rounded-[24px] border border-natural-border hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="bg-natural-softgreen text-natural-dark text-[9px] uppercase tracking-wider font-extrabold py-0.5 px-2 rounded">
                    {rec.category}
                  </span>
                  
                  <button
                    onClick={() => onRemoveFavorite(rec)}
                    className="p-1.5 rounded-full bg-natural-rust-soft border border-[#f5d0c0] text-natural-rust hover:bg-rose-100 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-serif font-bold text-base text-natural-dark tracking-tight leading-snug">
                  {rec.name}
                </h3>
                <p className="text-[10px] text-natural-muted mt-0.5 font-medium flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-natural-muted" />
                  {rec.address}
                </p>

                {/* Styled quote preview */}
                <div className="my-3 bg-natural-bg border-l-2 border-natural-green p-2.5">
                  <p className="text-xs italic leading-relaxed text-[#5a5a40]">
                    &ldquo;{rec.explanation}&rdquo;
                  </p>
                </div>
              </div>

              {/* Specs & Directions Row */}
              <div className="flex items-center justify-between border-t border-natural-border pt-3 mt-1.5">
                <div className="flex items-center gap-3 text-natural-text">
                  <span className="text-[10px] font-semibold flex items-center gap-0.5 font-mono">
                    <Compass className="w-3.5 h-3.5 text-natural-green" />
                    {rec.distance}
                  </span>
                  <span className="text-[10px] font-semibold flex items-center gap-0.5 font-mono">
                    <DollarSign className="w-3.5 h-3.5 text-natural-green" />
                    {rec.priceLevel}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenDirections(rec)}
                  className="bg-natural-green hover:bg-natural-dark text-white font-bold text-[10px] uppercase py-1.5 px-3.5 rounded-full flex items-center gap-1 transition-all"
                >
                  <Navigation className="w-3 h-3 text-white" />
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
