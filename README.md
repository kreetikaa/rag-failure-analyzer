# 🔍 RAG Failure Analyzer

A full-stack tool to automatically detect failures in RAG (Retrieval-Augmented Generation) pipelines using the **LLM-as-judge** pattern.

## 🚀 What it does

Paste any RAG trace (query + retrieved chunks + final answer) and instantly get:
- ❌ **Retrieval failures** — wrong or irrelevant chunks fetched
- ❌ **Generation failures** — hallucinations or incorrect answers
- ❌ **Chunking failures** — poorly split or incomplete chunks
- 📊 **Scores** for each failure type (0-100%)
- 💡 **Recommendations** to fix each failure

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| AI Judge | Groq LLaMA 3.3 70B |
| Frontend | React, Vite |
| Styling | Custom CSS (Dark Mode) |

## ⚙️ How to run locally

### Backend
```bash
cd RAG-Failure-Analyzer
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in root folder:
