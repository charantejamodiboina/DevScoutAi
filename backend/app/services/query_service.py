import asyncio
import json

from google import genai
from google.genai import errors

from app.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


async def generate_search_queries(
    user_profile: dict,
    opportunity_type: str,
    location: str | None,
    count: int,
):
    skills = user_profile.get("skills", [])
    interests = user_profile.get("interests", [])
    job_roles = user_profile.get("job_roles", [])
    experience_years = user_profile.get(
        "experience_years",
        0,
    )
    preferred_locations = user_profile.get(
        "preferred_locations",
        [],
    )

    search_location = (
        location
        or (
            preferred_locations[0]
            if preferred_locations
            else "India"
        )
    )

    prompt = f"""
You are a search query generation system for DevScout AI.

Generate exactly {count} DIFFERENT Google search queries.

User profile:
- Skills: {json.dumps(skills)}
- Interests: {json.dumps(interests)}
- Job roles: {json.dumps(job_roles)}
- Experience years: {experience_years}
- Preferred locations: {json.dumps(preferred_locations)}

Requested opportunity type:
{opportunity_type}

Requested location:
{search_location}

Generate highly specific Google search queries to find REAL and
CURRENT opportunities relevant to this user's profile.

For opportunity type "job":
- Include relevant job roles
- Include relevant skills when useful
- Include the requested location
- Include phrases such as "hiring", "careers", or "apply"

For opportunity type "certification":
- Search for free certifications, certification programs,
  certification offers, or certification events
- Prefer software engineering, cloud, DevOps, and AI opportunities

For opportunity type "exam_voucher":
- Search for free exam vouchers, discounts, promotions,
  giveaways, events, and certification voucher programs

For opportunity type "hackathon":
- Search for currently open technology hackathons
- Prefer software engineering, cloud, DevOps, and AI

For opportunity type "course":
- Search for free or discounted courses relevant to the user

Return ONLY valid JSON.

Use exactly this format:

{{
  "queries": [
    "search query 1",
    "search query 2",
    "search query 3"
  ]
}}
"""

    models = [
        "gemini-3.6-flash",
    ]

    last_error = None

    for model in models:
        try:
            print(f"\n--- TRYING MODEL: {model} ---")

            response = await client.aio.models.generate_content(
                model=model,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                },
            )

            print("RAW RESPONSE:")
            print(response.text)

            data = json.loads(response.text)

            print("PARSED DATA:")
            print(data)

            queries = data.get("queries", [])

            print("QUERIES:")
            print(queries)

            if not isinstance(queries, list):
                print("Queries is not a list")
                queries = []

            queries = [
                query.strip()
                for query in queries
                if isinstance(query, str)
                and query.strip()
            ]

            print("FINAL QUERIES:")
            print(queries)

            if queries:
                return queries[:count]

            print("MODEL RETURNED EMPTY QUERIES")

        except Exception as error:
            print(f"\nERROR WITH {model}:")
            print(repr(error))

            last_error = error

            await asyncio.sleep(1)

            continue

    if last_error:
        raise last_error

    return []