export type LoanAccountMode = "create" | "edit";

export type LoanAccountFormValues = {
  accountName: string;
  monthlyDueDate: number | "";
  currentMonthEmiPaid: boolean;
  repaymentPdf: File | null;
  termsPdf: File | null;
};

export type LoanAccountFormProps = {
  mode: LoanAccountMode;
  initialValues?: Partial<LoanAccountFormValues>;
  onSubmit: (values: LoanAccountFormValues) => void | Promise<void>;
  cancelPath?: string;
};
