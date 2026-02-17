import { describe, expect, it } from "bun:test";
import { app } from "@/index";

describe("Hikki API", () => {
  it("should return welcome message", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("Welcome to Hikki AI Assistant!");
  });
});
