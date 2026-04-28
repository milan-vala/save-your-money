from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.auth.deps import get_current_user
from app.schemas.loan_accounts import (
    CreateLoanAccountResponse,
    LoanAccountDocument,
    LoanAccountsListResponse,
)
from app.services.firestore_loan_accounts import (
    FirestoreUnavailableError,
    create_loan_account_document,
    list_loan_accounts_for_user,
)
from app.services.loan_analysis_service import (
    LoanAnalysisError,
    LoanConfigError,
    LoanInputError,
    analyze_loan_documents,
    read_pdf_upload,
)

router = APIRouter(prefix="/loan-accounts", tags=["loan-accounts"])


@router.get("", response_model=LoanAccountsListResponse)
async def get_loan_accounts(
    user: dict[str, Any] = Depends(get_current_user),
) -> LoanAccountsListResponse:
    uid = user.get("uid")
    if not isinstance(uid, str) or not uid:
        raise HTTPException(status_code=401, detail="Invalid authenticated user")
    try:
        items = list_loan_accounts_for_user(user_id=uid)
        return LoanAccountsListResponse(items=items)
    except FirestoreUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch loan accounts: {exc!s}",
        ) from exc


@router.post(
    "",
    response_model=CreateLoanAccountResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_loan_account(
    account_name: str = Form(...),
    amortization_schedule: UploadFile = File(...),
    terms_conditions: UploadFile | None = File(None),
    user: dict[str, Any] = Depends(get_current_user),
) -> CreateLoanAccountResponse:
    account_name = account_name.strip()
    if not account_name:
        raise HTTPException(status_code=400, detail="account_name is required")

    uid = user.get("uid")
    if not isinstance(uid, str) or not uid:
        raise HTTPException(status_code=401, detail="Invalid authenticated user")

    try:
        amortization_pdf, amortization_meta = await read_pdf_upload(
            amortization_schedule,
            required=True,
            field_name="amortization_schedule",
        )
        terms_pdf, terms_meta = await read_pdf_upload(
            terms_conditions,
            required=False,
            field_name="terms_conditions",
        )
        if amortization_pdf is None or amortization_meta is None:
            raise HTTPException(status_code=400, detail="amortization_schedule is required")

        analysis = await analyze_loan_documents(
            account_name=account_name,
            amortization_schedule_pdf=amortization_pdf,
            terms_conditions_pdf=terms_pdf,
        )

        now = datetime.now(UTC)
        doc = LoanAccountDocument(
            userId=uid,
            accountName=account_name,
            amortizationScheduleFile=amortization_meta,
            termsConditionsFile=terms_meta,
            analysis=analysis,
            createdAt=now,
            updatedAt=now,
            status="ready",
        )
        document_id = create_loan_account_document(doc)
        return CreateLoanAccountResponse(id=document_id)
    except LoanInputError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LoanConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except LoanAnalysisError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except FirestoreUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not process loan account documents",
        ) from exc
