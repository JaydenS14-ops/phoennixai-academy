import { z } from "zod";
import {
  createAcademyCourse,
  createAcademyEvent,
  createArchiveMoment,
  createStudentLead,
  deleteAcademyCourse,
  deleteArchiveMoment,
  deleteAcademyEvent,
  deleteStudentLead,
  deleteStudentLeads,
  getAdminLeadPage,
  markStudentLeadSpam,
  markStudentLeadsSpam,
  restoreStudentLead,
  restoreStudentLeads,
  getAdminArchiveMoments,
  getAdminAnalytics,
  getAcademyCatalog,
  getAdminOverview,
  recordPageView,
  recordAnalyticsEvent,
  resetAnalyticsTelemetry,
  updateArchiveMoment,
  updateAcademyContent,
  updateAcademyCourse,
  updateAcademyCourseImage,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { answerAcademyQuestion } from "../academyChat";
import { storagePut } from "../storage";

const leadInput = z.object({
  applicantType: z.enum(["parent_guardian", "adult_learner", "work_experience", "agency_apprenticeship"]),
  parentName: z.string().trim().min(2).max(160),
  parentEmail: z.string().trim().email().max(320),
  studentName: z.string().trim().min(2).max(160),
  studentAge: z.number().int().min(8).max(100),
  primarySkill: z.string().trim().min(2).max(160),
  availability: z.string().trim().min(8).max(2000),
}).superRefine((lead, context) => {
  if (lead.applicantType === "parent_guardian" && lead.studentAge < 8) context.addIssue({ code: "custom", path: ["studentAge"], message: "Prep School welcomes learners from age 8." });
  if (lead.applicantType === "adult_learner" && lead.studentAge < 18) context.addIssue({ code: "custom", path: ["studentAge"], message: "Please choose the appropriate youth, work-experience, or apprenticeship route for applicants under 18." });
  if ((lead.applicantType === "work_experience" || lead.applicantType === "agency_apprenticeship") && lead.studentAge < 14) context.addIssue({ code: "custom", path: ["studentAge"], message: "PhoennixAI Agency opportunity enquiries are available from age 14." });
});

const bentoSize = z.enum(["standard", "wide", "tall", "feature"]);
const imageMimeType = z.enum(["image/jpeg", "image/png", "image/webp"]);
const courseImageInput = z.object({
  id: z.number().int().positive(),
  fileName: z.string().trim().min(1).max(180),
  imageBase64: z.string().min(100).max(6000000),
  imageMimeType,
});
const analyticsEventInput = z.object({
  eventType: z.enum(["page_view", "course_view", "cta_click", "enquiry_start", "pathway_selected", "enquiry_field", "enquiry_step", "enquiry_submit"]),
  path: z.string().trim().min(1).max(255),
  visitorKey: z.string().trim().min(8).max(128),
  source: z.enum(["direct", "organic", "social", "referral", "campaign", "other"]),
  pathway: z.string().trim().max(160).optional(),
  detail: z.string().trim().max(160).optional(),
});
const analyticsFilterInput = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pathway: z.string().max(160).optional(),
  source: z.enum(["all", "direct", "organic", "social", "referral", "campaign", "other"]).optional(),
});

function archiveFileExtension(mimeType: z.infer<typeof imageMimeType>) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export const academyRouter = router({
  catalog: publicProcedure.query(() => getAcademyCatalog()),
  trackPageView: publicProcedure
    .input(z.object({ path: z.string().max(255), visitorKey: z.string().min(8).max(128) }))
    .mutation(({ input }) => recordPageView(input.path, input.visitorKey)),
  trackAnalyticsEvent: publicProcedure.input(analyticsEventInput).mutation(({ input }) => recordAnalyticsEvent(input)),
  submitLead: publicProcedure.input(leadInput).mutation(async ({ input }) => {
    await createStudentLead(input);
    return { success: true } as const;
  }),
  chat: publicProcedure
    .input(z.object({ question: z.string().trim().min(2).max(600) }))
    .mutation(async ({ input }) => ({ answer: await answerAcademyQuestion(input.question) })),
  admin: router({
    overview: adminProcedure.input(z.object({ search: z.string().trim().max(160).optional(), fromDate: z.string().date().optional(), toDate: z.string().date().optional(), status: z.enum(["active", "spam"]).default("active"), page: z.number().int().positive().default(1), pageSize: z.number().int().min(1).max(50).default(10) })).query(({ input }) => getAdminOverview(input)),
    leadPage: adminProcedure.input(z.object({ search: z.string().trim().max(160).optional(), fromDate: z.string().date().optional(), toDate: z.string().date().optional(), status: z.enum(["active", "spam"]).default("active"), page: z.number().int().positive().default(1), pageSize: z.number().int().min(1).max(50).default(10) })).query(({ input }) => getAdminLeadPage(input)),
    deleteLead: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteStudentLead(input.id)),
    deleteLeads: adminProcedure.input(z.object({ ids: z.array(z.number().int().positive()).min(1).max(100) })).mutation(({ input }) => deleteStudentLeads(Array.from(new Set(input.ids)))),
    markLeadSpam: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => markStudentLeadSpam(input.id)),
    markLeadsSpam: adminProcedure.input(z.object({ ids: z.array(z.number().int().positive()).min(1).max(100) })).mutation(({ input }) => markStudentLeadsSpam(Array.from(new Set(input.ids)))),
    restoreLead: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => restoreStudentLead(input.id)),
    restoreLeads: adminProcedure.input(z.object({ ids: z.array(z.number().int().positive()).min(1).max(100) })).mutation(({ input }) => restoreStudentLeads(Array.from(new Set(input.ids)))),
    analytics: adminProcedure.input(analyticsFilterInput).query(({ input }) => getAdminAnalytics(input)),
    resetAnalytics: adminProcedure.input(z.object({ confirmation: z.literal("RESET ANALYTICS") })).mutation(() => resetAnalyticsTelemetry()),
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
        title: z.string().trim().min(2).max(180),
        description: z.string().trim().min(10).max(2000),
        duration: z.string().trim().min(2).max(96),
        pricePence: z.number().int().min(0).max(10000000),
        paymentLink: z.string().trim().url().nullable(),
        featured: z.boolean(),
      }))
      .mutation(({ input }) => updateAcademyCourse(input)),
    updateCourseImage: adminProcedure
      .input(courseImageInput)
      .mutation(async ({ input }) => {
        const imageBuffer = Buffer.from(input.imageBase64, "base64");
        if (!imageBuffer.length || imageBuffer.byteLength > 4_500_000) throw new Error("Please choose a valid JPEG, PNG, or WebP image up to 4 MB.");
        const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 72) || "programme-image";
        const extension = archiveFileExtension(input.imageMimeType);
        const { key, url } = await storagePut(`academy-programmes/${Date.now()}-${safeName}.${extension}`, imageBuffer, input.imageMimeType);
        await updateAcademyCourseImage({ id: input.id, imageKey: key, imageUrl: url });
      }),
    clearCourseImage: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => updateAcademyCourseImage({ id: input.id, imageKey: null, imageUrl: null })),
    deleteCourse: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteAcademyCourse(input.id)),
    updateContent: adminProcedure
      .input(z.object({ contentKey: z.string().min(1).max(96), contentValue: z.string().trim().max(10000) }))
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
    archiveMoments: adminProcedure.query(() => getAdminArchiveMoments()),
    createArchiveMoment: adminProcedure
      .input(z.object({
        title: z.string().trim().min(2).max(180),
        caption: z.string().trim().min(2).max(2000),
        category: z.string().trim().min(2).max(96),
        bentoSize,
        published: z.boolean(),
        capturedAt: z.string().trim().min(2).max(96),
        fileName: z.string().trim().min(1).max(180),
        imageBase64: z.string().min(100).max(6000000),
        imageMimeType,
      }))
      .mutation(async ({ input }) => {
        const imageBuffer = Buffer.from(input.imageBase64, "base64");
        if (!imageBuffer.length || imageBuffer.byteLength > 4_500_000) {
          throw new Error("Please choose a valid JPEG, PNG, or WebP image up to 4 MB.");
        }
        const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 72) || "archive-moment";
        const extension = archiveFileExtension(input.imageMimeType);
        const { key, url } = await storagePut(`academy-archive/${Date.now()}-${safeName}.${extension}`, imageBuffer, input.imageMimeType);
        await createArchiveMoment({
          title: input.title,
          caption: input.caption,
          category: input.category,
          imageKey: key,
          imageUrl: url,
          bentoSize: input.bentoSize,
          published: input.published,
          capturedAt: input.capturedAt,
        });
      }),
    updateArchiveMoment: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().trim().min(2).max(180),
        caption: z.string().trim().min(2).max(2000),
        category: z.string().trim().min(2).max(96),
        bentoSize,
        published: z.boolean(),
        capturedAt: z.string().trim().min(2).max(96),
      }))
      .mutation(({ input }) => updateArchiveMoment(input)),
    deleteArchiveMoment: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteArchiveMoment(input.id)),
  }),
});
