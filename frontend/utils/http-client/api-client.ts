import httpClient from "./fetch-instance";

export async function GET<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<T> {
  let url = endpoint;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return httpClient.request<T>(url, {
    method: "GET",
  }) as Promise<T>;
}

export async function POST<T = unknown>(
  endpoint: string,
  payload?: unknown
): Promise<T> {
  const body =
    payload === undefined
      ? undefined
      : payload instanceof FormData
        ? payload
        : JSON.stringify(payload);
  return httpClient.request<T>(endpoint, {
    method: "POST",
    body,
  }) as Promise<T>;
}

export async function PUT<T = unknown>(
  endpoint: string,
  payload?: unknown
): Promise<T> {
  return httpClient.request<T>(endpoint, {
    method: "PUT",
    body: payload ? JSON.stringify(payload) : undefined,
  }) as Promise<T>;
}

export async function PATCH<T = unknown>(
  endpoint: string,
  payload?: unknown
): Promise<T> {
  return httpClient.request<T>(endpoint, {
    method: "PATCH",
    body: payload ? JSON.stringify(payload) : undefined,
  }) as Promise<T>;
}

export async function DELETE<T = unknown>(endpoint: string): Promise<T> {
  return httpClient.request<T>(endpoint, {
    method: "DELETE",
  }) as Promise<T>;
}
