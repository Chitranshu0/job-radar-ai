from langchain_core.runnables import RunnableLambda
from sentence_transformers import util

from llm.client import invoke_structured
from llm.schemas import (
    IntelligenceEngineOutput, JDSummary, CandidateSummary, 
    GapAnalysis, Scores, AnalyticsData
)
from utils.models import get_embedding_model


def _match_skills(resume_skills, jd_skills):
    if not jd_skills:
        return [], []

    if not resume_skills:
        return [], jd_skills

    model = get_embedding_model()
    resume_embeddings = model.encode(resume_skills, convert_to_tensor=True)
    jd_embeddings = model.encode(jd_skills, convert_to_tensor=True)
    scores = util.cos_sim(jd_embeddings, resume_embeddings)

    matched = []
    missing = []
    for index, skill in enumerate(jd_skills):
        if scores[index].max().item() >= 0.72:
            matched.append(skill)
        else:
            missing.append(skill)

    return matched, missing


def _reason_with_llm(state, matched_skills, missing_skills):
    template = """
You are an AI-powered Recruitment Intelligence Engine designed to evaluate candidate-job fit with explainability, evidence, and recruiter-level reasoning.

Your goal is to produce a structured, evidence-backed decision analysis.
🔴 CORE PRINCIPLE: EVIDENCE-FIRST ANALYSIS
Every score, insight, or conclusion MUST be backed by an explicit JD requirement and explicit evidence from candidate profile or clearly identified absence. Do NOT hallucinate. Do NOT assume.

### STEP 1: EXTRACT JD INTELLIGENCE
Extract Core Requirements, Secondary Requirements, Optional/Nice-to-have from the JD.

### STEP 2: EXTRACT CANDIDATE INTELLIGENCE
Extract Skills, Projects, Tools, Evidence of real-world usage from Resume/CL.

### STEP 3: REQUIREMENT → EVIDENCE MAPPING (CRITICAL)
Create a structured mapping for each JD requirement:
- Requirement Name
- Importance Level (Core/Secondary/Optional)
- Match Status (Full Match/Partial Match/No Match)
- Evidence Source

### STEP 4: PROJECT / EXPERIENCE ALIGNMENT
Classify alignment of projects/experience: Strongly Aligned, Moderately Aligned, Weak/Not Relevant.

### STEP 5: GAP ANALYSIS (MANDATORY)
Identify Critical, Moderate, Minor gaps. NEVER say "No gaps" unless ALL core + secondary are fully matched with evidence.

### STEP 6: SCORING LOGIC (EXPLAINABLE)
Provide scores based on Skill Coverage, Experience Depth, Project Alignment, Semantic Match, Overall Match (balanced).

### STEP 7: SELECTION LIKELIHOOD (REALISTIC)
Classify: High Shortlist Potential, Moderate Potential, Low Potential based on skill/experience and gap severity.

### STEP 8: EXECUTIVE SUMMARY (RECRUITER STYLE)
Write a concise, honest summary: Key strengths, weaknesses, overall fit.

### STEP 9: ACTIONABLE IMPROVEMENTS
Suggest missing skills to learn, project ideas, resume improvements.

### STEP 10: ANALYTICS DATA FOR VISUALIZATION (IMPORTANT)
Return structured data:
1. Requirement Coverage (e.g. "core": 0.8)
2. Match Distribution (e.g. "full": 5)
3. Project Alignment Breakdown (e.g. "strong": 2)
4. Experience Depth Indicators (e.g. "real_usage": 3)
5. Gap Severity Count (e.g. "critical": 1)

Relevant resume context:
{resume_context}

JD requirements:
{jd_requirements}

Extracted skills (Resume):
{extracted_skills}

Matched Skills (Embedding verified):
{matched_skills}

Missing Skills (Embedding verified):
{missing_skills}

Evidence Mapping:
{evidence_mapping}

Semantic score: {semantic_score}

{format_instructions}
"""
    resume_context = "\n".join(state.get("relevant_resume_chunks", [])[:5])
    jd_requirements = "\n".join(state.get("jd_requirements", [])[:7])
    
    return invoke_structured(
        IntelligenceEngineOutput,
        template,
        fallback=IntelligenceEngineOutput(
            overall_match_score=int(state.get("semantic_score", 50)),
            fit_category="Moderate Fit",
            shortlist_potential="Moderate Potential",
            jd_summary=JDSummary(),
            candidate_summary=CandidateSummary(),
            requirement_mapping=[],
            project_alignment=[],
            gap_analysis=GapAnalysis(moderate=missing_skills[:3]),
            scores=Scores(skill_coverage=50.0, experience_depth=50.0, project_alignment=50.0, semantic_match=50.0),
            analytics=AnalyticsData(),
            executive_summary="Candidate shows potential but lacks some verified key skills.",
            recommended_actions=["Highlight specific project outcomes", "Acquire missing core skills"]
        ),
        resume_context=resume_context,
        jd_requirements=jd_requirements,
        extracted_skills=state.get("extracted_skills", {}),
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        evidence_mapping=state.get("evidence_mapping", [])[:5],
        semantic_score=state.get("semantic_score", 0.0),
    )


def llm_reasoning_agent_fn(state):
    skills = state.get("extracted_skills", {})
    matched_skills, missing_skills = _match_skills(
        skills.get("resume", []),
        skills.get("jd", []),
    )
    reasoning = _reason_with_llm(state, matched_skills, missing_skills)
    reasoning_dict = reasoning.dict() if hasattr(reasoning, "dict") else reasoning.model_dump()

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "improvement_actions": reasoning.recommended_actions,
        "summary": reasoning.executive_summary,
        "llm_score": reasoning.overall_match_score,
        "optimized_reasoning": reasoning_dict
    }


llm_reasoning_agent = RunnableLambda(llm_reasoning_agent_fn)
