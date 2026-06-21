import { 
  Coffee, 
  Laptop, 
  Users, 
  Compass, 
  Utensils, 
  Sparkles,
  Smile,
  CheckCircle,
  Clock,
  MapPin,
  Heart,
  Navigation,
  Info,
  DollarSign
} from "lucide-react";

export interface MoodConfig {
  id: string;
  label: string;
  emoji: string;
  description: string;
  colorClass: string;
  bgGradient: string;
  borderClass: string;
}

export const MOODS: MoodConfig[] = [
  {
    id: "stressed",
    label: "Stressed",
    emoji: "💆",
    description: "Serene tea houses, calming botanical walks, sensory decompression lounges, and soothing spas to unwind.",
    colorClass: "bg-rose-500 text-white",
    bgGradient: "from-rose-50 to-pink-50",
    borderClass: "border-rose-200 hover:border-rose-400"
  },
  {
    id: "social",
    label: "Social",
    emoji: "🎉",
    description: "Bustling street markets, board game cafes, craft breweries, lively plazas, or bowling lanes.",
    colorClass: "bg-purple-500 text-white",
    bgGradient: "from-purple-50 to-pink-50",
    borderClass: "border-purple-200 hover:border-purple-400"
  },
  {
    id: "relaxed",
    label: "Low Energy",
    emoji: "🍃",
    description: "Quiet spots, botanical gardens, slow coffee, calming views, or libraries.",
    colorClass: "bg-emerald-500 text-white",
    bgGradient: "from-emerald-50 to-teal-50",
    borderClass: "border-emerald-200 hover:border-emerald-400"
  },
  {
    id: "hungry",
    label: "Hungry",
    emoji: "🍕",
    description: "Amazing local eateries, cozy ramen shops, taco stands, dessert parlors, or food trucks.",
    colorClass: "bg-red-500 text-white",
    bgGradient: "from-red-50 to-rose-50",
    borderClass: "border-red-200 hover:border-red-400"
  },
  {
    id: "productive",
    label: "Productive",
    emoji: "💻",
    description: "Quiet cafes with Wi-Fi, modern libraries, co-working spaces, or silent corners.",
    colorClass: "bg-blue-500 text-white",
    bgGradient: "from-blue-50 to-indigo-50",
    borderClass: "border-blue-200 hover:border-blue-400"
  },
  {
    id: "adventurous",
    label: "Adventurous",
    emoji: "🧗",
    description: "Hidden hiking trails, climbing spots, rooftop views, geo-caching venues, or rental spots.",
    colorClass: "bg-amber-500 text-white",
    bgGradient: "from-amber-50 to-orange-50",
    borderClass: "border-amber-200 hover:border-amber-400"
  },
  {
    id: "bored",
    label: "Bored",
    emoji: "🎡",
    description: "Quirky museums, vintage arcade bars, botanical greenhouses, secret shops, or local events.",
    colorClass: "bg-orange-500 text-white",
    bgGradient: "from-orange-50 to-amber-50",
    borderClass: "border-orange-200 hover:border-orange-400"
  },
  {
    id: "artistic",
    label: "Artistic",
    emoji: "🎨",
    description: "Indie craft galleries, public art walls, local pottery studios, historic bookstores, and inspiring architectural spots.",
    colorClass: "bg-violet-500 text-white",
    bgGradient: "from-violet-50 to-fuchsia-10 to-purple-50",
    borderClass: "border-violet-200 hover:border-violet-400"
  }
];

export const PRESET_CITIRES = [
  { name: "San Francisco, CA", coords: { lat: 37.7749, lng: -122.4194 } },
  { name: "New York, NY", coords: { lat: 40.7128, lng: -74.006 } },
  { name: "Austin, TX", coords: { lat: 30.2672, lng: -97.7431 } },
  { name: "Seattle, WA", coords: { lat: 47.6062, lng: -122.3321 } },
  { name: "London, UK", coords: { lat: 51.5074, lng: -0.1278 } },
  { name: "Tokyo, Japan", coords: { lat: 35.6762, lng: 139.6503 } }
];
