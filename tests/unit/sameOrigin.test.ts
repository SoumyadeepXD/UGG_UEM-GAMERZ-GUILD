import test from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { validateSameOrigin } from "../../src/lib/security/sameOrigin";

test("sameOrigin: accepts same-origin requests with sec-fetch-site: same-origin", () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "localhost:3000",
      "sec-fetch-site": "same-origin",
      "origin": "http://localhost:3000",
      "content-type": "application/json",
    },
  });

  const error = validateSameOrigin(req, { requireJson: true });
  assert.strictEqual(error, null);
});

test("sameOrigin: accepts direct user action with sec-fetch-site: none", () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "localhost:3000",
      "sec-fetch-site": "none",
      "origin": "http://localhost:3000",
      "content-type": "application/json",
    },
  });

  const error = validateSameOrigin(req, { requireJson: true });
  assert.strictEqual(error, null);
});

test("sameOrigin: accepts matching origin when sec-fetch-site is omitted", () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "localhost:3000",
      "origin": "http://localhost:3000",
      "content-type": "application/json",
    },
  });

  const error = validateSameOrigin(req, { requireJson: true });
  assert.strictEqual(error, null);
});

test("sameOrigin: accepts matching origin via x-forwarded-host header", () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "internal-balancer",
      "x-forwarded-host": "ugg.uemk.ac.in",
      "origin": "https://ugg.uemk.ac.in",
      "content-type": "application/json",
    },
  });

  const error = validateSameOrigin(req, { requireJson: true });
  assert.strictEqual(error, null);
});

test("sameOrigin: rejects cross-site sec-fetch-site with 403", async () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "localhost:3000",
      "sec-fetch-site": "cross-site",
      "origin": "https://malicious-site.com",
      "content-type": "application/json",
    },
  });

  const response = validateSameOrigin(req, { requireJson: true });
  assert.notStrictEqual(response, null);
  assert.strictEqual(response?.status, 403);
  const data = await response?.json();
  assert.strictEqual(data?.error?.includes("Cross-origin"), true);
});

test("sameOrigin: rejects origin mismatch with 403", async () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "localhost:3000",
      "origin": "https://evil-attacker.com",
      "content-type": "application/json",
    },
  });

  const response = validateSameOrigin(req, { requireJson: true });
  assert.notStrictEqual(response, null);
  assert.strictEqual(response?.status, 403);
  const data = await response?.json();
  assert.strictEqual(data?.error?.includes("Origin mismatch"), true);
});

test("sameOrigin: rejects request missing both sec-fetch-site and origin with 403", async () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "localhost:3000",
      "content-type": "application/json",
    },
  });

  const response = validateSameOrigin(req, { requireJson: true });
  assert.notStrictEqual(response, null);
  assert.strictEqual(response?.status, 403);
  const data = await response?.json();
  assert.strictEqual(data?.error?.includes("Missing valid same-origin"), true);
});

test("sameOrigin: rejects missing or non-json Content-Type when requireJson is true", async () => {
  const req = new NextRequest("http://localhost:3000/api/admin/tournaments", {
    method: "POST",
    headers: {
      "host": "localhost:3000",
      "sec-fetch-site": "same-origin",
      "origin": "http://localhost:3000",
      "content-type": "text/plain",
    },
  });

  const response = validateSameOrigin(req, { requireJson: true });
  assert.notStrictEqual(response, null);
  assert.strictEqual(response?.status, 403);
  const data = await response?.json();
  assert.strictEqual(data?.error?.includes("Content-Type must be application/json"), true);
});
