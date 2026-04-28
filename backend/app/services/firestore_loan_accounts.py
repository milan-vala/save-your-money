from __future__ import annotations

from typing import Any, cast

from firebase_admin import firestore
from google.api_core.exceptions import FailedPrecondition, InvalidArgument

from app.core.firebase import firebase_app_ready
from app.schemas.loan_accounts import LoanAccountDocument, LoanAccountListItem


class FirestoreUnavailableError(RuntimeError):
    pass


class LoanAccountNotFoundError(RuntimeError):
    pass


def create_loan_account_document(payload: LoanAccountDocument) -> str:
    if not firebase_app_ready():
        raise FirestoreUnavailableError("Firebase is not configured")
    db = firestore.client()
    ref = db.collection("loanAccounts").document()
    ref.set(payload.model_dump(by_alias=True, mode="json"))
    return ref.id


def list_loan_accounts_for_user(*, user_id: str) -> list[LoanAccountListItem]:
    if not firebase_app_ready():
        raise FirestoreUnavailableError("Firebase is not configured")
    db = firestore.client()
    base_query = db.collection("loanAccounts").where("userId", "==", user_id)
    try:
        docs = base_query.order_by("createdAt", direction="DESCENDING").stream()
    except (FailedPrecondition, InvalidArgument):
        docs = base_query.stream()

    records: list[tuple[object, LoanAccountListItem]] = []
    for doc in docs:
        data = doc.to_dict() or {}
        account_name = data.get("accountName")
        if isinstance(account_name, str) and account_name.strip():
            records.append(
                (
                    data.get("createdAt"),
                    LoanAccountListItem(id=doc.id, accountName=account_name.strip()),
                )
            )

    records.sort(key=lambda item: str(item[0] or ""), reverse=True)
    return [item for _, item in records]


def get_loan_account_for_user(*, user_id: str, loan_account_id: str) -> dict[str, object]:
    if not firebase_app_ready():
        raise FirestoreUnavailableError("Firebase is not configured")
    db = firestore.client()
    snapshot_any = cast(Any, db.collection("loanAccounts").document(loan_account_id).get())
    if not cast(bool, getattr(snapshot_any, "exists", False)):
        raise LoanAccountNotFoundError("Loan account not found")

    data = cast(dict[str, object], getattr(snapshot_any, "to_dict")() or {})
    if data.get("userId") != user_id:
        raise LoanAccountNotFoundError("Loan account not found")

    result: dict[str, object] = {"id": cast(str, getattr(snapshot_any, "id"))}
    result.update(data)
    return result
