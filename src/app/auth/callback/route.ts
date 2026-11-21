import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Redirect target is strictly a fixed internal path, never user-supplied
        return NextResponse.redirect(`${origin}/admin`);
      }
    } catch (err) {
      console.error("Auth callback exchange error:", err);
    }
  }

  // Return the user to login with a fixed path if verification failed
  return NextResponse.redirect(`${origin}/admin/login?error=auth_callback_failed`);
}
