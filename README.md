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

## Implemented capabilities

- Registration and login forms with server validation feedback.
- In-memory access token and HttpOnly refresh-cookie session restoration.
- Logout and protected workspace/onboarding navigation.
- Organization and first-brand onboarding.
- Feedback Inbox with search, brand, sentiment, topic and status filters.
- Cursor pagination and loading/empty/error states.
- Manual feedback capture with original content, author, source URL, publication date and topic tags.
- Feedback detail view with private internal notes and archive/restore controls.
- CSV upload preview, row-level validation, explicit confirmation and asynchronous import progress.
- Organization-aware TanStack Query keys and typed API client.

URL capture, date filters, sorting, AI insights, actions, testimonial studio and widget builder remain on the task ledger.

See [Frontend architecture](docs/architecture.md), [API integration contract](docs/api-integration.md), and [Task ledger](docs/task-ledger.md).
