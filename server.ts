import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for tracking
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cache map of approximate locations for fast coordinates matching if nominatim is slow
// and to guarantee some nice landmarks if there is any issue.
app.post("/api/recommend", async (req, res) => {
  try {
    const { lat, lng, mood, budget, maxDistance, locationPref, timeAvailable, customLocation } = req.body;

    let areaName = "";

    if (customLocation && customLocation.trim() !== "") {
      areaName = customLocation.trim();
    } else if (lat && lng) {
      try {
        // Reverse geocoding using OSM Nominatim to find neighborhood / city name
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const geoRes = await fetch(nominatimUrl, {
          headers: {
            "User-Agent": "MoodMapAI/1.0 (contact: Satyacorburn@gmail.com)"
          }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          // Construct a nice local summary area name e.g. "Mission District, San Francisco"
          const addr = geoData.address || {};
          const neighborhood = addr.neighborhood || addr.suburb || addr.village || "";
          const city = addr.city || addr.town || addr.municipality || "";
          const state = addr.state || "";
          
          const parts = [neighborhood, city, state].filter(Boolean);
          areaName = parts.slice(0, 2).join(", ") || geoData.display_name;
        }
      } catch (geoError) {
        console.error("OSM Nominatim error, falling back to coordinates:", geoError);
        areaName = `Coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    }

    if (!areaName) {
      areaName = "San Francisco, CA"; // Ultimate fallback
    }

    // Build the query to Gemini
    const systemPrompt = `You are MoodMap AI, a hyper-focused and delightful local place recommender.
Given a user's location (city, neighborhood or region), their current mood, and optional preferences (budget, distance, indoor/outdoor state, and time available), you recommend exactly 5 actual, real nearby places (e.g. stores, parks, cafes, libraries, scenic spots, secret gardens, restaurants, or active venues) that perfectly cater to their mindset.

For each place, provide:
1. "name": The exact name of the place.
2. "category": A specific brief category (e.g. "Third Wave Cafe", "Scenic Overlook", "Cozy Bookstore", "Art Museum").
3. "address": The real or highly accurate street address.
4. "priceLevel": One of: "Free", "$", "$$", "$$$".
5. "distance": Estimated distance in miles or feet from the center of ${areaName}, written as a reader-friendly string (e.g., "0.4 miles away" or "walking distance").
6. "timeRequired": Recommended duration, matching user preferences (e.g. "1-2 hours", "30 mins", "Half day").
7. "explanation": A highly tailored, delightful explanation explaining exactly why this specific place suits their selected mood (${mood}) and other parameters. Keep it under 250 characters. Write with a warm, encouraging, local-guide vibe.
8. "mapQuery": A clean search query string for Google Maps search, such as "Cafe name address city state".
9. "latitude": Estimated latitude of the place.
10. "longitude": Estimated longitude of the place.

DO NOT return fake places. Every place must be an actual landmark or business. Make sure you filter strictly based on:
- mood: ${mood}
- location preference: ${locationPref || 'Any'} (Indoor/Outdoor focus)
- budget limit: ${budget || 'Any'} (if Free, prioritize free parks, libraries, vistas, or cheap snacks; if $, keep it affordable)
- time: ${timeAvailable || 'Any'}

Search grounding is enabled. Ground your recommendations on actual, real-life locations in and around ${areaName}. If the location name is coordinates, focus on the general geographic region.`;

    const promptText = `Find 5 excellent recommendations for someone currently in "${areaName}" whose mood is "${mood}".
Preferences:
- Budget: ${budget || "Any"}
- Max Distance: ${maxDistance ? maxDistance + " miles" : "Any"}
- Indoor/Outdoor: ${locationPref || "Any"}
- Time Available: ${timeAvailable || "Any"}

Return the results as a standard JSON array of objects fitting the schema. Ensure excellent local variety and distinct options tailored precisely to ${mood}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              address: { type: Type.STRING },
              priceLevel: { type: Type.STRING },
              distance: { type: Type.STRING },
              timeRequired: { type: Type.STRING },
              explanation: { type: Type.STRING },
              mapQuery: { type: Type.STRING },
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER }
            },
            required: ["name", "category", "address", "priceLevel", "distance", "timeRequired", "explanation", "mapQuery", "latitude", "longitude"]
          }
        },
        tools: [{ googleSearch: {} }] // Utilize Search Grounding to guarantee actual active spots
      }
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      resolvedArea: areaName,
      recommendations: parsed
    });

  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Internal server error occurred while analyzing the map recommendations."
    });
  }
});

// Serve frontend build output in production, otherwise forward requests to Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MoodMap AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
