from motor.motor_asyncio import AsyncIOMotorClient

from .config import get_settings


settings = get_settings()
client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
db = client[settings.mongodb_db]

manga_collection = db["manga"]
chapter_collection = db["chapters"]
image_collection = db["images"]
cache_collection = db["api_cache"]


async def ping_database() -> None:
    await db.command("ping")


async def ensure_indexes() -> None:
    await ping_database()
    await manga_collection.create_index("title")
    await manga_collection.create_index("source")
    await chapter_collection.create_index([("manga_id", 1), ("number", 1)])
    await image_collection.create_index("manga_id", unique=True)
    await cache_collection.create_index("expiresAt", expireAfterSeconds=0)
