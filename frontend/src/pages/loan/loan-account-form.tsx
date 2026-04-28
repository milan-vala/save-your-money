import { useMemo, useState } from "react";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { FileUpload } from "@src/components/file-upload.tsx";
import { Button } from "@src/ui/button.tsx";
import type { LoanAccountFormProps, LoanAccountFormValues } from "./types.ts";

const loanAccountSchema = yup.object({
  accountName: yup.string().trim().required("Account name is required."),
  monthlyDueDate: yup
    .number()
    .typeError("Monthly EMI due date is required.")
    .required("Monthly EMI due date is required.")
    .integer("Monthly EMI due date must be a whole number.")
    .min(1, "Monthly EMI due date must be between 1 and 31.")
    .max(31, "Monthly EMI due date must be between 1 and 31."),
  currentMonthEmiPaid: yup.boolean().default(false),
  repaymentPdf: yup
    .mixed<File>()
    .required("Loan Repayment Schedule PDF is required.")
    .test(
      "is-pdf-file",
      "Loan Repayment Schedule PDF is required.",
      (value) => value instanceof File
    ),
  termsPdf: yup
    .mixed<File | null>()
    .nullable()
    .optional()
    .test(
      "optional-file",
      "Must be a PDF file.",
      (value) => value === null || value === undefined || value instanceof File
    ),
});

function formatFormikFieldError(error: unknown): string | undefined {
  if (error === undefined || error === null) return undefined;
  if (typeof error === "string") return error.trim() || undefined;
  if (Array.isArray(error)) {
    const joined = error
      .filter((item): item is string => typeof item === "string")
      .join(" ");
    return joined.trim() || undefined;
  }
  return undefined;
}

function emptyValues(): LoanAccountFormValues {
  return {
    accountName: "",
    monthlyDueDate: "",
    currentMonthEmiPaid: false,
    repaymentPdf: null,
    termsPdf: null,
  };
}

export function LoanAccountForm({
  mode,
  initialValues: initialValuesProp,
  onSubmit,
  cancelPath = "/dashboard",
}: LoanAccountFormProps) {
  const [fileFieldsKey, setFileFieldsKey] = useState(0);

  const initialValues = useMemo<LoanAccountFormValues>(() => {
    const base = emptyValues();
    if (!initialValuesProp) return base;
    return {
      ...base,
      ...initialValuesProp,
      accountName: initialValuesProp.accountName ?? base.accountName,
      monthlyDueDate: initialValuesProp.monthlyDueDate ?? base.monthlyDueDate,
      currentMonthEmiPaid:
        initialValuesProp.currentMonthEmiPaid ?? base.currentMonthEmiPaid,
      repaymentPdf: initialValuesProp.repaymentPdf ?? base.repaymentPdf,
      termsPdf: initialValuesProp.termsPdf ?? base.termsPdf,
    };
  }, [initialValuesProp]);

  const formik = useFormik<LoanAccountFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: loanAccountSchema,
    validateOnMount: false,
    onSubmit: async (values, { resetForm }) => {
      await onSubmit(values);
      resetForm();
      setFileFieldsKey((k) => k + 1);
    },
  });

  const showAccountNameError =
    Boolean(formik.touched.accountName) && Boolean(formik.errors.accountName);
  const showMonthlyDueDateError =
    Boolean(formik.touched.monthlyDueDate) &&
    Boolean(formik.errors.monthlyDueDate);
  const showRepaymentError =
    Boolean(formik.touched.repaymentPdf) && Boolean(formik.errors.repaymentPdf);

  const submitLabel =
    mode === "create" ? "Save Loan Account" : "Update Loan Account";

  return (
    <>
      <form className="space-y-6" onSubmit={formik.handleSubmit} noValidate>
        <div className="rounded-xl bg-[--gray-3]/45 p-3">
          <label
            htmlFor="account-name"
            className="mb-2 block text-sm font-medium text-[--gray-12]"
          >
            Account Name
          </label>
          <input
            id="account-name"
            name="accountName"
            type="text"
            value={formik.values.accountName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. SBI Home Loan - Mumbai Flat"
            aria-invalid={showAccountNameError}
            aria-describedby={
              showAccountNameError ? "account-name-error" : undefined
            }
            className={`w-full rounded-lg border bg-[--gray-1]/60 px-3 py-2.5 text-sm text-[--gray-12] outline-none placeholder:text-[--gray-10] focus:border-[--accent-8] ${
              showAccountNameError
                ? "border-red-500/70"
                : "border-[--gray-6]/60"
            }`}
          />
          {showAccountNameError ? (
            <p
              id="account-name-error"
              className="mt-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {formatFormikFieldError(formik.errors.accountName)}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl bg-[--gray-3]/45 p-3">
          <label
            htmlFor="monthly-due-date"
            className="mb-2 block text-sm font-medium text-[--gray-12]"
          >
            Monthly EMI Due Date (Day of month)
          </label>
          <input
            id="monthly-due-date"
            name="monthlyDueDate"
            type="number"
            min={1}
            max={31}
            value={formik.values.monthlyDueDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. 5, 10, 25"
            aria-invalid={showMonthlyDueDateError}
            aria-describedby={
              showMonthlyDueDateError ? "monthly-due-date-error" : undefined
            }
            className={`w-full rounded-lg border bg-[--gray-1]/60 px-3 py-2.5 text-sm text-[--gray-12] outline-none placeholder:text-[--gray-10] focus:border-[--accent-8] ${
              showMonthlyDueDateError
                ? "border-red-500/70"
                : "border-[--gray-6]/60"
            }`}
          />
          <p className="mt-2 text-xs text-[--gray-11]">
            Required. Enter a day from 1 to 31.
          </p>
          {showMonthlyDueDateError ? (
            <p
              id="monthly-due-date-error"
              className="mt-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {formatFormikFieldError(formik.errors.monthlyDueDate)}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl bg-[--gray-3]/45 p-3">
          <label
            htmlFor="current-month-emi-paid"
            className="flex cursor-pointer items-center justify-between gap-3"
          >
            <span className="text-sm font-medium text-[--gray-12]">
              Has this month&apos;s EMI already been paid?
            </span>
            <input
              id="current-month-emi-paid"
              name="currentMonthEmiPaid"
              type="checkbox"
              checked={formik.values.currentMonthEmiPaid}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-4 w-4 rounded border-[--gray-6] accent-[--accent-9]"
            />
          </label>
        </div>

        <div className="rounded-xl bg-[--gray-3]/45 p-3">
          <label
            htmlFor="repayment-schedule"
            className="mb-2 block text-sm font-medium text-[--gray-12]"
          >
            Loan Repayment Schedule (PDF)
          </label>
          <FileUpload
            key={`repayment-${fileFieldsKey}`}
            inputId="repayment-schedule"
            maxFiles={1}
            onDrop={(files) => {
              const file = files[0] ?? null;
              void formik.setFieldValue("repaymentPdf", file, true);
              void formik.setFieldTouched("repaymentPdf", true, false);
            }}
            hasError={showRepaymentError}
            ariaDescribedBy={
              showRepaymentError
                ? "repayment-schedule-helper repayment-schedule-error"
                : "repayment-schedule-helper"
            }
            description="Upload your monthly EMI / repayment schedule (PDF with the table showing dates, interest, principal & balance)."
          />
          <p
            id="repayment-schedule-helper"
            className="mt-2 text-xs text-[--gray-11]"
          >
            PDF only. Required for this loan account.
          </p>
          {showRepaymentError ? (
            <p
              id="repayment-schedule-error"
              className="mt-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {formatFormikFieldError(formik.errors.repaymentPdf)}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl bg-[--gray-3]/45 p-3">
          <label
            htmlFor="sanction-terms"
            className="mb-2 block text-sm font-medium text-[--gray-12]"
          >
            Sanction Letter / T&amp;C / Loan Offer Terms (Optional)
          </label>
          <FileUpload
            key={`terms-${fileFieldsKey}`}
            inputId="sanction-terms"
            maxFiles={1}
            onDrop={(files) => {
              const file = files[0] ?? null;
              void formik.setFieldValue("termsPdf", file, true);
              void formik.setFieldTouched("termsPdf", true, false);
            }}
            description="Upload the loan offer letter or detailed terms & conditions (helps calculate foreclosure fee, processing charges, etc.)."
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            size="2"
            className="cursor-pointer"
          >
            {submitLabel}
          </Button>
          <Button asChild variant="solid" size="2">
            <Link to={cancelPath}>Cancel</Link>
          </Button>
        </div>
      </form>

      {formik.dirty && !formik.isSubmitting ? (
        <p className="mt-4 text-center text-xs text-[--gray-11]">
          Unsaved changes
        </p>
      ) : null}
    </>
  );
}
