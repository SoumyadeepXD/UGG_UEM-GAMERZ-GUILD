import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

  // If Supabase environment variables are not yet configured,
  // ensure admin routes cannot be accessed anonymously
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdminRoute && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isAdminApiRoute) {
      return NextResponse.json(
        { error: "Server authentication not configured" },
        { status: 503 }
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

  // Redirect unauthenticated requests away from protected admin routes
  if (isAdminRoute && !isLoginPage && !isUnauthorizedPage) {
    if (!user) {
      const redirectUrl = new URL("/admin/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = (user.email || "").toLowerCase();
    const userRole = user.app_metadata?.role;
    const isAuthorized =
      userRole === "admin" || (adminEmails.length > 0 && adminEmails.includes(userEmail));

    if (!isAuthorized) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }
  }

  // If already logged in as admin, visiting login redirects to /admin
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // API protection
  if (isAdminApiRoute) {
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Active admin session required" },
        { status: 401 }
      );
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = (user.email || "").toLowerCase();
    const userRole = user.app_metadata?.role;
    const isAuthorized =
      userRole === "admin" || (adminEmails.length > 0 && adminEmails.includes(userEmail));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Coordinator admin role required" },
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
