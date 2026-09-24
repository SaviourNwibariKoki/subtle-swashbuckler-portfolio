import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing the built-in authentication flow.
 * The existing role field is used to keep the admin owner-only.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * One profile row stores the text used by the hero, about, contact, and footer.
 * Social links are stored as JSON text to keep this small first version simple.
 */
export const profileContent = mysqlTable("profile_content", {
  id: int("id").autoincrement().primaryKey(),
  initials: varchar("initials", { length: 12 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  heroTag: varchar("heroTag", { length: 120 }).notNull(),
  heroFirstName: varchar("heroFirstName", { length: 80 }).notNull(),
  heroHighlightName: varchar("heroHighlightName", { length: 80 }).notNull(),
  heroLastName: varchar("heroLastName", { length: 80 }).notNull(),
  subtitle: varchar("subtitle", { length: 180 }).notNull(),
  heroDescription: text("heroDescription").notNull(),
  profileImageUrl: text("profileImageUrl").notNull(),
  profileImageAlt: varchar("profileImageAlt", { length: 180 }).notNull(),
  aboutIntro: text("aboutIntro").notNull(),
  aboutDescription: text("aboutDescription").notNull(),
  contactHeading: varchar("contactHeading", { length: 180 }).notNull(),
  contactText: text("contactText").notNull(),
  footerTagline: varchar("footerTagline", { length: 160 }).notNull(),
  socialLinks: text("socialLinks").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Projects can be drafted, hidden, reordered, edited, or deleted from /admin. */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  tags: text("tags").notNull(),
  githubUrl: text("githubUrl").notNull(),
  liveUrl: text("liveUrl").notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Skills are grouped so the public About section keeps its current three-column design. */
export const skillGroups = mysqlTable("skill_groups", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  items: text("items").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Services are the four cards in the existing Services section. */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Experience is kept simple: role, organization, dates, and a description. */
export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  role: varchar("role", { length: 160 }).notNull(),
  company: varchar("company", { length: 160 }).notNull(),
  dates: varchar("dates", { length: 100 }).notNull(),
  description: text("description").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * These rows control the order and visibility of the existing homepage sections.
 * They do not create arbitrary layouts, which keeps the admin easy to understand.
 */
export const homepageSections = mysqlTable("homepage_sections", {
  id: int("id").autoincrement().primaryKey(),
  sectionKey: varchar("sectionKey", { length: 40 }).notNull().unique(),
  label: varchar("label", { length: 100 }).notNull(),
  heading: varchar("heading", { length: 160 }).default("").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ProfileRow = typeof profileContent.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type SkillGroupRow = typeof skillGroups.$inferSelect;
export type ServiceRow = typeof services.$inferSelect;
export type ExperienceRow = typeof experiences.$inferSelect;
export type HomepageSectionRow = typeof homepageSections.$inferSelect;
