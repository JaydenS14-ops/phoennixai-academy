import { describe, expect, it } from "vitest";
import { enquiryStepError, nextEnquiryStep, type EnquiryFormState } from "./enquiryFlow";
import { isNavigationActive } from "./navigationState";

const labels = { contactName: "Your name", personName: "Your name", availability: "Availability and areas of interest" };
const contact = { parentName: "Taylor Builder", parentEmail: "taylor@example.test", studentName: "", studentAge: "", primarySkill: "", availability: "" };
const valid = (applicantType: EnquiryFormState["applicantType"], age: string, primarySkill: string): EnquiryFormState => ({ applicantType, ...contact, studentName: applicantType === "parent_guardian" ? "Alex Builder" : "", studentAge: age, primarySkill, availability: "Available on weekday afternoons." });

describe("public enquiry interaction", () => {
  it("advances a complete parent or guardian enquiry from learner details to availability", () => expect(nextEnquiryStep(2, valid("parent_guardian", "8", "Software Computing"), labels)).toEqual({ step: 3, error: null }));
  it("advances a complete adult learner enquiry without requiring a duplicate learner name", () => expect(nextEnquiryStep(2, valid("adult_learner", "18", "AI Automation"), labels)).toEqual({ step: 3, error: null }));
  it("advances a complete work-experience enquiry without a hidden learner-name field", () => expect(nextEnquiryStep(2, valid("work_experience", "14", "Work Experience with PhoennixAI Agency"), labels)).toEqual({ step: 3, error: null }));
  it("advances a complete Agency apprenticeship enquiry without a hidden learner-name field", () => expect(nextEnquiryStep(2, valid("agency_apprenticeship", "14", "Agency Apprenticeship"), labels)).toEqual({ step: 3, error: null }));
  it("identifies the exact contact or availability detail that requires attention", () => { expect(enquiryStepError(1, { ...valid("adult_learner", "18", "AI Automation"), parentName: "" }, labels)).toBe("Please add your name."); expect(enquiryStepError(3, { ...valid("adult_learner", "18", "AI Automation"), availability: "Soon" }, labels)).toContain("availability and areas of interest"); });
});

describe("public navigation interaction", () => {
  it("marks the expected page routes as active", () => { expect(isNavigationActive("/courses", "", "/courses")).toBe(true); expect(isNavigationActive("/curriculum", "", "/courses")).toBe(false); expect(isNavigationActive("/rise-to-capital", "", "/rise-to-capital")).toBe(true); });
  it("marks grouped Home section links as active only for their current anchor", () => { expect(isNavigationActive("/", "#events", "/#events")).toBe(true); expect(isNavigationActive("/", "#events", "/#mandate")).toBe(false); expect(isNavigationActive("/", "#mandate", "/#mandate")).toBe(true); expect(isNavigationActive("/", "#mandate", "/")).toBe(false); });
});
