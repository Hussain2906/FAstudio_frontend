import {
  HOME_SELECTED_PROJECTS_TYPE,
  PORTFOLIO_PROJECT_TYPE,
  isHomeSelectedProjectsContent,
  isPortfolioProjectContent,
  type CmsImage,
  type CmsPublishedPage,
  type HomeSelectedProject,
  type HomeSelectedProjectsContent,
  type PortfolioProjectContent,
} from "@fs/cms-contracts";
import { getPublishedPage } from "../../../features/cms/api";

export type PortfolioEntry = {
  slug: string;
  title: string;
  category: string;
  shortDescription?: string;
  overview?: string;
  location?: string;
  completionYear?: number | null;
  coverImage: CmsImage;
  gallery: readonly CmsImage[];
  story?: string;
  contentSections?: PortfolioProjectContent["contentSections"];
  source: "portfolio" | "home" | "demo";
};

export function isPortfolioDemoMode() {
  return process.env.NODE_ENV === "development" && process.env.FS_PORTFOLIO_DEMO_MODE === "1";
}

function makePortfolioDemoEntries(entries: readonly PortfolioEntry[]): PortfolioEntry[] {
  return entries.map((entry, index) => {
    const { location: _location, completionYear: _completionYear, ...imageAndCategory } = entry;
    void _location;
    void _completionYear;
    const number = String(index + 1).padStart(2, "0");

    return {
      ...imageAndCategory,
      slug: `demo-project-${number}`,
      title: `Sample Project ${number}`,
      shortDescription: "Local demo content — not a published project.",
      overview:
        "This sample exists only to preview the Portfolio layout. It is not a real project or a saved CMS record.",
      gallery: [],
      story:
        "Demo-only text for local preview. This content is not stored in the CMS or published.",
      contentSections: [],
      source: "demo",
    };
  });
}

function legacySlug(project: HomeSelectedProject) {
  const slugPart = (value: string) =>
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const title = slugPart(project.title) || "project";
  const id = slugPart(project.id) || "id";
  return `home-${title}-${id}`;
}

function legacyEntry(project: HomeSelectedProject): PortfolioEntry | null {
  if (
    !project.image?.url ||
    !project.imageAlt?.trim() ||
    !project.title.trim() ||
    !project.category.trim()
  )
    return null;
  return {
    slug: legacySlug(project),
    title: project.title,
    category: project.category,
    coverImage: { ...project.image, alt: project.imageAlt },
    gallery: [],
    source: "home",
  };
}

function dedicatedEntry(project: PortfolioProjectContent): PortfolioEntry | null {
  if (
    !project.slug ||
    !project.title.trim() ||
    !project.category.trim() ||
    !project.coverImage?.url ||
    !project.coverImage.alt.trim()
  )
    return null;
  return {
    ...project,
    coverImage: project.coverImage,
    gallery: project.gallery,
    source: "portfolio",
  };
}

function typedSections<T>(
  page: CmsPublishedPage | null,
  sectionType: string,
  valid: (value: unknown) => value is T,
) {
  return (page?.sections ?? []).flatMap((section) => {
    if (section.type !== sectionType || !valid(section.content)) return [];
    return [section.content];
  });
}

export async function getPortfolioEntries(
  portfolioPage?: Promise<CmsPublishedPage | null>,
  homePage?: Promise<CmsPublishedPage | null>,
): Promise<PortfolioEntry[]> {
  const [portfolio, home] = await Promise.all([
    portfolioPage ?? getPublishedPage("portfolio").catch(() => null),
    homePage ?? getPublishedPage("home").catch(() => null),
  ]);
  const projects = typedSections<PortfolioProjectContent>(
    portfolio,
    PORTFOLIO_PROJECT_TYPE,
    isPortfolioProjectContent,
  )
    .map(dedicatedEntry)
    .filter((item): item is PortfolioEntry => item !== null);
  const homeContent = typedSections<HomeSelectedProjectsContent>(
    home,
    HOME_SELECTED_PROJECTS_TYPE,
    isHomeSelectedProjectsContent,
  )[0];
  const legacy =
    homeContent?.projects
      .map(legacyEntry)
      .filter((item): item is PortfolioEntry => item !== null) ?? [];
  const seenCovers = new Set(projects.map((project) => project.coverImage.publicId));
  const uniqueLegacy = legacy.filter((project) => {
    if (seenCovers.has(project.coverImage.publicId)) return false;
    seenCovers.add(project.coverImage.publicId);
    return true;
  });
  const entries = [...projects, ...uniqueLegacy];
  return isPortfolioDemoMode() ? makePortfolioDemoEntries(entries) : entries;
}
