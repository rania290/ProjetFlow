from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

from app.database import engine, Base
from app.aura import router, scheduler

# Create tables
Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vaerdia Aura Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router.router)

@app.on_event("startup")
async def startup_event():
    scheduler.start_scheduler()

@app.get("/health")
def health_check():
    return {"status": "healthy"}
