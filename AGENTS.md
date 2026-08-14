# Bristol Inn agent guide

Small-inn content and booking website. Keep this file short; load the linked docs only when a task touches their subject.

## Before changing code

- Read `docs/architecture-decisions.md` for integrations, data ownership, deployment, security, or structural changes.
- Read `docs/product-rules.md` for rooms, availability, booking, content, routes, or guest-facing behavior.
- Use the live code and tests as the source of truth when old prose conflicts with implementation.
- Ask before departing from these rules or changing a documented decision.

## Engineering rules

- Prefer Astro's static-first model and fast loading on poor connections.
- Maintain SEO, accessibility, privacy, and web-security fundamentals.
- Use strict TypeScript. Wrap external services behind `src/lib/` modules.
- Prefer composable components over configuration-heavy components.
- Use the Astro CLI for initial configuration where possible; apply overrides afterward.
- Install packages with `npm install`; do not hand-edit dependency versions.
- Preserve existing brace style; one-line conditionals are the only optional exception.

## UI rules

- Compose Tailwind classes for most styling; reserve global CSS for resets/tokens and rare shared needs.
- Build mobile-first with `tablet` and `desktop` breakpoints.
- Use a 6-column mobile and 8-column desktop grid where layout calls for a grid; prefer grid/flex over fixed or percentage sizing.
- Reuse primitives in `src/components/ui/` (for example TextStyle, Button, ButtonLink, and form fields).

## Safety

- Never modify `.env`, `.env.local`, `.dev.vars`, or the Studio `.env`.
- Git is read-only unless the user explicitly authorizes staging, committing, or pushing.
