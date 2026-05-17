import { useState } from "react"
import axios from "axios"

function App() {
  const [query, setQuery] = useState("")
  const [chunks, setChunks] = useState("")
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getScoreColor = (score) => {
    if (score >= 0.7) return "#22c55e"
    if (score >= 0.4) return "#f59e0b"
    return "#ff4d4d"
  }

  const handleSubmit = async () => {
    if (!query || !chunks || !answer) {
      setError("Please fill all fields!")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
    try {
      const chunkLines = chunks.split("\n").filter(c => c.trim())
      const retrievedChunks = chunkLines.map((content, i) => ({
        chunk_id: String(i + 1),
        content: content.trim(),
        score: 0.7
      }))
      const response = await axios.post("http://localhost:8000/api/analyze/", {
        query,
        retrieved_chunks: retrievedChunks,
        final_answer: answer
      })
      setResult(response.data)
    } catch (err) {
      setError("Error: " + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020c1b 0%, #0a1628 50%, #020c1b 100%)",
      color: "#ccd6f6",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "2rem"
    }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{
            fontSize: "2.4rem",
            fontWeight: "800",
            background: "linear-gradient(90deg, #00d2ff, #38bdf8, #00d2ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.5rem"
          }}>
            🔍 RAG Failure Analyzer
          </h1>
          <p style={{ color: "#64ffda", fontSize: "1rem" }}>
            Paste your RAG trace and detect failures instantly
          </p>
          <div style={{
            width: "80px", height: "3px",
            background: "linear-gradient(90deg, #00d2ff, #38bdf8)",
            margin: "1rem auto 0"
          }}/>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(2, 20, 45, 0.8)",
          border: "1px solid #00d2ff33",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 0 30px #00d2ff11"
        }}>
          <h2 style={{ color: "#38bdf8", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
            📝 Input Trace
          </h2>

          {/* Query */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", color: "#7dd3fc", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
              User Query
            </label>
            <textarea
              rows={2}
              placeholder="What is the capital of France?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: "100%", background: "#010d1f",
                border: "1px solid #00d2ff44", borderRadius: "8px",
                padding: "0.75rem", color: "#ccd6f6",
                fontSize: "0.9rem", resize: "vertical",
                fontFamily: "inherit", outline: "none"
              }}
            />
          </div>

          {/* Chunks */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", color: "#7dd3fc", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
              Retrieved Chunks <span style={{ color: "#64ffda" }}>(ek line = ek chunk)</span>
            </label>
            <textarea
              rows={5}
              placeholder="France is a country in Western Europe known for wine and fashion."
              value={chunks}
              onChange={e => setChunks(e.target.value)}
              style={{
                width: "100%", background: "#010d1f",
                border: "1px solid #00d2ff44", borderRadius: "8px",
                padding: "0.75rem", color: "#ccd6f6",
                fontSize: "0.9rem", resize: "vertical",
                fontFamily: "inherit", outline: "none"
              }}
            />
          </div>

          {/* Answer */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#7dd3fc", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
              Final Answer <span style={{ color: "#64ffda" }}>(LLM ka generated answer)</span>
            </label>
            <textarea
              rows={3}
              placeholder="The capital of France is Berlin."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              style={{
                width: "100%", background: "#010d1f",
                border: "1px solid #00d2ff44", borderRadius: "8px",
                padding: "0.75rem", color: "#ccd6f6",
                fontSize: "0.9rem", resize: "vertical",
                fontFamily: "inherit", outline: "none"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#ff4d4d11", border: "1px solid #ff4d4d44",
              color: "#ff4d4d", padding: "0.75rem 1rem",
              borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem"
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#1e3a5f" : "linear-gradient(90deg, #0ea5e9, #00d2ff)",
              color: loading ? "#7dd3fc" : "#020c1b",
              border: "none", borderRadius: "10px",
              padding: "0.85rem", fontSize: "1rem",
              fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.5px"
            }}
          >
            {loading ? "⏳ Analyzing..." : "🚀 Analyze"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#38bdf8" }}>
            ⏳ Groq analyze kar raha hai...
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            background: "rgba(2, 20, 45, 0.8)",
            border: `1px solid ${result.is_failure ? "#ff4d4d44" : "#22c55e44"}`,
            borderRadius: "16px", padding: "2rem",
            boxShadow: `0 0 30px ${result.is_failure ? "#ff4d4d11" : "#22c55e11"}`
          }}>

            {/* Result Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#38bdf8", fontSize: "1.2rem" }}>Analysis Result</h2>
              <span style={{
                padding: "0.35rem 1rem", borderRadius: "20px",
                fontSize: "0.85rem", fontWeight: "700",
                background: result.is_failure ? "#ff4d4d22" : "#22c55e22",
                color: result.is_failure ? "#ff4d4d" : "#22c55e",
                border: `1px solid ${result.is_failure ? "#ff4d4d55" : "#22c55e55"}`
              }}>
                {result.is_failure ? "❌ Failure Detected" : "✅ Looks Good"}
              </span>
            </div>

            {/* Scores */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Retrieval", score: result.retrieval_score },
                { label: "Generation", score: result.generation_score },
                { label: "Chunking", score: result.chunking_score },
              ].map((item, i) => (
                <div key={i} style={{
                  textAlign: "center", background: "#010d1f",
                  padding: "1rem", borderRadius: "10px",
                  border: "1px solid #00d2ff22"
                }}>
                  <div style={{ fontSize: "0.75rem", color: "#7dd3fc", marginBottom: "0.4rem" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "1.6rem", fontWeight: "800", color: getScoreColor(item.score) }}>
                    {(item.score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>

            {/* Failures */}
            {result.failures.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ color: "#ff4d4d", marginBottom: "0.75rem", fontSize: "1rem" }}>
                  ⚠️ Failures Found
                </h3>
                {result.failures.map((f, i) => (
                  <div key={i} style={{
                    background: "#010d1f",
                    borderLeft: "3px solid #ff4d4d",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "0.75rem"
                  }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#ff6b6b", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                      {f.failure_type} — {f.severity}
                    </div>
                    <div style={{ color: "#cbd5e1", fontSize: "0.88rem", marginBottom: "0.4rem" }}>
                      📌 {f.reason}
                    </div>
                    <div style={{ color: "#64ffda", fontSize: "0.82rem", fontStyle: "italic" }}>
                      💡 {f.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div style={{
              background: "#010d1f", borderRadius: "8px",
              padding: "0.75rem 1rem", color: "#7dd3fc",
              fontSize: "0.88rem", border: "1px solid #00d2ff22"
            }}>
              📊 {result.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App