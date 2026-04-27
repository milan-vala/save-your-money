from __future__ import annotations
import json
from typing import TYPE_CHECKING
import firebase_admin
from firebase_admin import credentials

if TYPE_CHECKING:
    pass

def init_firebase_app(*, credentials_path: str | None, credentials_json: str | None) -> None:
    if firebase_admin._apps:
        return
    if credentials_json:
        cred = credentials.Certificate(json.loads(credentials_json))
        firebase_admin.initialize_app(cred)
        return
    if credentials_path:
        cred = credentials.Certificate(credentials_path)
        firebase_admin.initialize_app(cred)


def firebase_app_ready() -> bool:
    return bool(firebase_admin._apps)
