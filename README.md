# Signalnest Frontend

Web application for Signalnest, the customer feedback intelligence and social-proof platform.

## Product experience

The frontend supports onboarding, organization and brand context, a unified feedback inbox, AI insights, actions, testimonial approval, Wall of Love and widget configuration.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- TanStack Query for server state
- Accessible component primitives

## Architecture

The frontend is a client of the Signalnest API. It must not own business authorization or duplicate domain rules. See [Frontend architecture](docs/architecture.md), [API integration contract](docs/api-integration.md), and [Task ledger](docs/task-ledger.md).

## Engineering rules

1. Server state belongs in TanStack Query; transient view state belongs in local state or a small UI store.
2. Query keys include the active organization and brand scope where relevant.
3. All API calls go through a typed API client.
4. Loading, empty, error and success states are required for data-driven screens.
5. Never trust hidden UI controls as authorization; the API enforces permissions.
6. Do not display AI-generated claims without their evidence and confidence context.
7. Public testimonial content must reflect backend approval and publication state.
