import { useState } from "react";
import { Link } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-medium text-[--accent-11]">Welcome back</p>
          <h1 className="text-3xl font-bold tracking-tight text-[--gray-12] sm:text-4xl">
            Sign in to continue your savings journey
          </h1>
          <p className="max-w-md text-[--gray-11]">
            Access your loan portfolio, compare prepayment scenarios, and track
            how much interest you can still save.
          </p>
          <Link
            to="/"
            className="inline-block text-sm font-medium text-[--accent-11] hover:underline"
          >
            ← Back to home
          </Link>
        </div>

        <div className="rounded-2xl border border-[--gray-6] bg-[--color-panel-solid] p-6 shadow-sm sm:p-8">
          <form
            className="space-y-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[--gray-12]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[--gray-7] bg-[--gray-2] px-3 py-2.5 text-sm text-[--gray-12] ring-0 transition outline-none placeholder:text-[--gray-10] focus:border-[--accent-8]"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[--gray-12]"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-[--accent-11] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-[--gray-7] bg-[--gray-2] px-3 py-2.5 text-sm text-[--gray-12] ring-0 transition outline-none placeholder:text-[--gray-10] focus:border-[--accent-8]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[--accent-9] px-4 py-2.5 text-sm font-semibold text-[--accent-contrast] transition hover:bg-[--accent-10]"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
