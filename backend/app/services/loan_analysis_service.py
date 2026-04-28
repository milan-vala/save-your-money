from __future__ import annotations

import json
from calendar import monthrange
from datetime import UTC, date, datetime
from typing import Any

import httpx
from fastapi import UploadFile
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.loan_accounts import (
    AmortizationRow,
    GeminiFileRef,
    GeminiProcessingMetadata,
    LoanAnalysisResult,
    LoanComputedMetrics,
    LoanExtraction,
    LoanTermsExtracted,
    UploadedFileMeta,
)

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"
GEMINI_UPLOAD_BASE = "https://generativelanguage.googleapis.com/upload/v1beta"


class LoanInputError(ValueError):
    pass


class LoanConfigError(RuntimeError):
    pass


class LoanAnalysisError(RuntimeError):
    pass


def _gemini_generate_endpoint(model: str) -> str:
    return f"{GEMINI_API_BASE}/models/{model}:generateContent"


def _gemini_files_upload_endpoint() -> str:
    return f"{GEMINI_UPLOAD_BASE}/files"


def _to_float(value: Any, *, field_name: str) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.replace(",", "").replace("₹", "").strip()
        if cleaned:
            try:
                return float(cleaned)
            except ValueError as exc:
                raise LoanAnalysisError(f"Invalid numeric value for {field_name}") from exc
    raise LoanAnalysisError(f"Missing numeric value for {field_name}")


def _to_optional_float(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.replace(",", "").replace("₹", "").strip()
        if not cleaned:
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None


def _pick_first(raw: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in raw and raw.get(key) is not None:
            return raw.get(key)
    return None


def _parse_date(value: Any) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if not isinstance(value, str):
        return None
    raw = value.strip()
    if not raw:
        return None
    # Try common formats from lender schedules.
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d %b %Y", "%d %B %Y"):
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    return None


def _extract_json_object(text: str) -> dict[str, Any]:
    candidate = text.strip()
    if candidate.startswith("```"):
        lines = candidate.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        candidate = "\n".join(lines).strip()
        if candidate.lower().startswith("json"):
            candidate = candidate[4:].strip()
    try:
        parsed = json.loads(candidate)
    except json.JSONDecodeError as exc:
        raise LoanAnalysisError("Model output was not valid JSON") from exc
    if isinstance(parsed, list):
        if parsed and isinstance(parsed[0], dict):
            parsed = parsed[0]
        else:
            raise LoanAnalysisError("Model output JSON must be an object")
    if isinstance(parsed, dict):
        for wrapper_key in ("result", "data", "loan_analysis", "analysis"):
            wrapped = parsed.get(wrapper_key)
            if isinstance(wrapped, dict):
                parsed = wrapped
                break
    if not isinstance(parsed, dict):
        raise LoanAnalysisError("Model output JSON must be an object")
    return parsed


def _normalize_amortization_rows(rows: list[dict[str, Any]]) -> list[AmortizationRow]:
    normalized: list[AmortizationRow] = []
    for idx, raw in enumerate(rows, start=1):
        if not isinstance(raw, dict):
            raise LoanAnalysisError("Amortization rows must be JSON objects")
        installment_number = raw.get("installment_number") or raw.get("installmentNo")
        if installment_number is not None:
            try:
                installment_number = int(str(installment_number).strip())
            except ValueError as exc:
                raise LoanAnalysisError("Invalid installment_number value") from exc
        tax_raw = _pick_first(
            raw,
            "tax_component",
            "tax",
            "taxes",
            "tax_amount",
            "applicable_taxes",
            "applicable_tax",
            "gst",
        )
        normalized.append(
            AmortizationRow(
                installment_number=installment_number,
                due_date=_parse_date(_pick_first(raw, "due_date", "date", "emi_date")),
                emi_amount=_to_float(
                    _pick_first(raw, "emi_amount", "emi", "installment", "monthly_due"),
                    field_name=f"amortization_schedule[{idx}].emi_amount",
                ),
                principal_component=_to_float(
                    _pick_first(raw, "principal_component", "principal"),
                    field_name=f"amortization_schedule[{idx}].principal_component",
                ),
                interest_component=_to_float(
                    _pick_first(raw, "interest_component", "interest"),
                    field_name=f"amortization_schedule[{idx}].interest_component",
                ),
                tax_component=_to_optional_float(tax_raw) or 0.0,
                balance_after_payment=_to_optional_float(
                    _pick_first(raw, "balance_after_payment", "balance", "outstanding")
                ),
                payment_status=(
                    str(raw.get("payment_status")).strip().lower()
                    if raw.get("payment_status") is not None
                    else None
                ),
            )
        )
    if not normalized:
        raise LoanAnalysisError("Amortization schedule is empty")
    return sorted(
        normalized,
        key=lambda item: (
            item.due_date or date.max,
            item.installment_number or 10**9,
        ),
    )


def _calculate_metrics(
    extraction: LoanExtraction,
    *,
    monthly_due_date: int,
    current_month_emi_paid: bool,
) -> LoanComputedMetrics:
    today = date.today()
    rows = extraction.amortization_schedule
    due_day = min(max(monthly_due_date, 1), monthrange(today.year, today.month)[1])
    current_cycle_due_date = date(today.year, today.month, due_day)
    # Count how many installments are due based on the requested due-cycle logic.
    paid_count = 0
    for row in rows:
        if row.due_date:
            if row.due_date < current_cycle_due_date or (
                row.due_date == current_cycle_due_date and current_month_emi_paid
            ):
                paid_count += 1
            else:
                break
        else:
            # Fallback when due_date is missing in extracted schedule rows.
            if row.installment_number and row.installment_number <= paid_count + 1:
                paid_count += 1
            else:
                break

    paid_count = min(max(paid_count, 0), len(rows))
    paid_rows = rows[:paid_count]
    remaining_rows = rows[paid_count:]

    principal_paid = sum(r.principal_component for r in paid_rows)
    interest_paid = sum(r.interest_component for r in paid_rows)
    taxes_paid = sum(r.tax_component for r in paid_rows)

    principal_remaining = sum(r.principal_component for r in remaining_rows)
    interest_remaining = sum(r.interest_component for r in remaining_rows)
    taxes_remaining = sum(r.tax_component for r in remaining_rows)

    outstanding_principal = max(principal_remaining, 0.0)
    current_balance = outstanding_principal
    if paid_rows and paid_rows[-1].balance_after_payment is not None:
        current_balance = paid_rows[-1].balance_after_payment or 0.0
    elif outstanding_principal > 0:
        current_balance = outstanding_principal
    elif extraction.loan_details.original_principal is not None:
        current_balance = extraction.loan_details.original_principal
    elif rows and rows[-1].balance_after_payment is not None:
        current_balance = rows[-1].balance_after_payment or 0.0
    elif rows and rows[0].balance_after_payment is not None:
        current_balance = rows[0].balance_after_payment or 0.0

    processing_fee_paid = extraction.loan_details.processing_fee or 0.0
    total_paid = principal_paid + interest_paid + taxes_paid + processing_fee_paid
    total_remaining = principal_remaining + interest_remaining + taxes_remaining

    foreclosure_rate = extraction.loan_details.foreclosure_charge_rate
    if foreclosure_rate is None:
        foreclosure_rate = 3.0
    foreclosure_flat = extraction.loan_details.foreclosure_flat_fee or 0.0
    foreclosure_charges = (max(current_balance, 0.0) * foreclosure_rate / 100.0) + foreclosure_flat
    foreclosure_total = max(current_balance, 0.0) + foreclosure_charges
    savings_on_foreclosure = total_remaining - foreclosure_total

    assumptions = [
        "Installment classification is based on due-cycle rules using monthly_due_date and current_month_emi_paid.",
        "Rows are treated as schedule-ordered; paid installments are counted sequentially from the start.",
        "Processing fee is treated as one-time upfront paid fee.",
    ]
    if foreclosure_rate == 3.0 and extraction.loan_details.foreclosure_charge_rate is None:
        assumptions.append("Foreclosure charge rate missing in documents; applied fallback of 3.0%.")
    if any(row.balance_after_payment is None for row in rows):
        assumptions.append(
            "Some balance_after_payment values were missing; current balance uses fallback logic."
        )
    return LoanComputedMetrics(
        as_of_date=today,
        total_installments=len(rows),
        paid_installments=len(paid_rows),
        remaining_installments=len(remaining_rows),
        principal_paid_to_date=round(principal_paid, 2),
        interest_paid_to_date=round(interest_paid, 2),
        total_taxes_paid=round(taxes_paid, 2),
        total_taxes_remaining=round(taxes_remaining, 2),
        processing_fee_paid=round(processing_fee_paid, 2),
        total_paid_to_date=round(total_paid, 2),
        principal_remaining=round(principal_remaining, 2),
        interest_remaining=round(interest_remaining, 2),
        total_remaining_payable=round(total_remaining, 2),
        current_balance=round(max(current_balance, 0.0), 2),
        scheduled_total_interest=round(sum(r.interest_component for r in rows), 2),
        estimated_foreclosure_charges=round(max(foreclosure_charges, 0.0), 2),
        estimated_foreclosure_total=round(max(foreclosure_total, 0.0), 2),
        estimated_savings_on_foreclosure=round(savings_on_foreclosure, 2),
        assumptions=assumptions,
    )


async def read_pdf_upload(
    file: UploadFile | None, *, required: bool, field_name: str
) -> tuple[bytes | None, UploadedFileMeta | None]:
    if file is None:
        if required:
            raise LoanInputError(f"{field_name} is required")
        return None, None

    content_type = (file.content_type or "").lower().strip()
    filename = (file.filename or "").strip()
    if content_type and content_type != "application/pdf":
        raise LoanInputError(f"{field_name} must be a PDF")
    if filename and not filename.lower().endswith(".pdf"):
        raise LoanInputError(f"{field_name} must be a PDF")

    raw = await file.read()
    if not raw:
        raise LoanInputError(f"{field_name} is empty")

    return (
        raw,
        UploadedFileMeta(
            filename=filename or f"{field_name}.pdf",
            content_type=content_type or "application/pdf",
            size_bytes=len(raw),
        ),
    )


async def analyze_loan_documents(
    *,
    account_name: str,
    monthly_due_date: int,
    current_month_emi_paid: bool,
    amortization_schedule_pdf: bytes,
    terms_conditions_pdf: bytes | None,
) -> LoanAnalysisResult:
    api_key = settings.gemini_api_key
    if not api_key:
        raise LoanConfigError("GEMINI_API_KEY is not configured")
    model = settings.gemini_model.strip() or "gemini-2.5-flash"

    prompt = f"""
You are a financial document extraction system.
Analyze the provided loan PDFs and produce STRICT JSON only with this structure:
{{
  "loan_details": {{
    "lender_name": string|null,
    "loan_type": string|null,
    "loan_start_date": "YYYY-MM-DD"|null,
    "loan_end_date": "YYYY-MM-DD"|null,
    "tenure_months": number|null,
    "annual_interest_rate": number|null,
    "original_principal": number|null,
    "monthly_emi": number|null,
    "foreclosure_charge_rate": number|null,
    "foreclosure_flat_fee": number|null,
    "processing_fee": number|null,
    "notes": string|null
  }},
  "amortization_schedule": [
    {{
      "installment_number": number|null,
      "due_date": "YYYY-MM-DD"|null,
      "emi_amount": number,
      "principal_component": number,
      "interest_component": number,
      "tax_component": number,
      "balance_after_payment": number|null,
      "payment_status": "paid|unpaid|future|remaining|completed|pending"|null
    }}
  ]
}}
Rules:
- Support diverse lender formats (SBI Card amortization schedules, Sammaan Capital account statements, and similar future formats).
- Always extract installment-level principal, interest, EMI, and taxes where available.
- Taxes can appear as tax/GST/applicable tax columns; map to tax_component, default to 0 when absent.
- Include every amortization installment row you can infer from the schedule/statement.
- Keep numeric fields as numbers (not strings); remove commas and currency symbols.
- If uncertain, return null only for optional fields.
- For statement-style documents where balance is not explicit, set balance_after_payment to null.
- Extract processing_fee from terms/statement when available.
- Account name context: {account_name}
- User-provided monthly EMI due date (day): {monthly_due_date}
- User confirms current month EMI paid: {current_month_emi_paid}
""".strip()

    async def upload_gemini_file(
        *,
        client: httpx.AsyncClient,
        file_bytes: bytes,
        display_name: str,
        mime_type: str = "application/pdf",
    ) -> GeminiFileRef:
        start_response = await client.post(
            _gemini_files_upload_endpoint(),
            params={"key": api_key},
            headers={
                "X-Goog-Upload-Protocol": "resumable",
                "X-Goog-Upload-Command": "start",
                "X-Goog-Upload-Header-Content-Length": str(len(file_bytes)),
                "X-Goog-Upload-Header-Content-Type": mime_type,
                "Content-Type": "application/json",
            },
            json={"file": {"display_name": display_name}},
        )
        if start_response.status_code >= 400:
            raise LoanAnalysisError("Gemini file upload initialization failed")

        upload_url = start_response.headers.get("X-Goog-Upload-URL")
        if not upload_url:
            raise LoanAnalysisError("Gemini did not return file upload URL")

        finalize_response = await client.post(
            upload_url,
            headers={
                "X-Goog-Upload-Offset": "0",
                "X-Goog-Upload-Command": "upload, finalize",
                "Content-Length": str(len(file_bytes)),
                "Content-Type": mime_type,
            },
            content=file_bytes,
        )
        if finalize_response.status_code >= 400:
            raise LoanAnalysisError("Gemini file upload finalization failed")

        payload = finalize_response.json()
        file_obj = payload.get("file")
        if not isinstance(file_obj, dict):
            raise LoanAnalysisError("Gemini file upload response missing file metadata")
        name = file_obj.get("name")
        uri = file_obj.get("uri")
        out_mime_type = file_obj.get("mimeType") or mime_type
        if not isinstance(name, str) or not isinstance(uri, str):
            raise LoanAnalysisError("Gemini file metadata was incomplete")
        size_bytes = file_obj.get("sizeBytes")
        return GeminiFileRef(
            name=name,
            uri=uri,
            mime_type=out_mime_type,
            display_name=file_obj.get("displayName"),
            size_bytes=int(size_bytes) if isinstance(size_bytes, str) and size_bytes.isdigit() else None,
        )

    uploaded_files: list[GeminiFileRef] = []

    async with httpx.AsyncClient(timeout=180.0) as client:
        amortization_ref = await upload_gemini_file(
            client=client,
            file_bytes=amortization_schedule_pdf,
            display_name=f"{account_name}-amortization-schedule",
        )
        uploaded_files.append(amortization_ref)
        terms_ref: GeminiFileRef | None = None
        if terms_conditions_pdf:
            terms_ref = await upload_gemini_file(
                client=client,
                file_bytes=terms_conditions_pdf,
                display_name=f"{account_name}-terms-conditions",
            )
            uploaded_files.append(terms_ref)

        parts: list[dict[str, Any]] = [{"text": prompt}]
        parts.append(
            {
                "file_data": {
                    "mime_type": amortization_ref.mime_type,
                    "file_uri": amortization_ref.uri,
                }
            }
        )
        if terms_ref:
            parts.append(
                {
                    "file_data": {
                        "mime_type": terms_ref.mime_type,
                        "file_uri": terms_ref.uri,
                    }
                }
            )

        payload = {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
            },
        }
        response = await client.post(
            _gemini_generate_endpoint(model),
            params={"key": api_key},
            json=payload,
        )
    if response.status_code >= 400:
        raise LoanAnalysisError(
            f"Gemini analysis failed ({response.status_code}): {response.text[:300]}"
        )

    data = response.json()
    parts_out = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [])
    )
    text_part = next(
        (
            item.get("text")
            for item in parts_out
            if isinstance(item, dict) and isinstance(item.get("text"), str)
        ),
        None,
    )
    if not text_part:
        raise LoanAnalysisError("Gemini returned no text payload")

    parsed_raw = _extract_json_object(text_part)
    loan_details = parsed_raw.get("loan_details")
    rows = parsed_raw.get("amortization_schedule")
    if not isinstance(loan_details, dict) or not isinstance(rows, list):
        raise LoanAnalysisError("Gemini response missing loan_details/amortization_schedule")

    try:
        extraction = LoanExtraction(
            loan_details=LoanTermsExtracted.model_validate(loan_details),
            amortization_schedule=_normalize_amortization_rows(rows),
        )
    except ValidationError as exc:
        raise LoanAnalysisError("Gemini response did not match expected schema") from exc

    computed = _calculate_metrics(
        extraction,
        monthly_due_date=monthly_due_date,
        current_month_emi_paid=current_month_emi_paid,
    )
    return LoanAnalysisResult(
        extraction=extraction,
        computed=computed,
        processing_metadata=GeminiProcessingMetadata(
            model=model,
            analyzed_at=datetime.now(UTC),
            uploaded_files=uploaded_files,
        ),
        raw_model_output=parsed_raw,
    )
