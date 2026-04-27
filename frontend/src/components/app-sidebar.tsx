import { Link } from "react-router-dom";

export function AppSidebar() {
  return (
    <aside className="h-fit rounded-2xl border border-[--gray-6] bg-[--color-panel-solid] p-4 shadow-sm sm:p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[--gray-11] uppercase">
            Loan Accounts
          </p>
          <p className="mt-2 text-sm text-[--gray-11]">
            No loan accounts yet. Create one to start tracking interest, EMI,
            and savings opportunities.
          </p>
        </div>

        <Link
          to="/dashboard/loan-accounts/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-[--accent-9] px-4 py-2.5 text-sm font-semibold text-[--accent-contrast] transition hover:bg-[--accent-10]"
        >
          Create Loan Account
        </Link>
      </div>
    </aside>
  );
}
