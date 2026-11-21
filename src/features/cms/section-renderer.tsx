import {
  ABOUT_SECTION_TYPES,
  HOME_DESIGN_CONSULTATION_TYPE,
  HOME_EXPERIENCE_TYPE,
  HOME_HERO_TYPE,
  HOME_ROOM_ASSEMBLY_TYPE,
  HOME_SELECTED_PROJECTS_TYPE,
  PROCESS_STEPS_TYPE,
  SERVICES_CATALOGUE_TYPE,
  SERVICES_HERO_TYPE,
  isAboutSectionContent,
  isHomeExperienceContent,
  isHomeHeroContent,
  isHomeRoomAssemblyContent,
  isHomeSelectedProjectsContent,
  isProcessStepsContent,
  isServicesCatalogueContent,
  isServicesHeroContent,
  normalizeHomeDesignConsultationContent,
  type CmsPublishedSection,
} from "@fs/cms-contracts";
import type { ReactNode } from "react";
import { HeroSection } from "../../components/site/hero-section";
import { HomeExperienceSection } from "../../components/site/home-experience-section";
import { HomeSelectedProjectsSection } from "../../components/site/home-selected-projects-section";
import { HomeRoomAssemblySection } from "../../components/site/home-room-assembly-section";
import { HomeDesignConsultationSection } from "../../components/site/home-design-consultation-section";
import { ProcessPageExperience } from "../../components/site/process/process-page-experience";
import { AboutSection } from "../../components/site/about-section";
import {
  ServicesCatalogueSection,
  ServicesHeroSection,
} from "../../components/site/services-sections";

type SectionRendererProps = {
  section: CmsPublishedSection;
  servicesCatalogueIsPageHeading?: boolean;
};

/**
 * Resolve registered storefront renderers here. Unsupported types are ignored
 * so a new or stale section cannot break the public page.
 */
export function CmsSectionRenderer({
  section,
  servicesCatalogueIsPageHeading = false,
}: SectionRendererProps): ReactNode {
  if (
    ABOUT_SECTION_TYPES.includes(section.type as (typeof ABOUT_SECTION_TYPES)[number]) &&
    isAboutSectionContent(section.content)
  )
    return <AboutSection content={section.content} type={section.type} />;
  if (section.type === SERVICES_HERO_TYPE && isServicesHeroContent(section.content))
    return <ServicesHeroSection content={section.content} />;
  if (section.type === SERVICES_CATALOGUE_TYPE && isServicesCatalogueContent(section.content))
    return (
      <ServicesCatalogueSection
        content={section.content}
        isPageHeading={servicesCatalogueIsPageHeading}
      />
    );
  if (section.type === HOME_HERO_TYPE && isHomeHeroContent(section.content))
    return <HeroSection content={section.content} />;
  if (section.type === HOME_EXPERIENCE_TYPE && isHomeExperienceContent(section.content))
    return <HomeExperienceSection content={section.content} />;
  if (
    section.type === HOME_SELECTED_PROJECTS_TYPE &&
    isHomeSelectedProjectsContent(section.content)
  )
    return <HomeSelectedProjectsSection content={section.content} />;
  if (section.type === HOME_ROOM_ASSEMBLY_TYPE && isHomeRoomAssemblyContent(section.content))
    return <HomeRoomAssemblySection content={section.content} />;
  if (section.type === HOME_DESIGN_CONSULTATION_TYPE) {
    const content = normalizeHomeDesignConsultationContent(section.content);
    if (content) return <HomeDesignConsultationSection content={content} />;
  }
  if (section.type === PROCESS_STEPS_TYPE && isProcessStepsContent(section.content))
    return <ProcessPageExperience content={section.content} />;
  return null;
}

export function CmsSectionList({
  sections,
}: {
  sections: readonly CmsPublishedSection[];
}): ReactNode {
  const hasPublishedServicesHero = sections.some(
    (section) => section.type === SERVICES_HERO_TYPE && isServicesHeroContent(section.content),
  );
  return sections.map((section) => (
    <CmsSectionRenderer
      key={section.id}
      section={section}
      servicesCatalogueIsPageHeading={!hasPublishedServicesHero}
    />
  ));
}
