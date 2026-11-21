import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/auth/adminGuard";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { logAdminAction } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB hard limit

/**
 * Validates actual binary content using magic byte signatures.
 * Prevents arbitrary file uploads masquerading as images.
 */
export function detectImageMagicBytes(buffer: Buffer): { mime: string; ext: string } | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { mime: "image/webp", ext: "webp" };
  }

  // AVIF: ftyp (bytes 4-7) and avif/avis (bytes 8-11)
  const brand = buffer.subarray(4, 12).toString("ascii");
  if (brand.startsWith("ftyp") && (brand.includes("avif") || brand.includes("avis"))) {
    return { mime: "image/avif", ext: "avif" };
  }

  return null;
}

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

  // Verify active session AND coordinator admin authorization
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

    // 1. File size enforcement
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File exceeds the 5MB size limit (${(file.size / (1024 * 1024)).toFixed(2)} MB uploaded).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Real Content-Type inspection via binary magic bytes (reject all executable/script polyglots)
    const detected = detectImageMagicBytes(buffer);
    if (!detected) {
      return NextResponse.json(
        {
          error: "Invalid file signature. File content is not a valid JPEG, PNG, WebP, or AVIF image.",
        },
        { status: 400 }
      );
    }

    // 3. Cryptographically random collision-resistant filename
    const uniqueKey = crypto.randomUUID();
    const fileName = `poster-${Date.now()}-${uniqueKey}.${detected.ext}`;

    // 4. Upload to Supabase Storage 'posters' bucket
    const { error: uploadError } = await adminSupabase.storage
      .from("posters")
      .upload(fileName, buffer, {
        contentType: detected.mime,
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
        mimeType: detected.mime,
        publicUrl,
      },
    });

    // Revalidate admin and public paths
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
        type: detected.mime,
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
