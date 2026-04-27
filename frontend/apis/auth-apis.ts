import { API } from "../utils/http-client";

/**
 * Create backend session cookies from Firebase tokens.
 */
export async function createSession(payload: {
  idToken: string;
  refreshToken: string;
}) {
  return API.POST<void>("/api/auth/session", payload);
}

/**
 * Refresh access cookie using refresh cookie.
 */
export async function refreshSession() {
  return API.POST<void>("/api/auth/refresh");
}

/**
 * Logout and clear all auth cookies
 */
export async function logout() {
  return API.POST<void>("/api/auth/logout");
}

/**
 * Fetch current user profile from the backend
 */
export async function getCurrentUser() {
  return API.GET<{ uid: string; email?: string | null }>("/api/auth/me");
}
