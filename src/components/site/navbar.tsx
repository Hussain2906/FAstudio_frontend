"use client";

import type { SiteLogoContent } from "@fs/cms-contracts";
import { GLOBAL_SITE_LOGO_TYPE } from "@fs/cms-contracts";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { consultationCta, siteNavigation, type SiteNavigationItem } from "../../config/navigation";
import { apiClient } from "../../lib/api/client";

function NavbarLink({ item, onNavigate }: { item: SiteNavigationItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <li className="group relative">
      <Link
        aria-current={active ? "page" : undefined}
        className={`relative inline-flex min-h-11 items-center px-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "text-foreground" : "text-foreground/70 hover:text-foreground"}`}
        href={item.href}
        onClick={onNavigate}
      >
        {item.label}
        <span
          aria-hidden="true"
          className={`absolute inset-x-2.5 bottom-1 h-px origin-left bg-primary transition-transform duration-200 motion-reduce:transition-none ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100"}`}
        />
      </Link>
    </li>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logo, setLogo] = useState<SiteLogoContent["image"]>();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    apiClient
      .get<{ content: SiteLogoContent }>(`cms/public/components/${GLOBAL_SITE_LOGO_TYPE}`)
      .then((response) => {
        if (active && response.content.image?.url) setLogo(response.content.image);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    firstMenuLinkRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-navbar fixed inset-x-3 top-3 z-50 text-foreground sm:inset-x-4">
      <div
        className={`relative overflow-hidden border border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur-xl transition-[background-color,border-radius,box-shadow] duration-300 supports-[backdrop-filter]:bg-background/75 motion-reduce:transition-none ${open ? "rounded-2xl" : "rounded-full"}`}
      >
        <div
          className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 transition-[min-height] duration-300 motion-reduce:transition-none sm:gap-3 sm:px-5 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:px-7 ${scrolled ? "min-h-14 sm:min-h-16" : "min-h-16 sm:min-h-[4.5rem]"}`}
        >
          <Link
            aria-label="FA Studio home"
            className="flex min-w-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-3"
            href="/"
            onClick={close}
          >
            {logo?.url ? (
              <Image
                alt=""
                aria-hidden="true"
                className={`h-auto w-auto shrink-0 object-contain transition-[max-height,max-width] duration-300 motion-reduce:transition-none ${scrolled ? "max-h-8 max-w-8" : "max-h-9 max-w-9"}`}
                height={logo.height}
                priority
                sizes="36px"
                src={logo.url}
                width={logo.width}
              />
            ) : null}
            <span className="flex min-w-0 flex-col">
              <span className="whitespace-nowrap font-display text-xl leading-none tracking-[-0.04em] sm:text-2xl">
                FA Studio
              </span>
              <span className="hidden pt-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:block">
                Interior Design
              </span>
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden justify-self-center xl:block">
            <ul className="flex items-center gap-1">
              {siteNavigation.map((item) => (
                <NavbarLink item={item} key={item.id} onNavigate={close} />
              ))}
            </ul>
          </nav>

          <div className="col-start-2 row-start-1 flex items-center justify-self-end gap-2 sm:gap-3 xl:col-start-3">
            <Link
              className="hidden min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-[0.625rem] font-semibold uppercase tracking-[0.09em] text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:inline-flex sm:text-[0.6875rem] sm:tracking-[0.1em] sm:px-5"
              href={consultationCta.href}
              onClick={close}
            >
              {consultationCta.label}
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </Link>
            <button
              ref={menuButtonRef}
              aria-controls="mobile-navigation"
              aria-expanded={open}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              className="grid size-11 shrink-0 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden motion-reduce:transition-none"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              {open ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div
          aria-hidden={!open}
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none xl:hidden ${open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}
          id="mobile-navigation"
          inert={!open}
        >
          <div className="min-h-0 overflow-hidden">
            <nav
              aria-label="Mobile navigation"
              className="border-t border-border px-4 pb-2 pt-2 sm:px-6"
            >
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {siteNavigation.map((item, index) => {
                  const active = pathname === item.href;
                  return (
                    <li className="border-b border-border last:border-0" key={item.id}>
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={`group flex min-h-12 items-center justify-between gap-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${active ? "text-foreground" : "text-foreground/70 hover:text-foreground"}`}
                        href={item.href}
                        onClick={close}
                        ref={index === 0 ? firstMenuLinkRef : undefined}
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className={`size-4 shrink-0 transition-[opacity,transform] duration-200 motion-reduce:transition-none ${active ? "opacity-100" : "opacity-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"}`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="px-4 pb-4 pt-2 sm:hidden">
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                href={consultationCta.href}
                onClick={close}
              >
                {consultationCta.label}
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
