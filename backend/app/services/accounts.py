import mysql.connector
from mysql.connector import errorcode

from app.core.db import get_connection
from app.core.schema_assumptions import build_account_insert_sql
from app.core.service_errors import ServiceError
from app.models.requests import AccountCreateRequest


def create_account(payload: AccountCreateRequest) -> int:
    query = """
    INSERT INTO Accounts (user_id, vpa, balance, status)
    VALUES (%s, %s, %s, %s)
    """
    user_id = payload.user_id
    vpa = payload.vpa
    balance = payload.initial_balance
    status = "Active"
    check_constraint_errno = getattr(errorcode, "ER_CHECK_CONSTRAINT_VIOLATED", 3819)

    try:
        with get_connection() as connection:
            cursor = connection.cursor(prepared=True)
            try:
                cursor.execute("SELECT user_id FROM Users WHERE user_id = %s", (user_id,))
                user = cursor.fetchone()
                if not user:
                    raise ServiceError(status_code=404, detail="User does not exist for the provided user_id.")

                cursor.execute(query, (user_id, vpa, balance, status))
                connection.commit()
                return cursor.lastrowid
            finally:
                cursor.close()
    except mysql.connector.IntegrityError as err:
        if err.errno == errorcode.ER_DUP_ENTRY:
            message = (err.msg or "").lower()
            if "vpa" in message:
                raise ServiceError(status_code=409, detail="VPA already exists.") from err
            raise ServiceError(status_code=409, detail="Duplicate account data.") from err

        if err.errno == errorcode.ER_NO_REFERENCED_ROW_2:
            raise ServiceError(status_code=400, detail="User does not exist for the provided user_id.") from err

        if err.errno == check_constraint_errno:
            raise ServiceError(status_code=400, detail="Check constraint violated.") from err

        raise ServiceError(status_code=400, detail="Invalid account input for current DB schema.") from err
    except mysql.connector.Error as err:
        raise ServiceError(
            status_code=500,
            detail=f"Database failure during account creation: {err.msg}",
        ) from err
