import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectGallery } from "../../../components/site/portfolio/project-gallery";
import { getPortfolioEntries } from "../../../components/site/portfolio/data";

type Props = { params: Promise<{ slug: string }> };

async function findProject(slug: string) {
  const projects = await getPortfolioEntries();
  const index = projects.findIndex((project) => project.slug === slug);
  return index < 0 ? null : { project: projects[index], projects, index };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await findProject(slug);
  if (!result) return { title: "Project not found | FA Studio" };
  return {
    title: `${result.project.title} | FA Studio`,
    description: result.project.shortDescription || result.project.overview,
  };
}

export default async function PortfolioProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await findProject(slug);
  if (!result) notFound();
  const { project, projects, index } = result;
  const seenImageIds = new Set([project.coverImage.publicId]);
  const contentSections = (project.contentSections ?? [])
    .map((section) => {
      if (!section.image) return section;
      if (seenImageIds.has(section.image.publicId)) return { ...section, image: null };
      seenImageIds.add(section.image.publicId);
      return section;
    })
    .filter((section) => section.heading.trim() || section.body.trim() || section.image);
  const gallery = project.gallery.filter((image) => {
    if (seenImageIds.has(image.publicId)) return false;
    seenImageIds.add(image.publicId);
    return true;
  });
  const previous = projects[index - 1];
  const next = projects[index + 1];
  return (
    <main aria-labelledby="project-heading" className="storefront-shell storefront-section">
      <Link
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
        href="/portfolio"
      >
        ← Back to portfolio
      </Link>
      <header className="grid gap-8 pb-10 pt-10 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:gap-16">
        <div>
          <p className="type-caption text-muted-foreground">
            {project.category}
            {project.location ? ` · ${project.location}` : ""}
            {project.completionYear ? ` · ${project.completionYear}` : ""}
          </p>
          <h1 className="type-page-heading mt-4" id="project-heading">
            {project.title}
          </h1>
          {project.shortDescription ? (
            <p className="type-subheading mt-5 max-w-2xl text-muted-foreground">
              {project.shortDescription}
            </p>
          ) : null}
        </div>
        {project.overview ? (
          <p className="max-w-prose text-base leading-7 text-muted-foreground">
            {project.overview}
          </p>
        ) : null}
      </header>
      <div
        className="relative overflow-hidden rounded-xl bg-muted"
        style={{ aspectRatio: `${project.coverImage.width} / ${project.coverImage.height}` }}
      >
        <Image
          alt={project.coverImage.alt}
          className="object-cover"
          fill
          preload
          sizes="(min-width: 1440px) 90rem, 92vw"
          src={project.coverImage.url}
        />
      </div>
      {project.story ? (
        <section className="grid gap-5 border-b border-border py-12 md:grid-cols-[0.55fr_1fr] md:gap-12">
          <h2 className="type-section-display">The story</h2>
          <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-muted-foreground">
            {project.story}
          </p>
        </section>
      ) : null}
      {contentSections.map((section) => (
          <section
            className={`grid gap-6 border-b border-border py-12 md:gap-12 ${section.image ? "md:grid-cols-[0.55fr_1fr]" : ""}`}
            key={section.id}
          >
            <div className="space-y-5">
              {section.heading ? <h2 className="type-section-display">{section.heading}</h2> : null}
              {section.body ? (
                <p className="max-w-prose whitespace-pre-line text-base leading-8 text-muted-foreground">
                  {section.body}
                </p>
              ) : null}
            </div>
            {section.image ? (
              <div
                className="relative overflow-hidden rounded-xl bg-muted"
                style={{ aspectRatio: `${section.image.width} / ${section.image.height}` }}
              >
                <Image
                  alt={section.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 768px) 58vw, 92vw"
                  src={section.image.url}
                />
              </div>
            ) : null}
          </section>
        ))}
      <ProjectGallery images={gallery} title={project.title} />
      <nav
        aria-label="Other portfolio projects"
        className="mt-16 flex flex-wrap justify-between gap-6 border-t border-border pt-8"
      >
        {previous ? (
          <Link
            className="min-h-11 max-w-[45%] text-sm hover:underline focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
            href={`/portfolio/${encodeURIComponent(previous.slug)}`}
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            className="min-h-11 max-w-[45%] text-right text-sm hover:underline focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
            href={`/portfolio/${encodeURIComponent(next.slug)}`}
          >
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
