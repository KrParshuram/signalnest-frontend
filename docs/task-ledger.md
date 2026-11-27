# Frontend task ledger

Status: **In progress**. A task is complete only after its acceptance checks pass.

## Phase 0 — Engineering foundation

- [ ] FE-001 — Next.js application shell, TypeScript and Tailwind setup. **Implemented; CI validation pending.**
- [ ] FE-002 — Design tokens, typography, spacing and accessible component conventions. **Initial neutral palette and page styling committed; full token system pending.**
- [ ] FE-003 — Typed API client, query client and organization-aware query keys. **Initial implementation committed; auth flow integration and tests pending.**
- [ ] FE-004 — Lint, typecheck, production build and CI. **CI workflow committed; first run in progress.**
- [ ] FE-005 — Responsive application shell and route-level loading/error boundaries. **Initial responsive entry screen committed; route boundaries pending.**

## Phase 1 — Identity and workspace

- [ ] FE-101 — Registration and login forms with server validation feedback.
- [ ] FE-102 — Session refresh and logout behavior.
- [ ] FE-103 — Organization creation and switching.
- [ ] FE-104 — First-brand onboarding flow.
- [ ] FE-105 — Role-aware navigation and empty states.

## Phase 2 — Feedback capture

- [ ] FE-201 — Feedback Inbox list with loading/empty/error states.
- [ ] FE-202 — Search, filters, sorting and pagination.
- [ ] FE-203 — Feedback detail and internal notes.
- [ ] FE-204 — Manual feedback form.
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
