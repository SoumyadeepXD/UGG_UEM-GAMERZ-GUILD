import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/auth/adminGuard";
import { tournamentSchema } from "@/lib/validations/tournament";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logAdminAction } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { initialTournaments } from "@/data/initialTournaments";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limiter = rateLimit(`admin-get-${ip}`, { max: 60, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ tournaments: initialTournaments });
    }

    const mapped = data.map((item) => ({
      id: item.id,
      title: item.title,
      game: item.game,
      posterUrl: item.poster_url || item.posterUrl,
      date: item.date,
      time: item.time,
      prizePool: item.prize_pool || item.prizePool,
      format: item.format,
      platform: item.platform,
      entryFee: item.entry_fee || item.entryFee,
      description: item.description,
      formUrl: item.form_url || item.formUrl,
      status: item.status,
      registeredTeams: item.registered_teams,
      maxTeams: item.max_teams,
    }));

    return NextResponse.json({ tournaments: mapped });
  } catch (err) {
    console.error("Error fetching tournaments in admin API:", err);
    return NextResponse.json({ tournaments: initialTournaments });
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limiter = rateLimit(`admin-write-${ip}`, { max: 20, windowMs: 60000 });
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
    const tournamentId = validatedData.id || `ugg-${Date.now()}`;

    const newTournament = {
      id: tournamentId,
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
      registered_teams: validatedData.registeredTeams || 0,
      max_teams: validatedData.maxTeams || 32,
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tournaments")
      .insert(newTournament)
      .select()
      .single();

    if (error) {
      console.warn("Supabase insert warning:", error.message);
    }

    // (c) Write an audit log row
    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "unknown@uem.edu.in",
      action: "CREATE_TOURNAMENT",
      resourceId: tournamentId,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        title: validatedData.title,
        game: validatedData.game,
        status: validatedData.status,
      },
    });

    // (d) Call revalidatePath for public site and admin
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(
      {
        success: true,
        tournament: data || {
          ...validatedData,
          id: tournamentId,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create tournament", details: message },
      { status: 500 }
    );
  }
}
