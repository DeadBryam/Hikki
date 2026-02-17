import { beforeAll, describe, expect, it } from "bun:test";
import { initDatabase } from "@/database/connection";
import { sessions, users } from "@/database/schema";
import { app } from "@/index";
import type { ErrorResponse } from "@/types/api";

describe("Auth Integration with Details", () => {
  beforeAll(async () => {
    await initDatabase();
    const db = (await import("@/database/connection")).db;
    db.delete(sessions).run();
    db.delete(users).run();
  });

  it("should return 409 with details when username already exists", async () => {
    const userData = {
      username: "detailed_user",
      email: "detailed@example.com",
      password: "Password123!",
      name: "Detailed User",
    };

    await app.handle(
      new Request("http://localhost/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
    );

    const response = await app.handle(
      new Request("http://localhost/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          email: "another_detailed@example.com",
        }),
      })
    );

    expect(response.status).toBe(409);
    const body = (await response.json()) as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.details).toBeDefined();
    expect(body.details?.[0]).toEqual({
      field: "username",
      message: "Username already exists",
    });
  });
});
