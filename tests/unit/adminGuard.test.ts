import test from "node:test";
import assert from "node:assert";
import { setMockServerClient } from "../../src/lib/supabase/server";
import { verifyAdminRequest } from "../../src/lib/auth/adminGuard";

test("adminGuard: denies unauthenticated requests with 401", async () => {
  setMockServerClient({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: new Error("Invalid session"),
      }),
    },
  });

  const result = await verifyAdminRequest();
  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.errorResponse?.status, 401);
  const data = await result.errorResponse?.json();
  assert.strictEqual(data?.error?.includes("Active admin session required"), true);
});

test("adminGuard: denies non-admin users with 403", async () => {
  setMockServerClient({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "user-123",
            email: "student@uem.edu.in",
            app_metadata: { role: "authenticated" },
          },
        },
        error: null,
      }),
    },
  });

  const result = await verifyAdminRequest();
  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.errorResponse?.status, 403);
  const data = await result.errorResponse?.json();
  assert.strictEqual(data?.error?.includes("Admin clearance required"), true);
});

test("adminGuard: denies admin at aal1 when nextLevel is aal2 (MFA required) with 403", async () => {
  setMockServerClient({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "admin-123",
            email: "admin@ugg.gg",
            app_metadata: { role: "admin" },
          },
        },
        error: null,
      }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({
          data: {
            currentLevel: "aal1",
            nextLevel: "aal2",
          },
          error: null,
        }),
      },
    },
  });

  const result = await verifyAdminRequest();
  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.errorResponse?.status, 403);
  const data = await result.errorResponse?.json();
  assert.strictEqual(data?.error?.includes("MFA verification required"), true);
});

test("adminGuard: authorizes admin who completed MFA (currentLevel is aal2)", async () => {
  setMockServerClient({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "admin-123",
            email: "admin@ugg.gg",
            app_metadata: { role: "admin" },
          },
        },
        error: null,
      }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({
          data: {
            currentLevel: "aal2",
            nextLevel: "aal2",
          },
          error: null,
        }),
      },
    },
  });

  const result = await verifyAdminRequest();
  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.user?.id, "admin-123");
  assert.strictEqual(result.errorResponse, undefined);
});

test("adminGuard: authorizes admin when account does not require MFA (aal1/aal1)", async () => {
  setMockServerClient({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "admin-123",
            email: "admin@ugg.gg",
            app_metadata: { role: "admin" },
          },
        },
        error: null,
      }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({
          data: {
            currentLevel: "aal1",
            nextLevel: "aal1",
          },
          error: null,
        }),
      },
    },
  });

  const result = await verifyAdminRequest();
  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.user?.id, "admin-123");
  assert.strictEqual(result.errorResponse, undefined);

  // Clean up mock after tests
  setMockServerClient(null);
});
