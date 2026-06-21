export interface Recommendation {
  id: string; // client side uuid or md5 of name
  name: string;
  category: string;
  address: string;
  priceLevel: string; // "Free", "$", "$$", "$$$"
  distance: string;
  timeRequired: string;
  explanation: string;
  mapQuery: string;
  latitude: number;
  longitude: number;
}

export type MoodType = "relaxed" | "productive" | "social" | "adventurous" | "hungry" | "bored" | "stressed" | "artistic" | (string & {});

export interface SearchPreferences {
  mood: MoodType;
  budget: string; // "Any" | "Free" | "$" | "$$" | "$$$"
  maxDistance: number; // 2, 5, 10, 20
  locationPref: string; // "Any" | "Indoor" | "Outdoor"
  timeAvailable: string; // "Any" | "Quick (<1 hr)" | "Medium (1-3 hrs)" | "Half Day (4+ hrs)"
  customLocation: string; // custom address input
}

export type ACTIVE_SCREEN = "home" | "mood-select" | "results" | "favorites";
