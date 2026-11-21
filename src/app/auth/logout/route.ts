import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function performLogout(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error signing out:", err);
  }

  // Redirect target is strictly a fixed internal path, never user-supplied
  const redirectUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function POST(request: NextRequest) {
  return performLogout(request);
}

export async function GET(request: NextRequest) {
  return performLogout(request);
}
