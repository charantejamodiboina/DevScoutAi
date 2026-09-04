from datetime import datetime, timezone

from bson import ObjectId
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.database import (
    database,
    saved_opportunities_collection,
    search_history_collection,
    user_profiles_collection,
)
from app.dependencies.user import get_current_user_id
from app.models.saved_opportunity import SavedOpportunity
from app.services.ai_service import analyze_opportunities
from app.services.serpapi_service import search_google
from app.routers.auth import router as auth_router
from app.routers.profile import (
    router as profile_router,
)
from app.routers.discovery import ( router as discovery_router)

app = FastAPI(
    title="DevScout AI",
    description=(
        "AI-powered software engineering opportunity "
        "intelligence platform"
    ),
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(discovery_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str = Field(
        ...,
        examples=["free AI certifications 2026"],
    )

    num_results: int = Field(
        default=10,
        ge=1,
        le=20,
    )


@app.get("/")
async def root():
    return {
        "message": "DevScout AI API is running 🚀"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
async def database_test():
    try:
        await database.command("ping")

        return {
            "status": "MongoDB connected successfully"
        }

    except Exception as error:
        return {
            "status": "MongoDB connection failed",
            "error": str(error),
        }


@app.post("/search")
async def search_opportunities(
    request: SearchRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        normalized_query = request.query.strip().lower()

        # Check the user's search cache
        cached_search = await search_history_collection.find_one(
            {
                "user_id": user_id,
                "query": normalized_query,
                "num_results": request.num_results,
            }
        )

        # Return cached results
        if cached_search:
            return {
                "query": request.query,
                "count": len(cached_search["results"]),
                "cached": True,
                "searched_at": cached_search["searched_at"],
                "results": cached_search["results"],
            }

        # Call SerpApi
        results = await search_google(
            query=request.query,
            num_results=request.num_results,
        )

        # Save search for this user
        search_data = {
            "user_id": user_id,
            "query": normalized_query,
            "original_query": request.query,
            "num_results": request.num_results,
            "results": results,
            "searched_at": datetime.now(timezone.utc),
        }

        await search_history_collection.insert_one(
            search_data
        )

        return {
            "query": request.query,
            "count": len(results),
            "cached": False,
            "searched_at": search_data["searched_at"],
            "results": results,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.get("/history")
async def get_search_history(
    user_id: str = Depends(get_current_user_id),
):
    history = []

    cursor = (
        search_history_collection
        .find(
            {"user_id": user_id},
            {
                "query": 1,
                "original_query": 1,
                "num_results": 1,
                "searched_at": 1,
            },
        )
        .sort("searched_at", -1)
        .limit(50)
    )

    async for item in cursor:
        history.append(
            {
                "_id": str(item["_id"]),
                "query": item.get(
                    "original_query",
                    item.get("query", ""),
                ),
                "num_results": item.get(
                    "num_results",
                    0,
                ),
                "searched_at": item.get(
                    "searched_at"
                ),
            }
        )

    return {
        "count": len(history),
        "history": history,
    }


@app.post("/search/analyze")
async def search_and_analyze(
    request: SearchRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        normalized_query = request.query.strip().lower()

        # Get this user's profile for AI personalization
        profile = await user_profiles_collection.find_one(
            {"user_id": user_id}
        )

        if profile:
            profile["_id"] = str(profile["_id"])

        # Check search cache for this user
        cached_search = await search_history_collection.find_one(
            {
                "user_id": user_id,
                "query": normalized_query,
                "num_results": request.num_results,
            }
        )

        if cached_search:
            results = cached_search["results"]
            source = "cache"

        else:
            results = await search_google(
                query=request.query,
                num_results=request.num_results,
            )

            search_data = {
                "user_id": user_id,
                "query": normalized_query,
                "original_query": request.query,
                "num_results": request.num_results,
                "results": results,
                "searched_at": datetime.now(
                    timezone.utc
                ),
            }

            await search_history_collection.insert_one(
                search_data
            )

            source = "serpapi"

        # Analyze opportunities with the user's profile
        analysis = await analyze_opportunities(
            query=request.query,
            results=results,
            user_profile=profile,
        )

        return {
            "query": request.query,
            "source": source,
            "raw_results_count": len(results),
            "profile_used": profile is not None,
            "opportunities": analysis.get(
                "opportunities",
                [],
            ),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.post("/opportunities/save")
async def save_opportunity(
    opportunity: SavedOpportunity,
    user_id: str = Depends(get_current_user_id),
):
    existing = await saved_opportunities_collection.find_one(
        {
            "user_id": user_id,
            "url": opportunity.url,
        }
    )

    if existing:
        return {
            "message": "Opportunity already saved",
            "saved": False,
            "id": str(existing["_id"]),
        }

    opportunity_data = {
        "user_id": user_id,
        **opportunity.model_dump(),
        "saved_at": datetime.now(timezone.utc),
    }

    result = await saved_opportunities_collection.insert_one(
        opportunity_data
    )

    return {
        "message": "Opportunity saved successfully",
        "saved": True,
        "id": str(result.inserted_id),
    }


@app.get("/opportunities/saved")
async def get_saved_opportunities(
    user_id: str = Depends(get_current_user_id),
):
    opportunities = []

    cursor = (
        saved_opportunities_collection
        .find({"user_id": user_id})
        .sort("saved_at", -1)
    )

    async for item in cursor:
        item["_id"] = str(item["_id"])
        opportunities.append(item)

    return {
        "count": len(opportunities),
        "opportunities": opportunities,
    }


@app.delete(
    "/opportunities/saved/{opportunity_id}"
)
async def delete_saved_opportunity(
    opportunity_id: str,
    user_id: str = Depends(get_current_user_id),
):
    try:
        result = await saved_opportunities_collection.delete_one(
            {
                "_id": ObjectId(opportunity_id),
                "user_id": user_id,
            }
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Saved opportunity not found",
            )

        return {
            "message": "Opportunity deleted successfully"
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid opportunity ID",
        )