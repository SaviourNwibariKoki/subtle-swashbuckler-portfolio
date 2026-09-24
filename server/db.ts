import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  experiences,
  homepageSections,
  profileContent,
  projects,
  services,
  skillGroups,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { defaultPortfolio } from "../shared/portfolioDefaults";
import type {
  ExperienceContent,
  HomepageSection,
  PortfolioSnapshot,
  ProfileContent,
  ProjectContent,
  ServiceContent,
  SkillGroup,
  SocialLinks,
} from "../shared/portfolio";

let _db: ReturnType<typeof drizzle> | null = null;

/** Lazily create the database connection so local tooling can run without a database. */
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
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

/** Parse JSON stored in a text column without allowing malformed content to break the page. */
function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toProfile(row: typeof profileContent.$inferSelect): ProfileContent {
  return {
    id: row.id,
    initials: row.initials,
    name: row.name,
    heroTag: row.heroTag,
    heroFirstName: row.heroFirstName,
    heroHighlightName: row.heroHighlightName,
    heroLastName: row.heroLastName,
    subtitle: row.subtitle,
    heroDescription: row.heroDescription,
    profileImageUrl: row.profileImageUrl,
    profileImageAlt: row.profileImageAlt,
    aboutIntro: row.aboutIntro,
    aboutDescription: row.aboutDescription,
    contactHeading: row.contactHeading,
    contactText: row.contactText,
    footerTagline: row.footerTagline,
    socialLinks: parseJson<SocialLinks>(row.socialLinks, {
      github: "",
      linkedin: "",
      twitter: "",
      email: "",
    }),
  };
}

function toProject(row: typeof projects.$inferSelect): ProjectContent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags: parseJson<string[]>(row.tags, []),
    githubUrl: row.githubUrl,
    liveUrl: row.liveUrl,
    isPublished: Boolean(row.isPublished),
    displayOrder: row.displayOrder,
  };
}

function toSkill(row: typeof skillGroups.$inferSelect): SkillGroup {
  return {
    id: row.id,
    category: row.category,
    items: parseJson<string[]>(row.items, []),
    isVisible: Boolean(row.isVisible),
    displayOrder: row.displayOrder,
  };
}

function toService(row: typeof services.$inferSelect): ServiceContent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    isVisible: Boolean(row.isVisible),
    displayOrder: row.displayOrder,
  };
}

function toExperience(row: typeof experiences.$inferSelect): ExperienceContent {
  return {
    id: row.id,
    role: row.role,
    company: row.company,
    dates: row.dates,
    description: row.description,
    isVisible: Boolean(row.isVisible),
    displayOrder: row.displayOrder,
  };
}

function toSection(row: typeof homepageSections.$inferSelect): HomepageSection {
  return {
    id: row.id,
    sectionKey: row.sectionKey,
    label: row.label,
    heading: row.heading,
    isVisible: Boolean(row.isVisible),
    displayOrder: row.displayOrder,
  };
}

/**
 * Apply the public visibility rules in one place. Keeping this function pure makes the
 * rule easy to understand and test without writing test records into the database.
 */
export function filterPublicPortfolio(portfolio: PortfolioSnapshot): PortfolioSnapshot {
  return {
    ...portfolio,
    projects: portfolio.projects.filter((project) => project.isPublished),
    skills: portfolio.skills.filter((skill) => skill.isVisible),
    services: portfolio.services.filter((service) => service.isVisible),
    experiences: portfolio.experiences.filter((experience) => experience.isVisible),
    homepageSections: portfolio.homepageSections.filter((section) => section.isVisible),
  };
}

/** Get only visible and published content for public visitors. */
export async function getPublicPortfolio(): Promise<PortfolioSnapshot | null> {
  const db = await getDb();
  if (!db) return null;

  const [profileRows, projectRows, skillRows, serviceRows, experienceRows, sectionRows] =
    await Promise.all([
      db.select().from(profileContent).where(eq(profileContent.id, 1)).limit(1),
      db.select().from(projects).where(eq(projects.isPublished, true)).orderBy(asc(projects.displayOrder)),
      db.select().from(skillGroups).where(eq(skillGroups.isVisible, true)).orderBy(asc(skillGroups.displayOrder)),
      db.select().from(services).where(eq(services.isVisible, true)).orderBy(asc(services.displayOrder)),
      db.select().from(experiences).where(eq(experiences.isVisible, true)).orderBy(asc(experiences.displayOrder)),
      db.select().from(homepageSections).where(eq(homepageSections.isVisible, true)).orderBy(asc(homepageSections.displayOrder)),
    ]);

  if (!profileRows[0]) return null;
  const projectList = projectRows.map(toProject);
  const sectionList = sectionRows.length > 0 ? sectionRows.map(toSection) : defaultPortfolio.homepageSections;

  return filterPublicPortfolio({
    profile: toProfile(profileRows[0]),
    projects: projectList,
    skills: skillRows.map(toSkill),
    services: serviceRows.map(toService),
    experiences: experienceRows.map(toExperience),
    homepageSections: sectionList,
  });
}

/** Get all content, including hidden and draft records, for the owner dashboard. */
export async function getAdminPortfolio() {
  const db = await getDb();
  if (!db) return null;

  const [profileRows, projectRows, skillRows, serviceRows, experienceRows, sectionRows] =
    await Promise.all([
      db.select().from(profileContent).where(eq(profileContent.id, 1)).limit(1),
      db.select().from(projects).orderBy(asc(projects.displayOrder)),
      db.select().from(skillGroups).orderBy(asc(skillGroups.displayOrder)),
      db.select().from(services).orderBy(asc(services.displayOrder)),
      db.select().from(experiences).orderBy(asc(experiences.displayOrder)),
      db.select().from(homepageSections).orderBy(asc(homepageSections.displayOrder)),
    ]);

  if (!profileRows[0]) return null;
  const projectList = projectRows.map(toProject);
  const sectionList = sectionRows.length > 0 ? sectionRows.map(toSection) : defaultPortfolio.homepageSections;

  return {
    profile: toProfile(profileRows[0]),
    projects: projectList,
    skills: skillRows.map(toSkill),
    services: serviceRows.map(toService),
    experiences: experienceRows.map(toExperience),
    homepageSections: sectionList,
  };
}

export async function saveProfile(id: number, input: Omit<ProfileContent, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(profileContent).set({
    ...input,
    socialLinks: JSON.stringify(input.socialLinks),
  }).where(eq(profileContent.id, id));
}

export async function createProject(input: Omit<ProjectContent, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(projects).values({
    ...input,
    tags: JSON.stringify(input.tags),
  });
  return Number(result[0].insertId);
}

export async function updateProject(id: number, input: Omit<ProjectContent, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(projects).set({ ...input, tags: JSON.stringify(input.tags) }).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(projects).where(eq(projects.id, id));
}

export async function createSkill(input: Omit<SkillGroup, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(skillGroups).values({ ...input, items: JSON.stringify(input.items) });
  return Number(result[0].insertId);
}

export async function updateSkill(id: number, input: Omit<SkillGroup, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(skillGroups).set({ ...input, items: JSON.stringify(input.items) }).where(eq(skillGroups.id, id));
}

export async function deleteSkill(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(skillGroups).where(eq(skillGroups.id, id));
}

export async function createService(input: Omit<ServiceContent, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(services).values(input);
  return Number(result[0].insertId);
}

export async function updateService(id: number, input: Omit<ServiceContent, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(services).set(input).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(services).where(eq(services.id, id));
}

export async function createExperience(input: Omit<ExperienceContent, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(experiences).values(input);
  return Number(result[0].insertId);
}

export async function updateExperience(id: number, input: Omit<ExperienceContent, "id">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(experiences).set(input).where(eq(experiences.id, id));
}

export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(experiences).where(eq(experiences.id, id));
}

export async function updateHomepageSections(sections: HomepageSection[]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  for (const section of sections) {
    await db.update(homepageSections).set({
      heading: section.heading,
      isVisible: section.isVisible,
      displayOrder: section.displayOrder,
    }).where(eq(homepageSections.id, section.id));
  }
}
