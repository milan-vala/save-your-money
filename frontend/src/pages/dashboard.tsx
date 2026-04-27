import { Link } from "react-router-dom";

export function Dashboard() {
  return (
    <section className="py-2">
      <div className="space-y-6">
        <div className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-6 sm:p-8">
          <p className="text-sm font-medium text-[--accent-11]">
            Loan Accounts
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[--gray-12] sm:text-3xl">
            No loan accounts present
          </h1>
          <p className="mt-3 text-[--gray-11]">
            Create your first loan account to start tracking EMI breakdown,
            outstanding balance, and savings opportunities.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/loan-accounts/new"
              className="inline-flex items-center justify-center rounded-lg bg-[--accent-9] px-5 py-3 text-sm font-semibold text-[--accent-contrast] transition hover:bg-[--accent-10]"
            >
              Create Loan Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
