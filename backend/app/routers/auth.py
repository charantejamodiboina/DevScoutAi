from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import users_collection
from app.dependencies.user import get_current_user
from app.models.auth import (
    AuthResponse,
    AuthUser,
    LoginRequest,
    RegisterRequest,
)
from app.services.auth_service import (
    create_access_token,
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    request: RegisterRequest,
):
    email = request.email.lower()

    existing_user = await users_collection.find_one(
        {"email": email}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    now = datetime.now(timezone.utc)

    user_data = {
        "email": email,
        "password_hash": hash_password(
            request.password
        ),
        "provider": "credentials",
        "created_at": now,
        "updated_at": now,
    }

    result = await users_collection.insert_one(
        user_data
    )

    user_id = str(result.inserted_id)

    access_token = create_access_token(
        user_id=user_id,
        email=email,
    )

    return AuthResponse(
        access_token=access_token,
        user=AuthUser(
            id=user_id,
            email=email,
        ),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
)
async def login(
    request: LoginRequest,
):
    email = request.email.lower()

    user = await users_collection.find_one(
        {"email": email}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    password_hash = user.get(
        "password_hash"
    )

    if (
        not password_hash
        or not verify_password(
            request.password,
            password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])

    access_token = create_access_token(
        user_id=user_id,
        email=user["email"],
    )

    return AuthResponse(
        access_token=access_token,
        user=AuthUser(
            id=user_id,
            email=user["email"],
        ),
    )


@router.get(
    "/me",
    response_model=AuthUser,
)
async def get_me(
    current_user: dict = Depends(
        get_current_user
    ),
):
    return AuthUser(
        id=str(current_user["_id"]),
        email=current_user["email"],
    )