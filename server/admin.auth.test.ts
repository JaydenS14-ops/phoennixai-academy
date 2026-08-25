import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext() {
  const cookies: Array<{ name: string; value: string }> = [];
  const ctx: TrpcContext = {
    user: null,
    adminSession: false,
    req: { headers: {}, protocol: "https" } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string) => cookies.push({ name, value }),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
  return { ctx, cookies };
}

afterEach(() => vi.unstubAllEnvs());

describe("admin.login", () => {
  it("accepts the configured private credentials and issues an administrator session cookie", async () => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    expect(username).toBeTruthy();
    expect(password).toBeTruthy();

    const { ctx, cookies } = createContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.login({ username: username!, password: password! });

    expect(result).toEqual({ success: true });
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.name).toBe("phoennix_admin_session");
    expect(cookies[0]?.value.split(".")).toHaveLength(3);
  });

  it("rejects invalid administrator credentials", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.login({ username: "not-the-admin", password: "incorrect" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
