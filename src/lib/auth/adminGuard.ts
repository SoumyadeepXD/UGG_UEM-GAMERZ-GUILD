import { createClient } from "../supabase/server";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export interface AdminAuthResult {
  authorized: boolean;
  user: User | null;
  errorResponse?: NextResponse;
}

function deny(status: number, error: string, user: User | null = null): AdminAuthResult {
  return {
    authorized: false,
    user,
    errorResponse: NextResponse.json({ error }, { status }),
  };
}

/**
 * Verified session + admin role + completed MFA challenge (aal2) when the
 * account has MFA enrolled.
 */
export async function verifyAdminRequest(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient();

    // getUser() re-validates the token with Supabase Auth.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return deny(401, "Unauthorized: Active admin session required");
    }

    if (user.app_metadata?.role !== "admin") {
      return deny(403, "Forbidden: Admin clearance required", user);
    }

    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalError || !aal) {
      return deny(401, "Unauthorized: Could not verify session assurance level", user);
    }

    if (aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      return deny(403, "Forbidden: MFA verification required", user);
    }

    return { authorized: true, user };
  } catch (err) {
    console.error("Error verifying admin request:", err);
    return deny(500, "Internal Auth Error");
  }
}