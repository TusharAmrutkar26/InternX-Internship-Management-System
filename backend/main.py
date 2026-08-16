from fastapi import FastAPI

from app.auth import router as auth_router
from app.database import initialize_database

app = FastAPI(title="InternX API", version="0.1.0")
app.include_router(auth_router, prefix="/auth")


@app.on_event("startup")
def startup_event() -> None:
    initialize_database()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "internx"}
