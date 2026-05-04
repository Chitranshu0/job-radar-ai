from langchain_core.runnables import RunnableLambda
from sentence_transformers import util

from llm.client import invoke_structured
from llm.schemas import (
    IntelligenceEngineOutput, JDSummary, CandidateSummary, 
    GapAnalysis, AnalyticsData, MatchDistribution, Graphs, ScoreBreakdown
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
Return clean plain ASCII text without any emojis or special UTF-8 characters like sparkles.

Your goal is to produce a structured, evidence-backed decision analysis.
CORE PRINCIPLE: EVIDENCE-FIRST ANALYSIS
Every score, insight, or conclusion MUST be backed by an explicit JD requirement and explicit evidence from candidate profile or clearly identified absence. Do NOT hallucinate. Do NOT assume.

### STEP 1: EXTRACT JD INTELLIGENCE
Extract Core Requirements, Secondary Requirements, Optional/Nice-to-have from the JD.

### STEP 2: EXTRACT CANDIDATE INTELLIGENCE
Extract Skills, Projects, Tools, Evidence of real-world usage from Resume/CL.

### STEP 3: REQUIREMENT MAPPING (STRICT)
For each requirement, provide:
- requirement: name of the skill/tool
- importance: Core | Secondary | Optional
- score: 0 to 100
- status: Strong | Partial | Weak
- evidence: extracted supporting text. If no match, state "No relevant experience found".
- source: Resume | Project | Experience | Cover Letter. If no match, state "None".
- confidence: 0 to 100

### STEP 4: GAP ANALYSIS (STRUCTURED)
Identify Critical, Moderate, and Minor gaps separately. NEVER say "No gaps" unless ALL core + secondary are fully matched. Ensure no duplication.

### STEP 5: MATCH DISTRIBUTION & SCORING BREAKDOWN
Calculate overall scores and distribution for:
- match_distribution (core, secondary, optional averages)
- Score breakdown (skills, experience, projects, overall)
- Component percentages (skill_match_percentage, experience_match_percentage, project_alignment_score)

### STEP 6: ANALYTICS DATA FOR GRAPHS (CRITICAL)
Generate graph-ready structures:
- Skills graph (name, jd_required, candidate)
- Section contribution (section, impact)

### STEP 7: SELECTION LIKELIHOOD
Classify: High Shortlist Potential, Moderate Potential, Low Potential based on skill/experience and gap severity.

### STEP 8: EXECUTIVE SUMMARY (OPTIMIZED)
Write a precise 2-3 line summary reflecting actual score and gaps.

### STEP 9: ACTIONABLE IMPROVEMENTS
Suggest missing skills to learn, project ideas, resume improvements.

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
            match_distribution=MatchDistribution(core=0, secondary=0, optional=0),
            jd_summary=JDSummary(),
            candidate_summary=CandidateSummary(),
            requirement_mapping=[],
            gap_analysis=GapAnalysis(moderate=missing_skills[:3]),
            analytics=AnalyticsData(
                skill_match_percentage=50,
                experience_match_percentage=50,
                project_alignment_score=50,
                graphs=Graphs(),
                score_breakdown=ScoreBreakdown(skills=50, experience=50, projects=50, overall=50)
            ),
            executive_summary="Candidate shows potential but lacks some verified key skills.",
            recommended_actions=["Highlight specific project outcomes", "Acquire missing core skills"]
        ),
        resume_context=resume_context,
        jd_requirements=jd_requirements,
        extracted_skills=state.get("extracted_skills", {}),
        matched_skills=matched_skills,
        missing_skills=missing_skills,
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
