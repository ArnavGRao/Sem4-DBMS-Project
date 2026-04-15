import re
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class UserRegistrationRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[str] = Field(default=None, min_length=5, max_length=255)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Full name cannot be empty.")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip().lower()
        if not re.fullmatch(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", cleaned):
            raise ValueError("Invalid email format.")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = value.strip()
        if not re.fullmatch(r"^[0-9]{10,15}$", cleaned):
            raise ValueError("Phone must contain only digits and be 10 to 15 characters.")
        return cleaned


class AccountCreateRequest(BaseModel):
    user_id: int = Field(gt=0)
    vpa: str = Field(min_length=5, max_length=100)
    initial_balance: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), max_digits=14, decimal_places=2)

    @field_validator("vpa")
    @classmethod
    def validate_vpa(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not re.fullmatch(r"^[a-z0-9._-]{2,}@[a-z]{2,}$", cleaned):
            raise ValueError("VPA format is invalid. Expected something like name@bank.")
        return cleaned


class TransferRequest(BaseModel):
    sender_vpa: str = Field(min_length=5, max_length=100)
    receiver_vpa: str = Field(min_length=5, max_length=100)
    amount: Decimal = Field(gt=Decimal("0.00"), max_digits=14, decimal_places=2)

    @field_validator("sender_vpa", "receiver_vpa")
    @classmethod
    def validate_vpa(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not re.fullmatch(r"^[a-z0-9._-]{2,}@[a-z]{2,}$", cleaned):
            raise ValueError("VPA format is invalid. Expected something like name@bank.")
        return cleaned

    @model_validator(mode="after")
    def validate_parties_are_different(self) -> "TransferRequest":
        if self.sender_vpa == self.receiver_vpa:
            raise ValueError("Sender and receiver VPA must be different.")
        return self


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class AddBalanceRequest(BaseModel):
    account_id: int = Field(gt=0)
    amount: Decimal = Field(gt=Decimal("0.00"), max_digits=14, decimal_places=2)
