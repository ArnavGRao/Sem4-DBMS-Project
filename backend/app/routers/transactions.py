from fastapi import APIRouter, HTTPException

from app.core.service_errors import ServiceError
from app.models.requests import TransferRequest
from app.services.transactions import get_transaction_history, process_transfer

router = APIRouter()


@router.post("/transfer")
def transfer(payload: TransferRequest) -> dict[str, str]:
    try:
        process_transfer(payload)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    return {
        "message": "Transfer successful"
    }


@router.get("/history/{vpa}")
def get_history(vpa: str):
    try:
        return get_transaction_history(vpa)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
