import { API } from "@src/utils/http-client";
import type {
  CreateLoanAccountPayload,
  CreateLoanAccountResponse,
  LoanAccountDetailsResponse,
  LoanAccountsListResponse,
} from "@src/types/loan-types";

export async function createLoanAccount(
  payload: CreateLoanAccountPayload
): Promise<CreateLoanAccountResponse> {
  const formData = new FormData();
  formData.append("account_name", payload.accountName.trim());
  formData.append("monthly_due_date", String(payload.monthlyDueDate));
  formData.append(
    "current_month_emi_paid",
    payload.currentMonthEmiPaid ? "true" : "false"
  );
  formData.append("amortization_schedule", payload.amortizationSchedule);
  if (payload.termsConditions) {
    formData.append("terms_conditions", payload.termsConditions);
  }
  return API.POST<CreateLoanAccountResponse>("/api/loan-accounts", formData);
}

export async function getLoanAccounts(): Promise<LoanAccountsListResponse> {
  return API.GET<LoanAccountsListResponse>("/api/loan-accounts");
}

export async function getLoanAccountById(
  id: string
): Promise<LoanAccountDetailsResponse> {
  return API.GET<LoanAccountDetailsResponse>(`/api/loan-accounts/${id}`);
}
