import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import app from "./app";

describe("API foundation", () => {
  it("returns a healthy status", async () => {
    const response = await request(app).get("/api/health");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      status: "ok",
      service: "novels-twines-api",
    });
  });

  it("returns a consistent JSON response for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist");

    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "NOT_FOUND");
  });

  it("rejects requests to the account endpoint without a bearer token", async () => {
    const response = await request(app).get("/api/auth/me");

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "AUTH_REQUIRED");
  });

  it("rejects creator applications without a bearer token", async () => {
    const response = await request(app).post("/api/creator/applications");

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "AUTH_REQUIRED");
  });

  it("rejects admin actions without a bearer token", async () => {
    const response = await request(app).get("/api/admin/creator-applications");

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "AUTH_REQUIRED");
  });
});
