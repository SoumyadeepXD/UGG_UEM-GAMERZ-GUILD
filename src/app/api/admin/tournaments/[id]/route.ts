import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/auth/adminGuard";
import { validateSameOrigin } from "@/lib/security/sameOrigin";
import { tournamentSchema, updateStatusSchema } from "@/lib/validations/tournament";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logAdminAction } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

const TOURNAMENT_ID_REGEX = /^[A-Za-z0-9_-]{1,80}$/;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Call sameOrigin validation first
  const originError = validateSameOrigin(request, { requireJson: true });
  if (originError) {
    return originError;
  }

  const { id } = await params;
  if (!id || !TOURNAMENT_ID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid tournament ID format" }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const limiter = await rateLimit(`admin-write-${ip}`, { max: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = tournamentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = parseResult.data;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tournaments")
      .update({
        title: validatedData.title,
        game: validatedData.game,
        poster_url: validatedData.posterUrl,
        date: validatedData.date,
        time: validatedData.time,
        prize_pool: validatedData.prizePool,
        format: validatedData.format,
        platform: validatedData.platform,
        entry_fee: validatedData.entryFee,
        description: validatedData.description,
        form_url: validatedData.formUrl,
        status: validatedData.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("Supabase tournament update error:", error.message);
      return NextResponse.json({ error: "Failed to update tournament record" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Write audit log row only after successful update
    const auditLogged = await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "admin@ugg.gg",
      action: "UPDATE_TOURNAMENT",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        title: validatedData.title,
        status: validatedData.status,
      },
    });

    if (!auditLogged) {
      console.error(`[AUDIT_FAILURE] Failed to record audit log for UPDATE_TOURNAMENT ${id}`);
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, auditLogged, id });
  } catch (err: unknown) {
    console.error("Update tournament exception:", err);
    return NextResponse.json({ error: "Failed to process tournament update" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Call sameOrigin validation first
  const originError = validateSameOrigin(request, { requireJson: true });
  if (originError) {
    return originError;
  }

  const { id } = await params;
  if (!id || !TOURNAMENT_ID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid tournament ID format" }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const limiter = await rateLimit(`admin-write-${ip}`, { max: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = updateStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid status value",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status } = parseResult.data;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tournaments")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("Supabase status update error:", error.message);
      return NextResponse.json({ error: "Failed to update tournament status" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Write audit log row only after successful update
    const auditLogged = await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "admin@ugg.gg",
      action: "UPDATE_STATUS",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      details: { newStatus: status },
    });

    if (!auditLogged) {
      console.error(`[AUDIT_FAILURE] Failed to record audit log for UPDATE_STATUS ${id}`);
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, auditLogged, id, status });
  } catch (err: unknown) {
    console.error("Patch status exception:", err);
    return NextResponse.json({ error: "Failed to process status update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Call sameOrigin validation first
  const originError = validateSameOrigin(request, { requireJson: false });
  if (originError) {
    return originError;
  }

  const { id } = await params;
  if (!id || !TOURNAMENT_ID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid tournament ID format" }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const limiter = await rateLimit(`admin-write-${ip}`, { max: 20, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("Supabase tournament delete error:", error.message);
      return NextResponse.json({ error: "Failed to delete tournament record" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Write audit log row only after successful deletion
    const auditLogged = await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "admin@ugg.gg",
      action: "DELETE_TOURNAMENT",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    if (!auditLogged) {
      console.error(`[AUDIT_FAILURE] Failed to record audit log for DELETE_TOURNAMENT ${id}`);
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, auditLogged, deletedId: id });
  } catch (err: unknown) {
    console.error("Delete tournament exception:", err);
    return NextResponse.json({ error: "Failed to process tournament deletion" }, { status: 500 });
  }
}
