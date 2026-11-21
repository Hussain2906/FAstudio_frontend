'use client';

import type { CmsDestinationKey, HomeSelectedProject, HomeSelectedProjectsContent } from '@fs/cms-contracts';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const destinationPaths: Record<CmsDestinationKey, string> = {
  home: '/', about: '/about', services: '/services', portfolio: '/portfolio', process: '/process', contact: '/contact',
};

const visualPositions = [-3, -2, -1, 0, 1, 2, 3] as const;
type PhysicalSlot = { id: number; position: number; projectIndex: number; transitionEnabled: boolean };
type Metrics = { viewport: number; card: number; gap: number };

const FALLBACK_CARD_WIDTH = 280;
const FALLBACK_CAROUSEL_GAP = 24;

function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function projectScale(distance: number) {
  if (distance === 0) return 1.12;
  if (distance === 1) return 0.87;
  return 0.76;
}

function createSlots(projectCount: number, activeIndex: number): PhysicalSlot[] {
  return visualPositions.map((position, id) => ({ id, position, projectIndex: modulo(activeIndex + position, projectCount), transitionEnabled: true }));
}

function ProjectCard({ project, active, decorative, distance, onSelect }: { project: HomeSelectedProject; active: boolean; decorative: boolean; distance: number; onSelect: () => void }) {
  return <button aria-current={active ? 'true' : undefined} aria-hidden={decorative ? true : undefined} aria-label={`${active ? 'Selected project' : 'Select project'}: ${project.title}`} className={`selected-project-card group relative block aspect-[3/4] w-[66vw] max-w-[22rem] overflow-hidden rounded-xl bg-primary text-left focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:w-[clamp(16rem,26vw,24rem)] ${active ? 'z-20' : 'z-10'}`} onClick={onSelect} style={{ opacity: active ? 1 : distance > 1 ? 0.62 : 0.9, transform: `perspective(1200px) scale(${projectScale(distance)}) translateZ(${active ? '18px' : '0px'})`, zIndex: active ? 30 : Math.max(1, 20 - distance) }} tabIndex={decorative ? -1 : undefined} type="button">{project.image?.url ? <Image alt={project.imageAlt} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]" fill sizes="(min-width: 1280px) 26vw, (min-width: 640px) 38vw, 66vw" src={project.image.url} /> : null}<span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent" /></button>;
}

export function HomeSelectedProjectsSection({ content }: { content: HomeSelectedProjectsContent }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const normalizeFrameRef = useRef<number | undefined>(undefined);
  const transitioningRef = useRef(false);
  const activeIndexRef = useRef(0);
  const directionRef = useRef<-1 | 1>(1);
  const recycledSlotRef = useRef<number | undefined>(undefined);
  const pendingMovesRef = useRef(0);
  const pendingDirectionRef = useRef<-1 | 1>(1);
  const moveRef = useRef<(direction: -1 | 1) => void>(() => undefined);
  const projectCount = content.projects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [slots, setSlots] = useState(() => createSlots(projectCount, 0));
  const [metrics, setMetrics] = useState<Metrics>();
  const [dragStart, setDragStart] = useState<number>();
  const [dragOffset, setDragOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const card = track.firstElementChild as HTMLElement | null;
      if (!card) return;
      const styles = getComputedStyle(track);
      const cardWidth = card.getBoundingClientRect().width;
      const parsedGap = Number.parseFloat(styles.columnGap || styles.gap || '');
      const gap = Number.isFinite(parsedGap) ? parsedGap : FALLBACK_CAROUSEL_GAP;
      const viewportWidth = viewport.clientWidth;
      if (!Number.isFinite(viewportWidth) || viewportWidth <= 0 || !Number.isFinite(cardWidth) || cardWidth <= 0 || !Number.isFinite(gap)) return;
      setMetrics({ viewport: viewportWidth, card: cardWidth, gap });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(([entry]) => setIsInViewport(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (normalizeFrameRef.current) cancelAnimationFrame(normalizeFrameRef.current);
  }, []);

  const finishTransition = useCallback(() => {
    transitioningRef.current = false;
    if (pendingMovesRef.current > 0) {
      pendingMovesRef.current -= 1;
      window.requestAnimationFrame(() => moveRef.current(pendingDirectionRef.current));
    }
  }, []);

  const move = useCallback((direction: -1 | 1) => {
    if (transitioningRef.current || projectCount < 2) return;
    transitioningRef.current = true;
    directionRef.current = direction;
    const nextActiveIndex = modulo(activeIndexRef.current + direction, projectCount);
    activeIndexRef.current = nextActiveIndex;
    setActiveIndex(nextActiveIndex);
    if (reducedMotion) {
      setSlots((current) => current.map((slot) => {
        const nextPosition = slot.position - direction;
        if (nextPosition < -3 || nextPosition > 3) {
          return { ...slot, position: direction === 1 ? 3 : -3, projectIndex: modulo(nextActiveIndex + (direction === 1 ? 3 : -3), projectCount), transitionEnabled: false };
        }
        return { ...slot, position: nextPosition, transitionEnabled: false };
      }));
      finishTransition();
      return;
    }
    setSlots((current) => current.map((slot) => ({ ...slot, position: slot.position - direction, transitionEnabled: true })));
    setDragOffset(0);
  }, [finishTransition, projectCount, reducedMotion]);

  useEffect(() => {
    moveRef.current = move;
  }, [move]);

  const autoplayActive = !isHovered && !isFocused && dragStart === undefined && isInViewport && !reducedMotion;

  useEffect(() => {
    if (!autoplayActive) return;
    const timer = window.setTimeout(() => {
      if (!transitioningRef.current) move(1);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, autoplayActive, move]);

  function goToProject(logicalIndex: number) {
    const forwardDistance = modulo(logicalIndex - activeIndexRef.current, projectCount);
    const delta = forwardDistance <= projectCount / 2 ? forwardDistance : forwardDistance - projectCount;
    if (delta === 0 || transitioningRef.current) return;
    const direction = delta > 0 ? 1 : -1;
    pendingDirectionRef.current = direction;
    pendingMovesRef.current = Math.abs(delta) - 1;
    move(direction);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (transitioningRef.current) return;
    setDragStart(event.clientX);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart === undefined) return;
    setDragOffset(event.clientX - dragStart);
  }

  function handlePointerEnd() {
    if (dragStart === undefined) return;
    const threshold = (metrics?.card ?? FALLBACK_CARD_WIDTH) * 0.18;
    if (dragOffset < -threshold) move(1);
    else if (dragOffset > threshold) move(-1);
    else setDragOffset(0);
    setDragStart(undefined);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'Home') { event.preventDefault(); goToProject(0); }
    if (event.key === 'End') { event.preventDefault(); goToProject(projectCount - 1); }
  }

  function handleSlotTransitionEnd(event: React.TransitionEvent<HTMLDivElement>, slot: PhysicalSlot) {
    if (event.target !== event.currentTarget || Math.abs(slot.position) <= 3 || recycledSlotRef.current === slot.id) return;
    recycledSlotRef.current = slot.id;
    const direction = directionRef.current;
    const replacementPosition = direction === 1 ? 3 : -3;
    const replacementProject = modulo(activeIndexRef.current + replacementPosition, projectCount);
    setSlots((current) => current.map((currentSlot) => currentSlot.id === slot.id ? { ...currentSlot, position: replacementPosition, projectIndex: replacementProject, transitionEnabled: false } : currentSlot));
    normalizeFrameRef.current = requestAnimationFrame(() => {
      normalizeFrameRef.current = requestAnimationFrame(() => {
        recycledSlotRef.current = undefined;
        setSlots((current) => current.map((currentSlot) => ({ ...currentSlot, transitionEnabled: true })));
        finishTransition();
      });
    });
  }

  const activeProject = content.projects[activeIndex];
  const cardWidth = metrics?.card ?? FALLBACK_CARD_WIDTH;
  const gap = metrics?.gap ?? FALLBACK_CAROUSEL_GAP;
  const step = Number.isFinite(cardWidth) && Number.isFinite(gap) ? cardWidth + gap : FALLBACK_CARD_WIDTH + FALLBACK_CAROUSEL_GAP;
  const seenVisibleProjects = new Set<number>();

  return <section aria-labelledby="selected-projects-heading" className="selected-projects-section bg-muted text-foreground" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false); }} onFocus={() => setIsFocused(true)} onKeyDown={handleKeyDown} tabIndex={0}><div className="storefront-shell storefront-section"><header className="mx-auto max-w-2xl text-center"><p className="type-caption flex items-center justify-center gap-3 text-muted-foreground"><span aria-hidden="true" className="h-px w-8 bg-primary" />{content.eyebrow}<span aria-hidden="true" className="h-px w-8 bg-primary" /></p><h2 className="type-section-display mt-5" id="selected-projects-heading">{content.heading}</h2>{content.supportingText ? <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted-foreground">{content.supportingText}</p> : null}</header><div className="mt-12 sm:mt-16"><div aria-label="Selected projects carousel" className="selected-projects-viewport" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onPointerCancel={handlePointerEnd} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} ref={viewportRef} role="region"><div className="selected-projects-track" ref={trackRef}>{slots.map((slot) => { const distance = Math.abs(slot.position); const hiddenBuffer = distance > 2; const duplicateVisibleProject = !hiddenBuffer && seenVisibleProjects.has(slot.projectIndex); if (!hiddenBuffer) seenVisibleProjects.add(slot.projectIndex); const project = content.projects[slot.projectIndex]; return <div aria-hidden={hiddenBuffer || duplicateVisibleProject ? true : undefined} className="selected-project-slot w-[66vw] max-w-[22rem] sm:w-[clamp(16rem,26vw,24rem)]" key={slot.id} onTransitionEnd={(event) => handleSlotTransitionEnd(event, slot)} style={{ transition: slot.transitionEnabled && dragStart === undefined ? undefined : 'none', transform: `translate3d(calc(-50% + ${slot.position * step + dragOffset}px), -50%, 0)` } as React.CSSProperties}><ProjectCard active={slot.position === 0} decorative={hiddenBuffer || duplicateVisibleProject} distance={distance} onSelect={() => goToProject(slot.projectIndex)} project={project} /></div>; })}</div></div><div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-5"><button aria-label="Previous project" className="grid size-11 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring" onClick={() => move(-1)} type="button"><ArrowLeft aria-hidden="true" className="size-4" /></button><p aria-live="polite" className="min-w-40 text-center text-sm text-muted-foreground"><span className="font-display text-2xl text-foreground">{activeProject?.title}</span><span className="mt-1 block text-[0.625rem] font-bold uppercase tracking-[0.12em]">{activeProject?.category}</span><span className="mt-2 block text-[0.625rem] font-bold uppercase tracking-[0.12em]">{activeIndex + 1} / {projectCount}</span></p><button aria-label="Next project" className="grid size-11 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring" onClick={() => move(1)} type="button"><ArrowRight aria-hidden="true" className="size-4" /></button></div>{activeProject ? <Link className="mx-auto mt-4 flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" href={destinationPaths[activeProject.destination]}>View our work<ArrowUpRight aria-hidden="true" className="size-3.5" /></Link> : null}</div></div></section>;
}
