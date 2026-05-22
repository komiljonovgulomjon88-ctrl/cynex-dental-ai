from supabase import create_client, Client
from config import settings
from functools import lru_cache

@lru_cache(maxsize=1)
def get_db() -> Client:
    """Lazy singleton Supabase client — created on first use, not at import time."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# Backward-compatible proxy so existing code (`from services.supabase_service import db`)
# still works — `db` is resolved lazily on first attribute access.
class _LazyDB:
    def __getattr__(self, name):
        return getattr(get_db(), name)

db: Client = _LazyDB()  # type: ignore
