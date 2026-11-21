import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/auth/adminGuard";
import { tournamentSchema, updateStatusSchema } from "@/lib/validations/tournament";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logAdminAction } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const body = await request.json();

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
    const { error } = await supabase
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
      .eq("id", id);

    if (error) {
      console.error("Supabase tournament update error:", error.message);
      return NextResponse.json({ error: "Failed to update tournament record" }, { status: 500 });
    }

    await logAdminAction({
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

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    console.error("Update tournament exception:", err);
    return NextResponse.json({ error: "Failed to process tournament update" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const body = await request.json();

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
    const { error } = await supabase
      .from("tournaments")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase status update error:", error.message);
      return NextResponse.json({ error: "Failed to update tournament status" }, { status: 500 });
    }

    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "admin@ugg.gg",
      action: "UPDATE_STATUS",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      details: { newStatus: status },
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    console.error("Patch status exception:", err);
    return NextResponse.json({ error: "Failed to process status update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const { error } = await supabase.from("tournaments").delete().eq("id", id);

    if (error) {
      console.error("Supabase tournament delete error:", error.message);
      return NextResponse.json({ error: "Failed to delete tournament record" }, { status: 500 });
    }

    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "admin@ugg.gg",
      action: "DELETE_TOURNAMENT",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    console.error("Delete tournament exception:", err);
    return NextResponse.json({ error: "Failed to process tournament deletion" }, { status: 500 });
  }
}
