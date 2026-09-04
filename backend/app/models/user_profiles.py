from typing import Literal

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    name: str | None = None
    skills: list[str] = Field(
        default_factory=list
    )

    experience_years: float = Field(
        ge=0,
        default=0,
    )

    job_roles: list[str] = Field(
        default_factory=list
    )

    preferred_locations: list[str] = Field(
        default_factory=list
    )

    opportunity_types: list[
        Literal[
            "job",
            "internship",
            "hackathon",
            "certification",
            "course",
            "exam_voucher",
        ]
    ] = Field(default_factory=list)

    interests: list[str] = Field(
        default_factory=list
    )

    bio: str | None = Field(
        default=None,
        max_length=1000,
    )