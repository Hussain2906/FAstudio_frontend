"use client";

import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ProcessStep, ProcessStepsContent } from "@fs/cms-contracts";
import styles from "./process-story.module.css";
import { deriveProcessTimeline } from "./process-scroll-math";

type Props = {
  content: ProcessStepsContent;
  steps: readonly ProcessStep[];
  onReadText: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function splitCharacters(value: string) {
  return Array.from(value);
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

export function ProcessScrollScene({ content, steps, onReadText }: Props) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const outgoingTextRef = useRef<HTMLDivElement>(null);
  const incomingTextRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLSpanElement>(null);
  const progressFillRef = useRef<HTMLSpanElement>(null);
  const segmentRef = useRef(0);
  const activeRef = useRef(0);
  const finalSettledRef = useRef(false);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [finalSettled, setFinalSettled] = useState(false);
  const renderedSegmentIndex = finalSettled ? steps.length - 1 : segmentIndex;
  const from = steps[Math.min(renderedSegmentIndex, steps.length - 1)] ?? steps[0];
  const to = finalSettled ? from : (steps[Math.min(segmentIndex + 1, steps.length - 1)] ?? from);
  const active = steps[activeIndex] ?? steps[0];
  const trackHeight = `calc(100svh + ${(steps.length - 1) * 82}svh + 44svh)`;
  const fromCharacters = splitCharacters(from.title);
  const toCharacters = splitCharacters(to.title);
  const cellCount = Math.max(fromCharacters.length, toCharacters.length);
  const cells = Array.from({ length: cellCount }, (_, index) => ({
    index,
    from: fromCharacters[index] ?? "",
    to: toCharacters[index] ?? "",
  }));

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || steps.length < 2) return;

    const motionQuery = window.matchMedia(
      "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let isNearViewport = true;
    let activeListener = false;
    let intersectionObserver: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;

    const paint = () => {
      frame = 0;
      if (!isNearViewport || document.hidden) return;
      const rect = track.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollOffset = Math.max(0, -rect.top);
      const timeline = deriveProcessTimeline(scrollOffset, viewportHeight, steps.length);
      const segment = timeline.segmentIndex;
      const segmentProgress = timeline.segmentProgress;
      const nextActive = timeline.activeIndex;

      if (segmentRef.current !== segment) {
        segmentRef.current = segment;
        setSegmentIndex(segment);
      }
      if (activeRef.current !== nextActive) {
        activeRef.current = nextActive;
        setActiveIndex(nextActive);
      }
      const nextFinalSettled = timeline.totalProgress >= 1;
      if (finalSettledRef.current !== nextFinalSettled) {
        finalSettledRef.current = nextFinalSettled;
        setFinalSettled(nextFinalSettled);
      }

      const reveal = segmentProgress;
      const copyOutPhase = clamp((reveal - 0.48) / 0.02, 0, 1);
      const copyInPhase = clamp((reveal - 0.5) / 0.02, 0, 1);
      const copyOut = copyOutPhase * copyOutPhase * (3 - 2 * copyOutPhase);
      const copyIn = copyInPhase * copyInPhase * (3 - 2 * copyInPhase);
      if (outgoingRef.current) {
        outgoingRef.current.style.opacity = String(1 - reveal);
        outgoingRef.current.style.transform = `scale(${1 + reveal * 0.018})`;
      }
      if (incomingRef.current) {
        incomingRef.current.style.opacity = String(reveal);
        incomingRef.current.style.transform = `scale(${1.035 - reveal * 0.035})`;
      }
      if (outgoingTextRef.current) {
        outgoingTextRef.current.style.opacity = String(1 - copyOut);
        outgoingTextRef.current.style.transform = `translateY(${-6 * copyOut}px)`;
      }
      if (incomingTextRef.current) {
        incomingTextRef.current.style.opacity = String(copyIn);
        incomingTextRef.current.style.transform = `translateY(${6 * (1 - copyIn)}px)`;
      }
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${timeline.totalProgress})`;
      }

      const flap = flapRef.current;
      if (flap) {
        flap.querySelectorAll<HTMLElement>("[data-flap-cell]").forEach((cell) => {
          const index = Number(cell.dataset.index ?? 0);
          const span = Math.max(1, Number(cell.dataset.span ?? 1));
          const stagger = span <= 1 ? 0 : (index / (span - 1)) * 0.16;
          const characterProgress = clamp((reveal - stagger) / (1 - stagger), 0, 1);
          const flip = clamp((characterProgress - 0.48) / 0.04, 0, 1);
          const oldFace = cell.querySelector<HTMLElement>("[data-flap-face='old']");
          const newFace = cell.querySelector<HTMLElement>("[data-flap-face='new']");
          const outgoingPhase = Math.min(flip * 2, 1);
          const incomingPhase = Math.max((flip - 0.5) * 2, 0);
          if (oldFace) {
            oldFace.style.transform = `rotateX(${-90 * outgoingPhase}deg)`;
            oldFace.style.opacity = flip < 0.5 ? "1" : "0";
          }
          if (newFace) {
            newFace.style.transform = `rotateX(${90 * (1 - incomingPhase)}deg)`;
            newFace.style.opacity = flip < 0.5 ? "0" : "1";
          }
        });
      }
    };

    const schedule = () => {
      if (!frame && isNearViewport && !document.hidden) frame = window.requestAnimationFrame(paint);
    };

    const removeListeners = () => {
      if (!activeListener) return;
      activeListener = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      document.removeEventListener("visibilitychange", schedule);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const addListeners = () => {
      if (activeListener) return;
      activeListener = true;
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      window.addEventListener("pageshow", schedule);
      document.addEventListener("visibilitychange", schedule);
      if ("IntersectionObserver" in window) {
        intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            isNearViewport = entry.isIntersecting;
            schedule();
          },
          { rootMargin: "100% 0px" },
        );
        intersectionObserver.observe(track);
      }
      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(track);
        resizeObserver.observe(stage);
      }
      schedule();
    };

    const syncMotionMode = () => {
      if (motionQuery.matches) addListeners();
      else removeListeners();
    };
    syncMotionMode();
    motionQuery.addEventListener("change", syncMotionMode);
    return () => {
      motionQuery.removeEventListener("change", syncMotionMode);
      removeListeners();
    };
  }, [steps]);

  return (
    <section
      aria-label="Scroll-driven process story"
      className={styles.scrollTrack}
      ref={trackRef}
      style={{ height: trackHeight }}
    >
      <div className={styles.stickyStage} ref={stageRef}>
        <div aria-hidden="true" className={styles.mediaLayers}>
          <div
            className={`${styles.mediaLayer} ${styles.outgoing}`}
            data-process-image="outgoing"
            ref={outgoingRef}
          >
            {from.image ? (
              <Image
                alt=""
                className={styles.sceneImage}
                fill
                loading="eager"
                fetchPriority={segmentIndex === 0 ? "high" : undefined}
                sizes="100vw"
                src={from.image.url}
                style={{ objectPosition: focalPosition(from.imagePosition) }}
              />
            ) : null}
          </div>
          <div
            className={`${styles.mediaLayer} ${styles.incoming}`}
            data-process-image="incoming"
            ref={incomingRef}
          >
            {to.image ? (
              <Image
                alt=""
                className={styles.sceneImage}
                fill
                loading="eager"
                sizes="100vw"
                src={to.image.url}
                style={{ objectPosition: focalPosition(to.imagePosition) }}
              />
            ) : null}
          </div>
        </div>

        <div aria-hidden="true" className={styles.sceneIntro}>
          {content.eyebrow.trim() ? <p className="type-caption">{content.eyebrow}</p> : null}
          <h2>{content.heading}</h2>
          {content.description.trim() ? <p>{content.description}</p> : null}
        </div>

        <div aria-hidden="true" className={styles.stepPanel}>
          <div className={styles.stepMeta}>
            <span className="type-caption">
              {active.eyebrow.trim() || `STEP ${String(activeIndex + 1).padStart(2, "0")}`}
            </span>
            <span className={styles.counter}>
              {String(activeIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </span>
          </div>
          <h3 className={styles.flapHeading}>
            <span className={styles.flapCells} key={segmentIndex} ref={flapRef}>
              {cells.map((cell) => (
                <span
                  className={styles.flapCell}
                  data-flap-cell=""
                  data-has-source={cell.from ? "true" : "false"}
                  data-has-target={cell.to ? "true" : "false"}
                  data-index={cell.index}
                  data-span={cellCount}
                  key={cell.index}
                >
                  <span className={`${styles.flapFace} ${styles.oldFace}`} data-flap-face="old">
                    {cell.from}
                  </span>
                  <span className={`${styles.flapFace} ${styles.newFace}`} data-flap-face="new">
                    {cell.to}
                  </span>
                </span>
              ))}
            </span>
          </h3>
          <div className={styles.stepTextLayers}>
            <div
              className={`${styles.stepText} ${styles.outgoingText}`}
              data-step-copy="outgoing"
              ref={outgoingTextRef}
            >
              <p className={styles.summary}>{from.summary}</p>
              {from.description.trim() ? (
                <p className={styles.description}>{from.description}</p>
              ) : null}
              {from.secondaryCaption.trim() ? (
                <p className={styles.secondaryCaption}>{from.secondaryCaption}</p>
              ) : null}
            </div>
            <div
              className={`${styles.stepText} ${styles.incomingText}`}
              data-step-copy="incoming"
              ref={incomingTextRef}
            >
              <p className={styles.summary}>{to.summary}</p>
              {to.description.trim() ? (
                <p className={styles.description}>{to.description}</p>
              ) : null}
              {to.secondaryCaption.trim() ? (
                <p className={styles.secondaryCaption}>{to.secondaryCaption}</p>
              ) : null}
            </div>
          </div>
          <div className={styles.progressArea}>
            <div
              aria-label="Process progress"
              aria-valuemax={steps.length}
              aria-valuemin={1}
              aria-valuenow={activeIndex + 1}
              aria-valuetext={`Step ${activeIndex + 1} of ${steps.length}: ${active.title}`}
              className={styles.progressBar}
              role="progressbar"
            >
              <span className={styles.progressFill} ref={progressFillRef} />
            </div>
          </div>
        </div>

        <button className={styles.readButton} onClick={onReadText} type="button">
          <span>{content.skipLinkLabel.trim() || "Read the process as text"}</span>
          <ArrowDownRight aria-hidden="true" size={18} />
        </button>
      </div>
    </section>
  );
}
