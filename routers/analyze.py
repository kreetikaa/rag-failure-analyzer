from fastapi import APIRouter, HTTPException
from models.schemas import RAGTrace, AnalysisResult
from services.analyzer import analyze_trace

router = APIRouter()

@router.post("/", response_model=AnalysisResult)
async def analyze(trace: RAGTrace):
    try:
        result = await analyze_trace(trace)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))