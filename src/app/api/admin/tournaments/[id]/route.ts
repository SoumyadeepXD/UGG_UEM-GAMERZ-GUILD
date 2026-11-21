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
  const limiter = rateLimit(`admin-write-${ip}`, { max: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // (a) Verify session and admin email
  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();

    // (b) Validate input with Zod
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
      console.warn("Supabase update warning:", error.message);
    }

    // (c) Write audit log row
    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "unknown@uem.edu.in",
      action: "UPDATE_TOURNAMENT",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        title: validatedData.title,
        status: validatedData.status,
      },
    });

    // (d) Call revalidatePath
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getClientIp(request.headers);
  const limiter = rateLimit(`admin-write-${ip}`, { max: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // (a) Verify session and admin email
  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();

    // (b) Validate input with Zod
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
      console.warn("Supabase status update warning:", error.message);
    }

    // (c) Write audit log row
    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "unknown@uem.edu.in",
      action: "UPDATE_STATUS",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      details: { newStatus: status },
    });

    // (d) Call revalidatePath
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Patch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getClientIp(request.headers);
  const limiter = rateLimit(`admin-write-${ip}`, { max: 20, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // (a) Verify session and admin email
  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tournaments").delete().eq("id", id);

    if (error) {
      console.warn("Supabase delete warning:", error.message);
    }

    // (c) Write audit log row
    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "unknown@uem.edu.in",
      action: "DELETE_TOURNAMENT",
      resourceId: id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // (d) Call revalidatePath
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
