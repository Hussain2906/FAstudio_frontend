import type { Metadata } from "next";
import { cache } from "react";
import {
  HOME_HERO_TYPE,
  PROCESS_STEPS_TYPE,
  isHomeHeroContent,
  isProcessStepsContent,
  processStepsDefaultContent,
  type CmsPublishedPage,
  type ProcessStepsContent,
} from "@fs/cms-contracts";
import { ProcessPageExperience } from "../../components/site/process/process-page-experience";
import { getPublishedPage } from "../../features/cms/api";

export const dynamic = "force-dynamic";

const getProcessPage = cache(async (): Promise<CmsPublishedPage | null> =>
  getPublishedPage("process").catch(() => null),
);
const getHomePage = cache(async (): Promise<CmsPublishedPage | null> =>
  getPublishedPage("home").catch(() => null),
);

async function getProcessContent(): Promise<ProcessStepsContent> {
  const page = await getProcessPage();
  const section = page?.sections.find((candidate) => candidate.type === PROCESS_STEPS_TYPE);
  return section && isProcessStepsContent(section.content)
    ? section.content
    : processStepsDefaultContent;
}

export async function generateMetadata(): Promise<Metadata> {
  const [content, home] = await Promise.all([getProcessContent(), getHomePage()]);
  const hero = home?.sections.find((section) => section.type === HOME_HERO_TYPE);
  const homeImage = hero && isHomeHeroContent(hero.content) ? hero.content.image : null;
  const processImage = content.steps.find((step) => step.enabled && step.image)?.image ?? null;
  const title = content.seoTitle.trim() || `${content.heading} | FA Studio`;
  const description =
    content.seoDescription.trim() ||
    content.description.trim() ||
    "The process behind FA Studio’s interior design work.";
  const images = processImage?.url
    ? [processImage.url]
    : homeImage?.url
      ? [homeImage.url]
      : undefined;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images } : {}) },
  };
}

export default async function ProcessPage() {
  const [content, home] = await Promise.all([getProcessContent(), getHomePage()]);
  const hero = home?.sections.find((section) => section.type === HOME_HERO_TYPE);
  const emptyStateImage = hero && isHomeHeroContent(hero.content) ? hero.content.image : null;

  return (
    <main aria-label="Our design process">
      <ProcessPageExperience content={content} emptyStateImage={emptyStateImage} />
    </main>
  );
}
