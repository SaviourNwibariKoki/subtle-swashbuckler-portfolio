import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PortfolioSnapshot } from "../shared/portfolio";
import { vi as vitest } from "vitest";

const databaseMocks = vitest.hoisted(() => ({
  getPublicPortfolio: vitest.fn(),
  getAdminPortfolio: vitest.fn(),
  saveProfile: vitest.fn(),
  createProject: vitest.fn(),
  updateProject: vitest.fn(),
  deleteProject: vitest.fn(),
  createSkill: vitest.fn(),
  updateSkill: vitest.fn(),
  deleteSkill: vitest.fn(),
  createService: vitest.fn(),
  updateService: vitest.fn(),
  deleteService: vitest.fn(),
  createExperience: vitest.fn(),
  updateExperience: vitest.fn(),
  deleteExperience: vitest.fn(),
  updateHomepageSections: vitest.fn(),
}));

vitest.mock("./db", () => databaseMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type TestUser = NonNullable<TrpcContext["user"]>;

const publicSnapshot: PortfolioSnapshot = {
  profile: {
    id: 1, initials: "SNK", name: "Saviour Nwibari Koki", heroTag: "DEV", heroFirstName: "SAVIOUR", heroHighlightName: "NWIBARI", heroLastName: "KOKI", subtitle: "Developer", heroDescription: "Description", profileImageUrl: "", profileImageAlt: "Saviour", aboutIntro: "Intro", aboutDescription: "About", contactHeading: "Contact", contactText: "Text", footerTagline: "Better", socialLinks: { github: "", linkedin: "", twitter: "", email: "" },
  },
  projects: [], skills: [], services: [], experiences: [], homepageSections: [],
};

function createContext(role: "admin" | "user"): TrpcContext {
  const user: TestUser = {
    id: role === "admin" ? 1 : 2,
    openId: role === "admin" ? "owner" : "visitor",
    email: `${role}@example.com`,
    name: role === "admin" ? "Portfolio Owner" : "Visitor",
    loginMethod: "test",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const projectInput = {
  title: "New project",
  description: "A project description.",
  tags: ["React"],
  githubUrl: "",
  liveUrl: "",
  isPublished: false,
  displayOrder: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  databaseMocks.getPublicPortfolio.mockResolvedValue(publicSnapshot);
  databaseMocks.getAdminPortfolio.mockResolvedValue(publicSnapshot);
  databaseMocks.saveProfile.mockResolvedValue(undefined);
  databaseMocks.createProject.mockResolvedValue(20);
  databaseMocks.updateProject.mockResolvedValue(undefined);
  databaseMocks.deleteProject.mockResolvedValue(undefined);
  databaseMocks.createSkill.mockResolvedValue(21);
  databaseMocks.updateSkill.mockResolvedValue(undefined);
  databaseMocks.deleteSkill.mockResolvedValue(undefined);
  databaseMocks.createService.mockResolvedValue(22);
  databaseMocks.updateService.mockResolvedValue(undefined);
  databaseMocks.deleteService.mockResolvedValue(undefined);
  databaseMocks.createExperience.mockResolvedValue(23);
  databaseMocks.updateExperience.mockResolvedValue(undefined);
  databaseMocks.deleteExperience.mockResolvedValue(undefined);
  databaseMocks.updateHomepageSections.mockResolvedValue(undefined);
});

describe("portfolio public procedure", () => {
  it("returns the public snapshot from the filtered database helper", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    const result = await caller.portfolio.get();

    expect(result).toEqual(publicSnapshot);
    expect(databaseMocks.getPublicPortfolio).toHaveBeenCalledOnce();
  });
});

describe("portfolio admin protection", () => {
  it("rejects project changes from a normal signed-in user", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.portfolio.admin.projects.create(projectInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(databaseMocks.createProject).not.toHaveBeenCalled();
  });

  it("rejects a project without a title", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.portfolio.admin.projects.create({ ...projectInput, title: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(databaseMocks.createProject).not.toHaveBeenCalled();
  });

  it("allows the owner to save profile content", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await caller.portfolio.admin.saveProfile({
      id: 1, initials: "SNK", name: "Owner", heroTag: "DEV", heroFirstName: "A", heroHighlightName: "B", heroLastName: "C", subtitle: "Developer", heroDescription: "Description", profileImageUrl: "", profileImageAlt: "Owner", aboutIntro: "Intro", aboutDescription: "About", contactHeading: "Contact", contactText: "Text", footerTagline: "Better", socialLinks: { github: "", linkedin: "", twitter: "", email: "" },
    });

    expect(databaseMocks.saveProfile).toHaveBeenCalledOnce();
    expect(databaseMocks.saveProfile.mock.calls[0]?.[0]).toBe(1);
  });

  it("allows the owner to update homepage section visibility, order, and heading", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const sections = [{ id: 1, sectionKey: "about", label: "About", heading: "ABOUT", isVisible: false, displayOrder: 2 }];
    await caller.portfolio.admin.sections.update({ sections });

    expect(databaseMocks.updateHomepageSections).toHaveBeenCalledWith(sections);
  });

  it("routes owner CRUD operations for skills, services, experience, and projects", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await caller.portfolio.admin.projects.update({ id: 1, ...projectInput });
    await caller.portfolio.admin.projects.delete({ id: 1 });
    await caller.portfolio.admin.skills.create({ category: "Frontend", items: ["React"], isVisible: true, displayOrder: 1 });
    await caller.portfolio.admin.services.create({ title: "Web development", description: "Build websites.", isVisible: true, displayOrder: 1 });
    await caller.portfolio.admin.experience.create({ role: "Developer", company: "Studio", dates: "2024 – Present", description: "Built products.", isVisible: true, displayOrder: 1 });

    expect(databaseMocks.updateProject).toHaveBeenCalledOnce();
    expect(databaseMocks.deleteProject).toHaveBeenCalledOnce();
    expect(databaseMocks.createSkill).toHaveBeenCalledOnce();
    expect(databaseMocks.createService).toHaveBeenCalledOnce();
    expect(databaseMocks.createExperience).toHaveBeenCalledOnce();
  });
});

describe("individual supporting-content CRUD operations", () => {
  it("updates and deletes a skill group", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await caller.portfolio.admin.skills.update({ id: 1, category: "Frontend", items: ["React", "TypeScript"], isVisible: true, displayOrder: 1 });
    await caller.portfolio.admin.skills.delete({ id: 1 });

    expect(databaseMocks.updateSkill).toHaveBeenCalledWith(1, { category: "Frontend", items: ["React", "TypeScript"], isVisible: true, displayOrder: 1 });
    expect(databaseMocks.deleteSkill).toHaveBeenCalledWith(1);
  });

  it("updates and deletes a service", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await caller.portfolio.admin.services.update({ id: 1, title: "Web development", description: "Build websites.", isVisible: true, displayOrder: 1 });
    await caller.portfolio.admin.services.delete({ id: 1 });

    expect(databaseMocks.updateService).toHaveBeenCalledWith(1, { title: "Web development", description: "Build websites.", isVisible: true, displayOrder: 1 });
    expect(databaseMocks.deleteService).toHaveBeenCalledWith(1);
  });

  it("updates and deletes an experience entry", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await caller.portfolio.admin.experience.update({ id: 1, role: "Developer", company: "Studio", dates: "2024 – Present", description: "Built products.", isVisible: true, displayOrder: 1 });
    await caller.portfolio.admin.experience.delete({ id: 1 });

    expect(databaseMocks.updateExperience).toHaveBeenCalledWith(1, { role: "Developer", company: "Studio", dates: "2024 – Present", description: "Built products.", isVisible: true, displayOrder: 1 });
    expect(databaseMocks.deleteExperience).toHaveBeenCalledWith(1);
  });
});
