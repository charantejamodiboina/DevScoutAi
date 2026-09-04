from urllib.parse import urlparse


HIGH_PRIORITY_SOURCES = [
    "careers",
    "jobs",
    "greenhouse.io",
    "lever.co",
    "myworkdayjobs.com",
    "smartrecruiters.com",
    "ashbyhq.com",
]


LOW_PRIORITY_SOURCES = [
    "linkedin.com",
    "indeed.com",
    "glassdoor.com",
    "naukri.com",
    "foundit.in",
    "monster.com",
]


def get_source_priority(url: str) -> str:
    """
    Classify a search-result URL by source quality.
    """

    if not url:
        return "unknown"

    url = url.lower()

    for source in HIGH_PRIORITY_SOURCES:
        if source in url:
            return "high"

    for source in LOW_PRIORITY_SOURCES:
        if source in url:
            return "low"

    return "medium"


def get_source_domain(url: str) -> str:
    """
    Extract the normalized domain from a URL.
    """

    if not url:
        return ""

    try:
        domain = urlparse(url).netloc.lower()

        if domain.startswith("www."):
            domain = domain[4:]

        return domain

    except Exception:
        return ""


def add_source_metadata(
    result: dict,
) -> dict:
    """
    Add source domain and priority metadata.
    """

    url = result.get("link", "")

    result["source_domain"] = get_source_domain(
        url
    )

    result["source_priority"] = (
        get_source_priority(url)
    )

    return result


def prioritize_sources(
    results: list[dict],
) -> list[dict]:
    """
    Add metadata and sort higher-quality sources first.
    """

    priority_scores = {
        "high": 3,
        "medium": 2,
        "low": 1,
        "unknown": 0,
    }

    processed_results = [
        add_source_metadata(result)
        for result in results
    ]

    return sorted(
        processed_results,
        key=lambda result: priority_scores.get(
            result["source_priority"],
            0,
        ),
        reverse=True,
    )