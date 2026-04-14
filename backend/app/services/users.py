import bcrypt
import mysql.connector
from mysql.connector import errorcode

from app.core.db import get_connection
from app.core.schema_assumptions import build_user_insert_sql
from app.core.security import hash_password
from app.core.service_errors import ServiceError
from app.models.requests import UserRegistrationRequest


def register_user(payload: UserRegistrationRequest) -> int:
    query = """
    INSERT INTO Users (mobile_number, password_hash)
    VALUES (%s, %s)
    """
    hashed_password = bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        with get_connection() as connection:
            cursor = connection.cursor(prepared=True)
            try:
                cursor.execute(query, (payload.phone, hashed_password))
                connection.commit()
                return cursor.lastrowid
            finally:
                cursor.close()
    except mysql.connector.IntegrityError as err:
        if err.errno == errorcode.ER_DUP_ENTRY:
            raise ServiceError(
                status_code=409,
                detail="Duplicate user identity. Email or phone is already registered.",
            ) from err
        raise ServiceError(status_code=400, detail="Invalid user input for current DB schema.") from err
    except mysql.connector.Error as err:
        raise ServiceError(
            status_code=500,
            detail=f"Database failure during registration: {err.msg}",
        ) from err
