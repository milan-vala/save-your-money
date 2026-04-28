import { API } from "../utils/http-client";

export type CreateLoanAccountPayload = {
  accountName: string;
  amortizationSchedule: File;
  termsConditions?: File | null;
};

export type CreateLoanAccountResponse = {
  id: string;
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
