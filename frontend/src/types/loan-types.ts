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
  total_taxes_paid?: number;
  total_taxes_remaining?: number;
  processing_fee_paid?: number;
  principal_remaining?: number;
  interest_remaining?: number;
  paid_installments?: number;
  total_installments?: number;
  remaining_installments?: number;
  total_remaining_payable?: number;
  scheduled_total_interest?: number;
  estimated_foreclosure_charges?: number;
  estimated_foreclosure_total?: number;
  assumptions?: string[];
  [key: string]: unknown;
};

export type LoanTermsExtracted = {
  lender_name?: string | null;
  loan_type?: string | null;
  loan_start_date?: string | null;
  loan_end_date?: string | null;
  tenure_months?: number | null;
  annual_interest_rate?: number | null;
  original_principal?: number | null;
  monthly_emi?: number | null;
  foreclosure_charge_rate?: number | null;
  foreclosure_flat_fee?: number | null;
  processing_fee?: number | null;
  notes?: string | null;
};

export type AmortizationScheduleRow = {
  installment_number?: number;
  due_date?: string;
  emi_amount?: number;
  principal_component?: number;
  interest_component?: number;
  tax_component?: number;
  balance_after_payment?: number;
  payment_status?: string;
  [key: string]: unknown;
};

export type LoanAccountDetailsResponse = {
  id: string;
  data: {
    accountName?: string;
    monthlyDueDate?: number;
    currentMonthEmiPaid?: boolean;
    status?: string;
    analysis?: {
      computed?: LoanAnalysisComputed;
      extraction?: {
        loan_details?: LoanTermsExtracted;
        amortization_schedule?: AmortizationScheduleRow[];
      };
    };
  };
};
