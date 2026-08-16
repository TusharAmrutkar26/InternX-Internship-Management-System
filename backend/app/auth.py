from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import settings
from app.database import get_database, verify_password

router = APIRouter()
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


def create_access_token(subject: str, role: str, email: str, name: str) -> str:
    expires_at = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRES_MINUTES)
    payload = {
        "sub": subject,
        "role": role,
        "email": email,
        "name": name,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def serialize_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "_id": str(user.get("_id")),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role"),
        "organization": user.get("organization"),
        "is_verified": user.get("is_verified", False),
    }


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    database = get_database()
    users = database["users"]
    email = payload.email.strip().lower()
    user = users.find_one({"email": email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(
        subject=str(user["_id"]),
        role=user.get("role", "student"),
        email=user.get("email", email),
        name=user.get("name", ""),
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.get("/me")
def me(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    try:
        object_id = ObjectId(user_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        ) from exc

    database = get_database()
    user = database["users"].find_one({"_id": object_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    return {"user": serialize_user(user)}
