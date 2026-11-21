import Image from 'next/image';
import Link from 'next/link';
import type { AboutSectionContent } from '@fs/cms-contracts';

type Props = { type: string; content: AboutSectionContent };

function safeHref(value: string) {
  return value.startsWith('/') && !value.startsWith('//') || /^https?:\/\//i.test(value) ? value : undefined;
}

function EditorialImage({ content, className = '' }: { content: AboutSectionContent; className?: string }) {
  return <div className={`relative min-h-72 overflow-hidden bg-muted sm:min-h-96 ${className}`}>
    {content.image?.url ? <Image alt={content.imageAlt} className="object-cover" fill sizes="(min-width: 1024px) 50vw, 100vw" src={content.image.url} /> : <div aria-label="Image can be added in About page settings" className="absolute inset-0 grid place-items-center border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Image can be added in About page settings</div>}
  </div>;
}

function ItemList({ items, numbered = false }: { items: AboutSectionContent['items']; numbered?: boolean }) {
  return <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">{items.map((item, index) => <li className="border-t border-border py-6 sm:px-5 sm:first:pl-0" key={item.id}>{item.image?.url ? <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-muted"><Image alt={item.imageAlt} className="object-contain" fill sizes="(min-width: 1024px) 22vw, 50vw" src={item.image.url} /></div> : null}<p className="type-caption text-muted-foreground">{numbered ? item.value || String(index + 1).padStart(2, '0') : item.value}</p><h3 className="mt-3 font-display text-2xl tracking-tight">{item.title}</h3>{item.description ? <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{item.description}</p> : null}{safeHref(item.href) ? <a className="mt-3 inline-block text-sm underline underline-offset-4" href={safeHref(item.href)} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} target={item.href.startsWith('http') ? '_blank' : undefined}>Read more</a> : null}</li>)}</ol>;
}

export function AboutSection({ type, content }: Props) {
  if (["about.metrics", "about.press", "about.projects", "about.testimonials"].includes(type) && content.items.length === 0) return null;
  if (type === 'about.hero') return <section aria-labelledby="about-hero-heading" className="relative grid min-h-[68svh] overflow-hidden bg-primary text-primary-foreground lg:min-h-[76svh] lg:grid-cols-[0.8fr_1.2fr]">
    <div className="relative min-h-72 lg:order-2"><EditorialImage content={content} className="absolute inset-0 min-h-0 bg-primary/40" /><div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent lg:bg-gradient-to-r lg:from-primary/50 lg:via-transparent lg:to-transparent" /></div>
    <div className="relative z-10 flex flex-col justify-center px-[var(--page-gutter)] py-16 sm:py-24 lg:py-28"><p className="type-caption text-primary-foreground/75">{content.eyebrow}</p><h1 className="type-hero mt-6 max-w-[10ch]" id="about-hero-heading">{content.heading}</h1><p className="mt-7 max-w-lg text-base leading-7 text-primary-foreground/85 sm:text-lg">{content.description}</p></div>
  </section>;

  if (type === 'about.designer') return <section aria-labelledby="designer-heading" className="storefront-section bg-background"><div className="storefront-shell grid items-center gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-20"><EditorialImage content={content} className="aspect-[4/5] max-h-[44rem] bg-secondary" /><div className="max-w-2xl py-4"><p className="type-caption text-muted-foreground">{content.eyebrow}</p><p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{content.role}</p><h2 className="type-section-display mt-3" id="designer-heading">{content.designerName}</h2><p className="mt-6 whitespace-pre-line text-base leading-7 text-muted-foreground">{content.biography}</p>{content.quote ? <blockquote className="mt-8 border-l border-primary pl-5 font-display text-2xl italic leading-snug">“{content.quote}”</blockquote> : null}</div></div></section>;

  if (type === 'about.metrics') return <section aria-labelledby="about-metrics-heading" className="storefront-section bg-muted"><div className="storefront-shell"><p className="type-caption text-muted-foreground">{content.eyebrow}</p><h2 className="type-section-display mt-4" id="about-metrics-heading">{content.heading}</h2><div className="mt-10"><ItemList items={content.items} /></div></div></section>;

  if (type === 'about.studio') return <section aria-labelledby="about-studio-heading" className="storefront-section bg-primary text-primary-foreground"><div className="storefront-shell grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20"><div className="max-w-2xl"><p className="type-caption text-primary-foreground/70">{content.eyebrow}</p><h2 className="type-section-display mt-5" id="about-studio-heading">{content.heading}</h2><p className="mt-6 text-base leading-7 text-primary-foreground/85">{content.description}</p></div><EditorialImage content={content} className="aspect-[4/3] bg-background/10" /></div></section>;

  if (type === 'about.values') return <section aria-labelledby="about-values-heading" className="storefront-section bg-background"><div className="storefront-shell"><p className="type-caption text-muted-foreground">{content.eyebrow}</p><h2 className="type-section-display mt-4" id="about-values-heading">{content.heading}</h2><div className="mt-10"><ItemList items={content.items} /></div></div></section>;

  if (type === 'about.process') return <section aria-labelledby="about-process-heading" className="storefront-section bg-muted"><div className="storefront-shell"><div className="max-w-3xl"><p className="type-caption text-muted-foreground">{content.eyebrow}</p><h2 className="type-section-display mt-4" id="about-process-heading">{content.heading}</h2>{content.description ? <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{content.description}</p> : null}</div><div className="mt-12"><ItemList items={content.items} numbered /></div></div></section>;

  if (type === 'about.press') return <section aria-labelledby="about-press-heading" className="storefront-section bg-background"><div className="storefront-shell"><p className="type-caption text-muted-foreground">{content.eyebrow}</p><h2 className="type-section-display mt-4" id="about-press-heading">{content.heading}</h2><div className="mt-8"><ItemList items={content.items} /></div></div></section>;

  if (type === 'about.projects') return <section aria-labelledby="about-projects-heading" className="storefront-section bg-background"><div className="storefront-shell"><div className="max-w-3xl"><p className="type-caption text-muted-foreground">{content.eyebrow}</p><h2 className="type-section-display mt-4" id="about-projects-heading">{content.heading}</h2>{content.description ? <p className="mt-5 text-base leading-7 text-muted-foreground">{content.description}</p> : null}</div><div className="mt-10"><ItemList items={content.items} /></div></div></section>;

  if (type === 'about.testimonials') return <section aria-labelledby="about-testimonials-heading" className="storefront-section bg-muted"><div className="storefront-shell"><p className="type-caption text-muted-foreground">{content.eyebrow}</p><h2 className="type-section-display mt-4" id="about-testimonials-heading">{content.heading}</h2><div className="mt-8"><ItemList items={content.items} /></div></div></section>;

  if (type === 'about.closing') return <section aria-labelledby="about-closing-heading" className="relative isolate overflow-hidden bg-primary text-primary-foreground"><div className="absolute inset-0 -z-10"><EditorialImage content={content} className="size-full min-h-0 bg-primary" /><div className="absolute inset-0 bg-primary/65" /></div><div className="storefront-shell storefront-section"><p className="type-caption text-primary-foreground/75">{content.eyebrow}</p><h2 className="type-section-display mt-5 max-w-3xl" id="about-closing-heading">{content.heading}</h2><p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/85">{content.description}</p>{content.ctaLabel && safeHref(content.ctaUrl) ? <Link className="mt-8 inline-flex min-h-11 items-center rounded-full bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" href={safeHref(content.ctaUrl)!}>{content.ctaLabel}</Link> : null}</div></section>;

  return null;
}
