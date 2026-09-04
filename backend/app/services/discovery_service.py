from urllib.parse import (
    parse_qsl,
    urlencode,
    urlparse,
    urlunparse,
)


TRACKING_PARAMETERS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "ref",
    "source",
    "campaign",
}


def normalize_url(
    url: str | None,
) -> str:
    """
    Normalize a URL for reliable deduplication.
    """

    if not url:
        return ""

    try:
        parsed = urlparse(url.strip())

        scheme = parsed.scheme.lower() or "https"

        netloc = parsed.netloc.lower()

        if netloc.startswith("www."):
            netloc = netloc[4:]

        path = parsed.path.rstrip("/")

        # Remove common tracking parameters
        query_parameters = parse_qsl(
            parsed.query,
            keep_blank_values=False,
        )

        filtered_parameters = [
            (key, value)
            for key, value in query_parameters
            if key.lower()
            not in TRACKING_PARAMETERS
            and not key.lower().startswith("utm_")
        ]

        filtered_query = urlencode(
            filtered_parameters,
            doseq=True,
        )

        return urlunparse(
            (
                scheme,
                netloc,
                path,
                "",
                filtered_query,
                "",
            )
        )

    except Exception:
        return url.strip().lower()


def get_result_url(
    result: dict,
) -> str:
    """
    Support both raw SerpApi and normalized result formats.
    """

    return (
        result.get("link")
        or result.get("url")
        or ""
    )


def deduplicate_results(
    results: list[dict],
) -> list[dict]:
    """
    Remove duplicate URLs while preserving
    higher-priority results.
    """

    seen_urls = set()

    unique_results = []

    for result in results:
        url = get_result_url(result)

        normalized_url = normalize_url(
            url
        )

        if not normalized_url:
            continue

        if normalized_url in seen_urls:
            continue

        seen_urls.add(normalized_url)

        result["normalized_url"] = normalized_url

        unique_results.append(result)

    return unique_results