from fastapi import APIRouter, HTTPException, status

from app.core.service_errors import ServiceError
from app.models.requests import UserRegistrationRequest
from app.services.users import register_user

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegistrationRequest) -> dict[str, object]:
    try:
        user_id = register_user(payload)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    return {
        "message": "User registered successfully.",
        "user_id": user_id,
    }
