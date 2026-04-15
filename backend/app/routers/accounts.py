from fastapi import APIRouter, HTTPException, status

from app.core.service_errors import ServiceError
from app.models.requests import AccountCreateRequest, AddBalanceRequest
from app.services.accounts import create_account, add_balance, get_account_details

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


@router.get("/{account_id}")
def get_account(account_id: int) -> dict[str, object]:
    """Get account details including current balance"""
    try:
        result = get_account_details(account_id)
        return result
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/{account_id}/add-balance")
def add_balance_to_account(account_id: int, payload: AddBalanceRequest) -> dict[str, object]:
    """Add balance to an account (for testing/demo purposes)"""
    try:
        result = add_balance(account_id, payload.amount)
        return {
            "message": "Balance added successfully.",
            **result,
        }
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
