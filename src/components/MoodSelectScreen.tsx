import React, { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, DollarSign, Compass, Clock, MapPin, ChevronDown, Check } from "lucide-react";
import { MOODS } from "../constants";
import { MoodType, SearchPreferences } from "../types";

interface MoodSelectScreenProps {
  onBack: () => void;
  onSearch: (prefs: SearchPreferences) => void;
  initialPrefs: SearchPreferences;
}

export default function MoodSelectScreen({
  onBack,
  onSearch,
  initialPrefs
}: MoodSelectScreenProps) {
  const [prefs, setPrefs] = useState<SearchPreferences>(initialPrefs);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(initialPrefs.mood || null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customMoodText, setCustomMoodText] = useState(() => {
    const isPreset = MOODS.some(m => m.id === initialPrefs.mood);
    return isPreset ? "" : (initialPrefs.mood || "");
  });

  const budgetOptions = ["Any", "Free", "$", "$$", "$$$"];
  const distanceOptions = [
    { label: "Walking distance (1 mi)", val: 1 },
    { label: "Biking distance (3 mi)", val: 3 },
    { label: "Quick drive (10 mi)", val: 10 },
    { label: "Regional wanderer (25 mi)", val: 25 }
  ];
  const indoorOutdoorOptions = ["Any", "Indoor", "Outdoor"];
  const timeOptions = ["Any", "Quick (<1 hr)", "Medium (1-3 hrs)", "Half Day (4+ hrs)"];

  const handleMoodSelect = (moodId: MoodType) => {
    setSelectedMood(moodId);
    setPrefs((prev) => ({ ...prev, mood: moodId }));
    setCustomMoodText("");
  };

  const handleCustomMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomMoodText(val);
    if (val.trim() !== "") {
      setSelectedMood(val as MoodType);
      setPrefs((prev) => ({ ...prev, mood: val as MoodType }));
    } else {
      setSelectedMood(null);
    }
  };

  const executeSearch = () => {
    if (!selectedMood) return;
    onSearch({
      ...prefs,
      mood: selectedMood
    });
  };

  return (
    <div className="flex flex-col flex-grow p-6 bg-natural-bg animate-fade-in justify-between">
      {/* Top Bar Navigation */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-natural-green hover:text-natural-dark font-bold mb-4 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <h2 className="font-serif font-black text-2xl text-natural-dark leading-tight">
          How are you feeling today?
        </h2>
        <p className="text-xs text-natural-muted mt-1 font-medium leading-relaxed">
          Type your exact vibe, or choose one of our verified emotional baseline presets below.
        </p>

        {/* Custom Mood Input Section at the top */}
        <div className="bg-white rounded-2xl p-4 border border-[#e5e7eb] shadow-xs my-4 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-16 h-16 bg-natural-softgreen/30 rounded-full blur-xl z-0"></div>
          <div className="relative z-10 w-full">
            <label className="text-[10px] uppercase font-semibold tracking-wider text-natural-green block mb-1.5 flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Type Your Mood / Vibe
            </label>
            <input
              type="text"
              placeholder="e.g. nostalgic, energetic, anxious, curious, romantic..."
              value={customMoodText}
              onChange={handleCustomMoodChange}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-natural-bg border border-natural-border text-natural-dark placeholder-natural-muted focus:outline-none focus:ring-1 focus:ring-natural-green focus:border-natural-green transition-all"
            />
            {customMoodText.trim() ? (
              <div className="mt-2 text-[10px] text-natural-green font-bold flex items-center gap-1">
                <span>✓ Active custom mood:</span>
                <span className="bg-natural-softgreen px-2 py-0.5 rounded-lg border border-natural-green/20">"{selectedMood}"</span>
              </div>
            ) : (
              <p className="text-[9px] text-[#8e8d8a] leading-tight mt-1.5">
                Type anything to bypass the cards and generate a bespoke, tailormade list of local spots.
              </p>
            )}
          </div>
        </div>

        {/* Or Pick a Preset Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-[1px] bg-natural-border flex-grow"></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-natural-muted font-sans whitespace-nowrap">Or Pick a Preset</span>
          <div className="h-[1px] bg-natural-border flex-grow"></div>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMoodSelect(m.id as MoodType)}
                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-[115px] cursor-pointer group ${
                  isSelected
                    ? "bg-natural-softgreen border-natural-green shadow-xs ring-1 ring-natural-green"
                    : "bg-white border-natural-border hover:bg-natural-bg shadow-2xs"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-2xl">{m.emoji}</span>
                  {isSelected && (
                    <span className="bg-natural-green text-white p-0.5 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs text-natural-dark group-hover:text-natural-green transition-colors">
                    {m.label}
                  </h3>
                  <p className="text-[10px] text-natural-muted font-medium leading-tight line-clamp-2 mt-0.5">
                    {m.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white rounded-2xl p-4 border border-natural-border shadow-2xs my-2">
        <div className="w-full flex items-center justify-between font-serif font-bold text-natural-dark text-xs pb-3 border-b border-natural-border/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-natural-green" />
            <span>Customize Mood Mapping</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3.5 pt-1">
          {/* Budget */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#8a9a5b] block mb-1.5 flex items-center gap-1 font-mono">
              <DollarSign className="w-3 h-3 text-natural-green" /> Budget Range
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {budgetOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPrefs((prev) => ({ ...prev, budget: opt }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    prefs.budget === opt
                      ? "bg-natural-green border-natural-green text-white"
                      : "bg-white border-natural-border text-natural-text hover:bg-natural-bg"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#8a9a5b] block mb-1.5 flex items-center gap-1 font-mono">
              <Compass className="w-3 h-3 text-natural-green" /> Radius Limit
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {distanceOptions.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setPrefs((prev) => ({ ...prev, maxDistance: opt.val }))}
                  className={`p-2 rounded-xl text-[10px] font-bold border text-center transition-all truncate leading-tight ${
                    prefs.maxDistance === opt.val
                      ? "bg-natural-green border-natural-green text-white"
                      : "bg-white border-natural-border text-natural-text hover:bg-natural-bg"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indoor or Outdoor */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#8a9a5b] block mb-1.5 flex items-center gap-1 font-mono">
              <MapPin className="w-3 h-3 text-natural-green" /> Setting Preference
            </label>
            <div className="flex gap-1.5">
              {indoorOutdoorOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPrefs((prev) => ({ ...prev, locationPref: opt }))}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    prefs.locationPref === opt
                      ? "bg-natural-green border-natural-green text-white"
                      : "bg-white border-natural-border text-natural-text hover:bg-natural-bg"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Time Required */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#8a9a5b] block mb-1.5 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-natural-green" /> Duration Available
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {timeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPrefs((prev) => ({ ...prev, timeAvailable: opt }))}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    prefs.timeAvailable === opt
                      ? "bg-natural-green border-natural-green text-white"
                      : "bg-white border-natural-border text-natural-text hover:bg-natural-bg"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Button bar */}
      <div className="mt-4">
        <button
          onClick={executeSearch}
          disabled={!selectedMood}
          className={`w-full py-4 px-6 rounded-2xl font-serif font-black shadow-sm transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer ${
            selectedMood
              ? "bg-natural-green hover:bg-natural-dark text-white shadow-xs"
              : "bg-natural-panel text-natural-muted border border-natural-border cursor-not-allowed"
          }`}
        >
          <span>Seek Alignments</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        {!selectedMood && (
          <p className="text-center text-[10px] text-natural-muted mt-2 font-medium">
            Please pick a baseline mood above to unleash local AI recommendations.
          </p>
        )}
      </div>
    </div>
  );
}
