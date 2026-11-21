import type {
  ServiceCatalogueItem,
  ServicesCatalogueContent,
  ServicesHeroContent,
} from "@fs/cms-contracts";
import Image from "next/image";
import { ServiceCard } from "./service-card";
import motionStyles from "./services-hero-motion.module.css";

export function ServicesHeroSection({ content }: { content: ServicesHeroContent }) {
  return (
    <section
      aria-labelledby="services-hero-heading"
      className="grid min-h-[calc(100svh-5.5rem)] min-w-0 grid-rows-[auto_minmax(22rem,1fr)] bg-background text-foreground lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:grid-rows-1"
      data-enter="services-hero"
    >
      <div className="flex min-w-0 flex-col justify-center px-[var(--page-gutter)] py-12 sm:py-16 lg:px-[clamp(2rem,5vw,5rem)] lg:py-16">
        <div className={motionStyles.heroCopy}>
          <p className="type-caption flex items-center gap-3 text-muted-foreground">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-primary" />
            {content.eyebrow}
          </p>
          <h1 className="type-hero mt-7 max-w-[10ch]" id="services-hero-heading">
            {content.heading}
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {content.description}
          </p>
        </div>
      </div>
      <div className="relative min-h-[22rem] overflow-hidden bg-muted sm:min-h-[28rem] lg:min-h-[calc(100svh-5.5rem)]">
        {content.image?.url ? (
          <Image
            alt={content.imageAlt}
            className={`${motionStyles.heroImage} object-cover`}
            fill
            preload
            sizes="(min-width: 1024px) 56vw, 100vw"
            src={content.image.url}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-secondary/25"
          >
            <span className="font-display text-5xl tracking-[-0.04em] text-primary/75 sm:text-7xl">
              FA Studio
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export function ServicesCatalogueSection({
  content,
  isPageHeading = false,
}: {
  content: ServicesCatalogueContent;
  isPageHeading?: boolean;
}) {
  const visibleItems = content.items
    .filter((item) => item.enabled)
    .slice()
    .sort((a, b) => a.order - b.order);

  if (!visibleItems.length) return null;
  const Heading = isPageHeading ? "h1" : "h2";

  return (
    <section
      aria-labelledby="services-catalogue-heading"
      className="storefront-section bg-background text-foreground"
    >
      <div className="storefront-shell">
        <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-12">
          <div className="space-y-5">
            {content.eyebrow.trim() ? (
              <p className="type-caption text-muted-foreground">{content.eyebrow}</p>
            ) : null}
            <Heading className="type-section-display max-w-[12ch]" id="services-catalogue-heading">
              {content.heading}
            </Heading>
          </div>
          {content.description.trim() ? (
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {content.description}
            </p>
          ) : null}
        </header>
        <div className="mt-10 grid gap-x-10 gap-y-14 sm:gap-y-16 lg:grid-cols-2 xl:gap-x-14">
          {visibleItems.map((item: ServiceCatalogueItem, index) => (
            <ServiceCard item={item} key={item.id} position={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
