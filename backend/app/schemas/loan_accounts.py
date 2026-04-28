from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class UploadedFileMeta(BaseModel):
    filename: str
    content_type: str
    size_bytes: int = Field(ge=1)


class LoanTermsExtracted(BaseModel):
    lender_name: str | None = None
    loan_type: str | None = None
    loan_start_date: date | None = None
    loan_end_date: date | None = None
    tenure_months: int | None = Field(default=None, ge=1)
    annual_interest_rate: float | None = Field(default=None, ge=0)
    original_principal: float | None = Field(default=None, ge=0)
    monthly_emi: float | None = Field(default=None, ge=0)
    foreclosure_charge_rate: float | None = Field(default=None, ge=0)
    foreclosure_flat_fee: float | None = Field(default=None, ge=0)
    processing_fee: float | None = Field(default=None, ge=0)
    notes: str | None = None


class AmortizationRow(BaseModel):
    installment_number: int | None = Field(default=None, ge=1)
    due_date: date | None = None
    emi_amount: float = Field(ge=0)
    principal_component: float = Field(ge=0)
    interest_component: float = Field(ge=0)
    tax_component: float = Field(default=0, ge=0)
    balance_after_payment: float | None = Field(default=None, ge=0)
    payment_status: str | None = None


class LoanExtraction(BaseModel):
    loan_details: LoanTermsExtracted
    amortization_schedule: list[AmortizationRow] = Field(min_length=1)


class LoanComputedMetrics(BaseModel):
    as_of_date: date
    total_installments: int = Field(ge=0)
    paid_installments: int = Field(ge=0)
    remaining_installments: int = Field(ge=0)
    principal_paid_to_date: float = Field(ge=0)
    interest_paid_to_date: float = Field(ge=0)
    total_taxes_paid: float = Field(ge=0)
    total_taxes_remaining: float = Field(ge=0)
    processing_fee_paid: float = Field(ge=0)
    total_paid_to_date: float = Field(ge=0)
    principal_remaining: float = Field(ge=0)
    interest_remaining: float = Field(ge=0)
    total_remaining_payable: float = Field(ge=0)
    current_balance: float = Field(ge=0)
    scheduled_total_interest: float = Field(ge=0)
    estimated_foreclosure_charges: float = Field(ge=0)
    estimated_foreclosure_total: float = Field(ge=0)
    estimated_savings_on_foreclosure: float
    assumptions: list[str] = Field(default_factory=list)


class GeminiFileRef(BaseModel):
    name: str
    uri: str
    mime_type: str
    display_name: str | None = None
    size_bytes: int | None = None


class GeminiProcessingMetadata(BaseModel):
    mode: str = "files_api"
    model: str
    analyzed_at: datetime
    uploaded_files: list[GeminiFileRef] = Field(default_factory=list)


class LoanAnalysisResult(BaseModel):
    extraction: LoanExtraction
    computed: LoanComputedMetrics
    processing_metadata: GeminiProcessingMetadata | None = None
    raw_model_output: dict[str, Any] | None = None


class LoanAccountDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId", min_length=1)
    account_name: str = Field(alias="accountName", min_length=1)
    monthly_due_date: int = Field(alias="monthlyDueDate", ge=1, le=31)
    current_month_emi_paid: bool = Field(alias="currentMonthEmiPaid", default=False)
    amortization_schedule_file: UploadedFileMeta = Field(alias="amortizationScheduleFile")
    terms_conditions_file: UploadedFileMeta | None = Field(
        default=None, alias="termsConditionsFile"
    )
    analysis: LoanAnalysisResult
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    status: str = "ready"

    @field_validator("account_name")
    @classmethod
    def validate_account_name(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("account_name is required")
        return trimmed


class CreateLoanAccountResponse(BaseModel):
    id: str = Field(min_length=1)


class LoanAccountListItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(min_length=1)
    account_name: str = Field(alias="accountName", min_length=1)


class LoanAccountsListResponse(BaseModel):
    items: list[LoanAccountListItem] = Field(default_factory=list)


class LoanAccountDetailsResponse(BaseModel):
    id: str = Field(min_length=1)
    data: dict[str, Any]
