from contextlib import contextmanager
from typing import Iterator

import mysql.connector
from mysql.connector.connection import MySQLConnection

from app.core.config import settings


def create_mysql_connection() -> MySQLConnection:
    return mysql.connector.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        autocommit=False,
    )


@contextmanager
def get_connection() -> Iterator[MySQLConnection]:
    connection = create_mysql_connection()
    try:
        yield connection
    finally:
        connection.close()
