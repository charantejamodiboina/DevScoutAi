from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.database import (
    discovery_cache_collection,
    user_profiles_collection,
)
from app.dependencies.user import get_current_user_id
from app.services.ai_service import analyze_opportunities
from app.services.discovery_service import deduplicate_results
from app.services.freshness_service import (
    filter_recent_results,
)
from app.services.query_service import (
    generate_search_queries,
)
from app.services.search_filter_service import (
    get_google_time_filter,
)
from app.services.serpapi_service import search_google
from app.services.source_service import (
    prioritize_sources,
)

router = APIRouter(
    prefix="/discovery",
    tags=["Discovery"],
)


class QueryGenerationRequest(BaseModel):
    opportunity_type: Literal[
        "job",
        "certification",
        "exam_voucher",
        "hackathon",
        "course",
    ]

    location: str | None = None

    count: int = Field(
        default=5,
        ge=1,
        le=10,
    )


class DiscoveryRunRequest(BaseModel):
    opportunity_type: Literal[
        "job",
        "certification",
        "exam_voucher",
        "hackathon",
        "course",
    ]

    location: str | None = None

    query_count: int = Field(
        default=3,
        ge=1,
        le=5,
    )

    results_per_query: int = Field(
        default=10,
        ge=1,
        le=20,
    )

    max_age_hours: int | None = Field(
        default=None,
        ge=1,
        le=720,
    )

    strict_freshness: bool = False


def resolve_max_age_hours(
    opportunity_type: str,
    max_age_hours: int | None,
) -> int | None:
    if max_age_hours is not None:
        return max_age_hours

    if opportunity_type == "job":
        return 24

    return None


def build_cache_key(
    user_id: str,
    request: DiscoveryRunRequest,
    max_age_hours: int | None,
) -> dict:
    return {
        "user_id": user_id,
        "opportunity_type": request.opportunity_type,
        "location": request.location,
        "query_count": request.query_count,
        "results_per_query": request.results_per_query,
        "max_age_hours": max_age_hours,
        "strict_freshness": request.strict_freshness,
    }


@router.post("/queries")
async def create_personalized_queries(
    request: QueryGenerationRequest,
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
            detail=(
                "Create your profile before generating "
                "personalized search queries"
            ),
        )

    queries = await generate_search_queries(
        user_profile=profile,
        opportunity_type=request.opportunity_type,
        location=request.location,
        count=request.count,
    )

    return {
        "opportunity_type": request.opportunity_type,
        "count": len(queries),
        "queries": queries,
    }


@router.post("/run")
async def run_personalized_discovery(
    request: DiscoveryRunRequest,
    user_id: str = Depends(get_current_user_id),
):
    # Resolve the effective freshness once
    max_age_hours = resolve_max_age_hours(
        request.opportunity_type,
        request.max_age_hours,
    )

    # Use the effective values for caching
    cache_key = build_cache_key(
        user_id,
        request,
        max_age_hours,
    )

    # Check cache first
    cached_feed = await discovery_cache_collection.find_one(
        cache_key
    )

    if cached_feed:
        generated_at = cached_feed.get(
            "generated_at"
        )

        if generated_at:
    # Old MongoDB records may contain naive datetimes
            if generated_at.tzinfo is None:
                generated_at = generated_at.replace(
                    tzinfo=timezone.utc
                )

            expires_at = generated_at + timedelta(
                hours=1
            )

            if datetime.now(timezone.utc) < expires_at:
                return {
                    "cached": True,
                    "generated_at": generated_at,
                    "opportunity_type": (
                        request.opportunity_type
                    ),
                    "generated_queries": cached_feed.get(
                        "generated_queries",
                        [],
                    ),
                    "opportunities": cached_feed.get(
                        "opportunities",
                        [],
                    ),
                    "max_age_hours": max_age_hours,
                    "strict_freshness": (
                        request.strict_freshness
                    ),
                }

    # Get user profile
    profile = await user_profiles_collection.find_one(
        {
            "user_id": user_id,
        }
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Create your profile first",
        )

    # Generate personalized queries
    try:
        queries = await generate_search_queries(
            user_profile=profile,
            opportunity_type=request.opportunity_type,
            location=request.location,
            count=request.query_count,
        )

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI query generation is temporarily unavailable. "
                "Please try again shortly."
            ),
        )

    # Convert freshness requirement to SerpApi filter
    time_filter = get_google_time_filter(
        max_age_hours
    )

    # Search generated queries
    all_results = []

    for query in queries:
        results = await search_google(
            query=query,
            num_results=request.results_per_query,
            time_filter=time_filter,
        )

        all_results.extend(results)

    # Deduplicate
    unique_results = deduplicate_results(
        all_results
    )

    prioritized_results = prioritize_sources(
        unique_results
    )

    # Apply local freshness validation
    if max_age_hours:
        filtered_results = filter_recent_results(
            prioritized_results,
            max_age_hours=max_age_hours,
            strict=request.strict_freshness,
        )
    else:
        filtered_results = prioritized_results

    # Analyze and rank with AI
    analysis = await analyze_opportunities(
        query=(
            f"Personalized "
            f"{request.opportunity_type} discovery"
        ),
        results=filtered_results,
        user_profile=profile,
    )

    opportunities = analysis.get(
        "opportunities",
        [],
    )

    generated_at = datetime.now(timezone.utc)

    # Cache feed
    cache_data = {
        "generated_queries": queries,
        "opportunities": opportunities,
        "generated_at": generated_at,
    }

    await discovery_cache_collection.update_one(
        cache_key,
        {
            "$set": cache_data,
        },
        upsert=True,
    )

    return {
        "cached": False,
        "generated_at": generated_at,
        "opportunity_type": request.opportunity_type,
        "generated_queries": queries,
        "raw_results_count": len(all_results),
        "unique_results_count": len(unique_results),
        "fresh_results_count": len(filtered_results),
        "max_age_hours": max_age_hours,
        "strict_freshness": request.strict_freshness,
        "opportunities": opportunities,
    }


@router.post("/refresh")
async def refresh_discovery(
    request: DiscoveryRunRequest,
    user_id: str = Depends(get_current_user_id),
):
    max_age_hours = resolve_max_age_hours(
        request.opportunity_type,
        request.max_age_hours,
    )

    cache_key = build_cache_key(
        user_id,
        request,
        max_age_hours,
    )

    result = await discovery_cache_collection.delete_one(
        cache_key
    )

    return {
        "message": (
            "Discovery cache cleared successfully."
            if result.deleted_count
            else "No matching cached feed was found."
        )
    }