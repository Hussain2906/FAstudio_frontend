import {
  HOME_HERO_TYPE,
  PORTFOLIO_CATALOGUE_TYPE,
  PORTFOLIO_HERO_TYPE,
  isHomeHeroContent,
  isPortfolioCatalogueContent,
  isPortfolioHeroContent,
  portfolioCatalogueDefaultContent,
  portfolioHeroDefaultContent,
} from "@fs/cms-contracts";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPage } from "../../features/cms/api";
import { getPortfolioEntries, isPortfolioDemoMode } from "../../components/site/portfolio/data";
import { PortfolioAmbientBackground } from "../../components/site/portfolio/portfolio-ambient-background";
import { ProjectCatalogue } from "../../components/site/portfolio/project-catalogue";
import styles from "../../components/site/portfolio/portfolio.module.css";

export const metadata: Metadata = {
  title: "Portfolio | FA Studio",
  description: "A selection of interior architecture and design projects by FA Studio.",
};

export default async function PortfolioPage() {
  const demoMode = isPortfolioDemoMode();
  const pagePromise = getPublishedPage("portfolio").catch(() => null);
  const homePromise = getPublishedPage("home").catch(() => null);
  const [page, home, projects] = await Promise.all([
    pagePromise,
    homePromise,
    getPortfolioEntries(pagePromise, homePromise),
  ]);
  const sections = page?.sections ?? [];
  const heroSection = sections.find(
    (section) => section.type === PORTFOLIO_HERO_TYPE && isPortfolioHeroContent(section.content),
  );
  const catalogueSection = sections.find(
    (section) =>
      section.type === PORTFOLIO_CATALOGUE_TYPE && isPortfolioCatalogueContent(section.content),
  );
  const hero =
    heroSection && isPortfolioHeroContent(heroSection.content)
      ? heroSection.content
      : portfolioHeroDefaultContent;
  const catalogue =
    catalogueSection && isPortfolioCatalogueContent(catalogueSection.content)
      ? catalogueSection.content
      : portfolioCatalogueDefaultContent;
  const heroState = page?.sectionStates?.find((section) => section.type === PORTFOLIO_HERO_TYPE);
  const catalogueState = page?.sectionStates?.find(
    (section) => section.type === PORTFOLIO_CATALOGUE_TYPE,
  );
  const homeHeroSection = home?.sections.find(
    (section) => section.type === HOME_HERO_TYPE && isHomeHeroContent(section.content),
  );
  const homeHeroImage =
    homeHeroSection && isHomeHeroContent(homeHeroSection.content)
      ? homeHeroSection.content.image
      : null;
  const heroImage = hero.image ?? (heroState ? null : homeHeroImage);
  const heroVideo = hero.video ?? null;
  const showHero = page === null || heroState?.isVisible !== false;
  const showCatalogue = page === null || catalogueState?.isVisible !== false;
  const mainHeadingId = showHero
    ? "portfolio-heading"
    : showCatalogue
      ? "portfolio-catalogue-heading"
      : undefined;
  return (
    <main
      id="portfolio-page"
      aria-label={mainHeadingId ? undefined : "FA Studio Portfolio"}
      aria-labelledby={mainHeadingId}
    >
      {showHero ? (
        <section
          className="relative isolate min-h-[100svh] overflow-hidden bg-background text-foreground"
          style={{ marginTop: "-5.5rem", paddingTop: "5.5rem" }}
        >
          <PortfolioAmbientBackground
            imageSrc={heroVideo ? null : heroImage?.url}
            videoPosterSrc={heroVideo?.posterUrl}
            videoSrc={heroVideo?.url}
          />
          <div
            className={`${styles.heroContent} relative z-10 flex items-center px-[var(--page-gutter)] py-20 sm:py-24`}
          >
            <div className={`${styles.heroCopy} w-full max-w-3xl`} data-enter="portfolio-hero">
              {hero.eyebrow ? (
                <p className="type-caption text-muted-foreground">{hero.eyebrow}</p>
              ) : null}
              <h1 className="type-hero mt-5 max-w-4xl" id="portfolio-heading">
                {hero.heading || "Portfolio"}
              </h1>
              {hero.description ? (
                <p className="type-subheading mt-6 max-w-prose text-muted-foreground">
                  {hero.description}
                </p>
              ) : null}
              {projects.length ? (
                <p className="type-caption mt-6 text-muted-foreground">
                  {demoMode
                    ? `${projects.length} local demo ${projects.length === 1 ? "sample" : "samples"} — not published`
                    : `${projects.length} ${projects.length === 1 ? "published project" : "published projects"}`}
                </p>
              ) : null}
              {showCatalogue ? (
                <Link
                  className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                  href="#portfolio-catalogue-heading"
                >
                  Explore interior projects <span aria-hidden="true">↓</span>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
      {showCatalogue ? (
        <ProjectCatalogue
          description={catalogue.description}
          emptyDescription={catalogue.emptyStateDescription}
          emptyHeading={catalogue.emptyStateHeading}
          eyebrow={catalogue.eyebrow}
          heading={catalogue.heading}
          isPageHeading={!showHero}
          projects={projects}
        />
      ) : null}
    </main>
  );
}
