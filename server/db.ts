import { asc, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
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
  { slug: "family-bundle", title: "Multi-Disciplinary Household Family Bundle", description: "A flexible, low-risk household pathway that brings practical technology and creative learning together.", duration: "Flexible monthly", pricePence: 9900, featured: 1, sortOrder: 0 },
];

const academyContent = [
  { contentKey: "hero_eyebrow", contentValue: "Purpose-led skills for tomorrow’s builders" },
  { contentKey: "hero_title", contentValue: "Building capable futures through business, technology & purpose." },
  { contentKey: "hero_description", contentValue: "Live, project-led learning for children, teens, and adults ready to build with clarity, confidence, and conviction." },
  { contentKey: "mandate", contentValue: "At PhoennixAI, we don't raise followers - we raise leaders and builders. We remind every learner that you're kings, not servants - owners, not labourers." },
];

async function ensureAcademyDefaults() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");
  const [existingCourse] = await db.select({ id: courses.id }).from(courses).limit(1);
  if (!existingCourse) await db.insert(courses).values(academyCourses);
  const [existingContent] = await db.select({ id: siteContent.id }).from(siteContent).limit(1);
  if (!existingContent) await db.insert(siteContent).values(academyContent);
  return db;
}

export async function getAcademyCatalog() {
  const db = await ensureAcademyDefaults();
  const [courseList, contentList] = await Promise.all([
    db.select().from(courses).orderBy(asc(courses.sortOrder)),
    db.select().from(siteContent),
  ]);
  return {
    courses: courseList,
    content: Object.fromEntries(contentList.map(item => [item.contentKey, item.contentValue])),
  };
}

export async function createStudentLead(input: {
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
  pricePence: number;
  paymentLink: string | null;
}) {
  const db = await ensureAcademyDefaults();
  await db.update(courses).set({
    pricePence: input.pricePence,
    paymentLink: input.paymentLink,
  }).where(eq(courses.id, input.id));
}

export async function updateAcademyContent(contentKey: string, contentValue: string) {
  const db = await ensureAcademyDefaults();
  await db.insert(siteContent).values({ contentKey, contentValue }).onDuplicateKeyUpdate({
    set: { contentValue },
  });
}
