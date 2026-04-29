export type CreateLoanAccountPayload = {
  accountName: string;
  monthlyDueDate: number;
  currentMonthEmiPaid?: boolean;
  amortizationSchedule: File;
  termsConditions?: File | null;
};

export type CreateLoanAccountResponse = {
  id: string;
};

export type LoanAccountListItem = {
  id: string;
  accountName: string;
};

export type LoanAccountsListResponse = {
  items: LoanAccountListItem[];
};

export type LoanAnalysisComputed = {
  as_of_date?: string;
  total_paid_to_date?: number;
  current_balance?: number;
  estimated_savings_on_foreclosure?: number;
  interest_paid_to_date?: number;
  principal_paid_to_date?: number;
  taxes_paid_to_date?: number;
  processing_fee_paid_to_date?: number;
  principal_remaining?: number;
  interest_remaining?: number;
  taxes_remaining?: number;
  paid_installments?: number;
  total_installments?: number;
  [key: string]: unknown;
};

export type AmortizationScheduleRow = {
  installment_no?: number;
  installment_number?: number;
  due_date?: string;
  payment_date?: string;
  principal?: number;
  interest?: number;
  taxes?: number;
  processing_fee?: number;
  installment_amount?: number;
  balance?: number;
  outstanding_balance?: number;
  [key: string]: unknown;
};

export type LoanAccountDetailsResponse = {
  id: string;
  data: {
    accountName?: string;
    analysis?: {
      computed?: LoanAnalysisComputed;
    };
    extraction?: {
      amortization_schedule?: AmortizationScheduleRow[];
    };
  };
};
