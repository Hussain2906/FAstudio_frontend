'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import type { HomeDesignConsultationContent } from '@fs/cms-contracts';
import { ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Reveal } from './reveal';

const CAL_NAMESPACE = 'fs-studio-design-consultation';

function getCalLink(eventUrl: string) {
  try {
    const url = new URL(eventUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'cal.com' || url.username || url.password || url.hash) return null;
    const path = url.pathname.split('/').filter(Boolean);
    if (path.length < 2 || !path.every((segment) => /^[a-z0-9][a-z0-9_-]*$/i.test(segment))) return null;
    return path.join('/');
  } catch {
    return null;
  }
}

export function HomeDesignConsultationSection({ content }: { content: HomeDesignConsultationContent }) {
  const calLink = getCalLink(content.calcomUrl);

  return <section className="storefront-section scroll-mt-28 bg-background text-foreground" id="book-consultation">
    <div className="storefront-shell">
      <header className="mx-auto mb-8 max-w-3xl space-y-5 text-center sm:mb-12">
        <p className="type-caption text-muted-foreground">{content.eyebrow}</p>
        <h2 className="type-section-display text-balance text-foreground">{content.heading}</h2>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{content.description}</p>
      </header>
      <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
        <div className="min-w-0 p-5 sm:p-8 xl:p-10" data-testid="consultation-booking-panel">
          <StudioWordmark />
          {calLink ? <CalComScheduler calLink={calLink} eventUrl={content.calcomUrl} /> : <SchedulerFallback />}
        </div>
        <Reveal className="relative order-last min-h-[24rem] overflow-hidden border-t border-border bg-muted lg:order-none lg:min-h-0 lg:border-l lg:border-t-0">
          <div className="absolute inset-0" data-testid="consultation-image-panel">
            {content.consultationImage?.url ? <Image
              alt={content.consultationImageAlt}
              className="object-cover object-center"
              fill
              sizes="(min-width: 1024px) 43vw, 100vw"
              src={content.consultationImage.url}
            /> : <div aria-label="Consultation image placeholder" className="absolute inset-0 grid place-content-center gap-4 bg-muted p-8 text-center text-muted-foreground">
              <ImagePlus aria-hidden="true" className="mx-auto size-8" strokeWidth={1.2} />
              <div className="space-y-1"><p className="type-caption">Consultation image</p><p className="max-w-xs text-sm">Upload the studio workspace image in the Home Design Consultation editor.</p></div>
            </div>}
          </div>
        </Reveal>
      </div>
    </div>
  </section>;
}

function StudioWordmark() {
  return <div aria-label="FA Studio Interior Design" className="mb-6 flex items-center gap-3 text-foreground">
    <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full border border-primary/60 font-display text-xl leading-none">FS</span>
    <span><span className="block font-display text-2xl leading-none tracking-[-0.035em]">FA Studio</span><span className="type-caption mt-1 block text-[0.55rem] tracking-[0.28em] text-muted-foreground">Interior Design</span></span>
  </div>;
}

function SchedulerFallback({ eventUrl }: { eventUrl?: string }) {
  return <div className="grid min-h-72 place-items-center bg-muted/40 p-8 text-center">
    <div className="max-w-lg space-y-4">
      <h3 className="font-display text-2xl">The scheduler is unavailable</h3>
      <p className="text-sm text-muted-foreground">Open the Cal.com event page to arrange your consultation.</p>
      <a className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring" href={eventUrl ?? '/contact'} rel={eventUrl ? 'noopener noreferrer' : undefined} target={eventUrl ? '_blank' : undefined}>{eventUrl ? 'Book on Cal.com' : 'Contact the studio'}</a>
    </div>
  </div>;
}

function CalComScheduler({ calLink, eventUrl }: { calLink: string; eventUrl: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    let active = true;
    let api: Awaited<ReturnType<typeof getCalApi>> | undefined;
    const timeout = window.setTimeout(() => {
      if (active) setStatus((current) => current === 'loading' ? 'failed' : current);
    }, 20_000);

    const onReady = () => { if (active) setStatus('ready'); };
    const onFailed = () => { if (active) setStatus('failed'); };
    const onBookingSuccessful = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!detail || typeof detail !== 'object' || !('data' in detail) || !detail.data || typeof detail.data !== 'object') return;
      if (active) setBooked(true);
    };

    void getCalApi({ namespace: CAL_NAMESPACE }).then((cal) => {
      if (!active) return;
      api = cal;
      cal('on', { action: 'linkReady', callback: onReady });
      cal('on', { action: 'linkFailed', callback: onFailed });
      cal('on', { action: 'bookingSuccessfulV2', callback: onBookingSuccessful });

      const root = document.documentElement;
      const tokens = getComputedStyle(root);
      const token = (name: string) => tokens.getPropertyValue(name).trim();
      cal('ui', {
        theme: root.classList.contains('dark') ? 'dark' : 'light',
        layout: 'month_view',
        styles: {
          branding: { brandColor: token('--primary') },
          body: { background: token('--background') },
          enabledDateButton: { backgroundColor: token('--primary'), color: token('--primary-foreground') },
          disabledDateButton: { backgroundColor: token('--muted'), color: token('--muted-foreground') },
          availabilityDatePicker: { backgroundColor: token('--card'), color: token('--foreground') },
        },
      });
    }).catch(() => {
      if (active) setStatus('failed');
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      if (api) {
        api('off', { action: 'linkReady', callback: onReady });
        api('off', { action: 'linkFailed', callback: onFailed });
        api('off', { action: 'bookingSuccessfulV2', callback: onBookingSuccessful });
      }
    };
  }, []);

  return <div className="relative min-w-0 bg-background">
    {status === 'loading' ? <div aria-live="polite" className="absolute inset-0 z-10 grid place-items-center bg-muted/60 p-6 text-center text-sm text-muted-foreground">Loading Cal.com scheduler…</div> : null}
    {status === 'failed' ? <div className="absolute inset-0 z-10"><SchedulerFallback eventUrl={eventUrl} /></div> : null}
    <Cal calLink={calLink} namespace={CAL_NAMESPACE} config={{ layout: 'month_view' }} className="block w-full" style={{ width: '100%' }} />
    {booked ? <p aria-live="polite" className="absolute bottom-4 left-4 right-4 z-20 rounded-lg border border-border bg-card p-4 text-center text-sm text-foreground shadow-sm">Your consultation is confirmed. Cal.com will send the booking details.</p> : null}
    <div className="border-t border-border px-5 py-3 text-center"><a className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" href={eventUrl} rel="noopener noreferrer" target="_blank">Open scheduler in a new tab</a></div>
  </div>;
}
