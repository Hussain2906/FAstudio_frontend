export type SiteNavigationItem = {
  readonly id: string;
  readonly label: string;
  readonly href: `/${string}`;
  readonly children?: readonly SiteNavigationItem[];
};

export const siteNavigation = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'portfolio', label: 'Our Work', href: '/portfolio' },
  { id: 'process', label: 'The Process', href: '/process' },
  { id: 'contact', label: 'Contact', href: '/contact' },
] as const satisfies readonly SiteNavigationItem[];

export const consultationCta = {
  label: 'Book a Consultation',
  href: '/#book-consultation',
} as const;
