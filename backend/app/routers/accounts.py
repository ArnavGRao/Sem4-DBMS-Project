from fastapi import APIRouter, HTTPException, status

from app.core.service_errors import ServiceError
from app.models.requests import AccountCreateRequest
from app.services.accounts import create_account

router = APIRouter()


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create(payload: AccountCreateRequest) -> dict[str, object]:
    try:
        account_id = create_account(payload)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    return {
        "message": "Account created successfully.",
        "account_id": account_id,
    }
