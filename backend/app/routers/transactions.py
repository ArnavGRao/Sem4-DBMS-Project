from fastapi import APIRouter, HTTPException

from app.core.service_errors import ServiceError
from app.models.requests import TransferRequest
from app.services.transactions import get_transaction_history, process_transfer

router = APIRouter()


def _fetch_history(vpa: str):
    try:
        return get_transaction_history(vpa)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/transfer")
def transfer(payload: TransferRequest) -> dict[str, str]:
    try:
        process_transfer(payload)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    return {
        "message": "Transfer successful"
    }


@router.get("/history/")
def get_history(vpa: str):
    return _fetch_history(vpa)


@router.get("/history/{vpa}")
def get_history_legacy(vpa: str):
    return _fetch_history(vpa)
