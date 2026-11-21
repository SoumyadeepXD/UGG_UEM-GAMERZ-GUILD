import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/auth/adminGuard";
import { validateSameOrigin } from "@/lib/security/sameOrigin";
import { tournamentSchema } from "@/lib/validations/tournament";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logAdminAction } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

interface DbTournamentRow {
  id: string;
  title: string;
  game: string;
  poster_url?: string;
  posterUrl?: string;
  date: string;
  time?: string;
  prize_pool?: string;
  prizePool?: string;
  format?: string;
  platform?: string;
  entry_fee?: string;
  entryFee?: string;
  description?: string;
  form_url?: string;
  formUrl?: string;
  status: "active" | "upcoming" | "completed";
  registered_teams?: number;
  max_teams?: number;
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limiter = await rateLimit(`admin-get-${ip}`, { max: 60, windowMs: 60000 });
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

    if (error) {
      console.error("Error fetching tournaments in admin API:", error.message);
      return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ tournaments: [] });
    }

    const mapped = data.map((item: DbTournamentRow) => ({
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
    console.error("Exception fetching tournaments in admin API:", err);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Call sameOrigin validation first
  const originError = validateSameOrigin(request, { requireJson: true });
  if (originError) {
    return originError;
  }

  const ip = getClientIp(request.headers);
  const limiter = await rateLimit(`admin-write-${ip}`, { max: 20, windowMs: 60000 });
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

  // Verify session and admin role
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

    // Validate input with Zod
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
    const tournamentId = validatedData.id || `ugg-${crypto.randomUUID()}`;

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
      console.error("Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to save tournament record" },
        { status: 500 }
      );
    }

    // Write an audit log row
    const auditLogged = await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "admin@ugg.gg",
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

    if (!auditLogged) {
      console.error(`[AUDIT_FAILURE] Failed to record audit log for CREATE_TOURNAMENT ${tournamentId}`);
    }

    // Revalidate paths for on-demand ISR
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(
      {
        success: true,
        auditLogged,
        tournament: data || {
          ...validatedData,
          id: tournamentId,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Admin tournament creation handler exception:", err);
    return NextResponse.json(
      { error: "Failed to process tournament creation" },
      { status: 500 }
    );
  }
}
