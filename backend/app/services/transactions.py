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

def get_transaction_history(vpa: str) -> list[dict[str, object]]:
    query = """
    SELECT * FROM vw_User_Transaction_History
    WHERE sender_vpa = %s OR receiver_vpa = %s
    ORDER BY created_at DESC
    """

    if not vpa:
        raise ServiceError(400, "VPA is required")

    vpa = vpa.strip()
    if not vpa:
        raise ServiceError(400, "VPA is required")

    try:
        with get_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(query, (vpa, vpa))
                rows = cursor.fetchall()

                transactions: list[dict[str, object]] = []
                for row in rows:
                    if row["sender_vpa"] == vpa:
                        txn_type = "DEBIT"
                    elif row["receiver_vpa"] == vpa:
                        txn_type = "CREDIT"
                    else:
                        continue

                    transactions.append(
                        {
                            "transaction_id": row["transaction_id"],
                            "sender_vpa": row["sender_vpa"],
                            "receiver_vpa": row["receiver_vpa"],
                            "amount": str(row["amount"]),
                            "status": row["status"],
                            "created_at": str(row["created_at"]),
                            "type": txn_type,
                        }
                    )

                if not transactions:
                    raise ServiceError(404, "No transactions found for this VPA")

                return transactions
            finally:
                cursor.close()
    except ServiceError:
        raise
    except mysql.connector.Error as err:
        message = err.msg if hasattr(err, "msg") else str(err)
        raise ServiceError(500, f"Database error: {message}") from err
