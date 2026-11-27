# Frontend architecture

## Application boundaries

Next.js is the presentation and web delivery layer. The Express API remains the source of truth for identity, permissions, business data and workflows. The frontend must not connect directly to PostgreSQL or Redis.

## Feature organization

Organize code by product capability rather than by file type alone:

- `features/auth`
- `features/onboarding`
- `features/organizations`
- `features/brands`
- `features/feedback`
- `features/insights`
- `features/testimonials`
- `features/widgets`

Shared UI, API client, query client, design tokens and application shell live in shared directories.

## State management

- TanStack Query: API data, caching, mutations, invalidation and background refetch.
- Local React state: form drafts, open dialogs, temporary selections.
- Global UI state: only cross-route ephemeral state that cannot reasonably live in URL or component state.
- URL search parameters: shareable filters, sorting, pagination and selected views.

Query keys must include organization and brand scope to prevent data from one workspace appearing in another workspace after a context switch.

## UX requirements

Every asynchronous view has loading, empty, error and populated states. Mutations expose pending and failure states and prevent accidental duplicate submissions. Destructive actions require confirmation. Forms provide inline validation and preserve user input after recoverable errors.

## Accessibility and visual quality

- Semantic HTML and keyboard-operable controls.
- Visible focus states and sufficient contrast.
- Responsive layouts from mobile through desktop.
- Avoid decorative charts that do not support a product decision.
- Prefer clear hierarchy, useful density and restrained visual treatment.
