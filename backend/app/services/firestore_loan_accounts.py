from __future__ import annotations

from firebase_admin import firestore

from app.core.firebase import firebase_app_ready
from app.schemas.loan_accounts import LoanAccountDocument


class FirestoreUnavailableError(RuntimeError):
    pass


def create_loan_account_document(payload: LoanAccountDocument) -> str:
    if not firebase_app_ready():
        raise FirestoreUnavailableError("Firebase is not configured")
    db = firestore.client()
    ref = db.collection("loanAccounts").document()
    ref.set(payload.model_dump(by_alias=True, mode="json"))
    return ref.id
