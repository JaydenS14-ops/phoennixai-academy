import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  duration: varchar("duration", { length: 64 }).notNull(),
  pricePence: int("pricePence").notNull(),
  paymentLink: text("paymentLink"),
  featured: int("featured").notNull().default(0),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const siteContent = mysqlTable("site_content", {
  id: int("id").autoincrement().primaryKey(),
  contentKey: varchar("contentKey", { length: 96 }).notNull().unique(),
  contentValue: text("contentValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studentLeads = mysqlTable("student_leads", {
  id: int("id").autoincrement().primaryKey(),
  applicantType: varchar("applicantType", { length: 48 }).notNull().default("parent_guardian"),
  parentName: varchar("parentName", { length: 160 }).notNull(),
  parentEmail: varchar("parentEmail", { length: 320 }).notNull(),
  studentName: varchar("studentName", { length: 160 }).notNull(),
  studentAge: int("studentAge").notNull(),
  primarySkill: varchar("primarySkill", { length: 160 }).notNull(),
  availability: text("availability").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  path: varchar("path", { length: 255 }).notNull(),
  visitorKey: varchar("visitorKey", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 48 }).notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  visitorKey: varchar("visitorKey", { length: 128 }).notNull(),
  source: varchar("source", { length: 48 }).notNull().default("direct"),
  pathway: varchar("pathway", { length: 160 }),
  detail: varchar("detail", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const academyEvents = mysqlTable("academy_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: text("summary").notNull(),
  eventDate: varchar("eventDate", { length: 96 }).notNull(),
  lumaUrl: text("lumaUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const archiveMoments = mysqlTable("archive_moments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  caption: text("caption").notNull(),
  category: varchar("category", { length: 96 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  bentoSize: mysqlEnum("bentoSize", ["standard", "wide", "tall", "feature"]).notNull().default("standard"),
  published: int("published").notNull().default(0),
  sortOrder: int("sortOrder").notNull().default(0),
  capturedAt: varchar("capturedAt", { length: 96 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type StudentLead = typeof studentLeads.$inferSelect;
export type AcademyEvent = typeof academyEvents.$inferSelect;
export type ArchiveMoment = typeof archiveMoments.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
