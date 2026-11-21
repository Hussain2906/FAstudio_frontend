"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./portfolio.module.css";

type PortfolioAmbientBackgroundProps = {
  imageSrc?: string | null;
  videoSrc?: string | null;
  videoPosterSrc?: string | null;
};

export function PortfolioAmbientBackground({
  imageSrc,
  videoSrc,
  videoPosterSrc,
}: PortfolioAmbientBackgroundProps) {
  const [paused, setPaused] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [inViewport, setInViewport] = useState(true);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setMotionAllowed(!preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInViewport(entry.isIntersecting);
    });
    observer.observe(background);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!motionAllowed || paused || !inViewport) {
      video.pause();
      return;
    }
    void video.play().catch(() => setPaused(true));
  }, [inViewport, motionAllowed, paused, videoSrc]);

  if (!imageSrc && !videoSrc) return null;

  return (
    <div
      className={`${styles.heroBackground} absolute inset-0`}
      data-paused={paused}
      ref={backgroundRef}
    >
      {videoSrc ? (
        <video
          aria-hidden="true"
          className={`${styles.heroBackgroundVideo} absolute inset-0`}
          loop
          muted
          playsInline
          poster={videoPosterSrc ?? undefined}
          preload="metadata"
          ref={videoRef}
          src={videoSrc}
          tabIndex={-1}
        >
          Your browser does not support background video.
        </video>
      ) : imageSrc ? (
        <Image
          alt=""
          aria-hidden="true"
          className={styles.heroBackgroundImage}
          fill
          preload
          sizes="100vw"
          src={imageSrc}
        />
      ) : null}
      <div aria-hidden="true" className={`${styles.heroScrim} absolute inset-0`} />
      <button
        aria-label={paused ? "Resume background motion" : "Pause background motion"}
        className={styles.heroMotionToggle}
        onClick={() => setPaused((current) => !current)}
        type="button"
      >
        {paused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
        <span>{paused ? "Resume motion" : "Pause motion"}</span>
      </button>
    </div>
  );
}
