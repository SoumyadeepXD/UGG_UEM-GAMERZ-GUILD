import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { validateSameOrigin } from "./lib/security/sameOrigin";

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isUnauthorizedPage = pathname === "/admin/unauthorized";
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  // If Supabase environment variables are not configured,
  // ensure admin routes cannot be accessed anonymously
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdminRoute && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isAdminApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized: Active admin session required" },
        { status: 401 }
      );
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let aal = null;
  if (user) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    aal = aalData;
  }

  const isMfaPending = Boolean(
    user && aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2"
  );

  // 1. Redirect unauthenticated or unauthorized requests away from protected admin routes
  if (isAdminRoute && !isLoginPage && !isUnauthorizedPage) {
    if (!user) {
      const redirectUrl = new URL("/admin/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const userRole = user.app_metadata?.role;
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    // Admin user has enrolled MFA but hasn't completed challenge (only at AAL1)
    if (isMfaPending) {
      const redirectUrl = new URL("/admin/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Login page handling:
  // Avoid redirect loop: only redirect login -> /admin when the session is fully authorized (AAL2 or no MFA required).
  // When an admin is only at AAL1 and needs MFA, /admin/login remains accessible to complete MFA verification.
  if (isLoginPage && user) {
    const userRole = user.app_metadata?.role;
    if (userRole === "admin") {
      if (!isMfaPending) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      // If MFA is pending, do not redirect: let the login page display the MFA verification form
    } else {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }
  }

  // 3. API protection
  if (isAdminApiRoute) {
    // For administrative write requests, enforce same-origin verification
    if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
      const isUpload = pathname === "/api/admin/upload";
      const isDelete = request.method === "DELETE";
      const originError = validateSameOrigin(request, {
        requireJson: !isUpload && !isDelete,
      });
      if (originError) {
        return originError;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Active admin session required" },
        { status: 401 }
      );
    }

    const userRole = user.app_metadata?.role;
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin role required" },
        { status: 403 }
      );
    }

    if (isMfaPending) {
      return NextResponse.json(
        { error: "Forbidden: MFA verification required (AAL2)" },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
