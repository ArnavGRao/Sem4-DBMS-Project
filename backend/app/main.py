from fastapi import FastAPI

from app.routers import accounts, health, users

app = FastAPI(
    title="UPI Transaction System API",
    version="0.1.0",
    description="Backend API for DBMS semester project (Task 4 scaffold).",
)

app.include_router(health.router, tags=["health"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
