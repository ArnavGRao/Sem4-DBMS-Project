from fastapi import APIRouter

import mysql.connector

from app.core.db import get_connection

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "backend"}


@router.get("/health/db")
def health_db_check() -> dict[str, str]:
    try:
        with get_connection() as connection:
            cursor = connection.cursor(prepared=True)
            try:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            finally:
                cursor.close()
        return {"status": "ok", "database": "connected"}
    except mysql.connector.Error as err:
        return {
            "status": "error",
            "database": "not connected",
            "details": str(err),
        }
    except Exception as err:
        return {
            "status": "error",
            "database": "not connected",
            "details": str(err),
        }
