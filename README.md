# Signalnest Frontend

Web application for Signalnest, the customer feedback intelligence and social-proof platform.

## Stack

- Next.js 15 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- TanStack Query 5
- Lucide icons

## Local development

Requirements: Node.js 22+ and npm.

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1`.
3. Install dependencies: `npm install`.
4. Start the app: `npm run dev`.

The frontend runs at `http://localhost:3000`.

## Current implementation

- Next.js application shell and product landing/workspace entry screen.
- Tailwind CSS setup.
- TanStack Query provider with server/client-safe QueryClient lifecycle.
- Typed API client with in-memory access token, cookie credentials, single-flight refresh and one retry after a 401.
- Query key factory that includes organization and brand context.

Authentication screens, onboarding, and the actual feedback workflows are not implemented yet. See [the task ledger](docs/task-ledger.md).

## Architecture

The frontend is a client of the Signalnest API. It must not own business authorization or duplicate domain rules. See [Frontend architecture](docs/architecture.md) and [API integration contract](docs/api-integration.md).
