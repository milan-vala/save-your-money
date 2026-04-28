import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getLoanAccountById,
  getLoanAccounts,
  type LoanAccountDetailsResponse,
} from "../../apis/loan-account-apis";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] =
    useState<LoanAccountDetailsResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const listResponse = await getLoanAccounts();
        const first = listResponse.items[0];
        if (!mounted || !first) {
          if (mounted) setSelectedAccount(null);
          return;
        }
        const detailResponse = await getLoanAccountById(first.id);
        if (mounted) {
          setSelectedAccount(detailResponse);
        }
      } catch (cause: unknown) {
        if (!mounted) return;
        const message =
          cause instanceof Error ? cause.message : "Failed to load dashboard.";
        setError(message);
        setSelectedAccount(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-6 sm:p-8">
            <p className="text-sm font-medium text-[--accent-11]">
              Loan Accounts
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[--gray-12] sm:text-3xl">
              Loading account details...
            </h1>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-6 sm:p-8">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Could not load dashboard
            </p>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (selectedAccount) {
    return (
      <section className="py-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-6 sm:p-8">
            <p className="text-sm font-medium text-[--accent-11]">
              Loan Accounts
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[--gray-12] sm:text-3xl">
              Full loan account payload
            </h1>
            <p className="mt-3 text-[--gray-11]">
              Showing all fields for account ID: {selectedAccount.id}
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-[--gray-3]/50 p-4 text-xs text-[--gray-12]">
              {JSON.stringify(selectedAccount, null, 2)}
            </pre>
          </div>
        </div>
      </section>
    );
  }

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
