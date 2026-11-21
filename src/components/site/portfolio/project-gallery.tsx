"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CmsImage } from "@fs/cms-contracts";
import styles from "./portfolio.module.css";

export function ProjectGallery({ images, title }: { images: readonly CmsImage[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const close = useCallback(() => {
    setActive(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);
  const move = useCallback(
    (direction: number) => {
      setActive((current) =>
        current === null ? null : (current + direction + images.length) % images.length,
      );
    },
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, close, move]);

  if (images.length === 0) return null;
  return (
    <section aria-label={`${title} project photographs`} className="mt-14 sm:mt-20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {images.map((image, index) => (
          <button
            aria-label={`View photograph ${index + 1} of ${images.length}: ${image.alt}`}
            className={`${styles.galleryThumb} group relative overflow-hidden rounded-xl bg-muted transition-transform duration-200 active:scale-[0.995] motion-reduce:active:scale-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 ${index === 0 ? "sm:col-span-2" : ""}`}
            key={`${image.publicId}-${index}`}
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
            onClick={(event) => {
              returnFocusRef.current = event.currentTarget;
              setActive(index);
            }}
            type="button"
          >
            <Image
              alt={image.alt}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:group-hover:scale-100 motion-reduce:transition-none"
              fill
              sizes={
                index === 0 ? "(min-width: 768px) 90vw, 92vw" : "(min-width: 768px) 45vw, 92vw"
              }
              src={image.url}
            />
          </button>
        ))}
      </div>
      {active !== null ? (
        <div
          aria-label={`${title} image gallery`}
          aria-modal="true"
          ref={dialogRef}
          className={styles.lightbox}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          role="dialog"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current;
            const end = event.changedTouches[0]?.clientX;
            if (start !== null && end !== undefined && Math.abs(end - start) > 48)
              move(end < start ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          <button
            aria-label="Close image gallery"
            className={styles.closeButton}
            onClick={close}
            ref={closeRef}
            type="button"
          >
            Close
          </button>
          <button
            aria-label="Previous photograph"
            className={`${styles.navButton} ${styles.previous}`}
            onClick={() => move(-1)}
            type="button"
          >
            Previous
          </button>
          <div className={styles.lightboxImage}>
            <Image
              alt={images[active].alt}
              className="object-contain"
              fill
              sizes="100vw"
              src={images[active].url}
            />
          </div>
          <p aria-live="polite" className={styles.counter}>
            {active + 1} / {images.length}
          </p>
          <button
            aria-label="Next photograph"
            className={`${styles.navButton} ${styles.next}`}
            onClick={() => move(1)}
            type="button"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
