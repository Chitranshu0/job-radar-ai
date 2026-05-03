from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import io

from utils.text import extract_text_from_pdf, clean_text
from graph.pipeline import run_pipeline
from llm.client import get_llm

app = FastAPI(title="Job Radar AI - Backend API")

# Allow requests from the Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluateRequest(BaseModel):
    jd_text: str
    resume_text: str
    api_key: str

@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        file_obj = io.BytesIO(content)
        text = extract_text_from_pdf(file_obj)
        return {"text": clean_text(text)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")

@app.post("/api/evaluate")
async def evaluate_resume(request: EvaluateRequest):
    try:
        os.environ["GROQ_API_KEY"] = request.api_key
        # Clear cache so it picks up new API key if it changed
        get_llm.cache_clear()
        
        state = run_pipeline(jd_text=request.jd_text, resume_text=request.resume_text)
        
        if state.get("error"):
            raise HTTPException(status_code=500, detail=state["error"])
            
        return {
            "score": state.get("overall_score", 0),
            "summary": state.get("summary", "Analysis complete."),
            "analytics": {
                "graph_data": state.get("graph_data", {}),
                "section_scores": state.get("section_scores", {}),
                "matched_skills": state.get("matched_skills", []),
                "missing_skills": state.get("missing_skills", []),
                "improvement_actions": state.get("improvement_actions", [])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
