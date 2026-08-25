import { z } from "zod";
import {
  createStudentLead,
  getAcademyCatalog,
  getAdminOverview,
  recordPageView,
  updateAcademyContent,
  updateAcademyCourse,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const leadInput = z.object({
  parentName: z.string().trim().min(2).max(160),
  parentEmail: z.string().trim().email().max(320),
  studentName: z.string().trim().min(2).max(160),
  studentAge: z.number().int().min(8).max(100),
  primarySkill: z.string().trim().min(2).max(160),
  availability: z.string().trim().min(8).max(2000),
});

export const academyRouter = router({
  catalog: publicProcedure.query(() => getAcademyCatalog()),
  trackPageView: publicProcedure
    .input(z.object({ path: z.string().max(255), visitorKey: z.string().min(8).max(128) }))
    .mutation(({ input }) => recordPageView(input.path, input.visitorKey)),
  submitLead: publicProcedure.input(leadInput).mutation(async ({ input }) => {
    await createStudentLead(input);
    return { success: true } as const;
  }),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    updateCourse: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        pricePence: z.number().int().min(0).max(10000000),
        paymentLink: z.string().trim().url().nullable(),
      }))
      .mutation(({ input }) => updateAcademyCourse(input)),
    updateContent: adminProcedure
      .input(z.object({ contentKey: z.string().min(1).max(96), contentValue: z.string().trim().min(1).max(10000) }))
      .mutation(({ input }) => updateAcademyContent(input.contentKey, input.contentValue)),
  }),
});
