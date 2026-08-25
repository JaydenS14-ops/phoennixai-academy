import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createStudentLead: vi.fn(),
  updateAcademyCourse: vi.fn(),
  updateAcademyContent: vi.fn(),
}));

vi.mock("./db", () => ({
  createStudentLead: mocks.createStudentLead,
  getAcademyCatalog: vi.fn(),
  getAdminOverview: vi.fn(),
  recordPageView: vi.fn(),
  updateAcademyContent: mocks.updateAcademyContent,
  updateAcademyCourse: mocks.updateAcademyCourse,
}));

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
    await expect(caller.submitLead({
      parentName: "Valerie Wilcox",
      parentEmail: "valerie@example.com",
      studentName: "Learner One",
      studentAge: 7,
      primarySkill: "Software Computing",
      availability: "Wednesday afternoons",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("passes a validated intake to the student-lead persistence helper", async () => {
    const caller = academyRouter.createCaller(context());
    const lead = {
      parentName: "Valerie Wilcox",
      parentEmail: "valerie@example.com",
      studentName: "Learner One",
      studentAge: 12,
      primarySkill: "Software Computing",
      availability: "Wednesday afternoons and Saturday mornings",
    };
    await caller.submitLead(lead);
    expect(mocks.createStudentLead).toHaveBeenCalledWith(lead);
  });

  it("prevents unauthenticated callers from editing public course settings", async () => {
    const caller = academyRouter.createCaller(context());
    await expect(caller.admin.updateCourse({ id: 1, pricePence: 8500, paymentLink: null })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an administrator session to submit course updates", async () => {
    const caller = academyRouter.createCaller(context(true));
    await caller.admin.updateCourse({ id: 1, pricePence: 8500, paymentLink: null });
    expect(mocks.updateAcademyCourse).toHaveBeenCalledWith({ id: 1, pricePence: 8500, paymentLink: null });
  });

  it("calculates a one-decimal conversion rate without a divide-by-zero error", () => {
    expect(calculateConversionRate(0, 2)).toBe(0);
    expect(calculateConversionRate(37, 4)).toBe(10.8);
  });
});
