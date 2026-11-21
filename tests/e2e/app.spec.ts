import { test, expect } from "@playwright/test";

test.describe("UGG Public Site & Security E2E Suite", () => {
  test("Public homepage loads statically with verified tournaments", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);

    // Verify title and brand presence
    await expect(page).toHaveTitle(/UGG/);
    await expect(page.locator("text=UEMK GAMERZ GUILD").first()).toBeVisible();

    // Verify pre-rendered tournament showdowns carousel exists
    await expect(page.locator("text=Tournaments Arena")).toBeVisible();
    await expect(page.locator("text=Featured Showdowns")).toBeVisible();
    await expect(page.locator("h3:has-text('Valorant: Clash of Radiants')")).toBeVisible();

    // Verify carousel controls (play/pause and navigation)
    const pausePlayBtn = page.locator("button[aria-label*='tournament auto-slide']");
    if (await pausePlayBtn.count() > 0) {
      await expect(pausePlayBtn.first()).toBeVisible();
    }
  });

  test("Unauthenticated /admin redirects to /admin/login without leaking data", async ({ page }) => {
    // Navigate directly to protected /admin route without cookies
    await page.goto("/admin");

    // Must be redirected to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("text=Coordinator Portal")).toBeVisible();

    // Verify no admin dashboard content or controls are present
    await expect(page.locator("text=Active Tournament Roster")).toHaveCount(0);
    await expect(page.locator("text=Publish New Tournament")).toHaveCount(0);
  });

  test("Unauthenticated API write routes strictly reject unauthorized requests", async ({ request }) => {
    // POST /api/admin/tournaments
    const createRes = await request.post("/api/admin/tournaments", {
      data: {
        title: "Malicious Injection Tournament",
        game: "Valorant",
        posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
        date: "Tomorrow",
        formUrl: "https://docs.google.com/forms/d/e/xxx",
        status: "active",
      },
    });

    // Must reject with 401 Unauthorized or 503 Service Unavailable (if env unconfigured)
    expect([401, 403, 503]).toContain(createRes.status());

    // POST /api/admin/upload
    const uploadRes = await request.post("/api/admin/upload");
    expect([401, 403, 503]).toContain(uploadRes.status());
  });

  test("Health check endpoint /api/health returns 200 and healthy status", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.services.edgeCache).toBe("active");
  });
});
