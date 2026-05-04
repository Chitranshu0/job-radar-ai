from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
            
        opt = state.get("optimized_reasoning", {})
        
        # Ensure we don't break the extension frontend
        score = opt.get("overall_match_score", state.get("overall_score", 0))
        summary = opt.get("executive_summary", state.get("summary", "Analysis complete."))
        
        # Format the output data strictly to meet requirements
        data = {
            "score": score,
            "match_score": score,
            "overall_match_score": score,
            "summary": summary,
            "fit_category": opt.get("fit_category", "Unknown"),
            "shortlist_potential": opt.get("shortlist_potential", "Unknown"),
            "jd_summary": opt.get("jd_summary", {}),
            "candidate_summary": opt.get("candidate_summary", {}),
            "requirement_mapping": opt.get("requirement_mapping", []),
            "match_distribution": opt.get("match_distribution", {"core": 0, "secondary": 0, "optional": 0}),
            "gap_analysis": opt.get("gap_analysis", {}),
            "analytics": opt.get("analytics", {}),
            "executive_summary": summary,
            "recommended_actions": opt.get("recommended_actions", [])
        }
        
        # Validation Layer
        if not data["requirement_mapping"] or len(data["requirement_mapping"]) == 0:
            data["requirement_mapping"] = [
                {
                    "requirement": "Data Unavailable",
                    "importance": "Optional",
                    "score": 0,
                    "status": "No Data",
                    "evidence": "No relevant experience found.",
                    "source": "None",
                    "confidence": 0
                }
            ]
            
        if not data["match_distribution"] or "core" not in data["match_distribution"]:
            data["match_distribution"] = {"core": 0, "secondary": 0, "optional": 0}
            
        # Enforce clean UTF-8
        return JSONResponse(content=data, headers={"Content-Type": "application/json; charset=utf-8"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
