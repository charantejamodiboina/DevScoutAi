from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


client = AsyncIOMotorClient(settings.MONGODB_URL)

database = client[settings.MONGODB_DB_NAME]

search_history_collection = database["search_history"]
opportunities_collection = database["opportunities"]
saved_opportunities_collection = database[
    "saved_opportunities"
]
users_collection = database["users"]

user_profiles_collection = database["user_profiles"]
discovery_cache_collection = database["discovery_cache"]