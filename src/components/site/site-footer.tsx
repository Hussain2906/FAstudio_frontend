import { getGlobalComponentDefinition, GLOBAL_FOOTER_TYPE, GLOBAL_SITE_LOGO_TYPE, footerDefaultContent, type FooterContent, type SiteLogoContent, type FooterLink } from '@fs/cms-contracts';
import Image from 'next/image';
import Link from 'next/link';
import { PinterestMark } from './footer-social-mark';

async function getFooter(): Promise<FooterContent> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return footerDefaultContent;
    const response = await fetch(`${base.replace(/\/$/, '')}/cms/public/components/${GLOBAL_FOOTER_TYPE}`, { next: { revalidate: 60 } });
    if (!response.ok) return footerDefaultContent;
    const result = await response.json() as { content?: unknown };
    const definition = getGlobalComponentDefinition(GLOBAL_FOOTER_TYPE);
    if (definition?.validate(result.content)) return result.content as FooterContent;
    return footerDefaultContent;
  } catch { return footerDefaultContent; }
}

function isRemovedPage(href: string) {
  return /^\/journal(?:\/|[?#]|$)/.test(href);
}

function Destination({ item }: { item: FooterLink }) {
  if (!item.enabled || !item.href) return null;
  const external = /^https?:\/\//i.test(item.href);
  return external ? <a className="footer-link" href={item.href} rel="noopener noreferrer" target="_blank">{item.label}</a> : <Link className="footer-link" href={item.href}>{item.label}</Link>;
}

export async function SiteFooter() {
  const content = await getFooter();
  if (!content.enabled) return null;
  let logo = content.logo;
  if (!logo && process.env.NEXT_PUBLIC_API_URL) {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
      const response = await fetch(`${base}/cms/public/components/${GLOBAL_SITE_LOGO_TYPE}`, { next: { revalidate: 60 } });
      if (response.ok) {
        const result = await response.json() as { content?: SiteLogoContent };
        logo = result.content?.image ?? null;
      }
    } catch { /* The footer wordmark remains available if the global logo is unavailable. */ }
  }
  return <footer className="site-footer" style={content.background?.url ? { backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(--primary) 88%, transparent), color-mix(in srgb, var(--primary) 70%, transparent)), url("${content.background.url.replaceAll('"', '%22')}")` } : undefined}>
    <div aria-hidden="true" className="site-footer-wash" />
    <div className="site-footer-content storefront-shell">
      <section className="footer-brand" aria-label="About the studio">
        {logo?.url ? <Link aria-label={content.brandName} href="/"><Image alt={content.brandName} className="footer-logo" height={56} src={logo.url} width={160} /></Link> : <Link className="footer-wordmark" href="/">{content.brandName}</Link>}
        <p className="footer-subtitle">{content.brandSubtitle}</p><p className="footer-description">{content.description}</p>
        <nav aria-label="Social media" className="footer-socials">{content.socials.filter(s=>s.enabled && s.href).map(s=>{return <a aria-label={s.platform} href={s.href} key={s.id} rel="noopener noreferrer" target="_blank">{s.platform==='Pinterest'?<PinterestMark/>:<SocialIcon name={s.platform}/>}</a>})}</nav>
      </section>
      <nav aria-label="Explore" className="footer-column"><h2>{content.exploreHeading}</h2>{content.explore.filter(item=>!isRemovedPage(item.href)).map(item=><Destination item={item} key={item.id}/>)}</nav>
      <nav aria-label="Services" className="footer-column"><h2>{content.servicesHeading}</h2>{content.services.filter(item=>!isRemovedPage(item.href)).map(item=><Destination item={item} key={item.id}/>)}</nav>
      <section className="footer-column"><h2>Contact</h2>{content.location?<p>{content.location}</p>:null}{content.email?<a className="footer-link" href={`mailto:${content.email}`}>{content.email}</a>:null}{content.phone?<a className="footer-link" href={`tel:${content.phone.replace(/[^+\d]/g,'')}`}>{content.phone}</a>:null}</section>
    </div>
    <div className="footer-bottom storefront-shell"><span>{content.copyright} {new Date().getFullYear()}</span><nav aria-label="Legal">{content.privacyHref?<Destination item={{id:'privacy',label:'Privacy Policy',href:content.privacyHref,enabled:true}}/>:null}{content.termsHref?<Destination item={{id:'terms',label:'Terms of Use',href:content.termsHref,enabled:true}}/>:null}</nav></div>
  </footer>;
}

function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    Instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z',
    YouTube: 'M23 7.1a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9A3 3 0 0 0 3.1 19c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9ZM9.5 15.5v-7l6 3.5-6 3.5Z',
    LinkedIn: 'M5.2 3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3.3 9h3.8v12H3.3Zm6.2 0h3.6v1.6h.1a4 4 0 0 1 3.6-2c3.8 0 4.5 2.5 4.5 5.7V21h-3.8v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.5Z',
  };
  return <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d={paths[name] ?? ''}/></svg>;
}
