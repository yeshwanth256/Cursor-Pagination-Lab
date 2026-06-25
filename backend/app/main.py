from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.products import router as products_router

# Initialize FastAPI application
app = FastAPI(
    title="CodeVector High-Performance Catalog API",
    description="FastAPI service demonstrating high-performance cursor pagination with snapshot consistency on 200,000+ records.",
    version="1.0.0"
)

# Set up CORS middleware to allow client-side frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register products router
app.include_router(products_router, tags=["Products"])

@app.on_event("startup")
def startup_event():
    """
    On startup, create database tables if they do not exist.
    In real production, databases are usually migrated via Alembic,
    but this ensures tables are available immediately on setup.
    """
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create tables on startup: {e}")

@app.get("/", tags=["Health"])
def health_check():
    """
    Health check endpoint to verify system status.
    """
    return {"status": "ok"}
