export type LoanAccountMode = "create" | "edit";

export type LoanAccountFormValues = {
  accountName: string;
  repaymentPdf: File | null;
  termsPdf: File | null;
};

export type LoanAccountFormProps = {
  mode: LoanAccountMode;
  initialValues?: Partial<LoanAccountFormValues>;
  onSubmit: (values: LoanAccountFormValues) => void | Promise<void>;
  cancelPath?: string;
};
