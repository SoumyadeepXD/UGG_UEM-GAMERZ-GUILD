import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { status: "unhealthy", timestamp },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from("tournaments").select("id").limit(1);

    if (error) {
      console.error("Health check DB ping error:", error.message);
      return NextResponse.json(
        { status: "unhealthy", timestamp },
        { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      { status: "healthy", timestamp },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("Health check unexpected error:", err);
    return NextResponse.json(
      { status: "unhealthy", timestamp },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
