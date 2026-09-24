import type { PortfolioSnapshot } from "./portfolio";

/**
 * These defaults keep the public page readable during local startup or a temporary
 * database connection problem. The admin panel still saves the source of truth to the database.
 */
export const defaultPortfolio: PortfolioSnapshot = {
  profile: {
    id: 1,
    initials: "SNK",
    name: "Saviour Nwibari Koki",
    heroTag: "",
    heroFirstName: "SAVIOUR",
    heroHighlightName: "NWIBARI",
    heroLastName: "KOKI",
    subtitle: "Frontend Developer & GIS Analyst",
    heroDescription:
      "Crafting pixel-perfect web experiences and transforming spatial data into actionable insights. Bridging the gap between beautiful interfaces and geographic intelligence.",
    profileImageUrl: "/manus-storage/profile_af01b11e.jpg",
    profileImageAlt: "Saviour Nwibari Koki",
    aboutIntro:
      "I'm a passionate developer with a unique blend of frontend expertise and geographic information systems knowledge. My work sits at the intersection of beautiful user interfaces and data-driven spatial analysis.",
    aboutDescription:
      "With a strong foundation in modern web technologies and GIS tools, I create interactive mapping applications, responsive websites, and data visualizations that help people understand complex geographic patterns and make informed decisions.",
    contactHeading: "LET'S WORK TOGETHER",
    contactText:
      "Have a project in mind? Whether it's a web application, GIS solution, or data visualization, I'd love to hear about it. Let's create something amazing!",
    footerTagline: "I will be Better.",
    socialLinks: {
      github: "https://github.com/SaviourNwibariKoki",
      linkedin: "https://www.linkedin.com/in/saviour-koki-1a34bb247/",
      twitter: "https://x.com/Sswashbuckler1?t=AyC0FOUe_tqJyjfuTmmksg&s=09",
      email: "saviourbarry46@gmail.com",
    },
  },
  skills: [
    { id: 1, category: "FRONTEND", items: ["HTML5 & CSS3", "JavaScript (ES6+)", "TypeScript", "React.js", "Responsive Design"], isVisible: true, displayOrder: 1 },
    { id: 2, category: "GIS", items: ["QGIS", "Remote Sensing", "Spatial Analysis", "GRID3", "Leaflet/Mapbox", "GeoJSON"], isVisible: true, displayOrder: 2 },
    { id: 3, category: "TOOLS", items: ["Git & GitHub", "Python", "RESTful APIs", "Data Visualization", "PostgreSQL/PostGIS"], isVisible: true, displayOrder: 3 },
  ],
  projects: [],
  services: [
    { id: 1, title: "FRONTEND DEVELOPMENT", description: "Building responsive, performant, and accessible web applications using modern frameworks and best practices. From landing pages to complex SPAs.", isVisible: true, displayOrder: 1 },
    { id: 2, title: "WEB MAP DEVELOPMENT", description: "Creating interactive web maps and location-based applications with custom styling, spatial queries, and seamless user experiences.", isVisible: true, displayOrder: 2 },
    { id: 3, title: "GIS ANALYSIS & MAPPING", description: "Professional spatial analysis, cartographic design, and geospatial data processing using industry-standard GIS tools and methodologies.", isVisible: true, displayOrder: 3 },
    { id: 4, title: "DATA VISUALIZATION", description: "Transforming complex datasets into clear, insightful visual stories through interactive charts, dashboards, and custom visualizations.", isVisible: true, displayOrder: 4 },
  ],
  experiences: [],
  homepageSections: [
    { id: 1, sectionKey: "home", label: "Home", heading: "HOME", isVisible: true, displayOrder: 1 },
    { id: 2, sectionKey: "about", label: "About", heading: "ABOUT ME", isVisible: true, displayOrder: 2 },
    { id: 3, sectionKey: "projects", label: "Projects", heading: "FEATURED PROJECTS", isVisible: false, displayOrder: 3 },
    { id: 4, sectionKey: "services", label: "Services", heading: "SERVICES", isVisible: true, displayOrder: 4 },
    { id: 5, sectionKey: "experience", label: "Experience", heading: "EXPERIENCE", isVisible: true, displayOrder: 5 },
    { id: 6, sectionKey: "contact", label: "Contact", heading: "GET IN TOUCH", isVisible: true, displayOrder: 6 },
  ],
};
