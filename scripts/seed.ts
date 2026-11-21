/**
 * Database Seed Script for UGG (UEMK Gamerz Guild)
 * Seeds initial tournament fixtures into Postgres using Supabase service role key.
 * 
 * Usage:
 *   npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import { initialTournaments } from "../src/data/initialTournaments";

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log(`Seeding ${initialTournaments.length} tournaments into ${supabaseUrl}...`);

  for (const t of initialTournaments) {
    const row = {
      id: t.id,
      title: t.title,
      game: t.game,
      poster_url: t.posterUrl,
      date: t.date,
      time: t.time,
      prize_pool: t.prizePool,
      format: t.format,
      platform: t.platform,
      entry_fee: t.entryFee,
      description: t.description,
      form_url: t.formUrl,
      status: t.status,
      registered_teams: t.registeredTeams ?? 0,
      max_teams: t.maxTeams ?? 32,
    };

    const { error } = await supabase
      .from("tournaments")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error(`Failed to upsert tournament ${t.id}:`, error.message);
    } else {
      console.log(`✓ Seeded tournament: ${t.id} (${t.title})`);
    }
  }

  console.log("Database seeding completed.");
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
