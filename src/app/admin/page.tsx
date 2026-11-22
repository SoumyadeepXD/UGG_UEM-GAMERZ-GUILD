import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Tournament } from "@/types/tournament";
import { getSiteContent } from "@/lib/siteContent";
import AdminDashboard from "./AdminDashboard";

/**
 * Force on-demand server rendering per request.
 * Guarantees that /admin is never statically pre-rendered at build time.
 * Every incoming request must provide an authenticated coordinator session cookie.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Coordinator Portal | UGG",
  robots: {
    index: false,
    follow: false,
  },
};

interface DbTournamentRow {
  id: string;
  title: string;
  game: string;
  poster_url?: string;
  posterUrl?: string;
  date: string;
  time?: string;
  prize_pool?: string;
  prizePool?: string;
  format?: string;
  platform?: string;
  entry_fee?: string;
  entryFee?: string;
  description?: string;
  form_url?: string;
  formUrl?: string;
  status: "active" | "upcoming" | "completed";
  registered_teams?: number;
  max_teams?: number;
}

export default async function AdminPage() {
  // Ensure cookies are accessed to enforce dynamic request-time rendering
  await cookies();

  // If Supabase environment variables are missing (e.g. before initial setup), redirect to login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Unauthenticated requests are immediately bounced; no admin data or UI is rendered
  if (error || !user) {
    redirect("/admin/login");
  }

  // Server-side Admin Authorization Guard: strictly verify app_metadata.role === "admin"
  const userRole = user.app_metadata?.role;
  if (userRole !== "admin") {
    redirect("/admin/unauthorized");
  }

  // Load active tournaments and site content from database for authorized admin
  let tournaments: Tournament[] = [];
  let siteContent = undefined;

  try {
    const [tournamentsRes, contentRes] = await Promise.all([
      supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false }),
      getSiteContent(),
    ]);

    siteContent = contentRes;
    const { data: dbTournaments, error: dbError } = tournamentsRes;

    if (!dbError && dbTournaments && dbTournaments.length > 0) {
      tournaments = dbTournaments.map((t: DbTournamentRow) => ({
        id: t.id,
        title: t.title,
        game: t.game,
        posterUrl: t.poster_url || t.posterUrl,
        date: t.date,
        time: t.time,
        prizePool: t.prize_pool || t.prizePool,
        format: t.format,
        platform: t.platform,
        entryFee: t.entry_fee || t.entryFee,
        description: t.description,
        formUrl: t.form_url || t.formUrl,
        status: t.status,
        registeredTeams: t.registered_teams,
        maxTeams: t.max_teams,
      }));
    }
  } catch (err) {
    console.error("Could not load database records in admin portal:", err);
  }

  return (
    <AdminDashboard
      userEmail={user.email || "coordinator@uem.edu.in"}
      initialTournaments={tournaments}
      initialContent={siteContent}
    />
  );
}
