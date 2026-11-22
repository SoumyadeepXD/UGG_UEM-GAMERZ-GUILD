import "server-only";
import { createClient } from "@supabase/supabase-js";
import { DEF } from "@/data/uggContent";
import { merge, UggContent } from "@/lib/ugg/util";

function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Server-side static query to fetch site content configuration for public pages and SSR.
 * Returns merged DEF fallback if database is uninitialized or table does not exist.
 */
export async function getSiteContent(): Promise<UggContent> {
  try {
    const supabase = getPublicSupabase();
    if (!supabase) {
      return structuredClone(DEF);
    }

    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data || !data.content) {
      if (error && error.code !== "PGRST116") {
        console.warn("Could not load site content from database (using fallback defaults):", error.message);
      }
      return structuredClone(DEF);
    }

    return merge(structuredClone(DEF), data.content) as UggContent;
  } catch (err) {
    console.warn("Exception fetching site content from database:", err);
    return structuredClone(DEF);
  }
}
