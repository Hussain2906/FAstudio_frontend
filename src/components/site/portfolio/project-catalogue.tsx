"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PortfolioEntry } from "./data";
import { PortfolioProjectCard } from "./project-card";

const ALL_PROJECTS = "All projects";

function ContactPrompt() {
  return (
    <aside
      aria-labelledby="portfolio-contact-heading"
      className="flex min-w-0 flex-col gap-5 rounded-xl bg-muted p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div>
        <p className="type-caption text-muted-foreground">FA Studio / Portfolio</p>
        <h3
          className="mt-2 font-display text-2xl leading-tight tracking-[-0.03em] sm:text-3xl"
          id="portfolio-contact-heading"
        >
          Have a project in mind?
        </h3>
      </div>
      <Link
        className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
        href="/contact"
      >
        Contact the studio <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

export function ProjectCatalogue({
  projects,
  emptyHeading,
  emptyDescription,
  eyebrow,
  heading,
  description,
  isPageHeading,
}: {
  projects: readonly PortfolioEntry[];
  emptyHeading: string;
  emptyDescription: string;
  eyebrow: string;
  heading: string;
  description: string;
  isPageHeading: boolean;
}) {
  const categories = useMemo(
    () => [...new Set(projects.map((project) => project.category.trim()).filter(Boolean))],
    [projects],
  );
  const [category, setCategory] = useState<string | null>(null);
  const visible = category
    ? projects.filter((project) => project.category.trim() === category)
    : projects;
  const Heading = isPageHeading ? "h1" : "h2";
  const EmptyHeading = isPageHeading ? "h2" : "h3";
  const emptyHeadingClass = isPageHeading
    ? "font-display text-3xl leading-tight tracking-[-0.03em] sm:text-4xl"
    : "font-display text-xl leading-tight tracking-[-0.03em] sm:text-2xl";
  const emptyState = (
    <div className="pt-3">
      <EmptyHeading className={emptyHeadingClass}>{emptyHeading}</EmptyHeading>
      <p className="mt-4 max-w-prose text-base leading-7 text-muted-foreground">
        {emptyDescription}
      </p>
    </div>
  );
  const catalogueHeading = (
    <header className="grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-12">
      <div>
        {eyebrow ? <p className="type-caption text-muted-foreground">{eyebrow}</p> : null}
        <Heading
          className={`${isPageHeading ? "type-page-heading" : "font-display text-3xl leading-tight tracking-[-0.03em] sm:text-4xl"} mt-3`}
          id="portfolio-catalogue-heading"
        >
          {heading || "Interior projects"}
        </Heading>
      </div>
      {description ? (
        <p className="max-w-prose text-base leading-7 text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );

  const contactGridSpan = visible.length % 3 === 1 ? "xl:col-span-2" : "xl:col-span-3";

  return (
    <section
      aria-labelledby="portfolio-catalogue-heading"
      className="bg-background text-foreground"
      id="portfolio-catalogue"
    >
      <div className="storefront-shell flex flex-col gap-6 py-8 sm:gap-8 sm:py-10 lg:gap-10 lg:py-14">
        {catalogueHeading}
        {projects.length ? (
          <>
            <div
              aria-label="Filter projects by category"
              className="flex flex-wrap gap-2"
              role="group"
            >
              {[ALL_PROJECTS, ...categories].map((item) => {
                const selected = item === ALL_PROJECTS ? category === null : category === item;
                return (
                  <button
                    aria-controls="portfolio-project-results"
                    aria-pressed={selected}
                    className={`min-h-11 rounded-full border px-4 text-sm transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}
                    key={item}
                    onClick={() => setCategory(item === ALL_PROJECTS ? null : item)}
                    type="button"
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <p aria-atomic="true" aria-live="polite" className="sr-only">
              Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
              {category ? ` in ${category}` : ""}.
            </p>
            {visible.length ? (
              <div
                className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8"
                id="portfolio-project-results"
              >
                {visible.map((project) => (
                  <PortfolioProjectCard
                    headingLevel={isPageHeading ? "h2" : "h3"}
                    key={project.slug}
                    layout="tile"
                    project={project}
                    standalone={false}
                  />
                ))}
                <div className={`sm:col-span-2 ${contactGridSpan}`}>
                  <ContactPrompt />
                </div>
              </div>
            ) : (
              <div id="portfolio-project-results">
                {emptyState}
                <div className="mt-8">
                  <ContactPrompt />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {emptyState}
            <ContactPrompt />
          </>
        )}
      </div>
    </section>
  );
}
