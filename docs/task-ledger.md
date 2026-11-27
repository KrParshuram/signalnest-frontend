# Frontend task ledger

Status: **In progress**. Tasks are checked off only after their acceptance criteria pass.

## Phase 0 — Engineering foundation

- [x] FE-001 — Next.js application shell, TypeScript and Tailwind setup. **CI typecheck and production build passed.**
- [ ] FE-002 — Design tokens, typography, spacing and accessible component conventions. **Initial styling committed; full token system and accessibility review pending.**
- [x] FE-003 — Typed API client, query client and organization-aware query keys. **Typecheck and build passed.**
- [ ] FE-004 — Lint, typecheck, production build and CI. **Typecheck/build CI passed; lint and dedicated frontend tests pending.**
- [ ] FE-005 — Responsive application shell and route-level loading/error boundaries. **Responsive auth, onboarding, inbox and detail views committed; full route-boundary and viewport review pending.**

## Phase 1 — Identity and workspace

- [x] FE-101 — Registration and login forms with server validation feedback. **Implemented and CI-validated.**
- [x] FE-102 — Session refresh and logout behavior. **HttpOnly refresh-cookie restoration, in-memory access token and logout implemented.**
- [ ] FE-103 — Organization creation and switching. **Organization creation and profile loading implemented; switching between multiple organizations pending.**
- [ ] FE-104 — First-brand onboarding flow. **Organization and first brand are created together; business-type/source-selection and import steps remain.**
- [ ] FE-105 — Role-aware navigation and empty states. **Role-aware create controls and inbox empty states implemented; full navigation/permission review pending.**

## Phase 2 — Feedback capture

- [x] FE-201 — Feedback Inbox list with loading/empty/error states. **Implemented and CI-validated.**
- [ ] FE-202 — Search, filters, sorting and pagination. **Search, brand, sentiment, topic and status filters plus cursor pagination implemented; date filters and sorting remain.**
- [x] FE-203 — Feedback detail and internal notes. **Implemented and CI-validated.**
- [x] FE-204 — Manual feedback form. **Original content, brand, source URL, author, publication date and topic tags supported.**
- [ ] FE-205 — CSV import preview and progress.
- [ ] FE-206 — URL capture flow.

## Phase 3 — Intelligence and social proof

- [ ] FE-301 — Overview metrics and useful trend visualizations.
- [ ] FE-302 — Topic and insight evidence views.
- [ ] FE-401 — Testimonial approval and editing workflow.
- [ ] FE-402 — Wall of Love and widget builder.
- [ ] FE-403 — Embed instructions and publish status.

## Definition of done

- Acceptance criteria are met.
- Responsive and keyboard-accessible behavior is checked.
- Loading, empty, error and populated states exist.
- API failures are handled without losing form input.
- Lint/typecheck/build pass.
- No fake metrics are presented as live business data.
- The relevant task ledger entry is updated with verification evidence.
