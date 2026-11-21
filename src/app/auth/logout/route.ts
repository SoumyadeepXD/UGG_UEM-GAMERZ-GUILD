import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error signing out:", err);
  }

  const redirectUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
