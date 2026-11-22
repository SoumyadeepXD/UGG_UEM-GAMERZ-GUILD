import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/auth/adminGuard";
import { validateSameOrigin } from "@/lib/security/sameOrigin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logAdminAction } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEF } from "@/data/uggContent";
import { merge, UggContent } from "@/lib/ugg/util";
import { getSiteContent } from "@/lib/siteContent";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limiter = await rateLimit(`admin-content-get-${ip}`, { max: 60, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Exception fetching site content in admin API:", err);
    return NextResponse.json({ error: "Failed to fetch site content" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // 1. Same-origin validation
  const originError = validateSameOrigin(request, { requireJson: true });
  if (originError) {
    return originError;
  }

  // 2. Rate limiting
  const ip = getClientIp(request.headers);
  const limiter = await rateLimit(`admin-content-write-${ip}`, { max: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many write requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limiter.reset),
          "X-RateLimit-Reset": String(limiter.reset),
        },
      }
    );
  }

  // 3. Admin authorization verification
  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  // 4. Privileged Supabase client
  const adminSupabase = createAdminClient();
  if (!adminSupabase) {
    return NextResponse.json(
      { error: "Database service unavailable. SUPABASE_SERVICE_ROLE_KEY missing." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.content || typeof body.content !== "object") {
      return NextResponse.json({ error: "Invalid payload: 'content' object is required." }, { status: 400 });
    }

    const rawContent = body.content;
    const jsonString = JSON.stringify(rawContent);

    // Payload size guard (< 2MB)
    if (jsonString.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Content payload exceeds 2MB limit." }, { status: 400 });
    }

    // Merge with defaults to ensure structural completeness
    const validatedContent = merge(structuredClone(DEF), rawContent) as UggContent;

    // 5. Upsert to public.site_content in Supabase
    const { error: upsertError } = await adminSupabase
      .from("site_content")
      .upsert(
        {
          id: "main",
          content: validatedContent,
          updated_at: new Date().toISOString(),
          updated_by: auth.user.email || auth.user.id,
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      console.error("Supabase upsert error in site_content:", upsertError.message);
      if (upsertError.message.includes("Could not find the table 'public.site_content'") || upsertError.code === "42P01") {
        return NextResponse.json(
          {
            error: "Database table 'public.site_content' not found in Supabase. Please run the SQL schema migration in your Supabase SQL editor.",
            needsMigration: true,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Failed to persist site content: ${upsertError.message}` },
        { status: 500 }
      );
    }

    // 6. Audit logging
    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "unknown",
      action: "UPDATE_SITE_CONTENT",
      resourceId: "main",
      details: { timestamp: new Date().toISOString() },
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || "Unknown",
    });

    // 7. On-demand Next.js ISR revalidation for instantaneous edge propagation
    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch (revErr) {
      console.warn("Revalidation warning:", revErr);
    }

    return NextResponse.json({
      success: true,
      message: "Website content saved and published globally to the live site!",
    });
  } catch (err) {
    console.error("Exception in POST /api/admin/content:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving site content." },
      { status: 500 }
    );
  }
}
