export type CmsFieldType =
  "text" | "textarea" | "number" | "boolean" | "media" | "json";

export type CmsPageKey =
  "home" | "about" | "services" | "portfolio" | "process" | "contact";
export type CmsDestinationKey =
  "home" | "about" | "services" | "portfolio" | "process" | "contact";

export type CmsMediaAsset = {
  readonly publicId: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
};

export type CmsImage = CmsMediaAsset & {
  readonly alt: string;
};

export const CMS_VIDEO_MAX_BYTES = 10 * 1024 * 1024;

export type CmsVideo = CmsMediaAsset & {
  readonly resourceType: "video";
  readonly format: "mp4";
  readonly bytes: number;
  readonly posterUrl: string;
};

export type SiteLogoContent = {
  readonly image: CmsMediaAsset | null;
  readonly alt: string;
};

export const GLOBAL_SITE_LOGO_TYPE = "global.site-logo";

export const siteLogoDefaultContent: SiteLogoContent = {
  image: null,
  alt: "",
};

export const GLOBAL_FOOTER_TYPE = "global.footer";
export type FooterLink = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly enabled: boolean;
};
export type FooterSocial = {
  readonly id: string;
  readonly platform: "Instagram" | "YouTube" | "Pinterest" | "LinkedIn";
  readonly href: string;
  readonly enabled: boolean;
};
export type FooterContent = {
  readonly enabled: boolean;
  readonly logo: CmsMediaAsset | null;
  readonly brandName: string;
  readonly brandSubtitle: string;
  readonly description: string;
  readonly background: CmsMediaAsset | null;
  readonly backgroundAlt: string;
  readonly exploreHeading: string;
  readonly explore: readonly FooterLink[];
  readonly servicesHeading: string;
  readonly services: readonly FooterLink[];
  readonly location: string;
  readonly email: string;
  readonly phone: string;
  readonly socials: readonly FooterSocial[];
  readonly copyright: string;
  readonly privacyHref: string;
  readonly termsHref: string;
};
export const footerDefaultContent: FooterContent = {
  enabled: true,
  logo: null,
  brandName: "FA Studio",
  brandSubtitle: "Interior Design",
  description:
    "Thoughtful interiors that bring comfort, character, and timeless value to your space.",
  background: null,
  backgroundAlt: "",
  exploreHeading: "Explore",
  explore: [
    { id: "home", label: "Home", href: "/", enabled: true },
    { id: "about", label: "About", href: "/about", enabled: true },
    { id: "services", label: "Services", href: "/services", enabled: true },
    { id: "projects", label: "Projects", href: "/portfolio", enabled: true },
  ],
  servicesHeading: "Services",
  services: [
    {
      id: "residential",
      label: "Residential Design",
      href: "/services",
      enabled: true,
    },
    {
      id: "commercial",
      label: "Commercial Design",
      href: "/services",
      enabled: true,
    },
    {
      id: "renovation",
      label: "Renovation & Remodeling",
      href: "/services",
      enabled: true,
    },
    {
      id: "planning",
      label: "Space Planning",
      href: "/services",
      enabled: true,
    },
    {
      id: "consultation",
      label: "Design Consultation",
      href: "/#book-consultation",
      enabled: true,
    },
  ],
  location: "",
  email: "",
  phone: "",
  socials: [],
  copyright: "© FA Studio",
  privacyHref: "",
  termsHref: "",
};
/** Fills fields introduced after a footer draft was first saved. */
export function normalizeFooterContent(value: unknown): FooterContent {
  const content =
    value && typeof value === "object" ? (value as Partial<FooterContent>) : {};
  const socials = Array.isArray(content.socials)
    ? content.socials.map((social) =>
        social &&
        typeof social === "object" &&
        ["Instagram", "YouTube", "Pinterest", "LinkedIn"].includes(
          social.platform,
        )
          ? social
          : { ...social, platform: "Instagram" as const },
      )
    : footerDefaultContent.socials;
  return { ...footerDefaultContent, ...content, socials } as FooterContent;
}
function isFooterLink(value: unknown): value is FooterLink {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as FooterLink).id === "string" &&
    typeof (value as FooterLink).label === "string" &&
    typeof (value as FooterLink).href === "string" &&
    typeof (value as FooterLink).enabled === "boolean"
  );
}
export function isFooterContent(value: unknown): value is FooterContent {
  if (!value || typeof value !== "object") return false;
  const c = value as FooterContent;
  return (
    typeof c.enabled === "boolean" &&
    (c.logo === null || isMediaAsset(c.logo)) &&
    typeof c.brandName === "string" &&
    typeof c.brandSubtitle === "string" &&
    typeof c.description === "string" &&
    (c.background === null || isMediaAsset(c.background)) &&
    typeof c.backgroundAlt === "string" &&
    typeof c.exploreHeading === "string" &&
    Array.isArray(c.explore) &&
    c.explore.every(isFooterLink) &&
    typeof c.servicesHeading === "string" &&
    Array.isArray(c.services) &&
    c.services.every(isFooterLink) &&
    typeof c.location === "string" &&
    typeof c.email === "string" &&
    typeof c.phone === "string" &&
    Array.isArray(c.socials) &&
    c.socials.every(
      (s) =>
        !!s &&
        ["Instagram", "YouTube", "Pinterest", "LinkedIn"].includes(
          s.platform,
        ) &&
        typeof s.id === "string" &&
        typeof s.href === "string" &&
        typeof s.enabled === "boolean",
    ) &&
    typeof c.copyright === "string" &&
    typeof c.privacyHref === "string" &&
    typeof c.termsHref === "string"
  );
}

/** Returns field paths that fail footer validation without exposing their values. */
export function getFooterContentIssues(value: unknown): string[] {
  if (!value || typeof value !== "object") return ["content"];
  const c = value as Record<string, unknown>;
  const issues: string[] = [];
  if (typeof c.enabled !== "boolean") issues.push("enabled");
  if (c.logo !== null && !isMediaAsset(c.logo)) issues.push("logo");
  for (const key of [
    "brandName",
    "brandSubtitle",
    "description",
    "backgroundAlt",
    "exploreHeading",
    "servicesHeading",
    "location",
    "email",
    "phone",
    "copyright",
    "privacyHref",
    "termsHref",
  ]) {
    if (typeof c[key] !== "string") issues.push(key);
  }
  if (c.background !== null && !isMediaAsset(c.background))
    issues.push("background");
  for (const key of ["explore", "services"]) {
    if (!Array.isArray(c[key])) issues.push(key);
    else
      (c[key] as unknown[]).forEach((item, index) => {
        if (!isFooterLink(item)) issues.push(`${key}[${index}]`);
      });
  }
  if (!Array.isArray(c.socials)) issues.push("socials");
  else
    (c.socials as unknown[]).forEach((item, index) => {
      if (!item || typeof item !== "object") {
        issues.push(`socials[${index}]`);
        return;
      }
      const social = item as Record<string, unknown>;
      if (
        !["Instagram", "YouTube", "Pinterest", "LinkedIn"].includes(
          String(social.platform),
        )
      )
        issues.push(`socials[${index}].platform`);
      if (typeof social.id !== "string") issues.push(`socials[${index}].id`);
      if (typeof social.href !== "string")
        issues.push(`socials[${index}].href`);
      if (typeof social.enabled !== "boolean")
        issues.push(`socials[${index}].enabled`);
    });
  return issues;
}

export type HomeHeroContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly primaryCtaLabel: string;
  readonly primaryCtaDestination: CmsDestinationKey;
  readonly secondaryCtaLabel: string;
  readonly secondaryCtaDestination: CmsDestinationKey;
  readonly image: CmsImage;
  readonly mobileImage?: CmsImage;
  readonly serviceLabels: readonly [string, string, string];
  readonly floatingLabel: string;
  readonly slideIndicator: {
    readonly enabled: boolean;
    readonly current: number;
    readonly total: number;
  };
};

export type HomeExperienceStatistic = {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
  readonly accessibleDescription?: string;
};

export type HomeExperienceServiceCard = {
  readonly title: string;
  readonly subtitle: string;
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
  readonly destination: CmsDestinationKey;
};

export type HomeExperienceContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly mainImage: CmsMediaAsset | null;
  readonly mainImageAlt: string;
  readonly statistics: readonly [
    HomeExperienceStatistic,
    HomeExperienceStatistic,
    HomeExperienceStatistic,
    HomeExperienceStatistic,
  ];
  readonly services: readonly [
    HomeExperienceServiceCard,
    HomeExperienceServiceCard,
    HomeExperienceServiceCard,
  ];
};

export type HomeSelectedProject = {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
  readonly destination: CmsDestinationKey;
};

export type HomeSelectedProjectsContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingText: string;
  readonly projects: readonly HomeSelectedProject[];
};

export type RoomSceneElementType =
  "rug" | "table-vase" | "decorative-bowl" | "decor" | "accent-furniture";
export type RoomAnimationPreset =
  | "floor-reveal"
  | "from-left"
  | "from-right"
  | "from-top"
  | "from-bottom"
  | "gentle-settle";
export type RoomSceneElement = {
  readonly id: string;
  readonly type: RoomSceneElementType;
  readonly image: CmsMediaAsset | null;
  readonly alt: string;
  readonly enabled: boolean;
  readonly animationPreset: RoomAnimationPreset;
};

export type HomeRoomAssemblyContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly backdropImage: CmsMediaAsset | null;
  readonly backdropAlt: string;
  readonly sofaImage: CmsMediaAsset | null;
  readonly sofaAlt: string;
  readonly pillowsImage: CmsMediaAsset | null;
  readonly pillowsAlt: string;
  readonly centerTableImage: CmsMediaAsset | null;
  readonly centerTableAlt: string;
  readonly vaseImage: CmsMediaAsset | null;
  readonly vaseAlt: string;
  readonly accentChairImage?: CmsMediaAsset | null;
  readonly accentChairAlt?: string;
  readonly additionalElements?: readonly RoomSceneElement[];
  readonly primaryCtaLabel?: string;
  readonly primaryCtaDestination?: CmsDestinationKey;
  readonly secondaryCtaLabel?: string;
  readonly secondaryCtaDestination?: CmsDestinationKey;
};

export type HomeDesignConsultationContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly calcomUrl: string;
  readonly consultationImage: CmsMediaAsset | null;
  readonly consultationImageAlt: string;
};

export const HOME_HERO_TYPE = "home.hero";
export const HOME_EXPERIENCE_TYPE = "home.experience";
export const HOME_SELECTED_PROJECTS_TYPE = "home.selected-projects";
export const HOME_ROOM_ASSEMBLY_TYPE = "home.room-assembly";
export const HOME_DESIGN_CONSULTATION_TYPE = "home.design-consultation";
export const SERVICES_HERO_TYPE = "services.hero";
export const SERVICES_CATALOGUE_TYPE = "services.catalogue";
export const PROCESS_STEPS_TYPE = "process.steps";
export const CONTACT_PAGE_TYPE = "contact.page";

export type ContactPageContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly formHeading: string;
  readonly formDescription: string;
  readonly nameLabel: string;
  readonly emailLabel: string;
  readonly phoneLabel: string;
  readonly projectTypeLabel: string;
  readonly messageLabel: string;
  readonly submitLabel: string;
  readonly successMessage: string;
  readonly unavailableMessage: string;
  readonly projectTypes: readonly string[];
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
};

export const contactPageDefaultContent: ContactPageContent = {
  eyebrow: "GET IN TOUCH",
  heading: "Let’s talk about your space.",
  description:
    "Send an enquiry about residential or commercial design, renovation and remodeling, space planning, or a design consultation.",
  formHeading: "Tell us about your project",
  formDescription: "Share a few details about the space and the service you’re considering.",
  nameLabel: "Your name",
  emailLabel: "Email address",
  phoneLabel: "Phone number (optional)",
  projectTypeLabel: "Service you’re enquiring about",
  messageLabel: "A little about your project",
  submitLabel: "Send message",
  successMessage: "Thank you. Your enquiry has been sent.",
  unavailableMessage:
    "The online enquiry form is temporarily unavailable. Please email or phone the Studio.",
  projectTypes: [
    "Residential Design",
    "Commercial Design",
    "Renovation & Remodeling",
    "Space Planning",
    "Design Consultation",
  ],
  image: null,
  imageAlt: "",
};

export type ProcessImagePosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type ProcessStep = {
  readonly id: string;
  readonly order: number;
  readonly enabled: boolean;
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
  readonly imageDecorative: boolean;
  readonly secondaryCaption: string;
  readonly imagePosition: ProcessImagePosition;
};

export type ProcessStepsContent = {
  readonly enabled: boolean;
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly skipLinkLabel: string;
  readonly steps: readonly ProcessStep[];
};

/** Empty and unpublished by default: admins add the studio's verified process before publishing. */
export const processStepsDefaultContent: ProcessStepsContent = {
  enabled: false,
  eyebrow: "OUR PROCESS",
  heading: "The design process",
  description: "",
  seoTitle: "",
  seoDescription: "",
  skipLinkLabel: "Read the process as text",
  steps: [],
};

export type ServicesHeroContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
};

export type ServiceCatalogueItem = {
  readonly id: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly detailedDescription: string;
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
  /** Empty means the card is not a link. */
  readonly destinationUrl: string;
  readonly enabled: boolean;
  readonly order: number;
};

export type ServicesCatalogueContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly items: readonly ServiceCatalogueItem[];
};

export const servicesHeroDefaultContent: ServicesHeroContent = {
  eyebrow: "INTERIOR DESIGN SERVICES",
  heading: "Our Services",
  description:
    "Thoughtfully considered design services tailored to your space, lifestyle, and vision.",
  image: null,
  imageAlt: "",
};

export const servicesCatalogueDefaultContent: ServicesCatalogueContent = {
  eyebrow: "",
  heading: "Services",
  description: "",
  items: [],
};

export const servicesSectionDefaultVisibility: Readonly<
  Record<typeof SERVICES_HERO_TYPE | typeof SERVICES_CATALOGUE_TYPE, boolean>
> = {
  [SERVICES_HERO_TYPE]: true,
  [SERVICES_CATALOGUE_TYPE]: true,
};

export const ABOUT_SECTION_TYPES = [
  "about.hero",
  "about.designer",
  "about.metrics",
  "about.studio",
  "about.values",
  "about.process",
  "about.press",
  "about.projects",
  "about.testimonials",
  "about.closing",
] as const;
export type AboutSectionType = (typeof ABOUT_SECTION_TYPES)[number];
export type AboutListItem = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly value: string;
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
  readonly href: string;
};
export type AboutSectionContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly image: CmsMediaAsset | null;
  readonly imageAlt: string;
  readonly designerName: string;
  readonly role: string;
  readonly biography: string;
  readonly quote: string;
  readonly items: readonly AboutListItem[];
  readonly ctaLabel: string;
  readonly ctaUrl: string;
};
const emptyAboutContent: AboutSectionContent = {
  eyebrow: "",
  heading: "",
  description: "",
  image: null,
  imageAlt: "",
  designerName: "",
  role: "",
  biography: "",
  quote: "",
  items: [],
  ctaLabel: "",
  ctaUrl: "",
};
export const aboutSectionDefaults: Readonly<
  Record<AboutSectionType, AboutSectionContent>
> = {
  "about.hero": {
    ...emptyAboutContent,
    eyebrow: "ABOUT",
    heading: "About FA Studio",
    description:
      "A design studio crafting thoughtful, functional, and timeless interiors.",
  },
  "about.designer": {
    ...emptyAboutContent,
    eyebrow: "MEET THE DESIGNER",
    designerName: "Designer details pending approval",
    role: "Profile draft",
    biography:
      "Add the designer’s approved name, portrait, and biography before publishing this section.",
    quote: "",
  },
  "about.metrics": {
    ...emptyAboutContent,
    eyebrow: "AT A GLANCE",
    heading: "Studio milestones",
  },
  "about.studio": {
    ...emptyAboutContent,
    eyebrow: "ABOUT THE STUDIO",
    heading: "FA Studio",
    description:
      "FA Studio is an interior design practice dedicated to creating refined, functional, and meaningful spaces for modern living and working. Our approach brings together creativity, materiality, and a thoughtful understanding of how people experience their surroundings.",
  },
  "about.values": {
    ...emptyAboutContent,
    eyebrow: "OUR VALUES",
    heading: "Considered in every detail",
    items: [
      {
        id: "interior-design",
        title: "Interior Design",
        description: "Spaces shaped around the people who use them.",
        value: "",
        image: null,
        imageAlt: "",
        href: "",
      },
      {
        id: "space-planning",
        title: "Space Planning",
        description: "Thoughtful flow, proportion, and function.",
        value: "",
        image: null,
        imageAlt: "",
        href: "",
      },
      {
        id: "materials",
        title: "Thoughtful Materials",
        description: "A considered palette of texture and finish.",
        value: "",
        image: null,
        imageAlt: "",
        href: "",
      },
      {
        id: "detail",
        title: "Detail-Driven Design",
        description: "Care carried through the smallest decisions.",
        value: "",
        image: null,
        imageAlt: "",
        href: "",
      },
    ],
  },
  "about.process": {
    ...emptyAboutContent,
    eyebrow: "OUR PROCESS",
    heading: "A Thoughtful & Collaborative Journey",
    description:
      "Proposed process copy — review and confirm the project scope before publishing.",
    items: [
      {
        id: "discover",
        title: "Discover",
        description: "Understand the client’s needs, lifestyle, and vision.",
        value: "01",
        image: null,
        imageAlt: "",
        href: "",
      },
      {
        id: "concept",
        title: "Concept",
        description:
          "Explore design directions, materials, and spatial possibilities.",
        value: "02",
        image: null,
        imageAlt: "",
        href: "",
      },
      {
        id: "design",
        title: "Design",
        description: "Develop and refine the agreed design.",
        value: "03",
        image: null,
        imageAlt: "",
        href: "",
      },
      {
        id: "deliver",
        title: "Deliver",
        description:
          "Coordinate final design deliverables according to the agreed scope.",
        value: "04",
        image: null,
        imageAlt: "",
        href: "",
      },
    ],
  },
  "about.press": {
    ...emptyAboutContent,
    eyebrow: "PRESS",
    heading: "As Seen In",
  },
  "about.projects": {
    ...emptyAboutContent,
    eyebrow: "SELECTED WORK",
    heading: "Featured Projects",
  },
  "about.testimonials": {
    ...emptyAboutContent,
    eyebrow: "KIND WORDS",
    heading: "Client Reflections",
  },
  "about.closing": {
    ...emptyAboutContent,
    eyebrow: "FA STUDIO",
    heading: "Creating Spaces with Purpose",
    description:
      "Interiors that reflect your lifestyle, values, and the way you truly live.",
    ctaLabel: "Discuss your project",
    ctaUrl: "/#book-consultation",
  },
};
export const aboutSectionDefaultVisibility: Readonly<
  Record<AboutSectionType, boolean>
> = {
  "about.hero": true,
  "about.designer": true,
  "about.metrics": false,
  "about.studio": true,
  "about.values": true,
  "about.process": true,
  "about.press": false,
  "about.projects": false,
  "about.testimonials": false,
  "about.closing": true,
};
export function isAboutSectionContent(
  value: unknown,
): value is AboutSectionContent {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    [
      "eyebrow",
      "heading",
      "description",
      "imageAlt",
      "designerName",
      "role",
      "biography",
      "quote",
      "ctaLabel",
      "ctaUrl",
    ].every((key) => typeof c[key] === "string") &&
    (c.image === null || isMediaAsset(c.image)) &&
    Array.isArray(c.items) &&
    c.items.every((item) => {
      if (!item || typeof item !== "object") return false;
      const entry = item as Record<string, unknown>;
      return (
        ["id", "title", "description", "value", "imageAlt", "href"].every(
          (key) => typeof entry[key] === "string",
        ) &&
        (entry.image === null || isMediaAsset(entry.image))
      );
    })
  );
}

function isServicesHeroContentValue(
  value: unknown,
  requireComplete: boolean,
): value is ServicesHeroContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  if (
    !["eyebrow", "heading", "description", "imageAlt"].every(
      (key) => typeof content[key] === "string",
    )
  )
    return false;
  if (content.image !== null && !isServicesMediaAsset(content.image))
    return false;
  if (!requireComplete) return true;
  return (
    ["eyebrow", "heading", "description"].every(
      (key) => String(content[key]).trim().length > 0,
    ) &&
    isServicesMediaAsset(content.image) &&
    String(content.imageAlt).trim().length > 0
  );
}

export function isServicesHeroContent(
  value: unknown,
): value is ServicesHeroContent {
  return isServicesHeroContentValue(value, true);
}

export function isServicesHeroDraftContent(
  value: unknown,
): value is ServicesHeroContent {
  return isServicesHeroContentValue(value, false);
}

function isServiceCatalogueItemDraft(
  value: unknown,
): value is ServiceCatalogueItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    item.id.trim().length > 0 &&
    typeof item.title === "string" &&
    typeof item.shortDescription === "string" &&
    typeof item.detailedDescription === "string" &&
    (item.image === null || isServicesMediaAsset(item.image)) &&
    typeof item.imageAlt === "string" &&
    typeof item.destinationUrl === "string" &&
    typeof item.enabled === "boolean" &&
    typeof item.order === "number" &&
    Number.isInteger(item.order) &&
    item.order >= 0
  );
}

function isSafeServiceDestination(value: string): boolean {
  const destination = value.trim();
  if (!destination) return true;
  if (
    destination.startsWith("/") &&
    !destination.startsWith("//") &&
    !destination.includes("\\")
  )
    return true;
  if (destination.startsWith("#") && destination.length > 1) return true;
  if (!/^https:\/\/[^/]+/i.test(destination)) return false;
  try {
    const url = new URL(destination);
    return (
      url.protocol === "https:" &&
      url.hostname.length > 0 &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

export function isServicesCatalogueDraftContent(
  value: unknown,
): value is ServicesCatalogueContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  if (
    !["eyebrow", "heading", "description"].every(
      (key) => typeof content[key] === "string",
    ) ||
    !Array.isArray(content.items) ||
    !content.items.every(isServiceCatalogueItemDraft)
  )
    return false;
  const items = content.items as ServiceCatalogueItem[];
  return (
    new Set(items.map((item) => item.id)).size === items.length &&
    new Set(items.map((item) => item.order)).size === items.length
  );
}

export function isServicesCatalogueContent(
  value: unknown,
): value is ServicesCatalogueContent {
  if (!isServicesCatalogueDraftContent(value)) return false;
  const content = value as ServicesCatalogueContent;
  return (
    content.heading.trim().length > 0 &&
    content.items.every((item) => {
      if (!isSafeServiceDestination(item.destinationUrl)) return false;
      if (!item.enabled) return true;
      return (
        item.title.trim().length > 0 &&
        item.shortDescription.trim().length > 0 &&
        (item.image === null || item.imageAlt.trim().length > 0)
      );
    })
  );
}

export const homeHeroDefaultContent: HomeHeroContent = {
  eyebrow: "INTERIOR DESIGN & STYLING STUDIO",
  heading: "A home that feels entirely yours.",
  description: "Thoughtfully layered interiors, grounded in the way you live.",
  primaryCtaLabel: "Explore our projects",
  primaryCtaDestination: "portfolio",
  secondaryCtaLabel: "Discover our approach",
  secondaryCtaDestination: "process",
  image: { publicId: "", url: "", width: 0, height: 0, alt: "" },
  serviceLabels: ["Residential", "Styling & Décor", "Virtual Design"],
  floatingLabel: "DESIGNED FOR REAL LIFE",
  slideIndicator: { enabled: false, current: 1, total: 1 },
};

export const homeExperienceDefaultContent: HomeExperienceContent = {
  eyebrow: "OUR FOUNDATION",
  heading: "Built on Experience",
  description:
    "Thoughtful design, lasting relationships, and a deeper understanding of the spaces people live in.",
  mainImage: null,
  mainImageAlt: "",
  statistics: [
    {
      value: 15,
      suffix: "+",
      label: "Years of Experience",
      accessibleDescription: "",
    },
    {
      value: 250,
      suffix: "+",
      label: "Projects Completed",
      accessibleDescription: "",
    },
    {
      value: 98,
      suffix: "%",
      label: "Client Satisfaction",
      accessibleDescription: "",
    },
    {
      value: 12,
      suffix: "",
      label: "Design Awards",
      accessibleDescription: "",
    },
  ],
  services: [
    {
      title: "Residences",
      subtitle: "Homes that reflect you",
      image: null,
      imageAlt: "",
      destination: "services",
    },
    {
      title: "Styling & Décor",
      subtitle: "Refined spaces, everyday beauty",
      image: null,
      imageAlt: "",
      destination: "services",
    },
    {
      title: "Virtual Design",
      subtitle: "Thoughtful design, anywhere",
      image: null,
      imageAlt: "",
      destination: "services",
    },
  ],
};

export const homeSelectedProjectsDefaultContent: HomeSelectedProjectsContent = {
  eyebrow: "OUR WORK",
  heading: "Selected Works",
  supportingText: "",
  projects: [],
};

export const homeRoomAssemblyDefaultContent: HomeRoomAssemblyContent = {
  eyebrow: "THE DESIGN PROCESS",
  heading: "From empty space to designed living.",
  description: "Watch a considered interior take shape, one layer at a time.",
  backdropImage: null,
  backdropAlt: "",
  sofaImage: null,
  sofaAlt: "",
  pillowsImage: null,
  pillowsAlt: "",
  centerTableImage: null,
  centerTableAlt: "",
  vaseImage: null,
  vaseAlt: "",
  accentChairImage: null,
  accentChairAlt: "",
  additionalElements: [],
  primaryCtaLabel: "View Our Work",
  primaryCtaDestination: "portfolio",
  secondaryCtaLabel: "Book Consultation",
  secondaryCtaDestination: "contact",
};

export const homeDesignConsultationDefaultContent: HomeDesignConsultationContent =
  {
    eyebrow: "RESERVE A SPACE",
    heading: "Schedule a Design Consultation",
    description:
      "A personalized session to discuss your space, style, and vision.",
    calcomUrl: "https://cal.com/hussain-r8h2rf/fs-studio-design-consultation",
    consultationImage: null,
    consultationImageAlt: "",
  };

export const PORTFOLIO_HERO_TYPE = "portfolio.hero";
export const PORTFOLIO_CATALOGUE_TYPE = "portfolio.catalogue";
export const PORTFOLIO_PROJECT_TYPE = "portfolio.project";

export type PortfolioHeroContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly image: CmsImage | null;
  /** Optional for compatibility with previously saved Portfolio Hero sections. */
  readonly video?: CmsVideo | null;
};

export type PortfolioCatalogueContent = {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly emptyStateHeading: string;
  readonly emptyStateDescription: string;
};

export type PortfolioProjectContent = {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly shortDescription: string;
  readonly overview: string;
  readonly location: string;
  readonly completionYear: number | null;
  readonly coverImage: CmsImage | null;
  readonly gallery: readonly CmsImage[];
  readonly story: string;
  readonly contentSections: readonly {
    readonly id: string;
    readonly heading: string;
    readonly body: string;
    readonly image: CmsImage | null;
  }[];
};

export const portfolioHeroDefaultContent: PortfolioHeroContent = {
  eyebrow: "SELECTED WORK",
  heading: "Interior Design: Spaces We've Imagined",
  description: "A selection of thoughtful interiors by FA Studio.",
  image: null,
  video: null,
};

export const portfolioCatalogueDefaultContent: PortfolioCatalogueContent = {
  eyebrow: "THE PORTFOLIO",
  heading: "Interior projects",
  description:
    "Explore considered spaces, each shaped by its people and place.",
  emptyStateHeading: "No projects published yet",
  emptyStateDescription: "Published projects will appear here.",
};

export const portfolioProjectDefaultContent: PortfolioProjectContent = {
  slug: "",
  title: "",
  category: "",
  shortDescription: "",
  overview: "",
  location: "",
  completionYear: null,
  coverImage: null,
  gallery: [],
  story: "",
  contentSections: [],
};

function isPortfolioText(
  value: unknown,
  maxLength: number,
  required: boolean,
): value is string {
  return (
    typeof value === "string" &&
    value.length <= maxLength &&
    (!required || value.trim().length > 0)
  );
}

function isPortfolioImage(value: unknown): value is CmsImage {
  if (!isImage(value, true)) return false;
  try {
    const url = new URL(value.url);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

function isCloudinaryVideoUrl(
  value: unknown,
  extension: "mp4" | "jpg",
): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/video/upload/") &&
      url.pathname.toLowerCase().endsWith(`.${extension}`)
    );
  } catch {
    return false;
  }
}

export function isPortfolioVideo(value: unknown): value is CmsVideo {
  if (!value || typeof value !== "object") return false;
  const video = value as Record<string, unknown>;
  return (
    isMediaAsset(value) &&
    video.resourceType === "video" &&
    video.format === "mp4" &&
    Number.isFinite(video.width) &&
    Number.isFinite(video.height) &&
    Number.isInteger(video.bytes) &&
    (video.bytes as number) > 0 &&
    (video.bytes as number) <= CMS_VIDEO_MAX_BYTES &&
    isCloudinaryVideoUrl(video.url, "mp4") &&
    isCloudinaryVideoUrl(video.posterUrl, "jpg")
  );
}

export function isPortfolioHeroDraftContent(
  value: unknown,
): value is PortfolioHeroContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return (
    isPortfolioText(content.eyebrow, 100, false) &&
    isPortfolioText(content.heading, 160, false) &&
    isPortfolioText(content.description, 2000, false) &&
    (content.image === null || isPortfolioImage(content.image)) &&
    (content.video === undefined ||
      content.video === null ||
      isPortfolioVideo(content.video))
  );
}

export function isPortfolioHeroContent(
  value: unknown,
): value is PortfolioHeroContent {
  return (
    isPortfolioHeroDraftContent(value) &&
    ["eyebrow", "heading", "description"].every(
      (key) =>
        typeof (value as Record<string, unknown>)[key] === "string" &&
        ((value as Record<string, unknown>)[key] as string).trim().length > 0,
    )
  );
}

export function isPortfolioCatalogueDraftContent(
  value: unknown,
): value is PortfolioCatalogueContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return (
    isPortfolioText(content.eyebrow, 100, false) &&
    isPortfolioText(content.heading, 160, false) &&
    isPortfolioText(content.description, 2000, false) &&
    isPortfolioText(content.emptyStateHeading, 160, false) &&
    isPortfolioText(content.emptyStateDescription, 1000, false)
  );
}

export function isPortfolioCatalogueContent(
  value: unknown,
): value is PortfolioCatalogueContent {
  return (
    isPortfolioCatalogueDraftContent(value) &&
    ["eyebrow", "heading", "emptyStateHeading", "emptyStateDescription"].every(
      (key) =>
        ((value as Record<string, unknown>)[key] as string).trim().length > 0,
    )
  );
}

export function isPortfolioProjectDraftContent(
  value: unknown,
): value is PortfolioProjectContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  const sections = content.contentSections;
  return (
    isPortfolioText(content.slug, 100, false) &&
    isPortfolioText(content.title, 160, false) &&
    isPortfolioText(content.category, 100, false) &&
    isPortfolioText(content.shortDescription, 500, false) &&
    isPortfolioText(content.overview, 5000, false) &&
    isPortfolioText(content.location, 160, false) &&
    (content.completionYear === null ||
      (typeof content.completionYear === "number" &&
        Number.isInteger(content.completionYear) &&
        content.completionYear >= 1900 &&
        content.completionYear <= 2200)) &&
    (content.coverImage === null || isPortfolioImage(content.coverImage)) &&
    Array.isArray(content.gallery) &&
    content.gallery.length <= 50 &&
    content.gallery.every(isPortfolioImage) &&
    isPortfolioText(content.story, 20000, false) &&
    Array.isArray(sections) &&
    sections.length <= 30 &&
    sections.every((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const section = entry as Record<string, unknown>;
      return (
        isPortfolioText(section.id, 100, true) &&
        isPortfolioText(section.heading, 160, false) &&
        isPortfolioText(section.body, 10000, false) &&
        (section.image === null || isPortfolioImage(section.image))
      );
    }) &&
    new Set(
      (sections as Array<Record<string, unknown>>).map((entry) => entry.id),
    ).size === sections.length
  );
}

export function isPortfolioProjectContent(
  value: unknown,
): value is PortfolioProjectContent {
  if (!isPortfolioProjectDraftContent(value)) return false;
  const content = value as PortfolioProjectContent;
  if (!content.coverImage || !isPortfolioImage(content.coverImage))
    return false;
  const imageIds = [
    content.coverImage.publicId,
    ...content.gallery.map((image) => image.publicId),
  ];
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(content.slug) &&
    content.slug.length <= 100 &&
    !content.slug.startsWith("home-") &&
    [content.title, content.category, content.shortDescription].every(
      (field) => field.trim().length > 0,
    ) &&
    content.gallery.length > 0 &&
    new Set(imageIds).size === imageIds.length &&
    content.contentSections.every(
      (section) =>
        section.heading.trim().length > 0 &&
        (section.body.trim().length > 0 || section.image !== null),
    )
  );
}

export interface CmsFieldDefinition {
  readonly name: string;
  readonly label: string;
  readonly type: CmsFieldType;
  readonly required?: boolean;
  readonly description?: string;
}

export interface CmsSectionDefinition<TContent = unknown> {
  readonly type: string;
  readonly page: CmsPageKey;
  readonly displayName: string;
  readonly description: string;
  readonly icon: string;
  readonly fields: readonly CmsFieldDefinition[];
  readonly defaultContent: TContent;
  readonly supportsVisibility: boolean;
  readonly supportsOrdering: boolean;
  readonly renderer: string;
  readonly mediaFields?: readonly string[];
  readonly validate: (content: unknown) => content is TContent;
  readonly validateDraft?: (content: unknown) => content is TContent;
}

function isImage(value: unknown, requireUploaded = true): value is CmsImage {
  if (!value || typeof value !== "object") return false;
  const image = value as Record<string, unknown>;
  const hasUploadedAsset =
    typeof image.publicId === "string" &&
    image.publicId.length > 0 &&
    typeof image.url === "string" &&
    image.url.length > 0 &&
    typeof image.width === "number" &&
    image.width > 0 &&
    typeof image.height === "number" &&
    image.height > 0;
  return (
    typeof image.publicId === "string" &&
    typeof image.url === "string" &&
    typeof image.width === "number" &&
    typeof image.height === "number" &&
    typeof image.alt === "string" &&
    (requireUploaded ? hasUploadedAsset && image.alt.trim().length > 0 : true)
  );
}

function isMediaAsset(value: unknown): value is CmsMediaAsset {
  if (!value || typeof value !== "object") return false;
  const asset = value as Record<string, unknown>;
  return (
    typeof asset.publicId === "string" &&
    asset.publicId.trim().length > 0 &&
    typeof asset.url === "string" &&
    asset.url.trim().length > 0 &&
    typeof asset.width === "number" &&
    asset.width > 0 &&
    typeof asset.height === "number" &&
    asset.height > 0
  );
}

function isServicesMediaAsset(value: unknown): value is CmsMediaAsset {
  if (!isMediaAsset(value)) return false;
  try {
    const url = new URL(value.url);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

const processImagePositions: readonly ProcessImagePosition[] = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

function isProcessStepDraft(value: unknown): value is ProcessStep {
  if (!value || typeof value !== "object") return false;
  const step = value as Record<string, unknown>;
  return (
    typeof step.id === "string" &&
    step.id.trim().length > 0 &&
    step.id.length <= 80 &&
    typeof step.order === "number" &&
    Number.isInteger(step.order) &&
    step.order >= 0 &&
    typeof step.enabled === "boolean" &&
    typeof step.eyebrow === "string" &&
    step.eyebrow.length <= 100 &&
    typeof step.title === "string" &&
    step.title.length <= 120 &&
    typeof step.summary === "string" &&
    step.summary.length <= 320 &&
    typeof step.description === "string" &&
    step.description.length <= 2400 &&
    (step.image === null || isServicesMediaAsset(step.image)) &&
    typeof step.imageAlt === "string" &&
    step.imageAlt.length <= 240 &&
    typeof step.imageDecorative === "boolean" &&
    typeof step.secondaryCaption === "string" &&
    step.secondaryCaption.length <= 180 &&
    typeof step.imagePosition === "string" &&
    processImagePositions.includes(step.imagePosition as ProcessImagePosition)
  );
}

export function isProcessStepsDraftContent(
  value: unknown,
): value is ProcessStepsContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  if (
    typeof content.enabled !== "boolean" ||
    typeof content.eyebrow !== "string" ||
    content.eyebrow.length > 100 ||
    typeof content.heading !== "string" ||
    content.heading.length > 160 ||
    typeof content.description !== "string" ||
    content.description.length > 360 ||
    typeof content.seoTitle !== "string" ||
    content.seoTitle.length > 180 ||
    typeof content.seoDescription !== "string" ||
    content.seoDescription.length > 320 ||
    typeof content.skipLinkLabel !== "string" ||
    content.skipLinkLabel.length > 100 ||
    !Array.isArray(content.steps) ||
    !content.steps.every(isProcessStepDraft)
  )
    return false;

  const steps = content.steps as ProcessStep[];
  return (
    new Set(steps.map((step) => step.id)).size === steps.length &&
    new Set(steps.map((step) => step.order)).size === steps.length
  );
}

export function isProcessStepsContent(
  value: unknown,
): value is ProcessStepsContent {
  if (!isProcessStepsDraftContent(value)) return false;
  const content = value as ProcessStepsContent;
  if (!content.heading.trim()) return false;
  return content.steps.every((step) => {
    if (!step.enabled) return true;
    return (
      Boolean(step.title.trim()) &&
      Boolean(step.summary.trim()) &&
      step.image !== null &&
      (step.imageDecorative || Boolean(step.imageAlt.trim()))
    );
  });
}

export function isContactPageDraftContent(
  value: unknown,
): value is ContactPageContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  const stringLimits: Record<string, number> = {
    eyebrow: 80,
    heading: 160,
    description: 480,
    formHeading: 120,
    formDescription: 240,
    nameLabel: 80,
    emailLabel: 80,
    phoneLabel: 80,
    projectTypeLabel: 100,
    messageLabel: 100,
    submitLabel: 80,
    successMessage: 180,
    unavailableMessage: 240,
    imageAlt: 240,
  };
  if (
    !Object.entries(stringLimits).every(
      ([field, limit]) =>
        typeof content[field] === "string" &&
        (content[field] as string).length <= limit,
    ) ||
    (content.image !== null && !isServicesMediaAsset(content.image)) ||
    !Array.isArray(content.projectTypes) ||
    content.projectTypes.length > 12 ||
    !content.projectTypes.every(
      (item) =>
        typeof item === "string" && item.trim().length > 0 && item.length <= 80,
    )
  ) {
    return false;
  }

  const projectTypes = content.projectTypes as string[];
  return new Set(projectTypes.map((item) => item.trim().toLowerCase())).size === projectTypes.length;
}

export function isContactPageContent(
  value: unknown,
): value is ContactPageContent {
  if (!isContactPageDraftContent(value)) return false;
  const content = value as ContactPageContent;
  return (
    Boolean(content.eyebrow.trim()) &&
    Boolean(content.heading.trim()) &&
    Boolean(content.description.trim()) &&
    Boolean(content.formHeading.trim()) &&
    Boolean(content.formDescription.trim()) &&
    Boolean(content.nameLabel.trim()) &&
    Boolean(content.emailLabel.trim()) &&
    Boolean(content.phoneLabel.trim()) &&
    Boolean(content.projectTypeLabel.trim()) &&
    Boolean(content.messageLabel.trim()) &&
    Boolean(content.submitLabel.trim()) &&
    Boolean(content.successMessage.trim()) &&
    Boolean(content.unavailableMessage.trim()) &&
    content.projectTypes.length > 0 &&
    (content.image === null || Boolean(content.imageAlt.trim()))
  );
}

export function isSiteLogoContent(value: unknown): value is SiteLogoContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return (
    isMediaAsset(content.image) &&
    typeof content.alt === "string" &&
    content.alt.trim().length > 0
  );
}

export function isSiteLogoDraftContent(
  value: unknown,
): value is SiteLogoContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return (
    (content.image === null || isMediaAsset(content.image)) &&
    typeof content.alt === "string"
  );
}

export interface CmsGlobalComponentDefinition<TContent = unknown> {
  readonly type: string;
  readonly displayName: string;
  readonly description: string;
  readonly defaultContent: TContent;
  readonly validate: (content: unknown) => content is TContent;
  readonly validateDraft: (content: unknown) => content is TContent;
}

export const globalComponentRegistry: readonly CmsGlobalComponentDefinition[] =
  [
    {
      type: GLOBAL_SITE_LOGO_TYPE,
      displayName: "Site Logo",
      description: "The published logo displayed in the public navigation.",
      defaultContent: siteLogoDefaultContent,
      validate: isSiteLogoContent,
      validateDraft: isSiteLogoDraftContent,
    },
    {
      type: GLOBAL_FOOTER_TYPE,
      displayName: "Footer",
      description: "Global storefront footer content and presentation.",
      defaultContent: footerDefaultContent,
      validate: isFooterContent,
      validateDraft: isFooterContent,
    },
  ];

export const getGlobalComponentDefinition = (type: string) =>
  globalComponentRegistry.find((component) => component.type === type);

function isHeroContent(
  value: unknown,
  requireUploadedImage: boolean,
): value is HomeHeroContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  const indicator = content.slideIndicator;
  const services = content.serviceLabels;
  const destinations = [
    "home",
    "about",
    "services",
    "portfolio",
    "process",
    "contact",
  ];
  return (
    typeof content.eyebrow === "string" &&
    content.eyebrow.trim().length > 0 &&
    typeof content.heading === "string" &&
    content.heading.trim().length > 0 &&
    typeof content.description === "string" &&
    content.description.trim().length > 0 &&
    typeof content.primaryCtaLabel === "string" &&
    content.primaryCtaLabel.trim().length > 0 &&
    destinations.includes(String(content.primaryCtaDestination)) &&
    typeof content.secondaryCtaLabel === "string" &&
    content.secondaryCtaLabel.trim().length > 0 &&
    destinations.includes(String(content.secondaryCtaDestination)) &&
    isImage(content.image, requireUploadedImage) &&
    (content.mobileImage === undefined ||
      isImage(content.mobileImage, requireUploadedImage)) &&
    Array.isArray(services) &&
    services.length === 3 &&
    services.every(
      (label) => typeof label === "string" && label.trim().length > 0,
    ) &&
    typeof content.floatingLabel === "string" &&
    content.floatingLabel.trim().length > 0 &&
    typeof indicator === "object" &&
    indicator !== null &&
    typeof (indicator as Record<string, unknown>).enabled === "boolean" &&
    typeof (indicator as Record<string, unknown>).current === "number" &&
    typeof (indicator as Record<string, unknown>).total === "number"
  );
}

const destinationKeys: readonly CmsDestinationKey[] = [
  "home",
  "about",
  "services",
  "portfolio",
  "process",
  "contact",
];

function isStatistic(
  value: unknown,
  requireComplete: boolean,
): value is HomeExperienceStatistic {
  if (!value || typeof value !== "object") return false;
  const statistic = value as Record<string, unknown>;
  return (
    typeof statistic.value === "number" &&
    Number.isFinite(statistic.value) &&
    statistic.value >= 0 &&
    statistic.value <= 1000000 &&
    Number.isInteger(statistic.value) &&
    typeof statistic.suffix === "string" &&
    statistic.suffix.length <= 4 &&
    typeof statistic.label === "string" &&
    statistic.label.trim().length > 0 &&
    statistic.label.length <= 80 &&
    (!requireComplete ||
      (typeof statistic.accessibleDescription === "string" &&
        statistic.accessibleDescription.length <= 160))
  );
}

function isServiceCard(
  value: unknown,
  requireUploadedImage: boolean,
): value is HomeExperienceServiceCard {
  if (!value || typeof value !== "object") return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.title === "string" &&
    card.title.trim().length > 0 &&
    card.title.length <= 80 &&
    typeof card.subtitle === "string" &&
    card.subtitle.trim().length > 0 &&
    card.subtitle.length <= 120 &&
    (card.image === null || isMediaAsset(card.image)) &&
    (!requireUploadedImage || isMediaAsset(card.image)) &&
    typeof card.imageAlt === "string" &&
    card.imageAlt.length <= 160 &&
    (!requireUploadedImage || card.imageAlt.trim().length > 0) &&
    destinationKeys.includes(card.destination as CmsDestinationKey)
  );
}

function isHomeExperienceContentValue(
  value: unknown,
  requireComplete: boolean,
): value is HomeExperienceContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  const statistics = content.statistics;
  const services = content.services;
  return (
    typeof content.eyebrow === "string" &&
    content.eyebrow.trim().length > 0 &&
    content.eyebrow.length <= 100 &&
    typeof content.heading === "string" &&
    content.heading.trim().length > 0 &&
    content.heading.length <= 160 &&
    typeof content.description === "string" &&
    content.description.trim().length > 0 &&
    content.description.length <= 300 &&
    (content.mainImage === null || isMediaAsset(content.mainImage)) &&
    (!requireComplete || isMediaAsset(content.mainImage)) &&
    typeof content.mainImageAlt === "string" &&
    content.mainImageAlt.length <= 160 &&
    (!requireComplete || content.mainImageAlt.trim().length > 0) &&
    Array.isArray(statistics) &&
    statistics.length === 4 &&
    statistics.every((statistic) => isStatistic(statistic, requireComplete)) &&
    Array.isArray(services) &&
    services.length === 3 &&
    services.every((service) => isServiceCard(service, requireComplete))
  );
}

function isSelectedProject(
  value: unknown,
  requireComplete: boolean,
): value is HomeSelectedProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Record<string, unknown>;
  return (
    typeof project.id === "string" &&
    project.id.trim().length > 0 &&
    project.id.length <= 100 &&
    typeof project.title === "string" &&
    project.title.length <= 100 &&
    (!requireComplete || project.title.trim().length > 0) &&
    typeof project.category === "string" &&
    project.category.length <= 80 &&
    (!requireComplete || project.category.trim().length > 0) &&
    (project.image === null || isMediaAsset(project.image)) &&
    (!requireComplete || isMediaAsset(project.image)) &&
    typeof project.imageAlt === "string" &&
    project.imageAlt.length <= 180 &&
    (!requireComplete || project.imageAlt.trim().length > 0) &&
    destinationKeys.includes(project.destination as CmsDestinationKey)
  );
}

function isHomeSelectedProjectsContentValue(
  value: unknown,
  requireComplete: boolean,
): value is HomeSelectedProjectsContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  const projects = content.projects;
  if (
    !Array.isArray(projects) ||
    projects.length > 8 ||
    (requireComplete && projects.length < 3)
  )
    return false;
  const ids = projects.map((project) =>
    project && typeof project === "object"
      ? (project as Record<string, unknown>).id
      : undefined,
  );
  return (
    typeof content.eyebrow === "string" &&
    content.eyebrow.length <= 80 &&
    (!requireComplete || content.eyebrow.trim().length > 0) &&
    typeof content.heading === "string" &&
    content.heading.length <= 120 &&
    (!requireComplete || content.heading.trim().length > 0) &&
    typeof content.supportingText === "string" &&
    content.supportingText.length <= 240 &&
    projects.every((project) => isSelectedProject(project, requireComplete)) &&
    ids.every(
      (id, index) => typeof id === "string" && ids.indexOf(id) === index,
    )
  );
}

const roomSceneElementTypes: readonly RoomSceneElementType[] = [
  "rug",
  "table-vase",
  "decorative-bowl",
  "decor",
  "accent-furniture",
];
const roomAnimationPresets: readonly RoomAnimationPreset[] = [
  "floor-reveal",
  "from-left",
  "from-right",
  "from-top",
  "from-bottom",
  "gentle-settle",
];

function isRoomSceneElement(
  value: unknown,
  requireComplete: boolean,
): value is RoomSceneElement {
  if (!value || typeof value !== "object") return false;
  const element = value as Record<string, unknown>;
  const imageValid = element.image === null || isMediaAsset(element.image);
  const enabled = element.enabled === true;
  return (
    typeof element.id === "string" &&
    /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(element.id) &&
    roomSceneElementTypes.includes(element.type as RoomSceneElementType) &&
    imageValid &&
    typeof element.alt === "string" &&
    element.alt.length <= 180 &&
    typeof element.enabled === "boolean" &&
    roomAnimationPresets.includes(
      element.animationPreset as RoomAnimationPreset,
    ) &&
    (!requireComplete ||
      !enabled ||
      (isMediaAsset(element.image) && element.alt.trim().length > 0))
  );
}

function isRoomSceneElements(
  value: unknown,
  requireComplete: boolean,
): value is readonly RoomSceneElement[] {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.length <= 8 &&
      value.every((element) => isRoomSceneElement(element, requireComplete)))
  );
}

export function isHomeHeroContent(value: unknown): value is HomeHeroContent {
  return isHeroContent(value, true);
}
export function isHomeHeroDraftContent(
  value: unknown,
): value is HomeHeroContent {
  return isHeroContent(value, false);
}
export function isHomeExperienceContent(
  value: unknown,
): value is HomeExperienceContent {
  return isHomeExperienceContentValue(value, true);
}
export function isHomeExperienceDraftContent(
  value: unknown,
): value is HomeExperienceContent {
  return isHomeExperienceContentValue(value, false);
}
export function isHomeSelectedProjectsContent(
  value: unknown,
): value is HomeSelectedProjectsContent {
  return isHomeSelectedProjectsContentValue(value, true);
}
export function isHomeSelectedProjectsDraftContent(
  value: unknown,
): value is HomeSelectedProjectsContent {
  return isHomeSelectedProjectsContentValue(value, false);
}

function isHomeRoomAssemblyContentValue(
  value: unknown,
  requireComplete: boolean,
): value is HomeRoomAssemblyContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  const assets = [
    ["backdropImage", "backdropAlt"],
    ["sofaImage", "sofaAlt"],
    ["pillowsImage", "pillowsAlt"],
    ["centerTableImage", "centerTableAlt"],
    ["vaseImage", "vaseAlt"],
  ] as const;
  const assetsValid = assets.every(
    ([assetKey, altKey]) =>
      (content[assetKey] === null || isMediaAsset(content[assetKey])) &&
      typeof content[altKey] === "string" &&
      content[altKey].length <= 180 &&
      (!requireComplete ||
        (isMediaAsset(content[assetKey]) && content[altKey].trim().length > 0)),
  );
  const chairPresent =
    content.accentChairImage !== undefined && content.accentChairImage !== null;
  const chairValid =
    (content.accentChairImage === undefined ||
      content.accentChairImage === null ||
      isMediaAsset(content.accentChairImage)) &&
    (content.accentChairAlt === undefined ||
      (typeof content.accentChairAlt === "string" &&
        content.accentChairAlt.length <= 180)) &&
    (!requireComplete ||
      !chairPresent ||
      (isMediaAsset(content.accentChairImage) &&
        typeof content.accentChairAlt === "string" &&
        content.accentChairAlt.trim().length > 0));
  const ctaValid =
    [content.primaryCtaLabel, content.secondaryCtaLabel].every(
      (label) =>
        label === undefined ||
        (typeof label === "string" &&
          label.length <= 100 &&
          label.trim().length > 0),
    ) &&
    (content.primaryCtaDestination === undefined ||
      destinationKeys.includes(
        content.primaryCtaDestination as CmsDestinationKey,
      )) &&
    (content.secondaryCtaDestination === undefined ||
      destinationKeys.includes(
        content.secondaryCtaDestination as CmsDestinationKey,
      ));
  return (
    typeof content.eyebrow === "string" &&
    content.eyebrow.trim().length > 0 &&
    content.eyebrow.length <= 100 &&
    typeof content.heading === "string" &&
    content.heading.trim().length > 0 &&
    content.heading.length <= 160 &&
    typeof content.description === "string" &&
    content.description.length <= 300 &&
    assetsValid &&
    chairValid &&
    isRoomSceneElements(content.additionalElements, requireComplete) &&
    ctaValid
  );
}

export function isHomeRoomAssemblyContent(
  value: unknown,
): value is HomeRoomAssemblyContent {
  return isHomeRoomAssemblyContentValue(value, true);
}
export function isHomeRoomAssemblyDraftContent(
  value: unknown,
): value is HomeRoomAssemblyContent {
  return isHomeRoomAssemblyContentValue(value, false);
}

function isCalcomUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    return (
      url.protocol === "https:" &&
      url.hostname === "cal.com" &&
      url.username === "" &&
      url.password === "" &&
      url.hash === "" &&
      pathSegments.length >= 2 &&
      pathSegments.every((part) => /^[a-z0-9][a-z0-9_-]*$/i.test(part))
    );
  } catch {
    return false;
  }
}

function isHomeDesignConsultationContentValue(
  value: unknown,
): value is HomeDesignConsultationContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return (
    ["eyebrow", "heading", "description"].every(
      (key) => typeof content[key] === "string",
    ) &&
    String(content.eyebrow).trim().length > 0 &&
    String(content.eyebrow).length <= 100 &&
    String(content.heading).trim().length > 0 &&
    String(content.heading).length <= 160 &&
    String(content.description).length <= 300 &&
    isCalcomUrl(content.calcomUrl) &&
    (content.consultationImage === null ||
      (isMediaAsset(content.consultationImage) &&
        typeof content.consultationImageAlt === "string" &&
        content.consultationImageAlt.trim().length > 0 &&
        content.consultationImageAlt.length <= 180)) &&
    typeof content.consultationImageAlt === "string" &&
    content.consultationImageAlt.length <= 180
  );
}

export function isHomeDesignConsultationContent(
  value: unknown,
): value is HomeDesignConsultationContent {
  return isHomeDesignConsultationContentValue(value);
}

/** Migrate the previously published Calendly-shaped content in memory. The
 * current editable contract remains Cal.com-only; this keeps existing CMS
 * revisions renderable until an administrator saves and republishes them. */
export function normalizeHomeDesignConsultationContent(
  value: unknown,
): HomeDesignConsultationContent | null {
  if (isHomeDesignConsultationContent(value)) return value;
  if (!value || typeof value !== "object") return null;
  const content = value as Record<string, unknown>;
  if (
    !["eyebrow", "heading", "description"].every(
      (key) => typeof content[key] === "string",
    )
  )
    return null;
  const configuredUrl = isCalcomUrl(content.calcomUrl)
    ? content.calcomUrl
    : isCalcomUrl(content.calendlyUrl)
      ? content.calendlyUrl
      : homeDesignConsultationDefaultContent.calcomUrl;
  const normalized = {
    eyebrow: String(content.eyebrow),
    heading: String(content.heading),
    description: String(content.description),
    calcomUrl: configuredUrl,
    consultationImage:
      content.consultationImage && isMediaAsset(content.consultationImage)
        ? content.consultationImage
        : null,
    consultationImageAlt:
      typeof content.consultationImageAlt === "string"
        ? content.consultationImageAlt
        : "",
  };
  return isHomeDesignConsultationContent(normalized) ? normalized : null;
}

/**
 * The authoritative registry. Add a section definition here when its schema,
 * renderer, and editor are ready; core CMS CRUD does not need to change.
 */
export const sectionRegistry: readonly CmsSectionDefinition[] = [
  ...ABOUT_SECTION_TYPES.map((type): CmsSectionDefinition => {
    const labels: Record<AboutSectionType, string> = {
      "about.hero": "About Hero",
      "about.designer": "Meet the Designer",
      "about.metrics": "Designer Achievements",
      "about.studio": "About FA Studio",
      "about.values": "Studio Values",
      "about.process": "Our Design Process",
      "about.press": "As Seen In / Press",
      "about.projects": "Featured Projects",
      "about.testimonials": "Testimonials",
      "about.closing": "Closing Editorial",
    };
    const descriptions: Record<AboutSectionType, string> = {
      "about.hero": "Editorial introduction to FA Studio.",
      "about.designer": "Approved designer profile and philosophy.",
      "about.metrics": "Optional verified studio achievements.",
      "about.studio": "The studio story and approach.",
      "about.values": "Principles that guide the studio’s work.",
      "about.process":
        "Proposed design journey; confirm scope before publishing.",
      "about.press": "Verified publications and article links.",
      "about.projects": "Selected work; add only completed, approved projects.",
      "about.testimonials": "Approved client testimonials.",
      "about.closing": "Editorial close and optional consultation link.",
    };
    const fields: CmsFieldDefinition[] = [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "media" },
      { name: "imageAlt", label: "Image alt text", type: "text" },
      { name: "designerName", label: "Designer name", type: "text" },
      { name: "role", label: "Role / title", type: "text" },
      { name: "biography", label: "Biography", type: "textarea" },
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "items", label: "Items", type: "json" },
      { name: "ctaLabel", label: "CTA label", type: "text" },
      { name: "ctaUrl", label: "CTA URL", type: "text" },
    ];
    return {
      type,
      page: "about",
      displayName: labels[type],
      description: descriptions[type],
      icon: "panels-top-left",
      fields,
      defaultContent: aboutSectionDefaults[type],
      supportsVisibility: true,
      supportsOrdering: true,
      renderer: type,
      mediaFields: ["image", "items[].image"],
      validate: isAboutSectionContent,
      validateDraft: isAboutSectionContent,
    };
  }),
  {
    type: SERVICES_HERO_TYPE,
    page: "services",
    displayName: "Services Hero",
    description:
      "The published editorial introduction and lead image for the Services page.",
    icon: "panels-top-left",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      { name: "image", label: "Hero image", type: "media", required: true },
      {
        name: "imageAlt",
        label: "Image alt text",
        type: "text",
        required: true,
      },
    ],
    defaultContent: servicesHeroDefaultContent,
    supportsVisibility: true,
    supportsOrdering: false,
    renderer: SERVICES_HERO_TYPE,
    mediaFields: ["image"],
    validate: isServicesHeroContent,
    validateDraft: isServicesHeroDraftContent,
  },
  {
    type: SERVICES_CATALOGUE_TYPE,
    page: "services",
    displayName: "Service Catalogue",
    description:
      "An unlimited, ordered catalogue of individually editable and visible services.",
    icon: "layers",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "items", label: "Services", type: "json", required: true },
    ],
    defaultContent: servicesCatalogueDefaultContent,
    supportsVisibility: true,
    supportsOrdering: false,
    renderer: SERVICES_CATALOGUE_TYPE,
    mediaFields: ["items[].image"],
    validate: isServicesCatalogueContent,
    validateDraft: isServicesCatalogueDraftContent,
  },
  {
    type: PROCESS_STEPS_TYPE,
    page: "process",
    displayName: "Process story",
    description:
      "Edit the page introduction, accessibility and search metadata, and the ordered process steps.",
    icon: "workflow",
    fields: [
      { name: "enabled", label: "Enable immersive story", type: "boolean" },
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Page heading", type: "text", required: true },
      { name: "description", label: "Introduction", type: "textarea" },
      { name: "seoTitle", label: "Search title", type: "text" },
      { name: "seoDescription", label: "Search description", type: "textarea" },
      { name: "skipLinkLabel", label: "Skip-story link label", type: "text" },
      { name: "steps", label: "Ordered steps", type: "json", required: true },
    ],
    defaultContent: processStepsDefaultContent,
    supportsVisibility: true,
    supportsOrdering: false,
    renderer: PROCESS_STEPS_TYPE,
    mediaFields: ["steps[].image"],
    validate: isProcessStepsContent,
    validateDraft: isProcessStepsDraftContent,
  },
  {
    type: CONTACT_PAGE_TYPE,
    page: "contact",
    displayName: "Contact page",
    description:
      "Manage contact-page copy, form labels, service choices, and its optional interior image. Public email and phone are managed in Footer Management.",
    icon: "mail",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Page heading", type: "text", required: true },
      { name: "description", label: "Introduction", type: "textarea", required: true },
      { name: "formHeading", label: "Form heading", type: "text", required: true },
      { name: "formDescription", label: "Form introduction", type: "textarea", required: true },
      { name: "nameLabel", label: "Name field label", type: "text", required: true },
      { name: "emailLabel", label: "Email field label", type: "text", required: true },
      { name: "phoneLabel", label: "Phone field label", type: "text", required: true },
      { name: "projectTypeLabel", label: "Service field label", type: "text", required: true },
      { name: "messageLabel", label: "Message field label", type: "text", required: true },
      { name: "submitLabel", label: "Send button label", type: "text", required: true },
      { name: "successMessage", label: "Success message", type: "text", required: true },
      { name: "unavailableMessage", label: "Unavailable message", type: "textarea", required: true },
      { name: "projectTypes", label: "Service choices", type: "json", required: true },
      { name: "image", label: "Contact image", type: "media" },
      { name: "imageAlt", label: "Image alt text", type: "text" },
    ],
    defaultContent: contactPageDefaultContent,
    supportsVisibility: true,
    supportsOrdering: false,
    renderer: CONTACT_PAGE_TYPE,
    mediaFields: ["image"],
    validate: isContactPageContent,
    validateDraft: isContactPageDraftContent,
  },
  {
    type: PORTFOLIO_HERO_TYPE,
    page: "portfolio",
    displayName: "Portfolio Hero",
    description: "The editorial introduction to the project portfolio.",
    icon: "images",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      { name: "image", label: "Hero still image", type: "media" },
      { name: "video", label: "Hero background video (MP4)", type: "media" },
    ],
    defaultContent: portfolioHeroDefaultContent,
    supportsVisibility: true,
    supportsOrdering: false,
    renderer: PORTFOLIO_HERO_TYPE,
    mediaFields: ["image", "video"],
    validate: isPortfolioHeroContent,
    validateDraft: isPortfolioHeroDraftContent,
  },
  {
    type: PORTFOLIO_CATALOGUE_TYPE,
    page: "portfolio",
    displayName: "Portfolio Catalogue",
    description: "Portfolio introduction and published-project empty state.",
    icon: "layers",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "emptyStateHeading",
        label: "Empty-state heading",
        type: "text",
        required: true,
      },
      {
        name: "emptyStateDescription",
        label: "Empty-state description",
        type: "textarea",
        required: true,
      },
    ],
    defaultContent: portfolioCatalogueDefaultContent,
    supportsVisibility: true,
    supportsOrdering: false,
    renderer: PORTFOLIO_CATALOGUE_TYPE,
    validate: isPortfolioCatalogueContent,
    validateDraft: isPortfolioCatalogueDraftContent,
  },
  {
    type: PORTFOLIO_PROJECT_TYPE,
    page: "portfolio",
    displayName: "Portfolio Project",
    description: "An independently draftable and publishable studio project.",
    icon: "images",
    fields: [
      { name: "slug", label: "URL slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      {
        name: "shortDescription",
        label: "Short description",
        type: "textarea",
        required: true,
      },
      { name: "overview", label: "Overview", type: "textarea" },
      { name: "location", label: "Location", type: "text" },
      { name: "completionYear", label: "Completion year", type: "number" },
      {
        name: "coverImage",
        label: "Cover image",
        type: "media",
        required: true,
      },
      { name: "gallery", label: "Gallery", type: "json", required: true },
      { name: "story", label: "Project story", type: "textarea" },
      { name: "contentSections", label: "Content sections", type: "json" },
    ],
    defaultContent: portfolioProjectDefaultContent,
    supportsVisibility: true,
    supportsOrdering: true,
    renderer: PORTFOLIO_PROJECT_TYPE,
    mediaFields: ["coverImage", "gallery[]", "contentSections[].image"],
    validate: isPortfolioProjectContent,
    validateDraft: isPortfolioProjectDraftContent,
  },
  {
    type: HOME_HERO_TYPE,
    page: "home",
    displayName: "Hero Section",
    description: "The primary editorial introduction for the home page.",
    icon: "sparkles",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      {
        name: "primaryCtaLabel",
        label: "Primary CTA label",
        type: "text",
        required: true,
      },
      {
        name: "secondaryCtaLabel",
        label: "Secondary CTA label",
        type: "text",
        required: true,
      },
      { name: "image", label: "Desktop image", type: "media", required: true },
      { name: "mobileImage", label: "Mobile image", type: "media" },
      {
        name: "serviceLabels",
        label: "Service categories",
        type: "json",
        required: true,
      },
      {
        name: "floatingLabel",
        label: "Floating image label",
        type: "text",
        required: true,
      },
      { name: "slideIndicator", label: "Slide indicator", type: "json" },
    ],
    defaultContent: homeHeroDefaultContent,
    supportsVisibility: true,
    supportsOrdering: true,
    renderer: HOME_HERO_TYPE,
    mediaFields: ["image", "mobileImage"],
    validate: isHomeHeroContent,
    validateDraft: isHomeHeroDraftContent,
  },
  {
    type: HOME_EXPERIENCE_TYPE,
    page: "home",
    displayName: "Built on Experience",
    description: "The Home foundation story, statistics, and services gallery.",
    icon: "layers",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      { name: "mainImage", label: "Main image", type: "media", required: true },
      { name: "statistics", label: "Statistics", type: "json", required: true },
      {
        name: "services",
        label: "Services gallery",
        type: "json",
        required: true,
      },
    ],
    defaultContent: homeExperienceDefaultContent,
    supportsVisibility: true,
    supportsOrdering: true,
    renderer: HOME_EXPERIENCE_TYPE,
    mediaFields: ["mainImage", "services[].image"],
    validate: isHomeExperienceContent,
    validateDraft: isHomeExperienceDraftContent,
  },
  {
    type: HOME_SELECTED_PROJECTS_TYPE,
    page: "home",
    displayName: "Selected Projects",
    description: "A center-focused carousel of featured studio projects.",
    icon: "images",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "supportingText", label: "Supporting text", type: "textarea" },
      {
        name: "projects",
        label: "Featured projects",
        type: "json",
        required: true,
      },
    ],
    defaultContent: homeSelectedProjectsDefaultContent,
    supportsVisibility: true,
    supportsOrdering: true,
    renderer: HOME_SELECTED_PROJECTS_TYPE,
    mediaFields: ["projects[].image"],
    validate: isHomeSelectedProjectsContent,
    validateDraft: isHomeSelectedProjectsDraftContent,
  },
  {
    type: HOME_ROOM_ASSEMBLY_TYPE,
    page: "home",
    displayName: "Room Assembly",
    description:
      "A scroll-controlled composition that assembles a furnished room.",
    icon: "panels-top-left",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "backdropImage",
        label: "Empty-room backdrop",
        type: "media",
        required: true,
      },
      { name: "sofaImage", label: "Sofa layer", type: "media", required: true },
      {
        name: "pillowsImage",
        label: "Pillows layer",
        type: "media",
        required: true,
      },
      {
        name: "centerTableImage",
        label: "Center table layer",
        type: "media",
        required: true,
      },
      {
        name: "vaseImage",
        label: "Vase / planter layer",
        type: "media",
        required: true,
      },
      {
        name: "accentChairImage",
        label: "Optional accent chair layer",
        type: "media",
      },
      {
        name: "additionalElements",
        label: "Additional scene elements",
        type: "json",
      },
      { name: "primaryCtaLabel", label: "Primary CTA label", type: "text" },
      {
        name: "primaryCtaDestination",
        label: "Primary CTA destination",
        type: "text",
      },
      { name: "secondaryCtaLabel", label: "Secondary CTA label", type: "text" },
      {
        name: "secondaryCtaDestination",
        label: "Secondary CTA destination",
        type: "text",
      },
    ],
    defaultContent: homeRoomAssemblyDefaultContent,
    supportsVisibility: true,
    supportsOrdering: true,
    renderer: HOME_ROOM_ASSEMBLY_TYPE,
    mediaFields: [
      "backdropImage",
      "sofaImage",
      "pillowsImage",
      "centerTableImage",
      "vaseImage",
      "accentChairImage",
      "additionalElements[].image",
    ],
    validate: isHomeRoomAssemblyContent,
    validateDraft: isHomeRoomAssemblyDraftContent,
  },
  {
    type: HOME_DESIGN_CONSULTATION_TYPE,
    page: "home",
    displayName: "Design Consultation",
    description: "Editorial introduction and Cal.com scheduling experience.",
    icon: "calendar-days",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      {
        name: "calcomUrl",
        label: "Public Cal.com event URL",
        type: "text",
        required: true,
      },
      { name: "consultationImage", label: "Consultation image", type: "media" },
      {
        name: "consultationImageAlt",
        label: "Consultation image alt text",
        type: "text",
      },
    ],
    defaultContent: homeDesignConsultationDefaultContent,
    supportsVisibility: true,
    supportsOrdering: true,
    renderer: HOME_DESIGN_CONSULTATION_TYPE,
    mediaFields: ["consultationImage"],
    validate: isHomeDesignConsultationContent,
    validateDraft: isHomeDesignConsultationContent,
  },
];

export const getSectionDefinition = (type: string) =>
  sectionRegistry.find((section) => section.type === type);

export interface CmsPublishedSection {
  readonly id: string;
  readonly type: string;
  readonly content: unknown;
  readonly order: number;
  readonly renderer: string;
}

export interface CmsPublishedSectionState {
  readonly id: string;
  readonly type: string;
  readonly isVisible: boolean;
}

export interface CmsPublishedPage {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly sections: readonly CmsPublishedSection[];
  /** Metadata for published snapshots only; hidden sections never expose content. */
  readonly sectionStates: readonly CmsPublishedSectionState[];
}
