import { and, asc, count, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  academyEvents,
  analyticsEvents,
  archiveMoments,
  courses,
  InsertUser,
  pageViews,
  siteContent,
  studentLeads,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { calculateConversionRate } from "./academyMetrics";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

const academyCourses = [
  { slug: "product-design", title: "Product Design (UI/UX)", description: "Research, prototype, and design digital experiences that make ideas clear and useful.", duration: "6–8 months", pricePence: 8500, featured: 0, sortOrder: 1 },
  { slug: "software-computing", title: "Software Computing", description: "Build strong computing logic through practical software development and real-world systems thinking.", duration: "6–8 months", pricePence: 9900, featured: 0, sortOrder: 2 },
  { slug: "gaming-graphics", title: "Gaming & Graphics Design", description: "Combine creative visual design with the foundations of interactive game experiences.", duration: "6–8 months", pricePence: 9500, featured: 0, sortOrder: 3 },
  { slug: "content-creation", title: "Content Creation & Social Media", description: "Create purposeful content and understand how to communicate with clarity across digital platforms.", duration: "6–8 months", pricePence: 6500, featured: 0, sortOrder: 4 },
  { slug: "digital-marketing", title: "Digital Marketing", description: "Learn practical digital marketing, audience insight, and campaign strategy for meaningful growth.", duration: "6–8 months", pricePence: 6500, featured: 0, sortOrder: 5 },
  { slug: "ai-automation", title: "AI Automation", description: "Use AI tools responsibly to streamline work, solve problems, and turn concepts into operational systems.", duration: "6–8 months", pricePence: 12000, featured: 0, sortOrder: 6 },
  { slug: "hybrid-bundle", title: "Multi-Discipline Hybrid Bundle", description: "A flexible multi-course pathway for learners who want to combine more than one practical technology or creative programme.", duration: "Flexible monthly", pricePence: 9900, featured: 1, sortOrder: 0 },
  { slug: "holiday-family-bundle", title: "Family Bundle", description: "A school-holiday learning offer for children, siblings, and parents to explore practical technology and creative skills together.", duration: "Summer, bank holidays & half term", pricePence: 0, featured: 0, sortOrder: 7 },
];

const academyContent = [
  { contentKey: "hero_eyebrow", contentValue: "Purpose-led skills for tomorrow’s builders" },
  { contentKey: "hero_title", contentValue: "Building capable futures through business, technology & purpose." },
  { contentKey: "hero_description", contentValue: "Live, project-led learning for children, teens, and adults ready to build with clarity, confidence, and conviction." },
  { contentKey: "mandate", contentValue: "At PhoennixAI, we don't raise followers. We raise leaders and builders. We remind every learner that you're kings, builders, and owners. You're created to create." },
  { contentKey: "mandate_label", contentValue: "Our mandate" },
  { contentKey: "mandate_heading", contentValue: "More than education." },
  { contentKey: "mandate_supporting_text", contentValue: "An environment where gifts are discovered, activated, and applied to meaningful work." },
  { contentKey: "footer_purpose", contentValue: "Purpose-led learning for future builders, leaders, and innovators.\nYou're Created to Create." },
  { contentKey: "footer_address", contentValue: "58 Peregrine Road, Essex, IG6 3SZ" },
  { contentKey: "footer_email", contentValue: "info@phoennixai.com" },
  { contentKey: "footer_hours", contentValue: "Mon–Fri · 08:00–18:00 UK Time" },
  { contentKey: "social_instagram", contentValue: "" },
  { contentKey: "social_linkedin", contentValue: "" },
  { contentKey: "social_x", contentValue: "" },
  { contentKey: "social_facebook", contentValue: "" },
  { contentKey: "inmotion_eyebrow", contentValue: "The Builder Archive" },
  { contentKey: "inmotion_title", contentValue: "In Motion." },
  { contentKey: "inmotion_intro", contentValue: "A living visual archive for alumni moments, founder gatherings, capital conversations, retreats, and the people building meaningful impact across technology and business." },
  { contentKey: "inmotion_status_label", contentValue: "Growing with the community" },
  { contentKey: "inmotion_status_heading", contentValue: "Every photograph will become a record of momentum." },
  { contentKey: "inmotion_status_text", contentValue: "This archive is prepared for authentic community imagery. New approved moments are added as the Academy and its partners grow the community together." },
  { contentKey: "inmotion_section_label", contentValue: "Built for real moments" },
  { contentKey: "inmotion_section_heading", contentValue: "A bento archive that grows with the work." },
  { contentKey: "inmotion_section_text", contentValue: "The page accommodates event photography, short editorial captions, collaborator highlights, and evolving programmes without losing its clarity or sense of craft." },
  { contentKey: "inmotion_cta_label", contentValue: "For builders and partners" },
  { contentKey: "inmotion_cta_heading", contentValue: "Have a moment that belongs in the archive?" },
  { contentKey: "inmotion_cta_text", contentValue: "As the community grows, the archive can feature approved partner events, alumni milestones, and moments that reflect the Academy’s work in the real world." },
  { contentKey: "rise_partner_eyebrow", contentValue: "In collaboration with Conquest Capital Advisors" },
  { contentKey: "rise_title", contentValue: "Rise to Capital." },
  { contentKey: "rise_intro", contentValue: "PhoennixAI and Conquest Capital Advisors have collaborated to offer advanced entrepreneur and capital-readiness training. Developed by Mr Papadoyianis, Rise to Capital provides practical insight into the step-by-step process of business feasibility and fundraising." },
  { contentKey: "rise_approach_label", contentValue: "Programme approach" },
  { contentKey: "rise_approach_heading", contentValue: "Founder mindset meets practical capital readiness." },
  { contentKey: "rise_approach_feasibility", contentValue: "Business feasibility and fundraising preparation" },
  { contentKey: "rise_approach_partner", contentValue: "Conquest Capital Advisors partner learning" },
  { contentKey: "rise_outcomes_label", contentValue: "What you will gain" },
  { contentKey: "rise_outcomes_heading", contentValue: "Become ready to make the right capital conversation." },
  { contentKey: "rise_outcomes_intro", contentValue: "Through the fifteen modules, you will gain a deep understanding of the preparation, structure, and fundraising process for a conceptual, start-up, or operating business." },
];

async function ensureAcademyDefaults() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  const [existingCourse] = await db.select({ id: courses.id }).from(courses).limit(1);
  if (!existingCourse) await db.insert(courses).values(academyCourses);
  for (const content of academyContent) {
    await db.insert(siteContent).values(content).onDuplicateKeyUpdate({
      set: { contentKey: content.contentKey },
    });
  }
  return db;
}

export async function getAcademyCatalog() {
  const db = await ensureAcademyDefaults();
  const [courseList, contentList, eventList, archiveList] = await Promise.all([
    db.select().from(courses).orderBy(asc(courses.sortOrder)),
    db.select().from(siteContent),
    db.select().from(academyEvents).orderBy(desc(academyEvents.createdAt)),
    db.select().from(archiveMoments).where(eq(archiveMoments.published, 1)).orderBy(asc(archiveMoments.sortOrder), desc(archiveMoments.createdAt)),
  ]);
  return {
    courses: courseList,
    content: Object.fromEntries(contentList.map(item => [item.contentKey, item.contentValue])),
    events: eventList,
    archiveMoments: archiveList,
  };
}

export async function createStudentLead(input: {
  applicantType: "parent_guardian" | "adult_learner" | "work_experience" | "agency_apprenticeship";
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentAge: number;
  primarySkill: string;
  availability: string;
}) {
  const db = await ensureAcademyDefaults();
  await db.insert(studentLeads).values(input);
}

export async function recordPageView(path: string, visitorKey: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pageViews).values({ path, visitorKey });
}

export async function getAdminOverview() {
  const db = await ensureAcademyDefaults();
  const [[views], [leads], leadRows] = await Promise.all([
    db.select({ total: count() }).from(pageViews),
    db.select({ total: count() }).from(studentLeads),
    db.select().from(studentLeads).orderBy(desc(studentLeads.createdAt)),
  ]);
  const totalViews = Number(views?.total ?? 0);
  const totalLeads = Number(leads?.total ?? 0);
  return {
    totalViews,
    totalLeads,
    conversionRate: calculateConversionRate(totalViews, totalLeads),
    leads: leadRows,
  };
}

export async function updateAcademyCourse(input: {
  id: number;
  title: string;
  description: string;
  duration: string;
  pricePence: number;
  paymentLink: string | null;
  featured: boolean;
}) {
  const db = await ensureAcademyDefaults();
  await db.update(courses).set({
    title: input.title,
    description: input.description,
    duration: input.duration,
    pricePence: input.pricePence,
    paymentLink: input.paymentLink,
    featured: input.featured ? 1 : 0,
  }).where(eq(courses.id, input.id));
}

export async function deleteAcademyCourse(id: number) {
  const db = await ensureAcademyDefaults();
  const [courseCount] = await db.select({ total: count() }).from(courses);
  if (Number(courseCount?.total ?? 0) <= 1) {
    throw new Error("At least one programme must remain in the catalogue.");
  }
  await db.delete(courses).where(eq(courses.id, id));
}

export async function createAcademyCourse(input: {
  title: string;
  description: string;
  duration: string;
  pricePence: number;
  paymentLink: string | null;
  featured: boolean;
}) {
  const db = await ensureAcademyDefaults();
  const [lastCourse] = await db.select({ sortOrder: courses.sortOrder }).from(courses).orderBy(desc(courses.sortOrder)).limit(1);
  const slugBase = input.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "academy-course";
  await db.insert(courses).values({
    slug: `${slugBase}-${Date.now().toString(36)}`,
    title: input.title,
    description: input.description,
    duration: input.duration,
    pricePence: input.pricePence,
    paymentLink: input.paymentLink,
    featured: input.featured ? 1 : 0,
    sortOrder: (lastCourse?.sortOrder ?? 0) + 1,
  });
}

export async function updateAcademyContent(contentKey: string, contentValue: string) {
  const db = await ensureAcademyDefaults();
  await db.insert(siteContent).values({ contentKey, contentValue }).onDuplicateKeyUpdate({
    set: { contentValue },
  });
}

export async function createAcademyEvent(input: {
  title: string;
  summary: string;
  eventDate: string;
  lumaUrl: string;
}) {
  const db = await ensureAcademyDefaults();
  await db.insert(academyEvents).values(input);
}

export async function deleteAcademyEvent(id: number) {
  const db = await ensureAcademyDefaults();
  await db.delete(academyEvents).where(eq(academyEvents.id, id));
}

export async function getAdminArchiveMoments() {
  const db = await ensureAcademyDefaults();
  return db.select().from(archiveMoments).orderBy(asc(archiveMoments.sortOrder), desc(archiveMoments.createdAt));
}

export async function createArchiveMoment(input: {
  title: string;
  caption: string;
  category: string;
  imageKey: string;
  imageUrl: string;
  bentoSize: "standard" | "wide" | "tall" | "feature";
  published: boolean;
  capturedAt: string;
}) {
  const db = await ensureAcademyDefaults();
  const [lastMoment] = await db.select({ sortOrder: archiveMoments.sortOrder }).from(archiveMoments).orderBy(desc(archiveMoments.sortOrder)).limit(1);
  await db.insert(archiveMoments).values({
    ...input,
    published: input.published ? 1 : 0,
    sortOrder: (lastMoment?.sortOrder ?? -1) + 1,
  });
}

export async function updateArchiveMoment(input: {
  id: number;
  title: string;
  caption: string;
  category: string;
  bentoSize: "standard" | "wide" | "tall" | "feature";
  published: boolean;
  capturedAt: string;
}) {
  const db = await ensureAcademyDefaults();
  await db.update(archiveMoments).set({
    title: input.title,
    caption: input.caption,
    category: input.category,
    bentoSize: input.bentoSize,
    published: input.published ? 1 : 0,
    capturedAt: input.capturedAt,
  }).where(eq(archiveMoments.id, input.id));
}

export async function deleteArchiveMoment(id: number) {
  const db = await ensureAcademyDefaults();
  await db.delete(archiveMoments).where(eq(archiveMoments.id, id));
}

export type AnalyticsEventInput = {
  eventType: "page_view" | "course_view" | "cta_click" | "enquiry_start" | "pathway_selected" | "enquiry_field" | "enquiry_step" | "enquiry_submit";
  path: string;
  visitorKey: string;
  source: "direct" | "organic" | "social" | "referral" | "campaign" | "other";
  pathway?: string;
  detail?: string;
};

export type AnalyticsFilter = { startDate?: string; endDate?: string; pathway?: string; source?: string };

export async function recordAnalyticsEvent(input: AnalyticsEventInput) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values({ ...input, pathway: input.pathway || null, detail: input.detail || null });
}

export async function resetAnalyticsTelemetry() {
  const db = await ensureAcademyDefaults();
  await db.delete(analyticsEvents);
  await db.delete(pageViews);
}

function withinRange(value: Date, start?: Date, end?: Date) { return (!start || value >= start) && (!end || value <= end); }
function dayKey(value: Date) { return value.toISOString().slice(0, 10); }
function percentage(part: number, whole: number) { return whole ? Number(((part / whole) * 100).toFixed(1)) : 0; }

export async function getAdminAnalytics(filter: AnalyticsFilter) {
  const db = await ensureAcademyDefaults();
  const start = filter.startDate ? new Date(`${filter.startDate}T00:00:00.000Z`) : undefined;
  const end = filter.endDate ? new Date(`${filter.endDate}T23:59:59.999Z`) : undefined;
  const conditions = [start ? gte(analyticsEvents.createdAt, start) : undefined, end ? lte(analyticsEvents.createdAt, end) : undefined, filter.source && filter.source !== "all" ? eq(analyticsEvents.source, filter.source) : undefined, filter.pathway && filter.pathway !== "all" ? eq(analyticsEvents.pathway, filter.pathway) : undefined].filter(Boolean);
  const [events, leads] = await Promise.all([
    db.select().from(analyticsEvents).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(analyticsEvents.createdAt)),
    db.select().from(studentLeads).orderBy(desc(studentLeads.createdAt)),
  ]);
  const filteredLeads = leads.filter(lead => withinRange(lead.createdAt, start, end) && (!filter.pathway || filter.pathway === "all" || lead.primarySkill === filter.pathway));
  const pageEvents = events.filter(event => event.eventType === "page_view");
  const uniqueVisitors = new Set(events.map(event => event.visitorKey)).size;
  const courseViews = events.filter(event => event.eventType === "course_view");
  const enquiryStarts = events.filter(event => event.eventType === "enquiry_start");
  const submissions = events.filter(event => event.eventType === "enquiry_submit");
  const daily = new Map<string, { date: string; pageViews: number; visitors: Set<string>; enquiries: number }>();
  for (const event of events) { const key = dayKey(event.createdAt); const row = daily.get(key) ?? { date: key, pageViews: 0, visitors: new Set<string>(), enquiries: 0 }; row.visitors.add(event.visitorKey); if (event.eventType === "page_view") row.pageViews += 1; if (event.eventType === "enquiry_submit") row.enquiries += 1; daily.set(key, row); }
  const dailyTrend = Array.from(daily.values()).map(row => ({ date: row.date, pageViews: row.pageViews, visitors: row.visitors.size, enquiries: row.enquiries }));
  const sourceCounts = new Map<string, number>(); pageEvents.forEach(event => sourceCounts.set(event.source, (sourceCounts.get(event.source) ?? 0) + 1));
  const acquisition = Array.from(sourceCounts.entries()).map(([source, value]) => ({ source, value })).sort((a, b) => b.value - a.value);
  const ctaCounts = new Map<string, number>(); events.filter(event => event.eventType === "cta_click").forEach(event => ctaCounts.set(event.detail ?? "Other action", (ctaCounts.get(event.detail ?? "Other action") ?? 0) + 1));
  const ctaPerformance = Array.from(ctaCounts.entries()).map(([label, clicks]) => ({ label, clicks, ctr: percentage(clicks, pageEvents.length) })).sort((a, b) => b.clicks - a.clicks);
  const funnelRows = [
    { label: "Page view", value: new Set(pageEvents.map(event => event.visitorKey)).size },
    { label: "Viewed programmes", value: new Set(courseViews.map(event => event.visitorKey)).size },
    { label: "Started enquiry", value: new Set(enquiryStarts.map(event => event.visitorKey)).size },
    { label: "Submitted enquiry", value: new Set(submissions.map(event => event.visitorKey)).size },
  ];
  const funnel = funnelRows.map((row, index) => ({ ...row, dropOff: index ? percentage((funnelRows[index - 1]?.value ?? 0) - row.value, funnelRows[index - 1]?.value ?? 0) : 0 }));
  const completedFields = new Map<string, Set<string>>(); events.filter(event => event.eventType === "enquiry_field").forEach(event => { const set = completedFields.get(event.detail ?? "Field") ?? new Set<string>(); set.add(event.visitorKey); completedFields.set(event.detail ?? "Field", set); });
  const fieldDropOff = Array.from(completedFields.entries()).map(([label, visitors]) => ({ label: label.replaceAll("_", " "), completed: visitors.size, exits: Math.max(enquiryStarts.length - visitors.size, 0) })).sort((a, b) => b.exits - a.exits);
  const byVisitor = new Map<string, { first?: Date; submit?: Date }>(); events.forEach(event => { const row = byVisitor.get(event.visitorKey) ?? {}; if (event.eventType === "page_view" && !row.first) row.first = event.createdAt; if (event.eventType === "enquiry_submit" && !row.submit) row.submit = event.createdAt; byVisitor.set(event.visitorKey, row); });
  const conversionDays = Array.from(byVisitor.values()).filter(row => row.first && row.submit).map(row => (row.submit!.getTime() - row.first!.getTime()) / 86_400_000);
  const pathwayCounts = new Map<string, number>(); filteredLeads.forEach(lead => pathwayCounts.set(lead.primarySkill, (pathwayCounts.get(lead.primarySkill) ?? 0) + 1));
  const pathwayPopularity = Array.from(pathwayCounts.entries()).map(([pathway, enquiries]) => ({ pathway, enquiries })).sort((a, b) => b.enquiries - a.enquiries);
  const activity = Array.from({ length: 7 }, (_, day) => Array.from({ length: 24 }, (_, hour) => ({ day, hour, value: 0 })));
  events.forEach(event => { const date = event.createdAt; activity[(date.getUTCDay() + 6) % 7][date.getUTCHours()].value += 1; });
  return { filters: { startDate: filter.startDate ?? null, endDate: filter.endDate ?? null, pathway: filter.pathway ?? "all", source: filter.source ?? "all" }, metrics: { totalPageViews: pageEvents.length, uniqueVisitors, enquiryStarts: enquiryStarts.length, submissions: submissions.length, conversionRate: percentage(submissions.length, pageEvents.length), averageDaysToConvert: conversionDays.length ? Number((conversionDays.reduce((sum, value) => sum + value, 0) / conversionDays.length).toFixed(1)) : null }, dailyTrend, acquisition, ctaPerformance, funnel, fieldDropOff, pathwayPopularity, activity, exportRows: events.map(event => ({ eventType: event.eventType, path: event.path, source: event.source, pathway: event.pathway ?? "", detail: event.detail ?? "", visitorKey: event.visitorKey, createdAt: event.createdAt.toISOString() })) };
}
