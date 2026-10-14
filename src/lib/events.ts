import { Tournament } from "@/types/tournament";
import { initialTournaments } from "@/data/initialTournaments";
import { siteConfig } from "@/config/site";

/**
 * Parses raw CSV text from Google Sheets into Tournament objects
 */
export function parseGoogleSheetCsv(csvText: string): Tournament[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]+/g, ""));

  const tournaments: Tournament[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV splitting handling simple quotes
    const row = lines[i];
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = "";

    for (let charIndex = 0; charIndex < row.length; charIndex++) {
      const char = row[charIndex];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    if (values.length >= 4) {
      const getVal = (colName: string, fallback = "") => {
        const index = headers.findIndex((h) => h.includes(colName));
        return index !== -1 && values[index] ? values[index].replace(/^["']|["']$/g, "") : fallback;
      };

      const title = getVal("title") || getVal("name");
      if (!title) continue;

      tournaments.push({
        id: getVal("id") || `ugg-event-${i}`,
        title,
        game: getVal("game", "Esports"),
        posterUrl: getVal("poster") || getVal("image", "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"),
        date: getVal("date", "TBA"),
        time: getVal("time", "TBA"),
        prizePool: getVal("prize", "Trophies & Glory"),
        format: getVal("format", "Open Bracket"),
        description: getVal("description", "Join the official UGG tournament and compete for glory."),
        formUrl: getVal("form") || getVal("link") || getVal("url", siteConfig.socials.discord),
        status: (getVal("status", "active").toLowerCase() as Tournament["status"]) || "active",
        platform: getVal("platform", "Cross-Platform"),
        entryFee: getVal("entry", "Free"),
      });
    }
  }

  return tournaments.length > 0 ? tournaments : initialTournaments;
}

/**
 * Retrieves the active tournaments from LocalStorage or Google Sheet or default mock
 */
export async function getTournaments(): Promise<Tournament[]> {
  if (typeof window === "undefined") {
    return initialTournaments;
  }

  // 1. Check if user configured a Google Sheet CSV URL
  const sheetUrl = localStorage.getItem(siteConfig.admin.sheetUrlKey);
  if (sheetUrl && sheetUrl.startsWith("http")) {
    try {
      const res = await fetch(sheetUrl, { cache: "no-store" });
      if (res.ok) {
        const csv = await res.text();
        const parsed = parseGoogleSheetCsv(csv);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to fetch Google Sheet CSV, falling back to local data:", e);
    }
  }

  // 2. Check local storage for admin edits
  try {
    const local = localStorage.getItem(siteConfig.admin.storageKey);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read local tournaments:", e);
  }

  return initialTournaments;
}

/**
 * Saves tournaments to LocalStorage
 */
export function saveTournamentsLocally(tournaments: Tournament[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(siteConfig.admin.storageKey, JSON.stringify(tournaments));
  }
}
