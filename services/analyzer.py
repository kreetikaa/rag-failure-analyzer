import os
import json
import httpx
from dotenv import load_dotenv
from models.schemas import (
    RAGTrace, AnalysisResult, FailureDetail,
    FailureType, FailureSeverity
)

load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")

SYSTEM_PROMPT = """You are an expert RAG pipeline quality analyst.
Analyze the given RAG trace and detect failures in three areas:

1. RETRIEVAL - Are the chunks relevant to the query?
2. GENERATION - Does the answer match/use the chunks correctly?
3. CHUNKING - Are chunks well-formed or broken/incomplete?

Respond ONLY in this exact JSON format, nothing else:
{
  "retrieval": {"score": 0.0-1.0, "is_failure": true/false, "severity": "critical/high/medium/low", "reason": "...", "recommendation": "..."},
  "generation": {"score": 0.0-1.0, "is_failure": true/false, "severity": "critical/high/medium/low", "reason": "...", "recommendation": "..."},
  "chunking": {"score": 0.0-1.0, "is_failure": true/false, "severity": "critical/high/medium/low", "reason": "...", "recommendation": "..."},
  "overall_health": 0.0-1.0,
  "summary": "one sentence summary"
}"""

async def analyze_trace(trace: RAGTrace) -> AnalysisResult:
    # Build the prompt from the trace
    chunks_text = ""
    for i, chunk in enumerate(trace.retrieved_chunks):
        chunks_text += f"\nChunk {i+1} (score: {chunk.score}):\n{chunk.content}\n"

    user_prompt = f"""QUERY: {trace.query}

RETRIEVED CHUNKS:
{chunks_text}

FINAL ANSWER:
{trace.final_answer}"""

    # Call Groq API
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.1
            }
        )
        response.raise_for_status()

    # Parse response
    raw = response.json()["choices"][0]["message"]["content"].strip()
    
    # Remove markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    
    result = json.loads(raw.strip())

    # Build failures list
    failures = []
    for ftype, key in [
        (FailureType.RETRIEVAL, "retrieval"),
        (FailureType.GENERATION, "generation"),
        (FailureType.CHUNKING, "chunking"),
    ]:
        section = result[key]
        if section["is_failure"]:
            failures.append(FailureDetail(
                failure_type=ftype,
                severity=FailureSeverity(section["severity"]),
                score=section["score"],
                reason=section["reason"],
                recommendation=section["recommendation"]
            ))

    return AnalysisResult(
        query=trace.query,
        is_failure=len(failures) > 0,
        overall_health=result["overall_health"],
        retrieval_score=result["retrieval"]["score"],
        generation_score=result["generation"]["score"],
        chunking_score=result["chunking"]["score"],
        failures=failures,
        summary=result["summary"]
    )