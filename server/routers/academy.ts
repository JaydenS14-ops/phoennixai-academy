import { z } from "zod";
import {
  createAcademyCourse,
  createAcademyEvent,
  createStudentLead,
  deleteAcademyEvent,
  getAcademyCatalog,
  getAdminOverview,
  recordPageView,
  updateAcademyContent,
  updateAcademyCourse,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { answerAcademyQuestion } from "../academyChat";

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
  chat: publicProcedure
    .input(z.object({ question: z.string().trim().min(2).max(600) }))
    .mutation(async ({ input }) => ({ answer: await answerAcademyQuestion(input.question) })),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    createCourse: adminProcedure
      .input(z.object({
        title: z.string().trim().min(2).max(180),
        description: z.string().trim().min(10).max(2000),
        duration: z.string().trim().min(2).max(96),
        pricePence: z.number().int().min(0).max(10000000),
        paymentLink: z.string().trim().url().nullable(),
        featured: z.boolean(),
      }))
      .mutation(({ input }) => createAcademyCourse(input)),
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
    createEvent: adminProcedure
      .input(z.object({
        title: z.string().trim().min(2).max(180),
        summary: z.string().trim().min(2).max(2000),
        eventDate: z.string().trim().min(2).max(96),
        lumaUrl: z.string().trim().url().max(2000),
      }))
      .mutation(({ input }) => createAcademyEvent(input)),
    deleteEvent: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteAcademyEvent(input.id)),
  }),
});
