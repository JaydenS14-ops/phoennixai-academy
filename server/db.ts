import { asc, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  academyEvents,
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
  { slug: "family-bundle", title: "Multi-Disciplinary Family Bundle", description: "A flexible, low-risk family pathway that brings practical technology and creative learning together.", duration: "Flexible monthly", pricePence: 9900, featured: 1, sortOrder: 0 },
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
