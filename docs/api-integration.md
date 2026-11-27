# Frontend API integration contract

## API origin

Configure the API origin through a public frontend environment variable such as `NEXT_PUBLIC_API_BASE_URL`. It must point to the versioned API base and must never contain credentials.

## Authentication

- The API returns a short-lived access token after successful authentication.
- The refresh token is stored by the API in an HttpOnly cookie.
- Browser requests that refresh or use cookie-backed endpoints must include credentials.
- The frontend must not read or persist the refresh token in JavaScript storage.
- On an expired access token, refresh once, then retry the original request once. Avoid infinite refresh loops.
- Logout clears server-side refresh state and the cookie.

The final access-token storage strategy will be implemented and threat-reviewed in the authentication task; do not put tokens in localStorage by default.

## Organization context

Organization selection is explicit. Every organization-scoped query key and API request must include the selected organization context. The backend independently verifies membership and permissions.

## Query conventions

- Central typed API client.
- Central query key factory.
- Query keys include organization ID and brand ID when the result depends on them.
- Mutations invalidate only affected query families.
- Search/filter/sort state that should be shareable belongs in URL parameters.

## Response conventions

Success and error types mirror the backend contract. The UI must handle validation errors, authentication expiry, forbidden access, missing resources, rate limits and server failures distinctly.
