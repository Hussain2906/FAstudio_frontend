# Storefront Design Direction

This document is the authoritative source of truth for the Storefront UI. Read it before creating or modifying any page, component, layout, or styling. The visual direction is luxury editorial interior architecture: warm, quiet, tactile, photography-first, and intentionally composed.

## Brand identity

The Storefront uses the shared configuration-driven palette:

- **Primary — Cacao:** authority, type emphasis, and considered contrast.
- **Secondary — Taupe:** restraint, supporting surfaces, and hierarchy.
- **Tertiary — Khaki:** calm editorial space and warm neutral atmosphere.

The canonical values live only in `packages/design-system/src/theme.config.ts`. The design-system package generates all 33 shades and semantic light/dark tokens. Never add brand HEX values to Storefront code, CSS, or components. Consume semantic classes such as `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, and `ring-ring`.

The palette is inspired by cacao, taupe, and khaki but should read as architectural neutrals rather than decorative color. Functional status colors remain separate from the brand palette.

## Visual principles

- Use luxury editorial typography, generous whitespace, and strong hierarchy.
- Let architectural photography carry visual weight; interface chrome should recede.
- Prefer asymmetric compositions, offset columns, overlaps, and varied image scales.
- Use sophisticated rounded geometry without making every element a card.
- Favor quiet borders and tonal surfaces over shadows, gradients, or decoration.
- Keep the composition contemporary and warm; avoid generic SaaS dashboards, dense grids, and loud effects.

The reference typeface is an inspiration only. Bodoni Moda is the selected display alternative, not a claim of exact font matching.

## Typography

Fonts are self-hosted and optimized through `next/font/google` in `src/app/layout.tsx`:

- `--font-display`: **Bodoni Moda**, used for architectural display headings.
- `--font-body`: **Manrope**, used for body copy, navigation, controls, and labels.

Do not hardcode font families in components. Use the global type primitives where possible:

| Primitive | Use |
| --- | --- |
| `.type-hero` | Hero or campaign display, one short statement |
| `.type-section-display` | Section-level editorial statement |
| `.type-page-heading` | Page title |
| `.type-subheading` | Introductory or supporting copy |
| `.type-caption` | Metadata, labels, and navigation context |
| `font-body` / `font-display` | Tailwind utility-level composition |

Display type uses lighter weights, compact leading, and restrained negative tracking. Body copy should remain readable, with comfortable line length and a minimum practical size of 14px. Use fluid `clamp()` sizing for editorial headings rather than breakpoint jumps.

## Fluid type scale

Use these as starting points, adjusting only when composition requires it:

- Hero: `clamp(3.5rem, 10vw, 9rem)`
- Section display: `clamp(2.75rem, 6vw, 6rem)`
- Page heading: `clamp(2.25rem, 4vw, 4.5rem)`
- Subheading: `clamp(1.125rem, 1.6vw, 1.5rem)`
- Body: `1rem` with approximately `1.6` line-height
- Caption/navigation: `0.6875rem`, uppercase, increased tracking

Use no more than three weights in a view. Keep display headings short and allow intentional line breaks when they improve the composition.

## Layout and spacing

Use a 4px base rhythm. The shared Storefront primitives are:

- `.storefront-shell`: centered content with responsive gutters and a 90rem maximum width.
- `.storefront-section`: fluid vertical section spacing.
- `--page-gutter`: responsive page inset.
- `--section-space`: responsive section rhythm.

Build mobile-first, then introduce asymmetry at larger widths. Use CSS grid for editorial columns, generous empty space, and controlled overlaps. Avoid arbitrary one-off spacing when a shared token or a nearby 4px multiple works. Keep text measure readable and prevent horizontal overflow.

## Image system

Images are the primary visual material. Use `next/image` with explicit responsive sizing, preserved aspect ratio, and meaningful alt text. Prepare image sources for future Cloudinary URLs without coupling presentation components to the backend.

Supported presentation patterns include:

- Large architectural photographs with wide or tall aspect ratios.
- Rounded editorial images using `.editorial-image`.
- Arched or custom geometry through an explicit reusable modifier, not scattered inline styles.
- Edge-to-edge photography sections.
- Floating and overlapping image/text compositions.

Do not stretch images. Use `object-fit: cover` only when the crop is intentional and preserve focal points with `object-position`. Use the subtle image reveal already defined by `.editorial-image`; respect reduced motion.

## Components and styling

Use shadcn/ui components and shared semantic tokens for buttons, forms, cards, dialogs, and navigation. Buttons should have clear default, hover, active, focus-visible, disabled, and loading states. Prefer pill geometry for primary calls to action and navigation where appropriate; use standard rounded geometry for content surfaces.

Use borders before shadows. Keep shadows soft and purposeful. Use `rounded-xl` or the generated radius tokens for image cards and larger panels. Never add hardcoded brand colors, arbitrary gradients, or duplicate palette configuration.

Keep React Server Components as the default. Use Client Components only for interaction or browser APIs, and keep business logic separate from presentation.

## Motion

Motion should feel quiet and physical:

- Use smooth, short hover transitions.
- Keep image reveals subtle.
- Avoid heavy animation libraries unless a real interaction requires one.
- Never make essential information depend on motion.
- Preserve visible focus states and support `prefers-reduced-motion: reduce`.

## Responsive behavior

- **Mobile:** single-column reading flow, full-width imagery, comfortable gutters, wrapped controls, and no intentional overlap that harms reading order.
- **Tablet:** introduce two-column relationships where content remains legible; keep imagery prominent.
- **Laptop/Desktop:** use asymmetry, offset content, overlaps, and expanded whitespace.
- **Large desktop:** cap the content shell, preserve readable measure, and avoid scaling every element indefinitely.

At every size, retain image focal points, readable contrast, usable controls, and a natural semantic DOM order.

## Accessibility

Target WCAG 2.2 AA:

- Use semantic HTML and one meaningful page heading.
- Maintain at least 4.5:1 contrast for normal text and 3:1 for large text and relevant UI boundaries.
- Give every image meaningful alt text, or empty alt text when genuinely decorative.
- Keep interactive targets usable on touch devices.
- Provide visible `:focus-visible` indicators.
- Make navigation and controls keyboard accessible.
- Do not communicate important state by color alone.
- Respect reduced motion and preserve readable line lengths.

## Correct and incorrect examples

Correct:

```tsx
<section className="storefront-section bg-background text-foreground">
  <div className="storefront-shell grid gap-8 lg:grid-cols-[1fr_0.7fr]">
    <h2 className="type-section-display">Quietly considered spaces.</h2>
    <p className="max-w-prose text-muted-foreground">A short editorial introduction.</p>
  </div>
</section>
```

Incorrect:

```tsx
<section className="bg-[#4D403A] p-[37px] text-white shadow-2xl">
  <h2 style={{ fontFamily: "Arial" }}>Generic section</h2>
</section>
```

The first example uses generated semantic tokens and reusable layout/type primitives. The second introduces hardcoded brand values, arbitrary spacing, a conflicting font, and excessive elevation.

## Guidance for future AI-generated sections

Before implementation, read this file and inspect existing Storefront components. Reuse the generated tokens and existing primitives. Start with the semantic content structure, then compose an editorial layout around the photography and text hierarchy. Validate mobile behavior, keyboard focus, contrast, reduced motion, and the production build. Do not invent new brand colors, typography systems, spacing systems, or duplicate configuration files.

**Every new Storefront section must be designed according to DESIGN.md, use generated theme variables, use reusable typography and layout tokens, and maintain the established luxury editorial visual identity.**

## Global Navbar reference

The global Navbar is the approved premium navigation pattern for every public Storefront page. It uses a thin serif brand identity on the left, clean Manrope navigation links in the center, and a Cacao semantic pill CTA with an arrow on the right. Keep the bar spacious, quiet, and aligned; do not turn it into a dense application toolbar.

The Navbar is code-owned and uses the typed configuration in `src/config/navigation.ts`. Do not read labels, URLs, order, visibility, or CTA destinations from CMS data. Use semantic `<header>` and `<nav>` elements, a meaningful brand link, and a real button for the mobile menu.

On mobile, preserve the brand identity and provide an accessible menu toggle with a labelled panel. Keyboard focus must remain visible, links must be reachable in DOM order, and closing behavior must not trap users. Use restrained transitions and respect reduced motion. The active page indicator is a subtle underline or semantic state, never a color-only signal.

Navbar colors must use generated semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, and `ring-ring`). Never hardcode Cacao or generated shade values.

## Routing and content ownership

Application routes, navigation, and page structures are defined in code. The CMS manages only content within registered pages and components. Administrators may edit headings, descriptions, images, button display text, media, section visibility, and permitted content ordering, but may not create routes, delete routes, reorder navigation, or change navigation destinations. CMS actions must use predefined destination keys or code-defined actions.
