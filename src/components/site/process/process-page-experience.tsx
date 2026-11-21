"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import type { CmsMediaAsset, ProcessStep, ProcessStepsContent } from "@fs/cms-contracts";
import { ProcessScrollScene } from "./process-scroll-scene";
import styles from "./process-story.module.css";

const CINEMATIC_MEDIA_QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

function subscribeToCinematicPreference(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia(CINEMATIC_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getCinematicPreference() {
  return typeof window !== "undefined" && window.matchMedia(CINEMATIC_MEDIA_QUERY).matches;
}

function getServerCinematicPreference() {
  return null;
}

function focalPosition(position: ProcessStep["imagePosition"]): string {
  const positions: Record<ProcessStep["imagePosition"], string> = {
    center: "50% 50%",
    top: "50% 0%",
    bottom: "50% 100%",
    left: "0% 50%",
    right: "100% 50%",
    "top-left": "0% 0%",
    "top-right": "100% 0%",
    "bottom-left": "0% 100%",
    "bottom-right": "100% 100%",
  };
  return positions[position];
}

function ProcessReadingFlow({
  content,
  steps,
  headingRef,
  className,
  includeContactLink,
  eagerFirstImage,
  showStepImages,
}: {
  content: ProcessStepsContent;
  steps: readonly ProcessStep[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  className?: string;
  includeContactLink: boolean;
  eagerFirstImage: boolean;
  showStepImages: boolean;
}) {
  return (
    <section
      aria-labelledby="process-page-heading"
      className={`${styles.readingFlow} ${className ?? ""}`}
      id="process-reading-list"
    >
      <header className={styles.readingHeader}>
        {content.eyebrow.trim() ? <p className="type-caption">{content.eyebrow}</p> : null}
        <h1 className="type-page-heading" id="process-page-heading" ref={headingRef} tabIndex={-1}>
          {content.heading}
        </h1>
        {content.description.trim() ? <p className={styles.intro}>{content.description}</p> : null}
        {steps.length === 0 && includeContactLink ? (
          <Link className={styles.contactLink} href="/contact">
            Discuss your project
          </Link>
        ) : null}
      </header>
      {steps.length > 0 ? (
        <ol className={styles.readingList}>
          {steps.map((step, index) => (
            <li className={styles.readingItem} key={step.id}>
              {step.image ? (
                showStepImages ? (
                  <div className={styles.readingImage}>
                    <Image
                      alt={step.imageDecorative ? "" : step.imageAlt}
                      className={styles.readingImageElement}
                      width={step.image.width}
                      height={step.image.height}
                      loading={eagerFirstImage && index === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 64rem) 100vw, 52vw"
                      src={step.image.url}
                      style={{ objectPosition: focalPosition(step.imagePosition) }}
                    />
                  </div>
                ) : step.imageDecorative ? null : (
                  <span role="img" aria-label={step.imageAlt} />
                )
              ) : null}
              <div className={styles.readingCopy}>
                <p className="type-caption">
                  {step.eyebrow.trim() || `STEP ${String(index + 1).padStart(2, "0")}`}
                </p>
                <h2 className={styles.readingTitle}>{step.title}</h2>
                <p className={styles.readingSummary}>{step.summary}</p>
                {step.description.trim() ? (
                  <p className={styles.readingDescription}>{step.description}</p>
                ) : null}
                {step.secondaryCaption.trim() ? (
                  <p className={styles.secondaryCaption}>{step.secondaryCaption}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function ProcessEmptyState({
  content,
  image,
}: {
  content: ProcessStepsContent;
  image?: CmsMediaAsset | null;
}) {
  return (
    <section aria-labelledby="process-page-heading" className={styles.emptyHero}>
      {image ? (
        <Image
          alt=""
          className={styles.emptyHeroImage}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          src={image.url}
        />
      ) : null}
      <div className={styles.emptyHeroCopy}>
        {content.eyebrow.trim() ? <p className="type-caption">{content.eyebrow}</p> : null}
        <h1 className="type-page-heading" id="process-page-heading">
          {content.heading}
        </h1>
        {content.description.trim() ? <p className={styles.intro}>{content.description}</p> : null}
        <Link className={styles.contactLink} href="/contact">
          Discuss your project
        </Link>
      </div>
    </section>
  );
}

export function ProcessPageExperience({
  content,
  emptyStateImage,
}: {
  content: ProcessStepsContent;
  emptyStateImage?: CmsMediaAsset | null;
}) {
  const steps = content.enabled
    ? [...content.steps].filter((step) => step.enabled).sort((a, b) => a.order - b.order)
    : [];
  const isImmersive = content.enabled && steps.length >= 2;
  const cinematicPreference = useSyncExternalStore(
    subscribeToCinematicPreference,
    getCinematicPreference,
    getServerCinematicPreference,
  );
  const [readingMode, setReadingMode] = useState(false);
  const showCinematic = isImmersive && cinematicPreference === true && !readingMode;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (readingMode) headingRef.current?.focus({ preventScroll: false });
  }, [readingMode]);

  if (steps.length === 0) {
    return (
      <div className={styles.pageRoot}>
        <ProcessEmptyState content={content} image={emptyStateImage} />
      </div>
    );
  }

  return (
    <div className={styles.pageRoot}>
      {showCinematic ? (
        <ProcessScrollScene
          content={content}
          steps={steps}
          onReadText={() => setReadingMode(true)}
        />
      ) : null}
      <ProcessReadingFlow
        className={showCinematic ? styles.screenReaderOnly : undefined}
        content={content}
        headingRef={headingRef}
        includeContactLink={!showCinematic}
        eagerFirstImage={!isImmersive || readingMode || cinematicPreference === false}
        showStepImages={!isImmersive || readingMode || cinematicPreference === false}
        steps={steps}
      />
    </div>
  );
}
