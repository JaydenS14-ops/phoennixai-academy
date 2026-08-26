import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createStudentLead: vi.fn(),
  createAcademyCourse: vi.fn(),
  createAcademyEvent: vi.fn(),
  createArchiveMoment: vi.fn(),
  deleteAcademyCourse: vi.fn(),
  deleteArchiveMoment: vi.fn(),
  deleteAcademyEvent: vi.fn(),
  getAdminArchiveMoments: vi.fn(),
  storagePut: vi.fn().mockResolvedValue({ key: "academy-archive/real-moment.jpg", url: "/manus-storage/academy-archive/real-moment.jpg" }),
  updateArchiveMoment: vi.fn(),
  updateAcademyCourse: vi.fn(),
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
  getAdminArchiveMoments: mocks.getAdminArchiveMoments,
  getAcademyCatalog: vi.fn(),
  getAdminOverview: vi.fn(),
  recordPageView: vi.fn(),
  updateAcademyContent: mocks.updateAcademyContent,
  updateArchiveMoment: mocks.updateArchiveMoment,
  updateAcademyCourse: mocks.updateAcademyCourse,
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
    await expect(caller.submitLead({ parentName: "Valerie Wilcox", parentEmail: "valerie@example.com", studentName: "Learner One", studentAge: 7, primarySkill: "Software Computing", availability: "Wednesday afternoons" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("passes a validated intake to the student-lead persistence helper", async () => {
    const caller = academyRouter.createCaller(context());
    const lead = { parentName: "Valerie Wilcox", parentEmail: "valerie@example.com", studentName: "Learner One", studentAge: 12, primarySkill: "Software Computing", availability: "Wednesday afternoons and Saturday mornings" };
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
});
