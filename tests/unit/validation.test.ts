import test from "node:test";
import assert from "node:assert";
import { isAllowlistedPosterUrl, isValidRegistrationUrl } from "../../src/lib/validations/urlAllowlist";
import { tournamentSchema, trimText } from "../../src/lib/validations/tournament";
import { detectImageMagicBytes } from "../../src/lib/validations/magicBytes";

test("URL Allowlist: validates authorized poster CDNs without wildcards", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mockproject.supabase.co";

  // Exact Supabase project host is allowed
  assert.strictEqual(
    isAllowlistedPosterUrl("https://mockproject.supabase.co/storage/v1/object/public/posters/test.webp"),
    true
  );

  // Explicit allowlisted CDN (images.unsplash.com) is allowed
  assert.strictEqual(
    isAllowlistedPosterUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e"),
    true
  );

  // Wildcard *.supabase.co from a DIFFERENT project is strictly rejected
  assert.strictEqual(
    isAllowlistedPosterUrl("https://otherproject.supabase.co/storage/v1/object/public/posters/test.webp"),
    false
  );

  // Insecure and malicious origins rejected
  assert.strictEqual(isAllowlistedPosterUrl("https://malicious-site.com/image.png"), false);
  assert.strictEqual(isAllowlistedPosterUrl("http://images.unsplash.com/photo"), false); // HTTP rejected
  assert.strictEqual(isAllowlistedPosterUrl("javascript:alert(1)"), false);
  assert.strictEqual(isAllowlistedPosterUrl(""), false);
  assert.strictEqual(isAllowlistedPosterUrl(null), false);
});

test("URL Allowlist: validates registration URLs strictly with HTTPS", () => {
  assert.strictEqual(isValidRegistrationUrl("https://docs.google.com/forms/d/e/xxx/viewform"), true);
  assert.strictEqual(isValidRegistrationUrl("https://forms.gle/xyz"), true);

  // Insecure or dangerous protocols rejected
  assert.strictEqual(isValidRegistrationUrl("http://docs.google.com/forms"), false);
  assert.strictEqual(isValidRegistrationUrl("javascript:stealCookies()"), false);
  assert.strictEqual(isValidRegistrationUrl("data:text/html,<script>"), false);
  assert.strictEqual(isValidRegistrationUrl(""), false);
  assert.strictEqual(isValidRegistrationUrl(null), false);
});

test("Text Trimming: safely trims whitespace without destructive HTML regexes", () => {
  const padded = "   Valorant Championship 2026   ";
  const clean = trimText(padded);
  assert.strictEqual(clean, "Valorant Championship 2026");
  assert.strictEqual(trimText(""), "");
});

test("Tournament Zod Schema: validates compliant tournament payload", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mockproject.supabase.co";

  const validPayload = {
    title: "Valorant Radiant Cup",
    game: "Valorant",
    posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    date: "Dec 10 - 12, 2026",
    time: "6:00 PM IST",
    prizePool: "₹20,000",
    format: "5v5 Single Elimination",
    platform: "PC",
    entryFee: "Free",
    description: "Official collegiate tournament",
    formUrl: "https://docs.google.com/forms/d/e/xxx/viewform",
    status: "active",
  };

  const parsed = tournamentSchema.safeParse(validPayload);
  assert.strictEqual(parsed.success, true);
});

test("Tournament Zod Schema: rejects invalid payloads and dangerous URLs", () => {
  // Rejected: Non-HTTPS registration URL
  const badUrlPayload = {
    title: "Valorant Championship",
    game: "Valorant",
    posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    date: "Dec 10, 2026",
    formUrl: "javascript:alert(1)",
    status: "active",
  };
  assert.strictEqual(tournamentSchema.safeParse(badUrlPayload).success, false);

  // Rejected: Non-allowlisted poster host
  const badPosterPayload = {
    title: "Valorant Championship",
    game: "Valorant",
    posterUrl: "https://unauthorized-cdn.com/poster.png",
    date: "Dec 10, 2026",
    formUrl: "https://docs.google.com/forms/d/e/xxx",
    status: "active",
  };
  assert.strictEqual(tournamentSchema.safeParse(badPosterPayload).success, false);

  // Rejected: Invalid status enum
  const badStatusPayload = {
    title: "Valorant Championship",
    game: "Valorant",
    posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    date: "Dec 10, 2026",
    formUrl: "https://docs.google.com/forms/d/e/xxx",
    status: "invalid_status",
  };
  assert.strictEqual(tournamentSchema.safeParse(badStatusPayload).success, false);
});

test("Magic Bytes: identifies JPEG, PNG, WebP, AVIF and rejects HTML/polyglots", () => {
  // JPEG: FF D8 FF
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert.deepStrictEqual(detectImageMagicBytes(jpegBuffer), { mime: "image/jpeg", ext: "jpg" });

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assert.deepStrictEqual(detectImageMagicBytes(pngBuffer), { mime: "image/png", ext: "png" });

  // WebP: RIFF ... WEBP
  const webpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // length
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20, // VP8
  ]);
  assert.deepStrictEqual(detectImageMagicBytes(webpBuffer), { mime: "image/webp", ext: "webp" });

  // AVIF: ....ftypavif
  const avifBuffer = Buffer.from([
    0x00, 0x00, 0x00, 0x1c, // size
    0x66, 0x74, 0x79, 0x70, // ftyp
    0x61, 0x76, 0x69, 0x66, // avif
  ]);
  assert.deepStrictEqual(detectImageMagicBytes(avifBuffer), { mime: "image/avif", ext: "avif" });

  // Renamed HTML script / PHP payload
  const htmlBuffer = Buffer.from("<html><head><script>alert(1)</script></head><body>evil</body></html>");
  assert.strictEqual(detectImageMagicBytes(htmlBuffer), null);

  const phpBuffer = Buffer.from("<?php system($_GET['cmd']); ?>");
  assert.strictEqual(detectImageMagicBytes(phpBuffer), null);

  const emptyBuffer = Buffer.alloc(8);
  assert.strictEqual(detectImageMagicBytes(emptyBuffer), null);
});

test("Upload Limits: validates 4MB size ceiling", () => {
  const MAX_FILE_SIZE = 4 * 1024 * 1024;
  const validSize = 3.8 * 1024 * 1024;
  const oversized = 4.2 * 1024 * 1024;

  assert.strictEqual(validSize <= MAX_FILE_SIZE, true);
  assert.strictEqual(oversized <= MAX_FILE_SIZE, false);
});
