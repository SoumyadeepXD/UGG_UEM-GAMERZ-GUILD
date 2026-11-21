import { createClient } from "@supabase/supabase-js";
import { Tournament } from "@/types/tournament";

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
 * Server-side static query to fetch published tournaments for public pages.
 * Returns empty array when database is uninitialized or tournaments table is empty.
 */
export async function getPublishedTournaments(): Promise<Tournament[]> {
  try {
    const supabase = getPublicSupabase();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .in("status", ["active", "upcoming", "completed"])
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) {
        console.error("Supabase fetch error for published tournaments:", error.message);
      }
      return [];
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
    console.error("Database connection issue during generation:", err);
    return [];
  }
}

/**
 * Backwards-compatible tournament retrieval
 */
export async function getTournaments(): Promise<Tournament[]> {
  return getPublishedTournaments();
}
