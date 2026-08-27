import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminCookieOptions,
  validateAdminCredentials,
} from "./adminAuth";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { academyRouter } from "./routers/academy";
import { getLatestAdminSignIn, recordAdminSignIn } from "./db";

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
        if (!validateAdminCredentials(input.username, input.password)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "The username or password is incorrect.",
          });
        }
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
