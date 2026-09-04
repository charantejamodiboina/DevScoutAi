import json

from google import genai

from app.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


async def analyze_opportunities(
    query: str,
    results: list,
    user_profile: dict | None = None,
):
    if user_profile:
        # Remove MongoDB internal ID from the AI context
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

    response = await client.aio.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
        },
    )

    return json.loads(response.text)