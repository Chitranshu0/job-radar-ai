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
    match_status: str
    evidence: str

class ProjectAlignment(BaseModel):
    project: str
    alignment: str
    reason: str

class GapAnalysis(BaseModel):
    critical: List[str] = Field(default_factory=list)
    moderate: List[str] = Field(default_factory=list)
    minor: List[str] = Field(default_factory=list)

class Scores(BaseModel):
    skill_coverage: float
    experience_depth: float
    project_alignment: float
    semantic_match: float

class AnalyticsData(BaseModel):
    requirement_coverage: Dict[str, float] = Field(default_factory=dict)
    match_distribution: Dict[str, int] = Field(default_factory=dict)
    project_alignment_distribution: Dict[str, int] = Field(default_factory=dict)
    experience_indicators: Dict[str, int] = Field(default_factory=dict)
    gap_distribution: Dict[str, int] = Field(default_factory=dict)

class IntelligenceEngineOutput(BaseModel):
    overall_match_score: int = Field(ge=0, le=100)
    fit_category: str
    shortlist_potential: str
    jd_summary: JDSummary
    candidate_summary: CandidateSummary
    requirement_mapping: List[RequirementMapping] = Field(default_factory=list)
    project_alignment: List[ProjectAlignment] = Field(default_factory=list)
    gap_analysis: GapAnalysis
    scores: Scores
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

