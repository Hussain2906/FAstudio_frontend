# Storefront UI implementation instructions

Before creating or modifying any Storefront UI component, page, layout, or styling, read `DESIGN.md` in full. It is the authoritative design direction for the Storefront. Follow its luxury editorial visual identity, generated theme tokens, typography primitives, layout rules, responsive behavior, and accessibility standards.

Use the shared generated design-system package. Never introduce arbitrary brand colors, duplicate brand configuration, hardcoded font families, or unrelated spacing systems. Preserve React Server Components by default and use Client Components only when interaction or browser APIs require them.

Application routes, navigation destinations, and page existence are code-owned. The CMS may manage content only inside registered pages and components; never use CMS data to create, remove, reorder, or redirect application navigation.

Update `DESIGN.md` when an approved design-system rule changes. Do not modify Admin, Backend, Prisma, Neon, or Cloudinary while working on Storefront UI.


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
