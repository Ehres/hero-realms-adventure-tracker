# React Standards

## Component Structure

- Use functional components.
- Keep components light and small.
- Strongly type `props`.
- Don't use `React.FC`.
- Only type `props` with `interface`.

## Server vs Client Components

- Server Components are the default (no directive needed).
- Add `"use client"` only when using hooks, event handlers, or browser APIs.
- Never fetch data in client components; fetch in Server Components or Server
  Actions.

## Separation

- Split into sub-components by responsibility.
- Move shared components outside the parent folder.
- Create private sub-components for single use (use `_components/` folder).
- Follow smart/dumb component pattern.

## State

- Delegate state and logic to a smart component.
- Declare calculated variables at the top (dumb component).
- Do not use default export.
- Return `null` if mandatory props are missing.
- One component per file (except tiny private components).
- Use Zustand only for ephemeral UI state (e.g., HP during combat).
- Database is the source of truth for persistent data.

## Style and Accessibility

- Think mobile-first.
- Use existing UI components (shadcn/ui, warcraftcn-ui).
- Use semantic HTML elements.
- Add appropriate ARIA attributes.
- Ensure keyboard navigation.
