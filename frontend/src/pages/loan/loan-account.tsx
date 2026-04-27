import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { notify } from "@src/components/app-toast.tsx";
import { LoanAccountForm } from "./loan-account-form.tsx";
import type { LoanAccountFormValues } from "./types.ts";

export function LoanAccount() {
  const params = useParams<{ loanAccountId?: string }>();
  const isEdit = Boolean(params.loanAccountId);
  const mode = isEdit ? "edit" : "create";

  const handleSubmit = useCallback(
    async (values: LoanAccountFormValues) => {
      try {
        // TODO: replace with real API — create vs update based on `mode` / `params.loanAccountId`
        if (mode === "create") {
          // await createLoanAccount(values);
        } else {
          // await updateLoanAccount(params.loanAccountId!, values);
        }

        const detail = [
          values.accountName.trim(),
          values.repaymentPdf?.name ?? "no schedule file",
          values.termsPdf
            ? `Terms: ${values.termsPdf.name}`
            : "No optional terms file",
        ].join(" · ");

        if (mode === "create") {
          notify.success("Loan account created", detail);
        } else {
          notify.success("Loan account updated", detail);
        }
      } catch (cause: unknown) {
        const message =
          cause instanceof Error ? cause.message : "Something went wrong.";
        notify.error("Could not save loan account", message);
        throw cause;
      }
    },
    [mode]
  );

  const title = mode === "create" ? "Create Loan Account" : "Edit Loan Account";

  return (
    <section className="px-4 py-2 sm:px-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[--gray-6]/60 bg-[--gray-2]/40 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[--accent-11]">
              Loan Accounts
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[--gray-12] sm:text-3xl">
              {title}
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-[--gray-11] underline hover:text-[--gray-12]"
          >
            Back to Dashboard
          </Link>
        </div>

        <LoanAccountForm
          key={params.loanAccountId ?? "new"}
          mode={mode}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
