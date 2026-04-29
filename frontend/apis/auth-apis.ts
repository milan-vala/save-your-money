import { API } from "@src/utils/http-client";

export async function createSession(payload: {
  idToken: string;
  refreshToken: string;
}) {
  return API.POST<void>("/api/auth/session", payload);
}

export async function refreshSession() {
  return API.POST<void>("/api/auth/refresh");
}

export async function logout() {
  return API.POST<void>("/api/auth/logout");
}

export async function getCurrentUser() {
  return API.GET<{ uid: string; email?: string | null }>("/api/auth/me");
}
