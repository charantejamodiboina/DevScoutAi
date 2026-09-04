def get_google_time_filter(
    max_age_hours: int | None,
) -> str | None:
    """
    Convert a freshness requirement into a Google/SerpApi
    time filter.
    """

    if max_age_hours is None:
        return None

    if max_age_hours <= 1:
        return "qdr:h"

    if max_age_hours <= 24:
        return "qdr:d"

    if max_age_hours <= 168:
        return "qdr:w"

    if max_age_hours <= 720:
        return "qdr:m"

    return "qdr:y"