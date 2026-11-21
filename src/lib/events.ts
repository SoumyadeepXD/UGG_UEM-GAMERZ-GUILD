import { createClient } from "@supabase/supabase-js";
import { Tournament } from "@/types/tournament";
import { initialTournaments } from "@/data/initialTournaments";

/**
 * Creates a public unauthenticated Supabase client.
 * Does not read request cookies, preserving Next.js static page generation and ISR.
 */
function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Parses raw CSV text (e.g. from Google Sheets) into Tournament objects.
 * Used for admin batch imports.
 */
export function parseGoogleSheetCsv(csvText: string): Tournament[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]+/g, ""));
  const tournaments: Tournament[] = [];

  for (let i = 1; i < lines.length; i++) {
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
        id: getVal("id") || `ugg-event-${i}-${Date.now()}`,
        title,
        game: getVal("game", "Esports"),
        posterUrl: getVal("poster") || getVal("image", "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"),
        date: getVal("date", "TBA"),
        time: getVal("time", "6:00 PM IST"),
        prizePool: getVal("prize", "Trophies & Glory"),
        format: getVal("format", "Open Bracket"),
        description: getVal("description", "Collegiate tournament organized by UEMK Gamerz Guild."),
        formUrl: getVal("form") || getVal("link") || getVal("url", "https://docs.google.com/forms"),
        status: (getVal("status", "active").toLowerCase() as Tournament["status"]) || "active",
        platform: getVal("platform", "Cross-Platform"),
        entryFee: getVal("entry", "Free"),
      });
    }
  }

  return tournaments.length > 0 ? tournaments : initialTournaments;
}

/**
 * Server-side static query to fetch published tournaments for public pages.
 * Resilient against database outages: falls back to static seed data if Supabase is offline.
 */
export async function getPublishedTournaments(): Promise<Tournament[]> {
  try {
    const supabase = getPublicSupabase();
    if (!supabase) {
      return initialTournaments;
    }

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .in("status", ["active", "upcoming"])
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Supabase fetch notice (falling back to static seed):", error.message);
      }
      return initialTournaments;
    }

    // Map Postgres snake_case column names to TypeScript Tournament interface
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      game: item.game,
      posterUrl: item.poster_url || item.posterUrl,
      date: item.date,
      time: item.time,
      prizePool: item.prize_pool || item.prizePool,
      format: item.format,
      platform: item.platform,
      entryFee: item.entry_fee || item.entryFee,
      description: item.description,
      formUrl: item.form_url || item.formUrl,
      status: item.status,
      registeredTeams: item.registered_teams,
      maxTeams: item.max_teams,
    }));
  } catch (err) {
    console.warn("Database connection issue during generation; serving static fallback:", err);
    return initialTournaments;
  }
}

/**
 * Backwards-compatible tournament retrieval
 */
export async function getTournaments(): Promise<Tournament[]> {
  return getPublishedTournaments();
}
