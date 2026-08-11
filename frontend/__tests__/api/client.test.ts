/**
 * API client unit tests.
 * Tests the buildQueryString utility and ApiClientError class.
 */

import { buildQueryString, ApiClientError } from "@/lib/api/client";

describe("buildQueryString", () => {
  it("returns empty string for empty params", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("builds a simple query string", () => {
    const qs = buildQueryString({ page: 1, pageSize: 24 });
    expect(qs).toBe("?page=1&pageSize=24");
  });

  it("omits undefined values", () => {
    const qs = buildQueryString({ page: 1, search: undefined });
    expect(qs).toBe("?page=1");
  });

  it("omits null values", () => {
    const qs = buildQueryString({ page: 1, sortBy: null });
    expect(qs).toBe("?page=1");
  });

  it("omits empty string values", () => {
    const qs = buildQueryString({ page: 1, position: "" });
    expect(qs).toBe("?page=1");
  });

  it("handles string and number values", () => {
    const qs = buildQueryString({ search: "Messi", minOvr: 90 });
    expect(qs).toContain("search=Messi");
    expect(qs).toContain("minOvr=90");
  });

  it("handles boolean values", () => {
    const qs = buildQueryString({ active: true });
    expect(qs).toBe("?active=true");
  });
});

describe("ApiClientError", () => {
  it("creates error with correct properties", () => {
    const err = new ApiClientError(404, "NOT_FOUND", "Player not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Player not found");
    expect(err.name).toBe("ApiClientError");
  });

  it("identifies 404 as not found", () => {
    const err = new ApiClientError(404, "NOT_FOUND", "Not found");
    expect(err.isNotFound).toBe(true);
    expect(err.isBadRequest).toBe(false);
    expect(err.isServerError).toBe(false);
  });

  it("identifies 400 as bad request", () => {
    const err = new ApiClientError(400, "BAD_REQUEST", "Bad request");
    expect(err.isBadRequest).toBe(true);
    expect(err.isNotFound).toBe(false);
  });

  it("identifies 500 as server error", () => {
    const err = new ApiClientError(500, "INTERNAL_ERROR", "Server error");
    expect(err.isServerError).toBe(true);
  });

  it("identifies 503 as server error", () => {
    const err = new ApiClientError(503, "SERVICE_UNAVAILABLE", "Unavailable");
    expect(err.isServerError).toBe(true);
  });

  it("identifies 0 as network error", () => {
    const err = new ApiClientError(0, "NETWORK_ERROR", "Cannot connect");
    expect(err.isNetworkError).toBe(true);
  });

  it("is an instance of Error", () => {
    const err = new ApiClientError(500, "ERROR", "Test");
    expect(err instanceof Error).toBe(true);
  });
});
