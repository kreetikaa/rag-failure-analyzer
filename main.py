from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze

app = FastAPI(title="RAG Failure Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/analyze")

@app.get("/")
async def root():
    return {"message": "RAG Failure Analyzer is running!"}