export type ApplicantType = "parent_guardian" | "adult_learner" | "work_experience" | "agency_apprenticeship";

export type EnquiryFormState = { applicantType: ApplicantType; parentName: string; parentEmail: string; studentName: string; studentAge: string; primarySkill: string; cohortInterest: string; availability: string };
type Labels = { contactName: string; personName: string; availability: string };

export function minimumAge(type: ApplicantType) { return type === "parent_guardian" ? 8 : type === "adult_learner" ? 18 : 14; }

export function enquiryStepError(step: number, form: EnquiryFormState, labels: Labels) {
  if (step === 1) {
    const missing = [!form.parentName.trim() ? labels.contactName.toLowerCase() : "", !/^\S+@\S+\.\S+$/.test(form.parentEmail) ? "a valid email address" : ""].filter(Boolean);
    return missing.length ? `Please add ${missing.join(" and ")}.` : null;
  }
  if (step === 2) {
    const min = minimumAge(form.applicantType);
    const missing = [form.applicantType === "parent_guardian" && !form.studentName.trim() ? labels.personName.toLowerCase() : "", Number(form.studentAge) < min ? `a valid age (${min}+)` : "", !form.primarySkill ? "an interest or opportunity" : ""].filter(Boolean);
    return missing.length ? `Please add ${missing.join(", ")}.${Number(form.studentAge) < min ? ` ${form.applicantType === "adult_learner" ? "Adult learner pathways are for people aged 18 and above." : `This pathway is available from age ${min}.`}` : ""}` : null;
  }
  return form.availability.trim().length < 8 ? `Please add a short note about ${labels.availability.toLowerCase()} (at least 8 characters).` : null;
}

export function nextEnquiryStep(step: number, form: EnquiryFormState, labels: Labels) {
  const error = enquiryStepError(step, form, labels);
  return error ? { step, error } : { step: Math.min(3, step + 1), error: null };
}
