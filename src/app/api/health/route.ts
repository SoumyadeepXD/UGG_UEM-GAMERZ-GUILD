import { NextResponse } from "next/server";

const START_TIME = Date.now();

export const dynamic = "force-dynamic";

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);

  const status = {
    status: "healthy",
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      storageConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      edgeCache: "active",
    },
    version: "1.0.0",
  };

  return NextResponse.json(status, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
