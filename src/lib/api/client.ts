export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export class ApiError extends Error {
  constructor(public status: number, public body: ApiErrorBody) {
    super(body.message || "The request could not be completed.");
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function resolveUrl(path: string) {
  if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function restoreAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(resolveUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { accessToken?: string };
        if (!data.accessToken) return null;
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retryOnUnauthorized?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, retryOnUnauthorized = true, headers, ...requestOptions } = options;

  const execute = (token: string | null) => {
    const requestHeaders = new Headers(headers);
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (body !== undefined && !isFormData && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

    return fetch(resolveUrl(path), {
      ...requestOptions,
      credentials: "include",
      headers: requestHeaders,
      ...(body === undefined ? {} : { body: isFormData ? body as FormData : JSON.stringify(body) }),
    });
  };

  let response = await execute(accessToken);
  if (response.status === 401 && retryOnUnauthorized && !path.startsWith("/auth/")) {
    const refreshed = await restoreAccessToken();
    if (refreshed) response = await execute(refreshed);
    else setAccessToken(null);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: ApiErrorBody } | null;
    throw new ApiError(response.status, payload?.error ?? {
      code: "HTTP_ERROR",
      message: response.statusText || "The request could not be completed.",
    });
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
