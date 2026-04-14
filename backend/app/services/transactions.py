import mysql.connector

from app.core.db import get_connection
from app.core.service_errors import ServiceError
from app.models.requests import TransferRequest


def process_transfer(payload: TransferRequest) -> None:
    try:
        with get_connection() as connection:
            cursor = connection.cursor()
            try:
                cursor.callproc(
                    "sp_Process_Transfer",
                    (payload.sender_vpa, payload.receiver_vpa, payload.amount),
                )

                # Drain all stored procedure result sets to avoid unread-result errors.
                for result in cursor.stored_results():
                    result.fetchall()
                    result.close()

                while cursor.nextset():
                    pass

                connection.commit()
            finally:
                cursor.close()
    except mysql.connector.Error as err:
        message = err.msg if hasattr(err, "msg") else str(err)
        lowered_message = message.lower()

        if "ERR_INSUFFICIENT_BALANCE" in message:
            raise ServiceError(400, "Insufficient balance") from err
        elif "ERR_INVALID_VPA" in message:
            raise ServiceError(400, "Invalid VPA") from err
        elif "ERR_SELF_TRANSFER" in message:
            raise ServiceError(400, "Cannot transfer to self") from err
        elif "chk_positive_balance" in lowered_message or "check constraint" in lowered_message:
            raise ServiceError(400, "Insufficient balance") from err

        raise ServiceError(500, f"Database error: {message}") from err
