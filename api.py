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

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
