import asyncio
import json

from google import genai

from openai import AsyncOpenAI

from app.config import settings


# -----------------------------
# Gemini client
# -----------------------------

gemini_client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# -----------------------------
# Groq client
# -----------------------------

groq_client = (
    AsyncOpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )
    if settings.GROQ_API_KEY
    else None
)


# -----------------------------
# OpenRouter client
# -----------------------------

openrouter_client = (
    AsyncOpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
    )
    if settings.OPENROUTER_API_KEY
    else None
)


async def parse_queries(
    response_text: str,
    count: int,
):
    """
    Parse and validate AI-generated search queries.
    """

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        print("AI returned invalid JSON")
        print(response_text)
        return []

    queries = data.get("queries", [])

    if not isinstance(queries, list):
        print("Queries is not a list")
        return []

    queries = [
        query.strip()
        for query in queries
        if isinstance(query, str)
        and query.strip()
    ]

    # Remove duplicates while preserving order
    queries = list(dict.fromkeys(queries))

    print("FINAL QUERIES:")
    print(queries)

    return queries[:count]


async def generate_with_gemini(
    prompt: str,
    count: int,
):
    """
    Generate queries using Gemini.
    """

    model = "gemini-3.6-flash"

    print("\n--- TRYING GEMINI ---")

    response = await gemini_client.aio.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
        },
    )

    print("GEMINI RAW RESPONSE:")
    print(response.text)

    return await parse_queries(
        response.text,
        count,
    )


async def generate_with_groq(
    prompt: str,
    count: int,
):
    """
    Generate queries using Groq.
    """

    if not groq_client:
        print("GROQ_API_KEY not configured")
        return []

    print("\n--- TRYING GROQ ---")

    response = await groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a search query generation "
                    "system. Return ONLY valid JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        response_format={
            "type": "json_object",
        },
        temperature=0.2,
    )

    response_text = response.choices[0].message.content

    print("GROQ RAW RESPONSE:")
    print(response_text)

    return await parse_queries(
        response_text,
        count,
    )


async def generate_with_openrouter(
    prompt: str,
    count: int,
):
    """
    Generate queries using OpenRouter.
    """

    if not openrouter_client:
        print("OPENROUTER_API_KEY not configured")
        return []

    print("\n--- TRYING OPENROUTER ---")

    response = await openrouter_client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a search query generation "
                    "system. Return ONLY valid JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        response_format={
            "type": "json_object",
        },
        temperature=0.2,
    )

    response_text = response.choices[0].message.content

    print("OPENROUTER RAW RESPONSE:")
    print(response_text)

    return await parse_queries(
        response_text,
        count,
    )


async def generate_search_queries(
    user_profile: dict,
    opportunity_type: str,
    location: str | None,
    count: int,
):
    skills = user_profile.get(
        "skills",
        [],
    )

    interests = user_profile.get(
        "interests",
        [],
    )

    job_roles = user_profile.get(
        "job_roles",
        [],
    )

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

    # -----------------------------------
    # Provider fallback chain
    # -----------------------------------

    providers = [
        (
            "Gemini",
            generate_with_gemini,
        ),
        (
            "Groq",
            generate_with_groq,
        ),
        (
            "OpenRouter",
            generate_with_openrouter,
        ),
    ]

    last_error = None

    for provider_name, provider_function in providers:

        try:
            queries = await provider_function(
                prompt,
                count,
            )

            if queries:
                print(
                    f"\nSUCCESS: {provider_name}"
                )

                return queries[:count]

            print(
                f"{provider_name} returned "
                "empty queries"
            )

        except Exception as error:

            print(
                f"\nERROR WITH {provider_name}:"
            )

            print(repr(error))

            last_error = error

            # Small delay before next provider
            await asyncio.sleep(1)

    # -----------------------------------
    # All providers failed
    # -----------------------------------

    if last_error:
        raise last_error

    return []