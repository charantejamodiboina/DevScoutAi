from typing import List

from pydantic import BaseModel


class SavedOpportunity(BaseModel):
    title: str
    organization: str
    category: str
    deadline: str
    cost: str
    location: str
    skills: List[str] = []
    summary: str
    relevance_score: int
    url: str