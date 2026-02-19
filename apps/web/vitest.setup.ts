import "@testing-library/jest-dom";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

export const server = setupServer(
  http.post("/api/v1/auth/signup", () => {
    return HttpResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          id: "1",
          name: "Test User",
          username: "testuser",
          email: "test@example.com",
          createdAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  http.post("/api/v1/auth/login", () => {
    return HttpResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          id: "1",
          name: "Test User",
          username: "testuser",
          email: "test@example.com",
          createdAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }),

  http.post("/api/v1/auth/logout", () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  http.get("/api/v1/auth/verify/email", () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  http.post("/api/v1/auth/verify/resend", () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  http.post("/api/v1/auth/verify/forgot-password", () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  http.get("/api/v1/auth/verify/validate-reset-token", () => {
    return HttpResponse.json(
      { success: true, data: { valid: true } },
      { status: 200 }
    );
  }),

  http.post("/api/v1/auth/verify/reset-password", () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
