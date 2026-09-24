import { describe, expect, it } from "vitest";
import { filterPublicPortfolio } from "./db";
import type { PortfolioSnapshot } from "../shared/portfolio";

const profile = {
  id: 1,
  initials: "SNK",
  name: "Saviour Nwibari Koki",
  heroTag: "DEV",
  heroFirstName: "SAVIOUR",
  heroHighlightName: "NWIBARI",
  heroLastName: "KOKI",
  subtitle: "Developer",
  heroDescription: "Description",
  profileImageUrl: "",
  profileImageAlt: "Saviour",
  aboutIntro: "Intro",
  aboutDescription: "About",
  contactHeading: "Contact",
  contactText: "Text",
  footerTagline: "Better",
  socialLinks: { github: "", linkedin: "", twitter: "", email: "" },
};

describe("filterPublicPortfolio", () => {
  it("keeps only records marked visible or published", () => {
    const source: PortfolioSnapshot = {
      profile,
      projects: [
        { id: 1, title: "Published", description: "Shown", tags: [], githubUrl: "", liveUrl: "", isPublished: true, displayOrder: 1 },
        { id: 2, title: "Draft", description: "Hidden", tags: [], githubUrl: "", liveUrl: "", isPublished: false, displayOrder: 2 },
      ],
      skills: [
        { id: 1, category: "Visible", items: ["React"], isVisible: true, displayOrder: 1 },
        { id: 2, category: "Hidden", items: ["Secret"], isVisible: false, displayOrder: 2 },
      ],
      services: [
        { id: 1, title: "Shown", description: "Visible", isVisible: true, displayOrder: 1 },
        { id: 2, title: "Hidden", description: "Not visible", isVisible: false, displayOrder: 2 },
      ],
      experiences: [
        { id: 1, role: "Shown", company: "Studio", dates: "Now", description: "Visible", isVisible: true, displayOrder: 1 },
        { id: 2, role: "Hidden", company: "Studio", dates: "Before", description: "Hidden", isVisible: false, displayOrder: 2 },
      ],
      homepageSections: [
        { id: 1, sectionKey: "about", label: "About", heading: "ABOUT", isVisible: true, displayOrder: 1 },
        { id: 2, sectionKey: "services", label: "Services", heading: "SERVICES", isVisible: false, displayOrder: 2 },
      ],
    };

    const result = filterPublicPortfolio(source);

    expect(result.projects.map((item) => item.title)).toEqual(["Published"]);
    expect(result.skills.map((item) => item.category)).toEqual(["Visible"]);
    expect(result.services.map((item) => item.title)).toEqual(["Shown"]);
    expect(result.experiences.map((item) => item.role)).toEqual(["Shown"]);
    expect(result.homepageSections.map((item) => item.sectionKey)).toEqual(["about"]);
  });
});
