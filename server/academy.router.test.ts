import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createStudentLead: vi.fn(),
  createAcademyCourse: vi.fn(),
  createAcademyEvent: vi.fn(),
  createArchiveMoment: vi.fn(),
  deleteAcademyCourse: vi.fn(),
  deleteArchiveMoment: vi.fn(),
  deleteAcademyEvent: vi.fn(),
  deleteStudentLead: vi.fn(),
  deleteStudentLeads: vi.fn(),
  getAdminLeadPage: vi.fn().mockResolvedValue({ leads: [], total: 0, page: 1, pageSize: 10, totalPages: 1 }),
  markStudentLeadSpam: vi.fn(),
  markStudentLeadsSpam: vi.fn(),
  restoreStudentLead: vi.fn(),
  restoreStudentLeads: vi.fn(),
  updateStudentLeadFollowUpStatus: vi.fn(),
  getAdminArchiveMoments: vi.fn(),
  getAdminAnalytics: vi.fn().mockResolvedValue({ metrics: {}, dailyTrend: [], acquisition: [], ctaPerformance: [], funnel: [], fieldDropOff: [], pathwayPopularity: [], activity: [], exportRows: [] }),
  recordAnalyticsEvent: vi.fn(),
  resetAnalyticsTelemetry: vi.fn(),
  storagePut: vi.fn().mockResolvedValue({ key: "academy-archive/real-moment.jpg", url: "/manus-storage/academy-archive/real-moment.jpg" }),
  updateArchiveMoment: vi.fn(),
  updateAcademyCourse: vi.fn(),
  updateAcademyCourseImage: vi.fn(),
  updateAcademyContent: vi.fn(),
  answerAcademyQuestion: vi.fn().mockResolvedValue("The Prep School welcomes learners from age 8."),
}));

vi.mock("./db", () => ({
  createStudentLead: mocks.createStudentLead,
  createAcademyCourse: mocks.createAcademyCourse,
  createAcademyEvent: mocks.createAcademyEvent,
  createArchiveMoment: mocks.createArchiveMoment,
  deleteAcademyCourse: mocks.deleteAcademyCourse,
  deleteArchiveMoment: mocks.deleteArchiveMoment,
  deleteAcademyEvent: mocks.deleteAcademyEvent,
  deleteStudentLead: mocks.deleteStudentLead,
  deleteStudentLeads: mocks.deleteStudentLeads,
  getAdminLeadPage: mocks.getAdminLeadPage,
  markStudentLeadSpam: mocks.markStudentLeadSpam,
  markStudentLeadsSpam: mocks.markStudentLeadsSpam,
  restoreStudentLead: mocks.restoreStudentLead,
  restoreStudentLeads: mocks.restoreStudentLeads,
  updateStudentLeadFollowUpStatus: mocks.updateStudentLeadFollowUpStatus,
  getAdminArchiveMoments: mocks.getAdminArchiveMoments,
  getAdminAnalytics: mocks.getAdminAnalytics,
  getAcademyCatalog: vi.fn(),
  getAdminOverview: vi.fn(),
  recordPageView: vi.fn(),
  recordAnalyticsEvent: mocks.recordAnalyticsEvent,
  resetAnalyticsTelemetry: mocks.resetAnalyticsTelemetry,
  updateAcademyContent: mocks.updateAcademyContent,
  updateArchiveMoment: mocks.updateArchiveMoment,
  updateAcademyCourse: mocks.updateAcademyCourse,
  updateAcademyCourseImage: mocks.updateAcademyCourseImage,
}));

vi.mock("./academyChat", () => ({ answerAcademyQuestion: mocks.answerAcademyQuestion }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

import { academyRouter } from "./routers/academy";
import { calculateConversionRate } from "./academyMetrics";
import type { TrpcContext } from "./_core/context";

function context(adminSession = false): TrpcContext {
  return {
    user: null,
    adminSession,
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("academy intake and administration contracts", () => {
  it("validates Prep School age before accepting an intake", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.submitLead({ applicantType: "parent_guardian", parentName: "Valerie Wilcox", parentEmail: "valerie@example.com", studentName: "Learner One", studentAge: 7, primarySkill: "Software Computing", availability: "Wednesday afternoons" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("passes a validated intake to the student-lead persistence helper", async () => {
    const caller = academyRouter.createCaller(context());
    const lead = { applicantType: "parent_guardian" as const, parentName: "Valerie Wilcox", parentEmail: "valerie@example.com", studentName: "Learner One", studentAge: 12, primarySkill: "Software Computing", availability: "Wednesday afternoons and Saturday mornings" };
    await caller.submitLead(lead);
    expect(mocks.createStudentLead).toHaveBeenCalledWith(lead);
  });

  it("accepts an adult learner enquiry without parent-only framing", async () => {
    const caller = academyRouter.createCaller(context());
    const lead = { applicantType: "adult_learner" as const, parentName: "Jordan Blake", parentEmail: "jordan@example.com", studentName: "Jordan Blake", studentAge: 28, primarySkill: "AI Automation", availability: "Evenings and Saturdays" };
    await caller.submitLead(lead);
    expect(mocks.createStudentLead).toHaveBeenCalledWith(lead);
  });

  it("accepts an Agency work-experience enquiry from age 14", async () => {
    const caller = academyRouter.createCaller(context());
    const lead = { applicantType: "work_experience" as const, parentName: "Casey Morgan", parentEmail: "casey@example.com", studentName: "Casey Morgan", studentAge: 15, primarySkill: "Work Experience with PhoennixAI Agency", availability: "School holidays and Friday afternoons" };
    await caller.submitLead(lead);
    expect(mocks.createStudentLead).toHaveBeenCalledWith(lead);
  });

  it("prevents unauthenticated callers from editing public course settings", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.admin.updateCourse({ id: 1, title: "Product Design", description: "A complete product design learning pathway.", duration: "6 months", pricePence: 8500, paymentLink: null, featured: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an administrator session to submit course updates", async () => {
    const caller = academyRouter.createCaller(context(true));
    const update = { id: 1, title: "Product Design", description: "A complete product design learning pathway.", duration: "6 months", pricePence: 8500, paymentLink: null, featured: false };
    await caller.admin.updateCourse(update);
    expect(mocks.updateAcademyCourse).toHaveBeenCalledWith(update);
  });

  it("passes a validated sort mode to the protected real-lead page", async () => {
    const caller = academyRouter.createCaller(context(true));
    await caller.admin.leadPage({ status: "active", sort: "contact_az", page: 1, pageSize: 10 });
    expect(mocks.getAdminLeadPage).toHaveBeenCalledWith(expect.objectContaining({ sort: "contact_az" }));
  });

  it("rejects unsupported lead sort modes before querying records", async () => {
    const caller = academyRouter.createCaller(context(true));
    await expect(caller.admin.leadPage({ status: "active", sort: "unsafe_column" as never, page: 1, pageSize: 10 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("stores a programme image through protected storage before linking the override", async () => {
    const caller = academyRouter.createCaller(context(true));
    await caller.admin.updateCourseImage({ id: 1, fileName: "product-design.jpg", imageBase64: "a".repeat(160), imageMimeType: "image/jpeg" });
    expect(mocks.storagePut).toHaveBeenCalled();
    expect(mocks.updateAcademyCourseImage).toHaveBeenCalledWith({ id: 1, imageKey: "academy-archive/real-moment.jpg", imageUrl: "/manus-storage/academy-archive/real-moment.jpg" });
  });

  it("prevents non-administrators from replacing programme imagery", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.admin.updateCourseImage({ id: 1, fileName: "product-design.jpg", imageBase64: "a".repeat(160), imageMimeType: "image/jpeg" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("restricts course creation to administrator sessions", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.admin.createCourse({ title: "Founder Finance", description: "Practical commercial finance foundations for future venture builders.", duration: "5 months", pricePence: 12500, paymentLink: null, featured: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("passes a valid new course to the persistence helper", async () => {
    const caller = academyRouter.createCaller(context(true));
    const course = { title: "Founder Finance", description: "Practical commercial finance foundations for future venture builders.", duration: "5 months", pricePence: 12500, paymentLink: null, featured: false };
    await caller.admin.createCourse(course);
    expect(mocks.createAcademyCourse).toHaveBeenCalledWith(course);
  });

  it("restricts Luma event publishing to administrator sessions", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.admin.createEvent({ title: "Builder Session", summary: "A project-led event for future builders.", eventDate: "18 September 2026 · 18:00", lumaUrl: "https://lu.ma/builder-session" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("passes a valid public Luma event listing to the persistence helper", async () => {
    const caller = academyRouter.createCaller(context(true));
    const event = { title: "Builder Session", summary: "A project-led event for future builders.", eventDate: "18 September 2026 · 18:00", lumaUrl: "https://lu.ma/builder-session" };
    await caller.admin.createEvent(event);
    expect(mocks.createAcademyEvent).toHaveBeenCalledWith(event);
  });

  it("restricts the private archive library to administrator sessions", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.admin.archiveMoments()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("uploads a valid archive image through protected storage before creating its record", async () => {
    const caller = academyRouter.createCaller(context(true));
    const input = { title: "Founder gathering", caption: "Builders sharing practical ideas after the Academy session.", category: "Founder room", bentoSize: "feature" as const, published: true, capturedAt: "August 2026", fileName: "founder-gathering.jpg", imageBase64: "a".repeat(120), imageMimeType: "image/jpeg" as const };
    await caller.admin.createArchiveMoment(input);
    expect(mocks.storagePut).toHaveBeenCalled();
    expect(mocks.createArchiveMoment).toHaveBeenCalledWith(expect.objectContaining({ title: input.title, imageKey: "academy-archive/real-moment.jpg", imageUrl: "/manus-storage/academy-archive/real-moment.jpg", published: true }));
  });

  it("passes concise visitor questions through to the chatbot response service", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.chat({ question: "What age can students start?" })).resolves.toEqual({ answer: "The Prep School welcomes learners from age 8." });
    expect(mocks.answerAcademyQuestion).toHaveBeenCalledWith("What age can students start?");
  });

  it("calculates a one-decimal conversion rate without a divide-by-zero error", () => {
    expect(calculateConversionRate(0, 2)).toBe(0);
    expect(calculateConversionRate(37, 4)).toBe(10.8);
  });

  it("records an actual programme-view event without accepting visitor-entered form content", async () => {
    const caller = academyRouter.createCaller(context());
    const event = { eventType: "course_view" as const, path: "/courses", visitorKey: "e91b6623-351e-4ad9-8fd6-8aa843881c12", source: "social" as const, pathway: "AI Automation", detail: "Programme card visible" };
    await caller.trackAnalyticsEvent(event);
    expect(mocks.recordAnalyticsEvent).toHaveBeenCalledWith(event);
  });

  it("restricts lead deletion to administrator sessions", async () => {
    const anonymous = academyRouter.createCaller(context());
    await expect(anonymous.admin.deleteLead({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    await admin.admin.deleteLead({ id: 7 });
    expect(mocks.deleteStudentLead).toHaveBeenCalledWith(7);
  });

  it("validates and passes bounded bulk lead cleanup to the persistence helper", async () => {
    const anonymous = academyRouter.createCaller(context());
    await expect(anonymous.admin.deleteLeads({ ids: [1, 2] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    await admin.admin.deleteLeads({ ids: [4, 4, 9] });
    expect(mocks.deleteStudentLeads).toHaveBeenCalledWith([4, 9]);
    await expect(admin.admin.deleteLeads({ ids: [] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(admin.admin.deleteLeads({ ids: Array.from({ length: 101 }, (_, index) => index + 1) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("protects filtered and paginated lead retrieval", async () => {
    const anonymous = academyRouter.createCaller(context());
    await expect(anonymous.admin.leadPage({ status: "active", page: 1, pageSize: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    const filters = { search: "Valerie", fromDate: "2026-08-01", toDate: "2026-08-31", status: "spam" as const, page: 2, pageSize: 20 };
    await admin.admin.leadPage(filters);
    expect(mocks.getAdminLeadPage).toHaveBeenCalledWith({ ...filters, sort: "newest" });
  });

  it("passes an Administrator’s follow-up filter to the real lead query", async () => {
    const admin = academyRouter.createCaller(context(true));
    await admin.admin.leadPage({ status: "active", followUpStatus: "contacted", page: 1, pageSize: 10 });
    expect(mocks.getAdminLeadPage).toHaveBeenCalledWith(expect.objectContaining({ followUpStatus: "contacted", sort: "newest" }));
  });

  it("restricts lead follow-up updates to administrator sessions and validates their lifecycle", async () => {
    const anonymous = academyRouter.createCaller(context());
    await expect(anonymous.admin.updateLeadFollowUpStatus({ id: 9, followUpStatus: "enrolled" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    await admin.admin.updateLeadFollowUpStatus({ id: 9, followUpStatus: "enrolled" });
    expect(mocks.updateStudentLeadFollowUpStatus).toHaveBeenCalledWith(9, "enrolled");
    await expect(admin.admin.updateLeadFollowUpStatus({ id: 9, followUpStatus: "not_a_status" as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("keeps spam marking and restore operations Admin-only and bounded", async () => {
    const anonymous = academyRouter.createCaller(context());
    await expect(anonymous.admin.markLeadsSpam({ ids: [1] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    await admin.admin.markLeadSpam({ id: 3 });
    await admin.admin.markLeadsSpam({ ids: [3, 3, 8] });
    await admin.admin.restoreLead({ id: 8 });
    await admin.admin.restoreLeads({ ids: [8, 8, 11] });
    expect(mocks.markStudentLeadSpam).toHaveBeenCalledWith(3);
    expect(mocks.markStudentLeadsSpam).toHaveBeenCalledWith([3, 8]);
    expect(mocks.restoreStudentLead).toHaveBeenCalledWith(8);
    expect(mocks.restoreStudentLeads).toHaveBeenCalledWith([8, 11]);
    await expect(admin.admin.markLeadsSpam({ ids: Array.from({ length: 101 }, (_, index) => index + 1) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("restricts filtered strategic analytics to administrator sessions", async () => {
    const anonymous = academyRouter.createCaller(context());
    await expect(anonymous.admin.analytics({ source: "social" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    const filters = { startDate: "2026-08-01", endDate: "2026-08-31", pathway: "AI Automation", source: "social" as const };
    await admin.admin.analytics(filters);
    expect(mocks.getAdminAnalytics).toHaveBeenCalledWith(filters);
  });

  it("requires an administrator session and exact confirmation before resetting anonymous telemetry", async () => {
    await expect(academyRouter.createCaller(context()).admin.resetAnalytics({ confirmation: "RESET ANALYTICS" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    await expect(admin.admin.resetAnalytics({ confirmation: "reset analytics" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await admin.admin.resetAnalytics({ confirmation: "RESET ANALYTICS" });
    expect(mocks.resetAnalyticsTelemetry).toHaveBeenCalledTimes(1);
  });
});
