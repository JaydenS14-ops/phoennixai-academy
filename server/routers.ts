import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminCookieOptions,
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  getAdminRateLimitKey,
  registerFailedAdminLogin,
  validateAdminCredentialsAsync,
} from "./adminAuth";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { academyRouter } from "./routers/academy";
import { getLatestAdminSignIn, recordAdminSignIn } from "./db";
import { requestAdminPasswordRecovery, resetAdminPassword } from "./adminRecovery";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  admin: router({
    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(1).max(128),
          password: z.string().min(1).max(512),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const forwardedFor = ctx.req.headers["x-forwarded-for"];
        const ip = ctx.req.ip ?? (typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : undefined);
        const rateLimitKey = getAdminRateLimitKey(ip, input.username);
        const rateLimit = checkAdminLoginRateLimit(rateLimitKey);
        if (!rateLimit.allowed) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many sign-in attempts. Please wait and try again later." });
        }
        if (!(await validateAdminCredentialsAsync(input.username, input.password))) {
          registerFailedAdminLogin(rateLimitKey);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "The username or password is incorrect." });
        }
        clearAdminLoginFailures(rateLimitKey);
        const token = await createAdminSessionToken();
        await recordAdminSignIn();
        ctx.res.cookie(
          ADMIN_SESSION_COOKIE,
          token,
          getAdminCookieOptions(ENV.isProduction),
        );
        return { success: true } as const;
      }),
    status: publicProcedure.query(async ({ ctx }) => ({
      authenticated: Boolean(ctx.adminSession),
      latestSignIn: ctx.adminSession ? await getLatestAdminSignIn() : null,
    })),
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email().max(320) }))
      .mutation(async ({ input }) => {
        if (ENV.adminRecoveryEmail && input.email.trim().toLowerCase() === ENV.adminRecoveryEmail.trim().toLowerCase()) {
          await requestAdminPasswordRecovery();
        }
        return { message: "If the account details are eligible, recovery instructions have been sent." } as const;
      }),
    resetPassword: publicProcedure
      .input(z.object({ code: z.string().regex(/^\\d{6}$/), newPassword: z.string().min(12).max(512) }))
      .mutation(async ({ input }) => {
        await resetAdminPassword(input.code, input.newPassword);
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_SESSION_COOKIE, {
        ...getAdminCookieOptions(ENV.isProduction),
        maxAge: -1,
      });
      return { success: true } as const;
    }),
    privateCheck: adminProcedure.query(() => ({ ok: true })),
  }),
  academy: academyRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
