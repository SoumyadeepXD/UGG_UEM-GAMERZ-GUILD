import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

let mockServerClient: unknown = null;

export function setMockServerClient(client: unknown) {
  mockServerClient = client;
}

/**
 * Creates a server-side Supabase client for Server Components and Route Handlers.
 * Uses Next.js HttpOnly session cookies.
 */
export async function createClient() {
  if (mockServerClient) {
    return mockServerClient as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // Ignored if middleware is refreshing user sessions.
        }
      },
    },
  });
}
