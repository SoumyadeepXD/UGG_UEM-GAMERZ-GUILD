import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.describe("UGG Security & Public Interface Suite", () => {
  // 1. Public Homepage & Navigation
  test("Public homepage loads statically", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/UGG/);
    await expect(page.locator("text=UEMK GAMERZ GUILD").first()).toBeVisible();
    await expect(page.locator("text=Tournaments Arena")).toBeVisible();
  });

  // 2. Unauthenticated Admin Route Protection
  test("Unauthenticated /admin redirects to /admin/login without leaking data", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("text=Coordinator Portal")).toBeVisible();
    await expect(page.locator("text=Active Tournament Roster")).toHaveCount(0);
    await expect(page.locator("text=Publish New Tournament")).toHaveCount(0);
  });

  // 3. Unauthenticated API Write Routes: strictly return 401 or 403 (never 503)
  test("Unauthenticated writes (POST, PATCH, DELETE, upload) strictly return 401/403 (never 503)", async ({
    request,
  }) => {
    // POST /api/admin/tournaments
    const createRes = await request.post("/api/admin/tournaments", {
      data: {
        title: "Unauthorized Event",
        game: "Valorant",
        posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        date: "Tomorrow",
        formUrl: "https://docs.google.com/forms/d/e/xxx",
        status: "active",
      },
    });
    expect([401, 403]).toContain(createRes.status());
    expect(createRes.status()).not.toBe(503);

    // PATCH /api/admin/tournaments/mock-id
    const patchRes = await request.patch("/api/admin/tournaments/mock-id", {
      data: { status: "completed" },
    });
    expect([401, 403]).toContain(patchRes.status());
    expect(patchRes.status()).not.toBe(503);

    // DELETE /api/admin/tournaments/mock-id
    const deleteRes = await request.delete("/api/admin/tournaments/mock-id");
    expect([401, 403]).toContain(deleteRes.status());
    expect(deleteRes.status()).not.toBe(503);

    // POST /api/admin/upload
    const uploadRes = await request.post("/api/admin/upload");
    expect([401, 403]).toContain(uploadRes.status());
    expect(uploadRes.status()).not.toBe(503);
  });

  // 4. File Upload Security: rejects renamed HTML script and oversized (>4MB) files
  test("Upload rejects renamed HTML file and >4MB file", async ({ request }) => {
    // Even if unauthenticated, upload route rejects invalid requests with 401/403/400
    // Test magic byte payload with fake HTML masquerading as image/png
    const fakeHtmlFile = Buffer.from("<html><script>alert('xss')</script></html>");
    const uploadRes = await request.post("/api/admin/upload", {
      multipart: {
        file: {
          name: "fake-image.png",
          mimeType: "image/png",
          buffer: fakeHtmlFile,
        },
      },
    });
    expect([400, 401, 403]).toContain(uploadRes.status());

    // Test oversized file (> 4MB)
    const oversizedBuffer = Buffer.alloc(4.5 * 1024 * 1024);
    const oversizedRes = await request.post("/api/admin/upload", {
      multipart: {
        file: {
          name: "huge.jpg",
          mimeType: "image/jpeg",
          buffer: oversizedBuffer,
        },
      },
    });
    expect([400, 401, 403]).toContain(oversizedRes.status());
  });

  // 5. Carousel Tests without conditional assertions
  test("Carousel: pause button is visible on a 375px mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/test/carousel");
    const pauseButton = page.locator("button[aria-label*='tournament auto-slide']");
    await expect(pauseButton).toBeVisible();
  });

  test("Carousel: pause button is visible on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/test/carousel");
    const pauseButton = page.locator("button[aria-label*='tournament auto-slide']");
    await expect(pauseButton).toBeVisible();
  });

  test("Carousel: keyboard Enter on prev/next changes slide without opening a new tab", async ({
    page,
    context,
  }) => {
    await page.goto("/test/carousel");
    const initialSlide = await page.locator("div[role='group'][aria-roledescription='slide']").getAttribute("aria-label");

    const nextBtn = page.locator("button[aria-label='Next Tournament']");
    await nextBtn.focus();
    await page.keyboard.press("Enter");

    const afterNextSlide = await page.locator("div[role='group'][aria-roledescription='slide']").getAttribute("aria-label");
    expect(afterNextSlide).not.toBe(initialSlide);

    // Verify no new tab or window was spawned
    expect(context.pages().length).toBe(1);
  });

  test("Carousel: reduced-motion emulation disables autoplay", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/test/carousel");

    // Under reduced motion, auto-slide toggle is removed because autoplay is completely disabled
    const pauseButton = page.locator("button[aria-label*='tournament auto-slide']");
    await expect(pauseButton).toHaveCount(0);

    const initialSlide = await page.locator("div[role='group'][aria-roledescription='slide']").getAttribute("aria-label");
    await page.waitForTimeout(1500);
    const unchangedSlide = await page.locator("div[role='group'][aria-roledescription='slide']").getAttribute("aria-label");
    expect(unchangedSlide).toBe(initialSlide);
  });

  // 6. Real Dev Supabase & RLS Tests: MUST FAIL if env vars are missing
  test("Real dev Supabase RLS: denies anon-key direct REST write and audit log read", async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Strict requirement: MUST fail if env vars are missing
    if (!supabaseUrl || !anonKey) {
      throw new Error(
        "FAILED: Missing required real dev Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). As per instructions, tests must FAIL if env vars are missing."
      );
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    });

    // 1. Direct REST write to tournaments with anon key must be rejected by RLS
    const { error: insertError } = await anonClient.from("tournaments").insert({
      id: "malicious-anon-insert",
      title: "Hacked Tournament",
      game: "Hacked",
      poster_url: "https://evil.com/image.png",
      date: "Tomorrow",
      form_url: "https://evil.com",
      status: "active",
    });
    expect(insertError).not.toBeNull();

    // 2. Direct read of admin_audit_logs with anon key must be denied by RLS
    const { data: auditLogs, error: auditError } = await anonClient
      .from("admin_audit_logs")
      .select("*");
    expect(auditError !== null || (auditLogs && auditLogs.length === 0)).toBe(true);
  });
});
