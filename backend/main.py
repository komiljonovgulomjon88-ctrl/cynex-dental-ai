from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import auth, profile, analysis, dashboard, reminders
from routers import doctor as doctor_router

app = FastAPI(
    title="Cynex Dental AI API",
    description="Backend API for Cynex Dental AI — dental image analysis powered by Claude.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(profile.router,   prefix="/api/profile",   tags=["Profile"])
app.include_router(analysis.router,  prefix="/api/analysis",  tags=["Analysis"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(reminders.router,          prefix="/api/reminders",    tags=["Reminders"])
app.include_router(doctor_router.router,      prefix="/api/doctor",       tags=["Doctor Portal"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Cynex Dental AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
