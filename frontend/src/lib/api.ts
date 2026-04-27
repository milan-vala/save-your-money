const rawBase = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE = rawBase?.replace(/\/$/, "");

let authRetry = false;

export function getApiBaseUrl(): string {
  if (!API_BASE) {
    throw new Error("VITE_API_URL is not set");
  }
  return API_BASE;
}

/**
 * Fetch against the API with cookies. On 401, attempts one POST /auth/refresh then retries
 * (except for auth session/refresh endpoints).
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const skipRefresh =
    path.includes("/auth/refresh") || path.includes("/auth/session");

  const res = await fetch(url, { ...init, credentials: "include" });
  if (res.status !== 401 || skipRefresh || authRetry) {
    return res;
  }

  const refreshRes = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!refreshRes.ok) {
    return res;
  }

  authRetry = true;
  try {
    return await fetch(url, { ...init, credentials: "include" });
  } finally {
    authRetry = false;
  }
}
