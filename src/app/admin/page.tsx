import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initialTournaments } from "@/data/initialTournaments";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Coordinator Portal | UGG",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  // If Supabase environment variables are missing (e.g. before initial setup), redirect to login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Admin Role Check
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (user.email || "").toLowerCase();
  const userRole = user.app_metadata?.role;
  const isAuthorized =
    userRole === "admin" || (adminEmails.length > 0 && adminEmails.includes(userEmail));

  if (!isAuthorized) {
    redirect("/admin/unauthorized");
  }

  // Load active tournaments from database
  let tournaments = initialTournaments;
  try {
    const { data: dbTournaments, error: dbError } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!dbError && dbTournaments && dbTournaments.length > 0) {
      tournaments = dbTournaments.map((t) => ({
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
    console.warn("Could not load tournaments from database, using initial fixtures:", err);
  }

  return (
    <AdminDashboard
      userEmail={user.email || "coordinator@uem.edu.in"}
      initialTournaments={tournaments}
    />
  );
}
