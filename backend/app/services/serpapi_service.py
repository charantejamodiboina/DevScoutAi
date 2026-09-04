import httpx

from app.config import settings


SERPAPI_URL = "https://serpapi.com/search.json"


async def search_google(
    query: str,
    num_results: int = 10,
    time_filter: str | None = None,
):
    params = {
        "engine": "google",
        "q": query,
        "api_key": settings.SERPAPI_API_KEY,
        "num": num_results,
    }

    if time_filter:
        params["tbs"] = time_filter

    async with httpx.AsyncClient() as client:
        response = await client.get(
            SERPAPI_URL,
            params=params,
            timeout=30.0,
        )

        response.raise_for_status()

        data = response.json()

    organic_results = data.get(
        "organic_results",
        [],
    )

    return [
        {
            "position": result.get("position"),
            "title": result.get("title"),
            "link": result.get("link"),
            "snippet": result.get("snippet"),
            "source": result.get("displayed_link"),
            "date": result.get("date"),
        }
        for result in organic_results
    ]