import { vi, describe, expect, it } from "vitest";

const mocks = vi.hoisted(() => ({
  createStudentLead: vi.fn(),
  createTestimonial: vi.fn(),
  updateTestimonial: vi.fn(),
  deleteTestimonial: vi.fn(),
  getAdminTestimonials: vi.fn().mockResolvedValue([]),
}));

vi.mock("./db", () => ({
  createAcademyCourse: vi.fn(), createAcademyEvent: vi.fn(), createArchiveMoment: vi.fn(), createStudentLead: mocks.createStudentLead, createTestimonial: mocks.createTestimonial,
  deleteAcademyCourse: vi.fn(), deleteArchiveMoment: vi.fn(), deleteAcademyEvent: vi.fn(), deleteStudentLead: vi.fn(), deleteStudentLeads: vi.fn(), deleteTestimonial: mocks.deleteTestimonial,
  getAdminLeadPage: vi.fn(), markStudentLeadSpam: vi.fn(), markStudentLeadsSpam: vi.fn(), restoreStudentLead: vi.fn(), restoreStudentLeads: vi.fn(), getAdminArchiveMoments: vi.fn(), getAdminAnalytics: vi.fn(), getAcademyCatalog: vi.fn(), getAdminOverview: vi.fn(), getAdminTestimonials: mocks.getAdminTestimonials,
  recordPageView: vi.fn(), recordAnalyticsEvent: vi.fn(), resetAnalyticsTelemetry: vi.fn(), updateArchiveMoment: vi.fn(), updateAcademyContent: vi.fn(), updateAcademyCourse: vi.fn(), updateAcademyCourseImage: vi.fn(), updateTestimonial: mocks.updateTestimonial,
}));
vi.mock("./academyChat", () => ({ answerAcademyQuestion: vi.fn() }));
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { academyRouter } from "./routers/academy";

const context = (adminSession = false) => ({ user: null, adminSession, req: { headers: {} }, res: {} }) as any;

describe("community and founder enquiry contracts", () => {
  it("persists an optional founder cohort preference alongside a valid Rise to Capital enquiry", async () => {
    const lead = { applicantType: "adult_learner" as const, parentName: "Alex Morgan", parentEmail: "alex@example.com", studentName: "Alex Morgan", studentAge: 31, primarySkill: "Rise to Capital", cohortInterest: "Next available founder cohort", availability: "Wednesday evenings and Saturday mornings" };
    await academyRouter.createCaller(context()).submitLead(lead);
    expect(mocks.createStudentLead).toHaveBeenCalledWith(lead);
  });

  it("keeps testimonial creation, editing, deletion, and library access private to administrators", async () => {
    const testimonial = { authorName: "Verified contributor", authorRole: "Founder", quote: "An authentic approved community testimonial for the Academy.", consentConfirmed: true, published: true };
    const anonymous = academyRouter.createCaller(context());
    await expect(anonymous.admin.createTestimonial(testimonial)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(anonymous.admin.testimonials()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const admin = academyRouter.createCaller(context(true));
    await admin.admin.createTestimonial(testimonial);
    await admin.admin.updateTestimonial({ id: 4, ...testimonial, published: false });
    await admin.admin.deleteTestimonial({ id: 4 });
    expect(mocks.createTestimonial).toHaveBeenCalledWith(testimonial);
    expect(mocks.updateTestimonial).toHaveBeenCalledWith({ id: 4, ...testimonial, published: false });
    expect(mocks.deleteTestimonial).toHaveBeenCalledWith(4);
  });
});
