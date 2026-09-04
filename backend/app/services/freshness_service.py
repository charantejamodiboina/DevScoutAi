import re
from datetime import datetime, timedelta, timezone


def extract_time_text(result: dict) -> str:
    """
    Collect potential publication-time information from
    a SerpApi result.
    """
    values = [
        result.get("date"),
        result.get("snippet"),
        result.get("title"),
    ]

    return " ".join(
        str(value)
        for value in values
        if value
    ).lower()


def parse_relative_time(
    text: str | None,
) -> datetime | None:
    if not text:
        return None

    text = text.lower().strip()
    now = datetime.now(timezone.utc)

    patterns = [
        (r"(\d+)\s*(?:m|min|mins|minute|minutes)\b", "minutes"),
        (r"(\d+)\s*(?:h|hr|hrs|hour|hours)\b", "hours"),
        (r"(\d+)\s*(?:d|day|days)\b", "days"),
        (r"(\d+)\s*(?:w|week|weeks)\b", "weeks"),
    ]

    for pattern, unit in patterns:
        match = re.search(pattern, text)

        if not match:
            continue

        value = int(match.group(1))

        if unit == "minutes":
            return now - timedelta(minutes=value)

        if unit == "hours":
            return now - timedelta(hours=value)

        if unit == "days":
            return now - timedelta(days=value)

        if unit == "weeks":
            return now - timedelta(weeks=value)

    return None


def get_published_at(
    result: dict,
) -> datetime | None:
    time_text = extract_time_text(result)

    return parse_relative_time(time_text)


def add_freshness_metadata(
    result: dict,
) -> dict:
    published_at = get_published_at(result)

    result["published_at"] = published_at

    if published_at:
        age = (
            datetime.now(timezone.utc) - published_at
        )

        result["age_minutes"] = int(
            age.total_seconds() / 60
        )

    else:
        result["age_minutes"] = None

    return result


def filter_recent_results(
    results: list[dict],
    max_age_hours: int,
    strict: bool = False,
) -> list[dict]:
    cutoff = (
        datetime.now(timezone.utc)
        - timedelta(hours=max_age_hours)
    )

    filtered = []

    for result in results:
        result = add_freshness_metadata(result)

        published_at = result["published_at"]

        # Unknown age:
        # strict=True → reject
        # strict=False → keep for AI evaluation
        if not published_at:
            if not strict:
                filtered.append(result)

            continue

        if published_at >= cutoff:
            filtered.append(result)

    return filtered