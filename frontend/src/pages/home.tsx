import { Link } from "react-router-dom";

export function Home() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
              <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[--accent-4] blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
                <p className="inline-flex rounded-full border border-[--accent-7] bg-[--accent-3] px-3 py-1 text-xs font-semibold text-[--accent-11]">
            AI-Powered Loan Intelligence
          </p>

               <h1 className="text-4xl leading-tight font-bold tracking-tight text-[--gray-12] sm:text-5xl">
            Your loans are costing you more than you think. Let&apos;s fix that.
          </h1>

          <p className="max-w-xl text-base text-[--gray-11] sm:text-lg">
            Track every loan. Reveal hidden costs. Save real money.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
  <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[--accent-9] px-5 py-3 text-sm font-semibold text-[--accent-contrast] transition hover:bg-[--accent-10]"
            >
              Get started
                 <span aria-hidden>→</span>
                  </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-[--gray-7] bg-[--color-panel-solid] px-5 py-3 text-sm font-medium text-[--gray-12] transition hover:bg-[--gray-3]"
            >
              Explore features
            </a>
          </div>
        </div>

        <div
          id="features"
          className="rounded-2xl border border-[--gray-6] bg-[--color-panel-solid] p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-semibold text-[--gray-12]">
            Why users love it
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[--gray-6] bg-[--gray-2] p-4">
              <p className="text-sm font-semibold">Multi-loan tracking</p>
              <p className="mt-1 text-sm text-[--gray-11]">
                Manage home, car, personal, and credit loans in one view.
              </p>
            </div>
            <div className="rounded-xl border border-[--gray-6] bg-[--gray-2] p-4">
              <p className="text-sm font-semibold">Hidden cost detection</p>
              <p className="mt-1 text-sm text-[--gray-11]">
                See total interest paid and uncover expensive borrowing
                patterns.
              </p>
            </div>
            <div className="rounded-xl border border-[--gray-6] bg-[--gray-2] p-4">
              <p className="text-sm font-semibold">Prepayment simulation</p>
              <p className="mt-1 text-sm text-[--gray-11]">
                Compare scenarios and estimate savings from early repayment.
              </p>
            </div>
            <div className="rounded-xl border border-[--gray-6] bg-[--gray-2] p-4">
              <p className="text-sm font-semibold">Actionable insights</p>
              <p className="mt-1 text-sm text-[--gray-11]">
                Get clear recommendations to reduce interest burden faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
