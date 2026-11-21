import { createClient } from "../supabase/server";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export interface AdminAuthResult {
  authorized: boolean;
  user: User | null;
  errorResponse?: NextResponse;
}

/**
 * Validates whether the incoming request is authenticated and possesses admin role.
 */
export async function verifyAdminRequest(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        user: null,
        errorResponse: NextResponse.json(
          { error: "Unauthorized: Active admin session required" },
          { status: 401 }
        ),
      };
    }

    // Sole authorization check: user must have role === "admin" in app_metadata
    const userRole = user.app_metadata?.role;
    if (userRole !== "admin") {
      return {
        authorized: false,
        user,
        errorResponse: NextResponse.json(
          { error: "Forbidden: Admin clearance required" },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user,
    };
  } catch (err) {
    console.error("Error verifying admin request:", err);
    return {
      authorized: false,
      user: null,
      errorResponse: NextResponse.json(
        { error: "Internal Auth Error" },
        { status: 500 }
      ),
    };
  }
}
