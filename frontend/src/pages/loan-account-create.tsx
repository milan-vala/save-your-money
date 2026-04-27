import { useState } from "react";
import { Link } from "react-router-dom";

export function LoanAccountCreate() {
  const [accountName, setAccountName] = useState("");
  const [repaymentPdf, setRepaymentPdf] = useState<File | null>(null);
  const [termsPdf, setTermsPdf] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitted(false);

    if (!accountName.trim()) {
      setError("Account name is required.");
      return;
    }
    if (!repaymentPdf) {
      setError("Loan Repayment Schedule PDF is required.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <section className="py-2">
      <div className="rounded-2xl border border-[--gray-6] bg-[--color-panel-solid] p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[--accent-11]">
              Loan Accounts
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[--gray-12] sm:text-3xl">
              Create Loan Account
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-[--gray-11] hover:text-[--gray-12]"
          >
            Back to Dashboard
          </Link>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="account-name"
              className="mb-2 block text-sm font-medium text-[--gray-12]"
            >
              Account Name
            </label>
            <input
              id="account-name"
              type="text"
              required
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="e.g. SBI Home Loan - Mumbai Flat"
              className="w-full rounded-lg border border-[--gray-7] bg-[--gray-2] px-3 py-2.5 text-sm text-[--gray-12] outline-none placeholder:text-[--gray-10] focus:border-[--accent-8]"
            />
          </div>

          <div>
            <label
              htmlFor="repayment-schedule"
              className="mb-2 block text-sm font-medium text-[--gray-12]"
            >
              Loan Repayment Schedule (PDF)
            </label>
            <input
              id="repayment-schedule"
              type="file"
              accept="application/pdf"
              required
              onChange={(event) =>
                setRepaymentPdf(event.target.files?.[0] ?? null)
              }
              className="block w-full rounded-lg border border-[--gray-7] bg-[--gray-2] px-3 py-2 text-sm text-[--gray-12]"
            />
            <p className="mt-2 text-xs text-[--gray-11]">
              Upload your monthly EMI / repayment schedule (PDF with the table
              showing dates, interest, principal & balance)
            </p>
          </div>

          <div>
            <label
              htmlFor="sanction-terms"
              className="mb-2 block text-sm font-medium text-[--gray-12]"
            >
              Sanction Letter / T&amp;C / Loan Offer Terms (Optional)
            </label>
            <input
              id="sanction-terms"
              type="file"
              accept="application/pdf"
              onChange={(event) => setTermsPdf(event.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-[--gray-7] bg-[--gray-2] px-3 py-2 text-sm text-[--gray-12]"
            />
            <p className="mt-2 text-xs text-[--gray-11]">
              Upload the loan offer letter or detailed terms & conditions (helps
              calculate foreclosure fee, processing charges, etc.)
            </p>
          </div>

          {error ? (
            <p
              className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {submitted ? (
            <p className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              Form captured on frontend. Backend API integration will be added
              in the next step.
              <br />
              <span className="font-medium">
                Repayment schedule: {repaymentPdf?.name ?? "not selected"}
              </span>
              <br />
              <span className="font-medium">
                Offer terms document: {termsPdf?.name ?? "not uploaded"}
              </span>
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-[--accent-9] px-5 py-2.5 text-sm font-semibold text-[--accent-contrast] transition hover:bg-[--accent-10]"
            >
              Save Loan Account
            </button>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-[--gray-11] hover:text-[--gray-12]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
