import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "@src/lib/api.ts";
import { useAuth } from "@src/lib/auth.tsx";
import { getFirebaseAuth, getUserRefreshToken } from "@src/lib/firebase.ts";

export function Login() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await cred.user.getIdToken();
      const refreshToken = getUserRefreshToken(cred.user);

      const res = await fetch(`${getApiBaseUrl()}/auth/session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, refreshToken }),
      });

      if (!res.ok) {
        const text = await res.text();
        let detail = text || res.statusText;
        try {
          const j = JSON.parse(text) as { detail?: unknown };
          if (typeof j.detail === "string") detail = j.detail;
        } catch {
          /* keep detail */
        }
        throw new Error(detail || `Session failed (${res.status})`);
      }

      await refreshSession();
      await signOut(auth);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10 sm:max-w-lg">
        <div className="rounded-2xl border border-[--gray-6] bg-[--color-panel-solid] p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            {error ? (
              <p
                className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={loading}
              onClick={() => void signInWithGoogle()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[--gray-7] bg-[--gray-2] px-4 py-2.5 text-sm font-semibold text-[--gray-12] transition hover:bg-[--gray-3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Continue with Google"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-[--accent-11]">Welcome back</p>
          <h1 className="text-3xl font-bold tracking-tight text-[--gray-12] sm:text-4xl">
            Sign in to continue your savings journey
          </h1>
          <p className="text-[--gray-11]">
            Access your loan portfolio, compare prepayment scenarios, and track
            how much interest you can still save.
          </p>
        </div>
      </div>
    </section>
  );
}
