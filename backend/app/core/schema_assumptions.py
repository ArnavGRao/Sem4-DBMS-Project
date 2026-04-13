"""
Task 2 schema is not finalized yet.

All assumed table and column names for Task 4 are centralized in this file so they can
be updated in one place after Task 2 DDL is finalized.
"""

USERS_TABLE = "users"
USERS_COLUMNS = {
    "full_name": "full_name",
    "email": "email",
    "phone": "phone",
    "password_hash": "password_hash",
}

ACCOUNTS_TABLE = "accounts"
ACCOUNTS_COLUMNS = {
    "user_id": "user_id",
    "vpa": "vpa",
    "balance": "balance",
}


def build_user_insert_sql() -> str:
    return (
        f"INSERT INTO {USERS_TABLE} "
        f"({USERS_COLUMNS['full_name']}, {USERS_COLUMNS['email']}, "
        f"{USERS_COLUMNS['phone']}, {USERS_COLUMNS['password_hash']}) "
        "VALUES (%s, %s, %s, %s)"
    )


def build_account_insert_sql() -> str:
    return (
        f"INSERT INTO {ACCOUNTS_TABLE} "
        f"({ACCOUNTS_COLUMNS['user_id']}, {ACCOUNTS_COLUMNS['vpa']}, "
        f"{ACCOUNTS_COLUMNS['balance']}) "
        "VALUES (%s, %s, %s)"
    )
