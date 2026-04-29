import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getLoanAccounts,
  getLoanAccountById,
} from "../../apis/loan-account-apis";
import { Button } from "@src/ui/button.tsx";
import {
  formatCurrency,
  formatDate,
  safeDate,
  toNumber,
} from "@src/utils/loan-formatters";
import { LoanBalanceAreaChart } from "@src/components/loan-charts/loan-balance-area-chart";
import { PaidBreakdownDonutChart } from "@src/components/loan-charts/paid-breakdown-donut-chart";
import { PaidVsRemainingBarChart } from "@src/components/loan-charts/paid-vs-remaining-bar-chart";
import type {
  AmortizationScheduleRow,
  LoanAnalysisComputed,
  LoanAccountDetailsResponse,
} from "../types/loan-types";

export function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoAccountsState, setShowNoAccountsState] = useState(false);
  const [account, setAccount] = useState<LoanAccountDetailsResponse | null>(
    null
  );

  useEffect(() => {
    if (!id) {
      let mounted = true;
      void (async () => {
        setLoading(true);
        setError(null);
        setShowNoAccountsState(false);
        try {
          const listResponse = await getLoanAccounts();
          const first = listResponse.items[0];
          if (!mounted) return;
          if (first?.id) {
            navigate(`/dashboard/loan-accounts/${first.id}`, { replace: true });
            return;
          }
          setAccount(null);
          setShowNoAccountsState(true);
          setLoading(false);
        } catch (cause: unknown) {
          if (!mounted) return;
          const message =
            cause instanceof Error
              ? cause.message
              : "Unable to resolve a loan account for dashboard.";
          setError(message);
          setShowNoAccountsState(false);
          setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }

    let mounted = true;
    void (async () => {
      setLoading(true);
      setError(null);
      setShowNoAccountsState(false);
      try {
        const detailResponse = await getLoanAccountById(id);
        if (mounted) {
          setAccount(detailResponse);
        }
      } catch (cause: unknown) {
        if (!mounted) return;
        const message =
          cause instanceof Error ? cause.message : "Failed to load dashboard.";
        setError(message);
        setAccount(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const computed = (account?.data.analysis?.computed ??
    {}) as LoanAnalysisComputed;
  const schedule = (account?.data.extraction?.amortization_schedule ??
    []) as AmortizationScheduleRow[];

  const accountName =
    account?.data.accountName ?? account?.id ?? "Loan Account";
  const asOfDate = computed.as_of_date;

  const paidInstallments = toNumber(computed.paid_installments);
  const totalInstallments = toNumber(computed.total_installments);
  const progressPercent =
    totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  const kpis = useMemo(
    () => [
      {
        label: "Total Paid So Far",
        value: toNumber(computed.total_paid_to_date),
        className: "border-[--gray-6]/60 bg-[--gray-2]/40",
      },
      {
        label: "Current Outstanding",
        value: toNumber(computed.current_balance),
        className: "border-[--gray-6]/60 bg-[--gray-2]/40",
      },
      {
        label: "Foreclosure Savings",
        value: toNumber(computed.estimated_savings_on_foreclosure),
        className:
          "border-emerald-500/45 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]",
      },
      {
        label: "Total Interest Paid",
        value: toNumber(computed.interest_paid_to_date),
        className: "border-[--gray-6]/60 bg-[--gray-2]/40",
      },
    ],
    [computed]
  );

  const paidBreakdownData = useMemo(
    () => [
      {
        name: "Principal",
        value: toNumber(computed.principal_paid_to_date),
        color: "#3b82f6",
      },
      {
        name: "Interest",
        value: toNumber(computed.interest_paid_to_date),
        color: "#a855f7",
      },
      {
        name: "Taxes",
        value: toNumber(computed.taxes_paid_to_date),
        color: "#14b8a6",
      },
      {
        name: "Processing Fee",
        value: toNumber(computed.processing_fee_paid_to_date),
        color: "#f59e0b",
      },
    ],
    [computed]
  );

  const paidVsRemainingData = useMemo(
    () => [
      {
        metric: "Principal",
        paid: toNumber(computed.principal_paid_to_date),
        remaining: toNumber(computed.principal_remaining),
      },
      {
        metric: "Interest",
        paid: toNumber(computed.interest_paid_to_date),
        remaining: toNumber(computed.interest_remaining),
      },
      {
        metric: "Taxes",
        paid: toNumber(computed.taxes_paid_to_date),
        remaining: toNumber(computed.taxes_remaining),
      },
    ],
    [computed]
  );

  const timelineData = useMemo(() => {
    return schedule
      .map((row, index) => {
        const dateStr = String(row.due_date ?? "");
        const date = safeDate(dateStr);
        return {
          index,
          dateStr,
          ts: date ? date.getTime() : index,
          balance: toNumber(row.outstanding_balance ?? row.balance),
        };
      })
      .sort((a, b) => a.ts - b.ts);
  }, [schedule]);

  const todayTs = new Date().getTime();
  const progressRadius = 62;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset =
    progressCircumference -
    (Math.min(progressPercent, 100) / 100) * progressCircumference;

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

  if (showNoAccountsState) {
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
              <Button onClick={() => navigate("/dashboard/loan-accounts/new")}>
                Create Loan Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2">
      <div className="space-y-6 pb-6">
        <div className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <p className="text-sm font-medium text-[--accent-11]">
            Loan Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[--gray-12] sm:text-3xl">
            {accountName}
          </h1>
          <p className="mt-3 text-sm text-[--gray-11]">
            As of {asOfDate ? formatDate(asOfDate) : "N/A"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className={`rounded-2xl border p-5 shadow-sm transition-colors ${kpi.className}`}
            >
              <p className="text-sm font-medium text-[--gray-11]">
                {kpi.label}
              </p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-[--gray-12]">
                {formatCurrency(kpi.value)}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-5">
            <h2 className="text-base font-semibold text-[--gray-12]">
              Paid Breakdown
            </h2>
            <p className="mt-1 text-xs text-[--gray-11]">
              Principal, Interest, Taxes and Processing Fee
            </p>
            <div className="mt-4 h-72">
              <PaidBreakdownDonutChart data={paidBreakdownData} />
            </div>
          </article>

          <article className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-5">
            <h2 className="text-base font-semibold text-[--gray-12]">
              Paid vs Remaining
            </h2>
            <p className="mt-1 text-xs text-[--gray-11]">
              Principal, Interest and Taxes
            </p>
            <div className="mt-4 h-72">
              <PaidVsRemainingBarChart data={paidVsRemainingData} />
            </div>
          </article>

          <article className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-5">
            <h2 className="text-base font-semibold text-[--gray-12]">
              Loan Balance Over Time
            </h2>
            <p className="mt-1 text-xs text-[--gray-11]">
              Based on amortization schedule
            </p>
            <div className="mt-4 h-72">
              <LoanBalanceAreaChart data={timelineData} todayTs={todayTs} />
            </div>
          </article>
        </div>

        <article className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-5">
          <h2 className="text-base font-semibold text-[--gray-12]">
            Loan Paid Off
          </h2>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 160 160" className="h-40 w-40">
                <circle
                  cx="80"
                  cy="80"
                  r={progressRadius}
                  stroke="rgba(148, 163, 184, 0.25)"
                  strokeWidth="14"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={progressRadius}
                  stroke="#22c55e"
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={progressCircumference}
                  strokeDashoffset={progressOffset}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[--gray-12]">
                  {Math.round(progressPercent)}%
                </span>
                <span className="text-xs text-[--gray-11]">Completed</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-[--gray-11]">Paid installments</p>
              <p className="text-xl font-semibold text-[--gray-12]">
                {paidInstallments} / {totalInstallments}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-5">
          <h2 className="text-base font-semibold text-[--gray-12]">
            Amortization Schedule
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide text-[--gray-11] uppercase">
                  <th className="px-3 py-2">Installment</th>
                  <th className="px-3 py-2">Due Date</th>
                  <th className="px-3 py-2">Principal</th>
                  <th className="px-3 py-2">Interest</th>
                  <th className="px-3 py-2">Taxes</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, idx) => {
                  const due = safeDate(String(row.due_date ?? ""));
                  const isPaid = Boolean(due && due.getTime() <= todayTs);
                  return (
                    <tr
                      key={`${row.installment_no ?? row.installment_number ?? idx}-${row.due_date ?? idx}`}
                      className={`rounded-xl ${
                        isPaid
                          ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                          : "bg-slate-500/10 text-[--gray-12]"
                      }`}
                    >
                      <td className="rounded-l-xl px-3 py-2 font-medium">
                        {row.installment_no ??
                          row.installment_number ??
                          idx + 1}
                      </td>
                      <td className="px-3 py-2">
                        {formatDate(String(row.due_date ?? ""))}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(toNumber(row.principal))}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(toNumber(row.interest))}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(toNumber(row.taxes))}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(toNumber(row.installment_amount))}
                      </td>
                      <td className="rounded-r-xl px-3 py-2">
                        {formatCurrency(
                          toNumber(row.outstanding_balance ?? row.balance)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {schedule.length === 0 ? (
              <p className="py-6 text-sm text-[--gray-11]">
                No amortization schedule found for this account.
              </p>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
