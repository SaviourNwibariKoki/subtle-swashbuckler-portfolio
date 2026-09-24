const PERSON_NAME = "Saviour Nwibari Koki";
const BRAND_NAME = "Subtle Swashbuckler";
const PERSON_DESCRIPTION =
  "Portfolio of Saviour Nwibari Koki, a frontend developer and GIS analyst focused on responsive web interfaces, spatial analysis, and data visualization.";
const PROFILE_IMAGE_PATH = "/assets/profile-frame.png";
const PROFILE_IMAGE_WIDTH = 944;
const PROFILE_IMAGE_HEIGHT = 1665;
const SOCIAL_LINKS = [
  "https://github.com/SaviourNwibariKoki",
  "https://www.linkedin.com/in/saviour-koki-1a34bb247/",
  "https://x.com/Sswashbuckler1?t=AyC0FOUe_tqJyjfuTmmksg&s=09",
];
const STRUCTURED_DATA_ID = "portfolio-structured-data";

function getOrigin() {
  return window.location.origin.replace(/\/+$/, "");
}

function toAbsoluteUrl(origin: string, path: string) {
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );
  if (element) element.content = content;
}

function setCanonicalUrl(url: string) {
  const canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );
  if (canonical) canonical.href = url;
}

function createStructuredData(origin: string) {
  const publicUrl = `${origin}/`;
  const personId = `${publicUrl}#person`;
  const websiteId = `${publicUrl}#website`;
  const profilePageId = `${publicUrl}#profilepage`;
  const profileImageUrl = toAbsoluteUrl(origin, PROFILE_IMAGE_PATH);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: PERSON_NAME,
        alternateName: BRAND_NAME,
        jobTitle: "Frontend Developer & GIS Analyst",
        description: PERSON_DESCRIPTION,
        image: {
          "@type": "ImageObject",
          url: profileImageUrl,
          width: PROFILE_IMAGE_WIDTH,
          height: PROFILE_IMAGE_HEIGHT,
        },
        sameAs: SOCIAL_LINKS,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: BRAND_NAME,
        alternateName: `${PERSON_NAME} Portfolio`,
        description: PERSON_DESCRIPTION,
        url: publicUrl,
        publisher: { "@id": personId },
        inLanguage: "en",
      },
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        name: `${PERSON_NAME} | Frontend Developer & GIS Analyst`,
        url: publicUrl,
        isPartOf: { "@id": websiteId },
        about: { "@id": personId },
        mainEntity: { "@id": personId },
      },
    ],
  };
}

function updateStructuredData(origin: string) {
  const script = document.getElementById(STRUCTURED_DATA_ID);
  if (script) script.textContent = JSON.stringify(createStructuredData(origin));
}

export function applySeoMetadata(pathname?: string) {
  if (typeof window === "undefined") return;

  const origin = getOrigin();
  const currentPath = pathname ?? window.location.pathname;
  const isAdmin = currentPath === "/admin" || currentPath.startsWith("/admin/");
  const isIndexable = currentPath === "/" || currentPath === "";
  const publicUrl = `${origin}/`;
  const profileImageUrl = toAbsoluteUrl(origin, PROFILE_IMAGE_PATH);
  const title = isAdmin
    ? `Admin | ${PERSON_NAME}`
    : isIndexable
      ? `${PERSON_NAME} | Frontend Developer & GIS Analyst`
      : `Page not found | ${PERSON_NAME}`;
  const description = isIndexable
    ? PERSON_DESCRIPTION
    : isAdmin
      ? `Private administration area for ${PERSON_NAME}.`
      : `The requested page could not be found.`;

  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", isIndexable ? "index,follow" : "noindex,nofollow");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", publicUrl);
  setMeta("property", "og:image", profileImageUrl);
  setMeta("property", "og:image:alt", `Portrait of ${PERSON_NAME}`);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", profileImageUrl);
  setMeta("name", "twitter:image:alt", `Portrait of ${PERSON_NAME}`);
  setCanonicalUrl(publicUrl);
  updateStructuredData(origin);
}
