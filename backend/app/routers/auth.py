from fastapi import APIRouter, HTTPException

from app.core.service_errors import ServiceError
from app.models.requests import LoginRequest
from app.services.users import authenticate_user

router = APIRouter()


@router.post("/login")
def login(payload: LoginRequest) -> dict[str, object]:
    try:
        return authenticate_user(payload)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc