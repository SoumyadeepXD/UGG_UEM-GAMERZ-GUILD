import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Ignore
}
try {
  process.loadEnvFile(".env.test");
} catch {
  // Ignore
}

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

  // 3. Unauthenticated API Write Routes: same-origin headers strictly return 401
  test("Unauthenticated writes with same-origin headers strictly return 401", async ({
    request,
  }) => {
    const sameOriginHeaders = {
      "sec-fetch-site": "same-origin",
      "origin": "http://localhost:3000",
      "content-type": "application/json",
    };

    // POST /api/admin/tournaments
    const createRes = await request.post("/api/admin/tournaments", {
      headers: sameOriginHeaders,
      data: {
        title: "Unauthorized Event",
        game: "Valorant",
        posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        date: "Tomorrow",
        formUrl: "https://docs.google.com/forms/d/e/xxx",
        status: "active",
      },
    });
    expect(createRes.status()).toBe(401);

    // PATCH /api/admin/tournaments/mock-id
    const patchRes = await request.patch("/api/admin/tournaments/mock-id", {
      headers: sameOriginHeaders,
      data: { status: "completed" },
    });
    expect(patchRes.status()).toBe(401);

    // DELETE /api/admin/tournaments/mock-id
    const deleteRes = await request.delete("/api/admin/tournaments/mock-id", {
      headers: {
        "sec-fetch-site": "same-origin",
        "origin": "http://localhost:3000",
      },
    });
    expect(deleteRes.status()).toBe(401);

    // POST /api/admin/upload
    const uploadRes = await request.post("/api/admin/upload", {
      headers: {
        "sec-fetch-site": "same-origin",
        "origin": "http://localhost:3000",
      },
    });
    expect(uploadRes.status()).toBe(401);
  });

  // 4. Admin-Authenticated File Upload Security
  test("Admin File Upload: validates binary magic bytes, enforces 4MB limit, and uploads valid PNG with cleanup", async ({
    page,
  }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.TEST_ADMIN_EMAIL;
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!supabaseUrl || !serviceKey || !adminEmail || !adminPassword) {
      throw new Error("Missing test credentials or Supabase env vars for upload test");
    }

    // 1. Sign in as admin in the browser context
    await page.goto("/admin/login");
    await page.fill("#coordinator-email", adminEmail);
    await page.fill("#coordinator-password", adminPassword);
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 });
    await expect(page.locator("text=Publish Tournament").first()).toBeVisible();

    const sameOriginUploadHeaders = {
      "sec-fetch-site": "same-origin",
      "origin": page.url().split("/admin")[0],
    };

    // A. HTML file renamed to .png returns 400
    const fakeHtmlBuffer = Buffer.from("<html><script>alert('xss')</script></html>");
    const htmlUploadRes = await page.request.post("/api/admin/upload", {
      headers: sameOriginUploadHeaders,
      multipart: {
        file: {
          name: "malicious.png",
          mimeType: "image/png",
          buffer: fakeHtmlBuffer,
        },
      },
    });
    expect(htmlUploadRes.status()).toBe(400);
    const htmlUploadJson = await htmlUploadRes.json();
    expect(htmlUploadJson.error).toContain("Invalid file signature");

    // B. File over 4 MB returns 400
    const oversizedBuffer = Buffer.alloc(4.5 * 1024 * 1024);
    const oversizedRes = await page.request.post("/api/admin/upload", {
      headers: sameOriginUploadHeaders,
      multipart: {
        file: {
          name: "oversized.png",
          mimeType: "image/png",
          buffer: oversizedBuffer,
        },
      },
    });
    expect(oversizedRes.status()).toBe(400);
    const oversizedJson = await oversizedRes.json();
    expect(oversizedJson.error).toContain("4MB limit");

    // C. Small valid PNG returns 201 with a URL on the exact Supabase hostname
    const validPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    let uploadedFileName: string | undefined;
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    try {
      const validUploadRes = await page.request.post("/api/admin/upload", {
        headers: sameOriginUploadHeaders,
        multipart: {
          file: {
            name: "valid-fixture.png",
            mimeType: "image/png",
            buffer: validPngBuffer,
          },
        },
      });
      expect(validUploadRes.status()).toBe(201);
      const validUploadJson = await validUploadRes.json();
      expect(validUploadJson.success).toBe(true);
      expect(validUploadJson.auditLogged).toBe(true);
      expect(validUploadJson.url).toBeDefined();

      uploadedFileName = validUploadJson.fileName;

      // Verify URL is on the exact Supabase hostname
      const expectedHost = new URL(supabaseUrl).hostname;
      const uploadedUrl = new URL(validUploadJson.url);
      expect(uploadedUrl.hostname).toBe(expectedHost);
      expect(uploadedUrl.pathname).toContain("/storage/v1/object/public/posters/");
    } finally {
      // Delete uploaded object from posters bucket and clean up its audit log row in a finally block
      if (uploadedFileName) {
        await adminClient.storage.from("posters").remove([uploadedFileName]);
        await adminClient.from("admin_audit_logs").delete().eq("resource_id", uploadedFileName);
      }
    }
  });

  // 5. Carousel Tests on public homepage with seeded database fixtures
  test("Carousel: pause button is visible on a 375px mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const pauseButton = page.locator("button[aria-label*='tournament auto-slide']");
    await expect(pauseButton).toBeVisible();
  });

  test("Carousel: pause button is visible on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const pauseButton = page.locator("button[aria-label*='tournament auto-slide']");
    await expect(pauseButton).toBeVisible();
  });

  test("Carousel: keyboard Enter on prev/next changes slide without opening a new tab", async ({
    page,
    context,
  }) => {
    await page.goto("/");
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
    await page.goto("/");

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

  // 7. Security: Cross-origin POST is rejected by sameOrigin check
  test("Security: Cross-origin POST is rejected with 403", async ({ request }) => {
    // Rejected when Sec-Fetch-Site is cross-site
    const crossSiteRes = await request.post("/api/admin/tournaments", {
      headers: {
        "sec-fetch-site": "cross-site",
        "origin": "https://malicious-site.com",
        "content-type": "application/json",
      },
      data: {
        title: "Malicious Tournament",
        game: "Valorant",
        posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        date: "Tomorrow",
        formUrl: "https://docs.google.com/forms/d/e/xxx",
        status: "active",
      },
    });
    expect(crossSiteRes.status()).toBe(403);
    const crossSiteJson = await crossSiteRes.json();
    expect(crossSiteJson.error).toContain("Forbidden: Cross-origin request rejected");

    // Rejected when Origin does not match Host
    const originMismatchRes = await request.post("/api/admin/tournaments", {
      headers: {
        "origin": "https://evil-attacker.com",
        "content-type": "application/json",
      },
      data: {
        title: "Malicious Tournament",
        game: "Valorant",
        posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        date: "Tomorrow",
        formUrl: "https://docs.google.com/forms/d/e/xxx",
        status: "active",
      },
    });
    expect(originMismatchRes.status()).toBe(403);
  });

  // 8. Admin Write Isolation: PATCH and DELETE on nonexistent ID return 404 and write no audit rows
  test("Admin Write Isolation: PATCH and DELETE on nonexistent ID return 404 and write no audit log", async ({
    page,
  }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.TEST_ADMIN_EMAIL;
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!supabaseUrl || !serviceKey || !adminEmail || !adminPassword) {
      throw new Error("Missing test credentials or Supabase env vars for admin nonexistent ID test");
    }

    // 1. Sign in as admin in the browser context
    await page.goto("/admin/login");
    await page.fill("#coordinator-email", adminEmail);
    await page.fill("#coordinator-password", adminPassword);
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 });
    await expect(page.locator("text=Publish Tournament").first()).toBeVisible();

    const nonExistentId = `nonexistent-id-${Date.now()}`;
    const sameOriginHeaders = {
      "sec-fetch-site": "same-origin",
      "origin": page.url().split("/admin")[0],
      "content-type": "application/json",
    };

    // 2. PATCH on nonexistent ID returns 404
    const patchRes = await page.request.patch(`/api/admin/tournaments/${nonExistentId}`, {
      headers: sameOriginHeaders,
      data: { status: "completed" },
    });
    expect(patchRes.status()).toBe(404);
    const patchJson = await patchRes.json();
    expect(patchJson.error).toContain("Tournament not found");

    // 3. DELETE on nonexistent ID returns 404
    const deleteRes = await page.request.delete(`/api/admin/tournaments/${nonExistentId}`, {
      headers: {
        "sec-fetch-site": "same-origin",
        "origin": page.url().split("/admin")[0],
      },
    });
    expect(deleteRes.status()).toBe(404);
    const deleteJson = await deleteRes.json();
    expect(deleteJson.error).toContain("Tournament not found");

    // 4. Verify no audit log row was written for this nonexistent ID
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const { data: auditLogs, error: auditError } = await adminClient
      .from("admin_audit_logs")
      .select("*")
      .eq("resource_id", nonExistentId);

    expect(auditError).toBeNull();
    expect(auditLogs).toHaveLength(0);
  });

  // 9. Non-Admin Isolation: Non-admin session receives 403 Forbidden on all write routes and tests Sign Out
  test("Non-admin session receives 403 Forbidden on write routes and can sign out", async ({
    page,
  }) => {
    const nonAdminEmail = process.env.TEST_NONADMIN_EMAIL;
    const nonAdminPassword = process.env.TEST_NONADMIN_PASSWORD;

    if (!nonAdminEmail || !nonAdminPassword) {
      throw new Error(
        "FAILED: Missing TEST_NONADMIN_EMAIL or TEST_NONADMIN_PASSWORD in environment. As per rules, tests must fail if missing."
      );
    }

    // 1. Sign in as non-admin
    await page.goto("/admin/login");
    await page.fill("#coordinator-email", nonAdminEmail);
    await page.fill("#coordinator-password", nonAdminPassword);
    await page.click("button[type='submit']");

    // 2. Redirected to /admin/unauthorized
    await expect(page).toHaveURL(/\/admin\/unauthorized$/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Coordinator Clearance Required" })).toBeVisible();
    await expect(page.locator("text=ACCESS DENIED // 403 FORBIDDEN").first()).toBeVisible();

    const sameOriginHeaders = {
      "sec-fetch-site": "same-origin",
      "origin": page.url().split("/admin")[0],
      "content-type": "application/json",
    };

    // 3. Write routes return strictly 403 Forbidden for non-admin
    const createRes = await page.request.post("/api/admin/tournaments", {
      headers: sameOriginHeaders,
      data: {
        title: "Unauthorized Non-Admin Event",
        game: "Valorant",
        posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        date: "Tomorrow",
        formUrl: "https://docs.google.com/forms/d/e/xxx",
        status: "active",
      },
    });
    expect(createRes.status()).toBe(403);
    const createJson = await createRes.json();
    expect(createJson.error).toContain("Forbidden");

    const patchRes = await page.request.patch("/api/admin/tournaments/mock-id", {
      headers: sameOriginHeaders,
      data: { status: "completed" },
    });
    expect(patchRes.status()).toBe(403);

    const deleteRes = await page.request.delete("/api/admin/tournaments/mock-id", {
      headers: {
        "sec-fetch-site": "same-origin",
        "origin": page.url().split("/admin")[0],
      },
    });
    expect(deleteRes.status()).toBe(403);

    // 4. Test working Sign out button on /admin/unauthorized
    const signOutBtn = page.locator("button[aria-label='Sign out of coordinator portal']");
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();
    await expect(page).toHaveURL(/\/admin\/login$/, { timeout: 15000 });
    await expect(page.locator("text=UGG Portal Login")).toBeVisible();
  });

  // 10. Admin Lifecycle & Test Cleanup: Admin create, update, delete flow with verified cleanup
  test("Admin write lifecycle: create, update, delete with guaranteed cleanup", async ({
    page,
  }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.TEST_ADMIN_EMAIL;
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;

    if (!supabaseUrl || !serviceKey || !adminEmail || !adminPassword) {
      throw new Error(
        "FAILED: Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD or Supabase env vars."
      );
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const testTournamentId = `e2e-tourn-${Date.now()}`;

    try {
      // 1. Sign in as admin
      await page.goto("/admin/login");
      await page.fill("#coordinator-email", adminEmail);
      await page.fill("#coordinator-password", adminPassword);
      await page.click("button[type='submit']");
      await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 });
      await expect(page.locator("text=Publish Tournament").first()).toBeVisible();

      const sameOriginHeaders = {
        "sec-fetch-site": "same-origin",
        "origin": page.url().split("/admin")[0],
        "content-type": "application/json",
      };

      // 2. Create tournament
      const createRes = await page.request.post("/api/admin/tournaments", {
        headers: sameOriginHeaders,
        data: {
          id: testTournamentId,
          title: "E2E Lifecycle Tournament",
          game: "Valorant",
          posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
          date: "Tomorrow 6PM",
          formUrl: "https://docs.google.com/forms/d/e/xxx",
          status: "upcoming",
        },
      });
      expect(createRes.status()).toBe(201);
      const createJson = await createRes.json();
      expect(createJson.success).toBe(true);
      expect(createJson.auditLogged).toBe(true);

      // 3. Update status
      const patchRes = await page.request.patch(`/api/admin/tournaments/${testTournamentId}`, {
        headers: sameOriginHeaders,
        data: { status: "active" },
      });
      expect(patchRes.status()).toBe(200);
      const patchJson = await patchRes.json();
      expect(patchJson.success).toBe(true);
      expect(patchJson.auditLogged).toBe(true);

      // 4. Delete tournament
      const deleteRes = await page.request.delete(`/api/admin/tournaments/${testTournamentId}`, {
        headers: {
          "sec-fetch-site": "same-origin",
          "origin": page.url().split("/admin")[0],
        },
      });
      expect(deleteRes.status()).toBe(200);
      const deleteJson = await deleteRes.json();
      expect(deleteJson.success).toBe(true);
      expect(deleteJson.auditLogged).toBe(true);
    } finally {
      // 5. Guaranteed cleanup of any test rows created
      await adminClient.from("tournaments").delete().eq("id", testTournamentId);
      await adminClient.from("admin_audit_logs").delete().eq("resource_id", testTournamentId);
    }
  });
});
