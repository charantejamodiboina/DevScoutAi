import json

from google import genai
from openai import AsyncOpenAI

from app.config import settings


# ---------------------------------
# Gemini client
# ---------------------------------

gemini_client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# ---------------------------------
# Groq client
# ---------------------------------

groq_client = (
    AsyncOpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )
    if settings.GROQ_API_KEY
    else None
)


# ---------------------------------
# OpenRouter client
# ---------------------------------

openrouter_client = (
    AsyncOpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
    )
    if settings.OPENROUTER_API_KEY
    else None
)


def parse_analysis_response(
    response_text: str,
):
    """
    Parse AI opportunity analysis response.
    """

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError as error:
        print("AI returned invalid JSON:")
        print(response_text)
        raise error

    opportunities = data.get(
        "opportunities",
        [],
    )

    if not isinstance(opportunities, list):
        print("Opportunities is not a list")
        opportunities = []

    data["opportunities"] = opportunities

    return data


async def analyze_with_gemini(
    prompt: str,
):
    """
    Analyze opportunities using Gemini.
    """

    print("\n--- TRYING GEMINI ANALYSIS ---")

    response = await gemini_client.aio.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
        },
    )

    print("GEMINI ANALYSIS RESPONSE:")
    print(response.text)

    return parse_analysis_response(
        response.text
    )


async def analyze_with_groq(
    prompt: str,
):
    """
    Analyze opportunities using Groq.
    """

    if not groq_client:
        print("GROQ_API_KEY not configured")
        return None

    print("\n--- TRYING GROQ ANALYSIS ---")

    response = await groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are DevScout AI, an opportunity "
                    "intelligence assistant for software engineers. "
                    "Return ONLY valid JSON."
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

    response_text = (
        response.choices[0]
        .message
        .content
    )

    print("GROQ ANALYSIS RESPONSE:")
    print(response_text)

    return parse_analysis_response(
        response_text
    )


async def analyze_with_openrouter(
    prompt: str,
):
    """
    Analyze opportunities using OpenRouter.
    """

    if not openrouter_client:
        print(
            "OPENROUTER_API_KEY not configured"
        )
        return None

    print(
        "\n--- TRYING OPENROUTER ANALYSIS ---"
    )

    response = await openrouter_client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are DevScout AI, an opportunity "
                    "intelligence assistant for software engineers. "
                    "Return ONLY valid JSON."
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

    response_text = (
        response.choices[0]
        .message
        .content
    )

    print(
        "OPENROUTER ANALYSIS RESPONSE:"
    )
    print(response_text)

    return parse_analysis_response(
        response_text
    )


async def analyze_opportunities(
    query: str,
    results: list,
    user_profile: dict | None = None,
):
    if user_profile:

        # Remove MongoDB internal ID
        # from AI context
        profile_data = {
            key: value
            for key, value in user_profile.items()
            if key != "_id"
        }

        profile_context = json.dumps(
            profile_data,
            indent=2,
            default=str,
        )

    else:

        profile_context = (
            "No user profile is available. "
            "Analyze based on the search query only."
        )

    prompt = f"""
You are DevScout AI, an opportunity intelligence assistant for
software engineers.

The user searched for:

"{query}"

User profile:

{profile_context}

Analyze these search results:

{json.dumps(results, indent=2, default=str)}

Identify only real opportunities relevant to the user's query.

If a user profile is available, prioritize opportunities matching
the user's skills, experience, interests, and career goals.

For each opportunity, return:

- title
- organization
- category
- deadline
- cost
- location
- skills
- summary
- relevance_score (0-100)
- url

Return ONLY valid JSON in exactly this format:

{{
  "opportunities": [
    {{
      "title": "string",
      "organization": "string or unknown",
      "category": "hackathon | certification | job | course | deal | other",
      "deadline": "string or unknown",
      "cost": "free | paid | unknown",
      "location": "string or unknown",
      "skills": [],
      "summary": "string",
      "relevance_score": 0,
      "url": "string"
    }}
  ]
}}
"""

    # ---------------------------------
    # AI fallback chain
    # ---------------------------------

    providers = [
        (
            "Gemini",
            analyze_with_gemini,
        ),
        (
            "Groq",
            analyze_with_groq,
        ),
        (
            "OpenRouter",
            analyze_with_openrouter,
        ),
    ]

    last_error = None

    for provider_name, provider_function in providers:

        try:

            result = await provider_function(
                prompt
            )

            if result is not None:

                print(
                    f"\nSUCCESS: "
                    f"{provider_name} analysis"
                )

                return result

        except Exception as error:

            print(
                f"\nERROR WITH "
                f"{provider_name} ANALYSIS:"
            )

            print(repr(error))

            last_error = error

    # ---------------------------------
    # All providers failed
    # ---------------------------------

    if last_error:
        raise last_error

    return {
        "opportunities": []
    }