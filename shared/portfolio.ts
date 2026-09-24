/**
 * Links that are shown in the contact and footer areas of the portfolio.
 * Keeping these in one object makes social links easy to edit together.
 */
export type SocialLinks = {
  github: string;
  linkedin: string;
  twitter: string;
  email: string;
};

/**
 * The single profile record used by the hero, about, contact, and footer sections.
 */
export type ProfileContent = {
  id: number;
  initials: string;
  name: string;
  heroTag: string;
  heroFirstName: string;
  heroHighlightName: string;
  heroLastName: string;
  subtitle: string;
  heroDescription: string;
  profileImageUrl: string;
  profileImageAlt: string;
  aboutIntro: string;
  aboutDescription: string;
  contactHeading: string;
  contactText: string;
  footerTagline: string;
  socialLinks: SocialLinks;
};

/**
 * A project displayed in the featured projects grid.
 * Hidden or unpublished projects are kept in the database but omitted publicly.
 */
export type ProjectContent = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  isPublished: boolean;
  displayOrder: number;
};

/** A group of related skills, such as Frontend, GIS, or Tools. */
export type SkillGroup = {
  id: number;
  category: string;
  items: string[];
  isVisible: boolean;
  displayOrder: number;
};

/** A service card shown in the services section. */
export type ServiceContent = {
  id: number;
  title: string;
  description: string;
  isVisible: boolean;
  displayOrder: number;
};

/** A career or learning experience entry. */
export type ExperienceContent = {
  id: number;
  role: string;
  company: string;
  dates: string;
  description: string;
  isVisible: boolean;
  displayOrder: number;
};

/**
 * A simple homepage section control. This is intentionally not a visual page builder.
 * It only controls visibility and order for the existing portfolio sections.
 */
export type HomepageSection = {
  id: number;
  sectionKey: string;
  label: string;
  heading: string;
  isVisible: boolean;
  displayOrder: number;
};

/** Everything required to render the public portfolio page. */
export type PortfolioSnapshot = {
  profile: ProfileContent;
  projects: ProjectContent[];
  skills: SkillGroup[];
  services: ServiceContent[];
  experiences: ExperienceContent[];
  homepageSections: HomepageSection[];
};

/** Form payload used when saving the profile from the admin page. */
export type ProfileFormValues = Omit<ProfileContent, "id" | "socialLinks"> & {
  github: string;
  linkedin: string;
  twitter: string;
  email: string;
};

export type ProjectFormValues = Omit<ProjectContent, "id" | "tags"> & {
  tagsText: string;
};

export type SkillFormValues = Omit<SkillGroup, "id" | "items"> & {
  itemsText: string;
};

export type ServiceFormValues = Omit<ServiceContent, "id">;
export type ExperienceFormValues = Omit<ExperienceContent, "id">;
