import bcrypt
import mysql.connector
from mysql.connector import errorcode

from app.core.db import get_connection
from app.core.service_errors import ServiceError
from app.models.requests import LoginRequest, UserRegistrationRequest


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


def _verify_password(plain_password: str, stored_password: str) -> bool:
    if stored_password.startswith("$2"):
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), stored_password.encode("utf-8"))
        except ValueError:
            return False

    return plain_password == stored_password


def authenticate_user(payload: LoginRequest) -> dict[str, object]:
    identifier = payload.identifier.strip().lower()

    try:
        with get_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(
                    "SELECT user_id, mobile_number, password_hash FROM Users WHERE LOWER(mobile_number) = %s",
                    (identifier,),
                )
                user = cursor.fetchone()

                if user is None:
                    cursor.execute(
                        """
                        SELECT u.user_id, u.mobile_number, u.password_hash
                        FROM Users u
                        INNER JOIN Accounts a ON a.user_id = u.user_id
                        WHERE LOWER(a.vpa) = %s
                        LIMIT 1
                        """,
                        (identifier,),
                    )
                    user = cursor.fetchone()

                if user is None or not _verify_password(payload.password, user["password_hash"]):
                    raise ServiceError(status_code=401, detail="Invalid credentials.")

                cursor.execute(
                    """
                    SELECT account_id, vpa, balance, status, created_at
                    FROM Accounts
                    WHERE user_id = %s
                    ORDER BY account_id ASC
                    """,
                    (user["user_id"],),
                )
                accounts = [
                    {
                        "id": account["account_id"],
                        "name": f"Account {index + 1}",
                        "vpa": account["vpa"],
                        "balance": str(account["balance"]),
                        "status": account["status"],
                    }
                    for index, account in enumerate(cursor.fetchall())
                ]

                return {
                    "user_id": user["user_id"],
                    "mobile_number": user["mobile_number"],
                    "accounts": accounts,
                    "active_account_id": accounts[0]["id"] if accounts else None,
                }
            finally:
                cursor.close()
    except ServiceError:
        raise
    except mysql.connector.Error as err:
        raise ServiceError(
            status_code=500,
            detail=f"Database failure during login: {err.msg}",
        ) from err
