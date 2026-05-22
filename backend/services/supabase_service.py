from supabase import create_client, Client
from config import settings

# Singleton Supabase client (uses service role key — full DB access)
db: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
