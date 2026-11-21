import test from "node:test";
import assert from "node:assert";
import { isAllowlistedPosterUrl, isValidRegistrationUrl } from "../../src/lib/validations/urlAllowlist";
import { tournamentSchema, sanitizeText } from "../../src/lib/validations/tournament";
import { detectImageMagicBytes } from "../../src/lib/validations/magicBytes";

test("URL Allowlist: validates authorized poster CDNs", () => {
  // Allowlisted hosts
  assert.strictEqual(
    isAllowlistedPosterUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e"),
    true
  );
  assert.strictEqual(
    isAllowlistedPosterUrl("https://xyzcompany.supabase.co/storage/v1/object/public/posters/test.webp"),
    true
  );

  // Rejected hosts
  assert.strictEqual(isAllowlistedPosterUrl("https://malicious-site.com/image.png"), false);
  assert.strictEqual(isAllowlistedPosterUrl("http://images.unsplash.com/photo"), false); // HTTP rejected
  assert.strictEqual(isAllowlistedPosterUrl("javascript:alert(1)"), false);
  assert.strictEqual(isAllowlistedPosterUrl(""), false);
  assert.strictEqual(isAllowlistedPosterUrl(null), false);
});

test("URL Allowlist: validates registration URLs strictly with HTTPS", () => {
  assert.strictEqual(isValidRegistrationUrl("https://docs.google.com/forms/d/e/xxx/viewform"), true);
  assert.strictEqual(isValidRegistrationUrl("https://forms.gle/xyz"), true);

  // Dangerous / insecure schemes rejected
  assert.strictEqual(isValidRegistrationUrl("http://docs.google.com/forms"), false);
  assert.strictEqual(isValidRegistrationUrl("javascript:stealCookies()"), false);
  assert.strictEqual(isValidRegistrationUrl("data:text/html,<script>"), false);
  assert.strictEqual(isValidRegistrationUrl(""), false);
});

test("Text Sanitizer: strips HTML and script tags", () => {
  const dirty = "<script>alert('pwned')</script>Valorant <b>Championship</b>";
  const clean = sanitizeText(dirty);
  assert.strictEqual(clean, "Valorant Championship");

  const dangerousLink = "javascript:alert(1)";
  assert.strictEqual(sanitizeText(dangerousLink), "alert(1)");
});

test("Tournament Zod Schema: validates compliant tournament payload", () => {
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

test("Tournament Zod Schema: rejects invalid or dangerous payload", () => {
  const invalidPayload = {
    title: "Val",
    game: "V", // too short
    posterUrl: "https://evil.com/hack.png", // unallowlisted host
    date: "",
    formUrl: "http://insecure-form.com", // non-https
    status: "unknown_status", // invalid status enum
  };

  const parsed = tournamentSchema.safeParse(invalidPayload);
  assert.strictEqual(parsed.success, false);
});

test("Magic Bytes: correctly identifies JPEG, PNG, WebP, AVIF and rejects polyglots", () => {
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

  // Fake file (PHP script / Shell / Plain text)
  const shellScript = Buffer.from("<?php echo 'malicious shell'; ?>");
  assert.strictEqual(detectImageMagicBytes(shellScript), null);

  const emptyBuffer = Buffer.alloc(5);
  assert.strictEqual(detectImageMagicBytes(emptyBuffer), null);
});
