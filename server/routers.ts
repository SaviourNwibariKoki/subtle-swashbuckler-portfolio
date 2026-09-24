import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { defaultPortfolio } from "@shared/portfolioDefaults";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createExperience,
  createProject,
  createService,
  createSkill,
  deleteExperience,
  deleteProject,
  deleteService,
  deleteSkill,
  getAdminPortfolio,
  getPublicPortfolio,
  saveProfile,
  updateExperience,
  updateHomepageSections,
  updateProject,
  updateService,
  updateSkill,
} from "./db";

/** Only the signed-in owner can read or change portfolio content in /admin. */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Owner access is required." });
  }
  return next({ ctx });
});

const socialLinksSchema = z.object({
  github: z.string().trim().max(500),
  linkedin: z.string().trim().max(500),
  twitter: z.string().trim().max(500),
  email: z.string().trim().max(320),
});

const profileSchema = z.object({
  id: z.number().int().positive(),
  initials: z.string().trim().min(1).max(12),
  name: z.string().trim().min(1).max(160),
  heroTag: z.string().trim().min(1).max(120),
  heroFirstName: z.string().trim().min(1).max(80),
  heroHighlightName: z.string().trim().min(1).max(80),
  heroLastName: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().min(1).max(180),
  heroDescription: z.string().trim().min(1).max(2000),
  profileImageUrl: z.string().trim().max(1000),
  profileImageAlt: z.string().trim().min(1).max(180),
  aboutIntro: z.string().trim().min(1).max(2000),
  aboutDescription: z.string().trim().min(1).max(3000),
  contactHeading: z.string().trim().min(1).max(180),
  contactText: z.string().trim().min(1).max(2000),
  footerTagline: z.string().trim().max(160),
  socialLinks: socialLinksSchema,
});

const projectSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(3000),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  githubUrl: z.string().trim().max(1000),
  liveUrl: z.string().trim().max(1000),
  isPublished: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

const skillSchema = z.object({
  category: z.string().trim().min(1).max(100),
  items: z.array(z.string().trim().min(1).max(100)).max(30),
  isVisible: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

const serviceSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(3000),
  isVisible: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

const experienceSchema = z.object({
  role: z.string().trim().min(1).max(160),
  company: z.string().trim().min(1).max(160),
  dates: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(3000),
  isVisible: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

const idSchema = z.object({ id: z.number().int().positive() });

const sectionSchema = z.object({
  id: z.number().int().positive(),
  sectionKey: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(100),
  heading: z.string().trim().min(1).max(160),
  isVisible: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  portfolio: router({
    /** Public route: hidden and draft records are filtered in the database helper. */
    get: publicProcedure.query(async () => {
      const dbPortfolio = await getPublicPortfolio();
      return dbPortfolio ?? defaultPortfolio;
    }),

    /** Admin routes are grouped so the frontend can use trpc.portfolio.admin.* hooks. */
    admin: router({
      get: adminProcedure.query(async () => {
        const dbPortfolio = await getAdminPortfolio();
        return dbPortfolio ?? defaultPortfolio;
      }),
      saveProfile: adminProcedure.input(profileSchema).mutation(({ input }) => {
        const { id, ...profile } = input;
        return saveProfile(id, profile);
      }),
      projects: router({
        create: adminProcedure.input(projectSchema).mutation(({ input }) => createProject(input)),
        update: adminProcedure.input(projectSchema.extend(idSchema.shape)).mutation(({ input }) => {
          const { id, ...project } = input;
          return updateProject(id, project);
        }),
        delete: adminProcedure.input(idSchema).mutation(({ input }) => deleteProject(input.id)),
      }),
      skills: router({
        create: adminProcedure.input(skillSchema).mutation(({ input }) => createSkill(input)),
        update: adminProcedure.input(skillSchema.extend(idSchema.shape)).mutation(({ input }) => {
          const { id, ...skill } = input;
          return updateSkill(id, skill);
        }),
        delete: adminProcedure.input(idSchema).mutation(({ input }) => deleteSkill(input.id)),
      }),
      services: router({
        create: adminProcedure.input(serviceSchema).mutation(({ input }) => createService(input)),
        update: adminProcedure.input(serviceSchema.extend(idSchema.shape)).mutation(({ input }) => {
          const { id, ...service } = input;
          return updateService(id, service);
        }),
        delete: adminProcedure.input(idSchema).mutation(({ input }) => deleteService(input.id)),
      }),
      experience: router({
        create: adminProcedure.input(experienceSchema).mutation(({ input }) => createExperience(input)),
        update: adminProcedure.input(experienceSchema.extend(idSchema.shape)).mutation(({ input }) => {
          const { id, ...experience } = input;
          return updateExperience(id, experience);
        }),
        delete: adminProcedure.input(idSchema).mutation(({ input }) => deleteExperience(input.id)),
      }),
      sections: router({
        update: adminProcedure.input(z.object({ sections: z.array(sectionSchema).max(20) })).mutation(({ input }) =>
          updateHomepageSections(input.sections),
        ),
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
