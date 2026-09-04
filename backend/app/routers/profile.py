from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import user_profiles_collection
from app.dependencies.user import get_current_user_id
from app.models.user_profiles import UserProfile


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


@router.get("")
async def get_profile(
    user_id: str = Depends(get_current_user_id),
):
    profile = await user_profiles_collection.find_one(
        {
            "user_id": user_id,
        }
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    profile["_id"] = str(profile["_id"])

    return profile


@router.put("")
async def update_profile(
    profile: UserProfile,
    user_id: str = Depends(get_current_user_id),
):
    profile_data = {
        "user_id": user_id,
        **profile.model_dump(),
        "updated_at": datetime.now(timezone.utc),
    }

    await user_profiles_collection.update_one(
        {
            "user_id": user_id,
        },
        {
            "$set": profile_data,
        },
        upsert=True,
    )

    return {
        "message": "Profile updated successfully",
    }