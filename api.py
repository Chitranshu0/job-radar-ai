from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Job Radar AI - Backend API")

# Allow requests from the Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JDRequest(BaseModel):
    text: str

@app.post("/api/detect-jd")
async def detect_jd(request: JDRequest):
    """
    This endpoint will use your AI model (e.g. Groq/Llama-3) to detect if the text is a JD.
    For now, we simulate a fast AI verification response.
    """
    text = request.text.lower()
    
    # Simulate an AI model analyzing the semantic context of the text
    has_role = "responsibilities" in text or "what you'll do" in text
    has_reqs = "requirements" in text or "qualifications" in text
    has_exp = "experience" in text or "skills" in text
    
    is_jd = has_role and has_reqs and has_exp
    
    return {"is_JD": is_jd}

@app.post("/api/evaluate")
async def evaluate_resume(request: JDRequest):
    """
    Evaluates the scraped JD against the user's stored resume using our AI pipeline.
    Returning mock data for the workshop demonstration.
    """
    import random
    import asyncio
    
    # Simulate processing delay
    await asyncio.sleep(2)
    
    score = random.randint(70, 98)
    
    if score >= 90:
        summary = "Excellent match! Your extensive background strongly aligns with the core requirements of this role. Your skills stand out."
    elif score >= 80:
        summary = "Great match. You have most of the required skills, particularly in the main technologies. Highlighting your recent projects will help bridge any minor gaps."
    else:
        summary = "Good potential. While you meet many baseline requirements, some preferred qualifications are missing. Emphasize your adaptability."
        
    return {
        "score": score,
        "summary": summary
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
