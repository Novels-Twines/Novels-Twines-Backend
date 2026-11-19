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
});
