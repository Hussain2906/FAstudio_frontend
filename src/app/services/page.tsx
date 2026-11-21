import {
  SERVICES_CATALOGUE_TYPE,
  SERVICES_HERO_TYPE,
  isServicesCatalogueContent,
  isServicesHeroContent,
} from "@fs/cms-contracts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "../../lib/api/client";
import { CmsSectionList } from "../../features/cms/section-renderer";
import { getPublishedPage } from "../../features/cms/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services | FA Studio",
  description:
    "Thoughtfully considered design services tailored to your space, lifestyle, and vision.",
};

export default async function ServicesPage() {
  let page: Awaited<ReturnType<typeof getPublishedPage>>;
  try {
    page = await getPublishedPage("services");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const hasPublishedContent = page.sections.some(
    (section) =>
      (section.type === SERVICES_HERO_TYPE && isServicesHeroContent(section.content)) ||
      (section.type === SERVICES_CATALOGUE_TYPE &&
        isServicesCatalogueContent(section.content) &&
        section.content.items.some((item) => item.enabled)),
  );
  if (!hasPublishedContent) notFound();

  return (
    <main aria-label="FA Studio Services">
      <CmsSectionList sections={page.sections} />
    </main>
  );
}
