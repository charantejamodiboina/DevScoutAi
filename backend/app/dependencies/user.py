from typing import Annotated

import jwt
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

from app.config import settings
from app.database import users_collection


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


async def get_current_user(
    token: Annotated[
        str,
        Depends(oauth2_scheme),
    ],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_exception

        user = await users_collection.find_one(
            {
                "_id": ObjectId(user_id),
            }
        )

        if not user:
            raise credentials_exception

        user["_id"] = str(user["_id"])

        return user

    except (
        InvalidTokenError,
        ValueError,
    ):
        raise credentials_exception

async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> str:
    return current_user["_id"]