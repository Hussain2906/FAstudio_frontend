import {
  CONTACT_PAGE_TYPE,
  GLOBAL_FOOTER_TYPE,
  HOME_HERO_TYPE,
  contactPageDefaultContent,
  footerDefaultContent,
  getGlobalComponentDefinition,
  isContactPageContent,
  isHomeHeroContent,
  type CmsPublishedPage,
  type ContactPageContent,
  type FooterContent,
} from "@fs/cms-contracts";
import type { Metadata } from "next";
import { cache } from "react";
import type { CmsMediaAsset } from "@fs/cms-contracts";
import { ContactPageExperience } from "../../components/site/contact/contact-page";

export const dynamic = "force-dynamic";

async function getPublishedPage(slug: string): Promise<CmsPublishedPage | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/cms/public/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;

    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !Array.isArray((result as { sections?: unknown }).sections)
    ) {
      return null;
    }
    return result as CmsPublishedPage;
  } catch {
    return null;
  }
}

async function getPublishedFooter(): Promise<FooterContent> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) return footerDefaultContent;

  try {
    const response = await fetch(
      `${baseUrl}/cms/public/components/${encodeURIComponent(GLOBAL_FOOTER_TYPE)}`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return footerDefaultContent;

    const result: unknown = await response.json();
    if (typeof result !== "object" || result === null || !("content" in result)) {
      return footerDefaultContent;
    }

    const definition = getGlobalComponentDefinition(GLOBAL_FOOTER_TYPE);
    return definition?.validate(result.content)
      ? (result.content as FooterContent)
      : footerDefaultContent;
  } catch {
    return footerDefaultContent;
  }
}

const getContactPageData = cache(async () => {
  const [page, footer] = await Promise.all([getPublishedPage("contact"), getPublishedFooter()]);
  const contactSection = page?.sections.find(
    (section) => section.type === CONTACT_PAGE_TYPE && isContactPageContent(section.content),
  );
  const content: ContactPageContent = contactSection
    ? (contactSection.content as ContactPageContent)
    : contactPageDefaultContent;

  let image: CmsMediaAsset | null = content.image;
  let imageAlt = content.image ? content.imageAlt : "";
  if (!image) {
    const home = await getPublishedPage("home");
    const heroSection = home?.sections.find(
      (section) => section.type === HOME_HERO_TYPE && isHomeHeroContent(section.content),
    );
    if (heroSection && isHomeHeroContent(heroSection.content)) {
      image = heroSection.content.image;
      imageAlt = image ? heroSection.content.image.alt : "";
    }
  }

  return { content, image, imageAlt, email: footer.email, phone: footer.phone };
});

export async function generateMetadata(): Promise<Metadata> {
  const { content, image, imageAlt } = await getContactPageData();
  const title = `${content.heading} | FA Studio`;
  const description = content.description;
  const images = image?.url ? [{ url: image.url, alt: imageAlt }] : undefined;
  const twitterImages = image?.url ? [image.url] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "FA Studio",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
  };
}

export default async function ContactPage() {
  const { content, image, imageAlt, email, phone } = await getContactPageData();

  return (
    <ContactPageExperience
      content={content}
      email={email}
      image={image}
      imageAlt={imageAlt}
      phone={phone}
    />
  );
}
