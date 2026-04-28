import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../../apis/auth-apis";
import { useAuth } from "@src/lib/auth.tsx";
import { getFirebaseAuth, getUserRefreshToken } from "@src/lib/firebase.ts";
import { usePersistedAppTheme } from "@src/lib/use-persisted-app-theme.ts";
import googleLogo from "@src/assets/google-logo-48.png";
import brandLogoDark from "@src/assets/logo-dark.jpg";
import brandLogoLight from "@src/assets/logo-light.png";

export function Login() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const { isDark, toggleTheme } = usePersistedAppTheme();
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

      await createSession({ idToken, refreshToken });
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
    <section
      className={`relative isolate min-h-screen overflow-hidden px-4 py-14 sm:px-6 sm:py-20 ${
        isDark ? "bg-slate-900/90" : "bg-[--gray-2]/40"
      }`}
    >
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition ${
            isDark
              ? "border-white/20 bg-slate-900/75 text-white hover:bg-slate-800"
              : "border-slate-300 bg-white/85 text-slate-700 hover:bg-white"
          }`}
        >
          {isDark ? (
            <Sun aria-hidden size={18} strokeWidth={1.75} />
          ) : (
            <Moon aria-hidden size={18} strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 -left-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl sm:h-72 sm:w-72" />
      </div>

      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        <div className="mb-8 flex justify-center sm:mb-10">
          <div
            className={`rounded-[2rem] p-2 shadow-lg ${
              isDark
                ? "border border-cyan-300/30 bg-slate-900/70"
                : "border border-slate-300/70 bg-white/85"
            }`}
          >
            <img
              src={isDark ? brandLogoDark : brandLogoLight}
              alt="Save Your Money"
              className="h-24 w-auto rounded-[1.5rem] sm:h-28"
            />
          </div>
        </div>

        <div
          className={`rounded-3xl p-6 backdrop-blur-xl sm:p-8 ${
            isDark
              ? "border border-white/15 bg-slate-800/55 shadow-xl"
              : "border border-white/30 bg-white/60 shadow-[0_-10px_24px_rgba(15,23,42,0.08),0_12px_28px_rgba(15,23,42,0.1)]"
          }`}
        >
          <div className="space-y-3 text-center">
            <p
              className={`text-sm font-medium ${
                isDark ? "text-white/90" : "text-[--accent-11]"
              }`}
            >
              Welcome back
            </p>
            <h1
              className={`text-3xl font-bold tracking-tight sm:text-4xl ${
                isDark ? "text-white" : "text-[--gray-12]"
              }`}
            >
              Sign in to continue your savings journey
            </h1>
            <p className={isDark ? "text-white/85" : "text-[--gray-11]"}>
              Access your loan portfolio, compare prepayment scenarios, and
              track how much interest you can still save.
            </p>
          </div>

          <div className="mt-8 space-y-4">
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
              className={`flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isDark
                  ? "border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  : "border border-[#d0d7e7] bg-white text-[#111827] hover:bg-[#f8fafc]"
              }`}
            >
              <img
                src={googleLogo}
                alt=""
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
              />
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
