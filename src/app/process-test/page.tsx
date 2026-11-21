import { notFound } from "next/navigation";
import {
  HOME_HERO_TYPE,
  HOME_SELECTED_PROJECTS_TYPE,
  isHomeHeroContent,
  isHomeSelectedProjectsContent,
  processStepsDefaultContent,
  type CmsMediaAsset,
  type ProcessStep,
} from "@fs/cms-contracts";
import { ProcessPageExperience } from "../../components/site/process/process-page-experience";
import { getPublishedPage } from "../../features/cms/api";

export const dynamic = "force-dynamic";

export default async function ProcessBrowserFixturePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const home = await getPublishedPage("home").catch(() => null);
  const hero = home?.sections.find((section) => section.type === HOME_HERO_TYPE);
  const selected = home?.sections.find((section) => section.type === HOME_SELECTED_PROJECTS_TYPE);
  const assets: CmsMediaAsset[] = [
    ...(hero && isHomeHeroContent(hero.content) && hero.content.image ? [hero.content.image] : []),
    ...(selected && isHomeSelectedProjectsContent(selected.content)
      ? selected.content.projects.flatMap((project) => (project.image ? [project.image] : []))
      : []),
  ];
  if (!assets.length) notFound();

  const titles = ["Fixture stage one", "Plan", "Fixture stage three"];
  const steps: ProcessStep[] = titles.map((title, order) => ({
    id: `browser-fixture-${order + 1}`,
    order,
    enabled: true,
    eyebrow: `Browser test ${order + 1}`,
    title,
    summary: `Visible fixture summary for stage ${order + 1}.`,
    description: "Temporary local browser fixture. No process claims are published.",
    image: assets[order % assets.length],
    imageAlt: "Interior photograph used only for local browser testing.",
    imageDecorative: false,
    secondaryCaption: "Local test fixture only",
    imagePosition: "center",
  }));
  const content = {
    ...processStepsDefaultContent,
    enabled: true,
    eyebrow: "LOCAL BROWSER FIXTURE",
    heading: "Process story browser fixture",
    description: "Temporary test-only content, never published through the CMS.",
    skipLinkLabel: "Read fixture steps as text",
    steps,
  };

  return (
    <main aria-label="Local Process browser fixture">
      <ProcessPageExperience content={content} />
    </main>
  );
}
