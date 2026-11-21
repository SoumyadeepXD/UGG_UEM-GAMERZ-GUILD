import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/adminGuard";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logAdminAction } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limiter = rateLimit(`admin-upload-${ip}`, { max: 20, windowMs: 60000 });

  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limiter.reset),
          "X-RateLimit-Reset": String(limiter.reset),
        },
      }
    );
  }

  const auth = await verifyAdminRequest();
  if (!auth.authorized || !auth.user) {
    return auth.errorResponse!;
  }

  const adminSupabase = createAdminClient();
  if (!adminSupabase) {
    return NextResponse.json(
      { error: "Server storage credentials (SUPABASE_SERVICE_ROLE_KEY) not configured." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in form data." },
        { status: 400 }
      );
    }

    // 1. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, WebP, and AVIF images are permitted.",
        },
        { status: 400 }
      );
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File exceeds the 5MB size limit (${(file.size / (1024 * 1024)).toFixed(2)} MB uploaded).`,
        },
        { status: 400 }
      );
    }

    // 3. Generate collision-resistant unique file name
    const ext = MIME_TO_EXT[file.type] || "webp";
    const uniqueKey = crypto.randomUUID().slice(0, 8);
    const fileName = `poster-${Date.now()}-${uniqueKey}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Supabase Storage 'posters' bucket
    const { error: uploadError } = await adminSupabase.storage
      .from("posters")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "31536000", // 1 year immutable edge cache
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: "Failed to upload poster to storage bucket",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    // 5. Retrieve Public CDN URL
    const {
      data: { publicUrl },
    } = adminSupabase.storage.from("posters").getPublicUrl(fileName);

    // 6. Record Immutable Audit Log
    await logAdminAction({
      actorId: auth.user.id,
      actorEmail: auth.user.email || "unknown@uem.edu.in",
      action: "UPLOAD_POSTER",
      resourceId: fileName,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        fileName,
        sizeBytes: file.size,
        mimeType: file.type,
        publicUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
        type: file.type,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload processing failed";
    return NextResponse.json(
      { error: "Internal server error during upload", details: message },
      { status: 500 }
    );
  }
}
