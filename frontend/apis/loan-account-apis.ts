import { API } from "../utils/http-client";

export type CreateLoanAccountPayload = {
  accountName: string;
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

export type LoanAccountDetailsResponse = {
  id: string;
  data: Record<string, unknown>;
};

export async function createLoanAccount(
  payload: CreateLoanAccountPayload
): Promise<CreateLoanAccountResponse> {
  const formData = new FormData();
  formData.append("account_name", payload.accountName.trim());
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
