from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from passlib.context import CryptContext
from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_database():
    client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command("ping")
    except PyMongoError as exc:  # pragma: no cover - connection validation only
        raise RuntimeError(f"MongoDB connection failed: {exc}") from exc
    return client[settings.MONGODB_DB_NAME]


def get_required_indexes() -> dict[str, list[dict[str, Any]]]:
    return {
        "users": [
            {"name": "email_1", "fields": [("email", 1)], "unique": True},
        ],
        "student_profiles": [
            {"name": "user_id_1", "fields": [("user_id", 1)], "unique": True},
        ],
        "company_profiles": [
            {"name": "user_id_1", "fields": [("user_id", 1)], "unique": True},
        ],
        "internships": [
            {"name": "company_id_1", "fields": [("company_id", 1)]},
            {"name": "status_1", "fields": [("status", 1)]},
        ],
        "applications": [
            {"name": "student_id_1", "fields": [("student_id", 1)]},
            {"name": "internship_id_1", "fields": [("internship_id", 1)]},
        ],
    }


def get_demo_users() -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    password_hash = pwd_context.hash("Demo123!")
    return [
        {
            "name": "Aarav Student",
            "email": "student@internx.demo",
            "password_hash": password_hash,
            "role": "student",
            "organization": "InternX Academy",
            "is_verified": True,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Ishita Faculty",
            "email": "faculty@internx.demo",
            "password_hash": password_hash,
            "role": "faculty",
            "organization": "InternX University",
            "is_verified": True,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "TechNova HR",
            "email": "company@internx.demo",
            "password_hash": password_hash,
            "role": "company",
            "organization": "TechNova Labs",
            "is_verified": True,
            "created_at": now,
            "updated_at": now,
        },
    ]


def initialize_database() -> None:
    database = get_database()
    print("MongoDB connected")

    for collection_name, index_specs in get_required_indexes().items():
        collection = database[collection_name]
        for spec in index_specs:
            collection.create_index(
                spec["fields"],
                name=spec["name"],
                unique=spec.get("unique", False),
            )

    print("indexes verified")

    users_collection = database["users"]
    demo_users = get_demo_users()
    created_count = 0

    for user in demo_users:
        email = user["email"].lower()
        existing_user = users_collection.find_one({"email": email})
        if existing_user is None:
            users_collection.insert_one({
                **user,
                "email": email,
                "created_at": user["created_at"],
                "updated_at": user["updated_at"],
            })
            created_count += 1

    demo_user_count = users_collection.count_documents({"email": {"$in": [u["email"].lower() for u in demo_users]}})
    print(f"demo-user count: {demo_user_count}")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
