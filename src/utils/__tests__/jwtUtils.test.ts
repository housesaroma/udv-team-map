import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

declare const Buffer: {
  from(
    data: string,
    encoding?: string
  ): { toString(encoding?: string): string };
};
import {
  decodeJwt,
  extractEmailFromToken,
  extractFullNameFromToken,
  extractRoleFromToken,
  extractUserIdFromToken,
  extractUsernameFromToken,
  isTokenExpired,
} from "../jwtUtils";

type NullableAtob = typeof globalThis.atob | undefined;

const base64UrlEncode = (value: string): string =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const createToken = (payload: Record<string, unknown>): string => {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

let originalAtob: NullableAtob;

beforeAll(() => {
  originalAtob = globalThis.atob;
  globalThis.atob = (input: string): string => {
    const padding = (4 - (input.length % 4)) % 4;
    const padded = input + "=".repeat(padding);
    return Buffer.from(padded, "base64").toString("utf-8");
  };
});

afterAll(() => {
  if (originalAtob) {
    globalThis.atob = originalAtob;
  } else {
    delete (globalThis as Partial<typeof globalThis>).atob;
  }
});

describe("decodeJwt", () => {
  it("returns payload for valid token", () => {
    const token = createToken({ FullName: "QA User", Email: "qa@udv.group" });

    expect(decodeJwt(token)).toEqual({
      FullName: "QA User",
      Email: "qa@udv.group",
    });
  });

  it("returns null for malformed token segments", () => {
    expect(decodeJwt("broken.token")).toBeNull();
  });

  it("handles JSON parse errors gracefully", () => {
    const malformedBody = base64UrlEncode("not-json");
    const token = `header.${malformedBody}.signature`;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(decodeJwt(token)).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("extractRoleFromToken", () => {
  it("prioritizes admin role", () => {
    const token = createToken({
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "admin",
    });

    expect(extractRoleFromToken(token)).toBe("admin");
  });

  it("treats hr role or IsHr flag", () => {
    const roleToken = createToken({
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "hr",
    });
    const flagToken = createToken({ IsHr: "true" });

    expect(extractRoleFromToken(roleToken)).toBe("hr");
    expect(extractRoleFromToken(flagToken)).toBe("hr");
  });

  it("defaults to employee when payload missing", () => {
    expect(extractRoleFromToken("invalid")).toBe("employee");
  });

  it("returns employee when payload has no role data", () => {
    const token = createToken({ IsHr: "false" });

    expect(extractRoleFromToken(token)).toBe("employee");
  });
});

describe("claim extractors", () => {
  const payload = {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":
      "frontend.dev",
    Email: "dev@udv.group",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
      "user-1",
    FullName: "Dev User",
  };
  const token = createToken(payload);

  it("reads username claim", () => {
    expect(extractUsernameFromToken(token)).toBe("frontend.dev");
  });

  it("reads email claim", () => {
    expect(extractEmailFromToken(token)).toBe("dev@udv.group");
  });

  it("reads identifier claim", () => {
    expect(extractUserIdFromToken(token)).toBe("user-1");
  });

  it("reads full name claim", () => {
    expect(extractFullNameFromToken(token)).toBe("Dev User");
  });

  it("returns null for missing optional claims", () => {
    const minimalToken = createToken({});

    expect(extractUsernameFromToken(minimalToken)).toBeNull();
    expect(extractEmailFromToken(minimalToken)).toBeNull();
    expect(extractUserIdFromToken(minimalToken)).toBeNull();
    expect(extractFullNameFromToken(minimalToken)).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("treats missing payload or exp as expired", () => {
    expect(isTokenExpired("invalid")).toBe(true);
    const tokenWithoutExp = createToken({});
    expect(isTokenExpired(tokenWithoutExp)).toBe(true);
  });

  it("compares exp timestamp", () => {
    const future = Math.floor(Date.now() / 1000) + 60;
    const past = Math.floor(Date.now() / 1000) - 60;
    const futureToken = createToken({ exp: future });
    const pastToken = createToken({ exp: past });

    expect(isTokenExpired(futureToken)).toBe(false);
    expect(isTokenExpired(pastToken)).toBe(true);
  });
});
