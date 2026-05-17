from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class FailureType(str, Enum):
    RETRIEVAL = "retrieval"
    GENERATION = "generation"
    CHUNKING = "chunking"

class FailureSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Chunk(BaseModel):
    chunk_id: str
    content: str
    source: Optional[str] = None
    score: Optional[float] = None  # similarity score from vector DB

class RAGTrace(BaseModel):
    query: str                          # what user asked
    retrieved_chunks: List[Chunk]       # what retriever fetched
    final_answer: str                   # what LLM generated
    expected_answer: Optional[str] = None  # ground truth (optional)

class FailureDetail(BaseModel):
    failure_type: FailureType
    severity: FailureSeverity
    score: float        # 0.0 = worst, 1.0 = perfect
    reason: str
    recommendation: str

class AnalysisResult(BaseModel):
    query: str
    is_failure: bool
    overall_health: float
    retrieval_score: float
    generation_score: float
    chunking_score: float
    failures: List[FailureDetail]
    summary: str
    