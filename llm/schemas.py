from typing import Dict, List
from pydantic import BaseModel, Field

class SkillValidation(BaseModel):
    resume_skills: List[str] = Field(default_factory=list)
    jd_skills: List[str] = Field(default_factory=list)

    class Config:
        extra = "forbid"

class JDSummary(BaseModel):
    core_requirements: List[str] = Field(default_factory=list)
    secondary_requirements: List[str] = Field(default_factory=list)
    optional_requirements: List[str] = Field(default_factory=list)

class CandidateSummary(BaseModel):
    skills: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    experience_highlights: List[str] = Field(default_factory=list)

class RequirementMapping(BaseModel):
    requirement: str
    importance: str
    score: int = Field(ge=0, le=100)
    status: str
    evidence: str
    source: str
    confidence: int = Field(ge=0, le=100)

class MatchDistribution(BaseModel):
    core: int
    secondary: int
    optional: int

class SkillGraph(BaseModel):
    name: str
    jd_required: int
    candidate: int

class SectionContribution(BaseModel):
    section: str
    impact: int

class Graphs(BaseModel):
    skills: List[SkillGraph] = Field(default_factory=list)
    section_contribution: List[SectionContribution] = Field(default_factory=list)

class ScoreBreakdown(BaseModel):
    skills: int
    experience: int
    projects: int
    overall: int

class GapAnalysis(BaseModel):
    critical: List[str] = Field(default_factory=list)
    moderate: List[str] = Field(default_factory=list)
    minor: List[str] = Field(default_factory=list)

class AnalyticsData(BaseModel):
    skill_match_percentage: int
    experience_match_percentage: int
    project_alignment_score: int
    graphs: Graphs
    score_breakdown: ScoreBreakdown

class IntelligenceEngineOutput(BaseModel):
    overall_match_score: int = Field(ge=0, le=100)
    fit_category: str
    shortlist_potential: str
    match_distribution: MatchDistribution
    jd_summary: JDSummary
    candidate_summary: CandidateSummary
    requirement_mapping: List[RequirementMapping] = Field(default_factory=list)
    gap_analysis: GapAnalysis
    analytics: AnalyticsData
    executive_summary: str
    recommended_actions: List[str] = Field(default_factory=list)

    class Config:
        extra = "forbid"

class ScoringOutput(BaseModel):
    section_scores: Dict[str, float] = Field(default_factory=dict)

    class Config:
        extra = "forbid"

class GraphDataOutput(BaseModel):
    score_distribution: Dict[str, float] = Field(default_factory=dict)
    skill_match: Dict[str, int] = Field(default_factory=dict)
    category_scores: Dict[str, float] = Field(default_factory=dict)
    gap_analysis: Dict[str, int] = Field(default_factory=dict)

    class Config:
        extra = "forbid"

class JDClassification(BaseModel):
    is_JD: bool
    confidence: float = Field(ge=0, le=1)

    class Config:
        extra = "forbid"
