import Image from "next/image";
import Link from "next/link";
import type { PortfolioEntry } from "./data";
import styles from "./portfolio.module.css";

type PortfolioHeadingLevel = "h2" | "h3";
type PortfolioCardLayout = "feature" | "tile";

function projectCoverAlt(project: PortfolioEntry) {
  const alt = project.coverImage.alt.trim();
  return alt.split(/\s+/).length < 3
    ? `Photograph of the ${project.title.toLowerCase()} interior by FA Studio.`
    : alt;
}

export function PortfolioProjectCard({
  project,
  headingLevel = "h2",
  standalone = true,
  layout = "feature",
}: {
  project: PortfolioEntry;
  headingLevel?: PortfolioHeadingLevel;
  standalone?: boolean;
  layout?: PortfolioCardLayout;
}) {
  const Heading = headingLevel;
  const headingId = `portfolio-project-${project.slug}-heading`;
  const isTile = layout === "tile";
  const headingClass =
    headingLevel === "h2"
      ? "font-display text-3xl leading-tight tracking-[-0.03em] sm:text-4xl"
      : "font-display text-xl leading-tight tracking-[-0.03em] sm:text-2xl";
  const card = (
    <article className="group w-full min-w-0">
      <Link
        aria-label={`View project: ${project.title}`}
        className={`${styles.projectCardLink} grid grid-cols-1 gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 active:scale-[0.995] motion-reduce:active:scale-100 ${isTile ? "" : "md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-8 lg:gap-12"}`}
        href={`/portfolio/${encodeURIComponent(project.slug)}`}
      >
        <div
          className={`${isTile ? "order-1" : "order-1 md:order-2"} relative min-w-0 overflow-hidden rounded-xl bg-muted`}
          style={{ aspectRatio: "4 / 3" }}
        >
          <Image
            alt={projectCoverAlt(project)}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:group-hover:scale-100 motion-reduce:transition-none"
            fill
            sizes={
              isTile
                ? "(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw"
                : "(min-width: 1280px) 54vw, (min-width: 768px) 56vw, 92vw"
            }
            src={project.coverImage.url}
          />
        </div>
        <div className={`${isTile ? "order-2" : "order-2 md:order-1"} min-w-0`}>
          <p className="type-caption text-muted-foreground">
            {project.category}
            {project.location ? ` · ${project.location}` : ""}
            {project.completionYear ? ` · ${project.completionYear}` : ""}
          </p>
          <Heading className={`mt-3 ${headingClass}`} id={headingId}>
            {project.title}
          </Heading>
          {project.shortDescription && !isTile ? (
            <p className="mt-4 max-w-prose text-sm leading-6 text-muted-foreground">
              {project.shortDescription}
            </p>
          ) : null}
          <span
            aria-hidden="true"
            className="mt-5 inline-block text-sm underline decoration-border underline-offset-4 transition-[text-underline-offset] group-hover:underline-offset-8"
          >
            View project →
          </span>
        </div>
      </Link>
    </article>
  );

  if (!standalone) return card;
  return (
    <section aria-labelledby={headingId} className="bg-background text-foreground">
      <div className="storefront-shell py-8 sm:py-10 lg:py-12">{card}</div>
    </section>
  );
}
