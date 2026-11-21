"use client";

import type {
  HomeRoomAssemblyContent,
  RoomAnimationPreset,
  RoomSceneElement,
} from "@fs/cms-contracts";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type ScenePosition = { x: number; y: number; width: number; height: number };
type SceneGeometry = {
  viewportWidth: number;
  viewportHeight: number;
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
};
type AssetVisualBounds = { width: number; height: number; x: number; y: number };
type RoomLayerProps = {
  alt: string;
  asset: HomeRoomAssemblyContent["sofaImage"];
  className: string;
  debug: boolean;
  label: string;
  opacity: number;
  position: ScenePosition;
  transform: string;
  visualBounds?: AssetVisualBounds;
};
type AdditionalElementConfig = { position: ScenePosition; zIndex: number; finalTransform?: string };

const destinationPaths = {
  home: "/",
  about: "/about",
  services: "/services",
  portfolio: "/portfolio",
  process: "/process",
  contact: "/contact",
} as const;

/** Alpha bounds inspected from the currently published Cloudinary PNGs. */
const inspectedAssetBounds: Record<string, AssetVisualBounds> = {
  "interior-portfolio/xaerbdttoqouncfxvvkx": { x: 33, y: 47, width: 1951, height: 695 },
  "interior-portfolio/gjeq94ypwxr1odrrldcf": { x: 30, y: 16, width: 978, height: 1499 },
  "interior-portfolio/nex9eifwlrfefyl13zwl": { x: 25, y: 27, width: 1661, height: 883 },
  "interior-portfolio/psdii1w7akidz5rb2if1": { x: 120, y: 139, width: 1543, height: 686 },
  "interior-portfolio/mp4wyqb09ums2fu48eof": { x: 151, y: 56, width: 1280, height: 920 },
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}
function easeOut(value: number) {
  const progress = clamp(value);
  return 1 - (1 - progress) ** 3;
}
function phase(progress: number, start: number, end: number) {
  return easeOut(clamp((progress - start) / (end - start)));
}

function RoomLayer({
  alt,
  asset,
  className,
  debug,
  label,
  opacity,
  position,
  transform,
  visualBounds,
}: RoomLayerProps) {
  if (!asset?.url) return null;
  const style: CSSProperties = {
    height: `${position.height}%`,
    left: `${position.x}%`,
    opacity,
    top: `${position.y}%`,
    transform,
    width: `${position.width}%`,
  };
  return (
    <div
      aria-hidden={!alt}
      className={`room-assembly-layer ${className} ${debug ? "room-assembly-layer-debug" : ""}`}
      data-room-layer={label}
      style={style}
    >
      <Image
        alt={alt}
        className="object-contain"
        fill
        sizes="(min-width: 1024px) 70vw, 92vw"
        src={asset.url}
      />
      {debug ? (
        <>
          <span aria-hidden="true" className="room-assembly-debug-anchor" />
          <span className="room-assembly-debug-label">
            {label}
            {visualBounds ? ` · alpha ${visualBounds.width}×${visualBounds.height}` : ""}
          </span>
        </>
      ) : null}
    </div>
  );
}

function getAdditionalElementConfig(element: RoomSceneElement): AdditionalElementConfig | null {
  const configs: Record<RoomSceneElement["type"], AdditionalElementConfig> = {
    rug: { position: { x: 48, y: 72, width: 70, height: 52.5 }, zIndex: 2 },
    "table-vase": { position: { x: 48, y: 66, width: 7, height: 8 }, zIndex: 9 },
    "decorative-bowl": { position: { x: 48, y: 67, width: 8, height: 6 }, zIndex: 9 },
    decor: { position: { x: 53, y: 66, width: 8, height: 7 }, zIndex: 9 },
    "accent-furniture": { position: { x: 67, y: 63, width: 16, height: 26 }, zIndex: 3 },
  };
  return configs[element.type] ?? null;
}

function getAdditionalTransform(preset: RoomAnimationPreset, progress: number) {
  const offset = (1 - progress) * 120;
  switch (preset) {
    case "from-left":
      return `translate3d(calc(-50% + ${offset * -1}%), -50%, 0)`;
    case "from-right":
      return `translate3d(calc(-50% + ${offset}%), -50%, 0)`;
    case "from-top":
      return `translate3d(-50%, calc(-50% + ${offset * -1}%), 0)`;
    case "from-bottom":
      return `translate3d(-50%, calc(-50% + ${offset}%), 0)`;
    case "floor-reveal":
      return `translate3d(-50%, calc(-50% + ${offset * 0.66}%), 0)`;
    default:
      return `translate3d(-50%, calc(-50% + ${offset * 0.4}%), 0)`;
  }
}

export function HomeRoomAssemblySection({ content }: { content: HomeRoomAssemblyContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageStartRef = useRef<number | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [staticValidationEnabled, setStaticValidationEnabled] = useState(false);
  const [sceneGeometry, setSceneGeometry] = useState<SceneGeometry>();

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMode = () => setMotionEnabled(desktopQuery.matches && !reducedMotionQuery.matches);
    updateMode();
    desktopQuery.addEventListener("change", updateMode);
    reducedMotionQuery.addEventListener("change", updateMode);
    const debugFrame = window.requestAnimationFrame(() => {
      const developmentOnly = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      const params = new URLSearchParams(window.location.search);
      setDebugEnabled(developmentOnly && params.get("roomAssemblyDebug") === "1");
      setStaticValidationEnabled(developmentOnly && params.get("roomAssemblyStatic") === "1");
    });
    return () => {
      desktopQuery.removeEventListener("change", updateMode);
      reducedMotionQuery.removeEventListener("change", updateMode);
      window.cancelAnimationFrame(debugFrame);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const sourceWidth = content.backdropImage?.width ?? 1;
    const sourceHeight = content.backdropImage?.height ?? 1;
    if (!scene || sourceWidth <= 0 || sourceHeight <= 0) return;
    const measure = () => {
      const { width: viewportWidth, height: viewportHeight } = scene.getBoundingClientRect();
      if (viewportWidth <= 0 || viewportHeight <= 0) return;
      const scale = Math.max(viewportWidth / sourceWidth, viewportHeight / sourceHeight);
      const next: SceneGeometry = {
        viewportWidth,
        viewportHeight,
        scale,
        renderedWidth: sourceWidth * scale,
        renderedHeight: sourceHeight * scale,
        offsetX: (viewportWidth - sourceWidth * scale) / 2,
        offsetY: (viewportHeight - sourceHeight * scale) / 2,
      };
      setSceneGeometry((current) =>
        current &&
        Math.abs(current.viewportWidth - next.viewportWidth) < 0.5 &&
        Math.abs(current.viewportHeight - next.viewportHeight) < 0.5
          ? current
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [content.backdropImage?.height, content.backdropImage?.width]);

  useEffect(() => {
    if (!motionEnabled || staticValidationEnabled) return;
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const stage = stageRef.current;
      const section = sectionRef.current;
      if (!stage || !section) return;
      stageStartRef.current ??= stage.offsetTop;
      const stageStart = stageStartRef.current;
      const scrollDistance = Math.max(1, section.offsetHeight - stageStart - stage.offsetHeight);
      setProgress(clamp((-section.getBoundingClientRect().top - stageStart) / scrollDistance));
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [motionEnabled, staticValidationEnabled]);

  const positions = useMemo(() => {
    const sofa = { x: 35, y: 65, width: 40, height: 30 } satisfies ScenePosition;
    return {
      sofa,
      vase: { x: 9, y: 60, width: 12, height: 40 } satisfies ScenePosition,
      table: { x: 47, y: 74, width: 20, height: 14 } satisfies ScenePosition,
      chair: { x: 67, y: 63, width: 16, height: 26 } satisfies ScenePosition,
      pillows: {
        x: sofa.x + sofa.width * 0.03,
        y: sofa.y - sofa.height * 0.18,
        width: sofa.width * 0.38,
        height: sofa.height * 0.41,
      } satisfies ScenePosition,
    };
  }, []);

  const resolvedProgress = staticValidationEnabled || !motionEnabled ? 1 : progress;
  const primaryCtaLabel = content.primaryCtaLabel ?? "View Our Work";
  const secondaryCtaLabel =
    content.secondaryCtaLabel?.trim().toLowerCase() === "book consultation"
      ? "Book a Free Consultation"
      : (content.secondaryCtaLabel ?? "Book a Free Consultation");
  const sofaProgress = phase(resolvedProgress, 0, 0.28);
  const vaseProgress = phase(resolvedProgress, 0.18, 0.48);
  const tableProgress = phase(resolvedProgress, 0.38, 0.68);
  const chairProgress = phase(resolvedProgress, 0.48, 0.75);
  const pillowsProgress = phase(resolvedProgress, 0.58, 0.88);
  const geometryStyle: CSSProperties = sceneGeometry
    ? {
        height: `${sceneGeometry.renderedHeight}px`,
        left: `${sceneGeometry.offsetX}px`,
        top: `${sceneGeometry.offsetY}px`,
        width: `${sceneGeometry.renderedWidth}px`,
      }
    : { inset: 0 };
  const getBounds = (asset: HomeRoomAssemblyContent["sofaImage"]) =>
    asset ? inspectedAssetBounds[asset.publicId] : undefined;
  const debugPositions: Array<[string, ScenePosition]> = [
    ["sofa", positions.sofa],
    ["vase", positions.vase],
    ["table", positions.table],
    ["chair", positions.chair],
    ["pillows", positions.pillows],
  ];
  const debugWarnings = debugPositions
    .filter(
      ([, position]) =>
        position.x - position.width / 2 < 0 ||
        position.x + position.width / 2 > 100 ||
        position.y - position.height / 2 < 0 ||
        position.y + position.height / 2 > 100,
    )
    .map(([label]) => `${label} rectangle extends outside the reference canvas.`);

  return (
    <section
      aria-labelledby="room-assembly-heading"
      className={`room-assembly-section bg-background text-foreground ${motionEnabled ? "room-assembly-section-motion" : ""}`}
      ref={sectionRef}
    >
      <div className="room-assembly-stage" ref={stageRef}>
        <div className="room-assembly-copy">
          <p className="room-assembly-eyebrow type-caption flex items-center justify-center gap-3 text-muted-foreground">
            <span aria-hidden="true" className="h-px w-8 bg-primary" />
            {content.eyebrow}
          </p>
          <h2 className="room-assembly-heading type-section-display" id="room-assembly-heading">
            {content.heading}
          </h2>
          {content.description ? (
            <p className="room-assembly-description text-base leading-7 text-muted-foreground">
              {content.description}
            </p>
          ) : null}
          <div className="room-assembly-ctas flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
              href={destinationPaths[content.secondaryCtaDestination ?? "contact"]}
            >
              {secondaryCtaLabel}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className="text-sm font-semibold text-foreground underline decoration-border underline-offset-8 transition-colors hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
              href={destinationPaths[content.primaryCtaDestination ?? "portfolio"]}
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </div>
        <div className="room-assembly-scene" ref={sceneRef}>
          <div
            className={`room-assembly-reference ${debugEnabled ? "room-assembly-reference-debug" : ""}`}
            style={geometryStyle}
          >
            <Image
              alt={content.backdropAlt}
              className="room-assembly-backdrop object-cover"
              fill
              priority
              sizes="100vw"
              src={content.backdropImage?.url ?? ""}
            />
            <div aria-hidden="true" className="room-assembly-wash" />
            <RoomLayer
              alt={content.sofaAlt}
              asset={content.sofaImage}
              className="room-assembly-sofa"
              debug={debugEnabled}
              label="sofa"
              opacity={sofaProgress}
              position={positions.sofa}
              transform={`translate3d(-50%, calc(-50% + ${(1 - sofaProgress) * -160}%), 0)`}
              visualBounds={getBounds(content.sofaImage)}
            />
            <RoomLayer
              alt={content.vaseAlt}
              asset={content.vaseImage}
              className="room-assembly-vase"
              debug={debugEnabled}
              label="vase"
              opacity={vaseProgress}
              position={positions.vase}
              transform={`translate3d(calc(-50% + ${(1 - vaseProgress) * -180}%), -50%, 0)`}
              visualBounds={getBounds(content.vaseImage)}
            />
            <RoomLayer
              alt={content.centerTableAlt}
              asset={content.centerTableImage}
              className="room-assembly-table"
              debug={debugEnabled}
              label="table"
              opacity={tableProgress}
              position={positions.table}
              transform={`translate3d(-50%, calc(-50% + ${(1 - tableProgress) * 160}%), 0)`}
              visualBounds={getBounds(content.centerTableImage)}
            />
            <RoomLayer
              alt={content.accentChairAlt ?? ""}
              asset={content.accentChairImage ?? null}
              className="room-assembly-chair"
              debug={debugEnabled}
              label="chair"
              opacity={chairProgress}
              position={positions.chair}
              transform={`translate3d(calc(-50% + ${(1 - chairProgress) * 180}%), -50%, 0)`}
              visualBounds={getBounds(content.accentChairImage ?? null)}
            />
            {(content.additionalElements ?? [])
              .filter((element) => element.enabled && element.image?.url)
              .map((element) => {
                const config = getAdditionalElementConfig(element);
                if (!config) return null;
                const elementProgress = phase(
                  resolvedProgress,
                  element.type === "rug" ? 0 : 0.58,
                  element.type === "rug" ? 0.24 : 0.9,
                );
                return (
                  <RoomLayer
                    alt={element.alt}
                    asset={element.image}
                    className={`room-assembly-additional room-assembly-additional-${element.type}`}
                    debug={debugEnabled}
                    key={element.id}
                    label={element.type}
                    opacity={elementProgress}
                    position={config.position}
                    transform={getAdditionalTransform(element.animationPreset, elementProgress)}
                  />
                );
              })}
            <RoomLayer
              alt={content.pillowsAlt}
              asset={content.pillowsImage}
              className="room-assembly-pillows"
              debug={debugEnabled}
              label="pillows"
              opacity={pillowsProgress}
              position={positions.pillows}
              transform={`translate3d(-50%, calc(-50% + ${(1 - pillowsProgress) * -100}%), 0)`}
              visualBounds={getBounds(content.pillowsImage)}
            />
            {debugEnabled ? (
              <div className="room-assembly-debug-panel">
                <p>Room Assembly debug · progress {resolvedProgress.toFixed(3)}</p>
                <p>
                  viewport{" "}
                  {sceneGeometry
                    ? `${Math.round(sceneGeometry.viewportWidth)}×${Math.round(sceneGeometry.viewportHeight)}`
                    : "measuring"}{" "}
                  · scale {sceneGeometry?.scale.toFixed(3) ?? "—"}
                </p>
                <p>
                  crop offset{" "}
                  {sceneGeometry
                    ? `${Math.round(sceneGeometry.offsetX)}px, ${Math.round(sceneGeometry.offsetY)}px`
                    : "—"}
                </p>
                {debugWarnings.length ? (
                  debugWarnings.map((warning) => <p key={warning}>{warning}</p>)
                ) : (
                  <p>Geometry bounds: OK</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
