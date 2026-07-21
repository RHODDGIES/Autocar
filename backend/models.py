from pydantic import BaseModel, Field
from typing import Optional, List

class RecommendationRequest(BaseModel):
    query: str = Field(..., min_length=5, max_length=500)
    budget_max: Optional[int] = Field(None, ge=5000, le=200000)
    location: Optional[str] = None
    language: Optional[str] = Field("en", pattern="^(en|fr)$")

class ExtractedNeeds(BaseModel):
    seating_capacity: Optional[int] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    fuel_type_preference: Optional[List[str]] = None
    body_types: Optional[List[str]] = None
    drivetrain: Optional[str] = None
    priority_attributes: Optional[List[str]] = None
    use_case_tags: Optional[List[str]] = None
    towing_min_lbs: Optional[int] = None
    cargo_priority: Optional[bool] = None
    new_vs_used: Optional[str] = None
    location_climate: Optional[str] = None

class CarRecommendation(BaseModel):
    car_id: str
    score: float
    match_reason: str
    trade_offs: str

class RecommendationResponse(BaseModel):
    extracted_needs: ExtractedNeeds
    recommendations: List[CarRecommendation]

class CompareRequest(BaseModel):
    car_ids: List[str] = Field(..., min_length=2, max_length=3)

class CompareResponse(BaseModel):
    comparison: dict

class FeedbackRequest(BaseModel):
    car_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
