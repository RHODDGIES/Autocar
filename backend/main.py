from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
import json
import logging
from typing import Dict, Any

from config import settings, client
from models import (
    RecommendationRequest, 
    RecommendationResponse, 
    ExtractedNeeds,
    CarRecommendation,
    CompareRequest,
    CompareResponse,
    FeedbackRequest,
    HealthResponse
)
from cars_db import get_car_by_id, get_all_cars
from scoring import score_cars
from prompts import EXTRACT_NEEDS_PROMPT, RECOMMEND_PROMPT, COMPARE_PROMPT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="AutoMatch API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory feedback storage
feedback_store = {}

@app.get("/")
async def root():
    """Return a simple deployment status response."""
    return {"status": "ok", "service": "AutoMatch API", "health": "/health"}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")

@app.post("/api/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest, http_request: Request):
    """
    Main recommendation endpoint.
    1. Extract needs from natural language query using LLM
    2. Filter cars by hard constraints
    3. Score remaining cars
    4. Generate explanations using LLM
    5. Return ranked recommendations
    """
    try:
        logger.info(f"Recommendation request: query='{request.query}', budget={request.budget_max}, language={request.language}")
        
        # Step 1: Extract needs using LLM
        extracted_needs = await extract_needs(request.query, request.language, request.budget_max)
        logger.info(f"Extracted needs: {extracted_needs}")
        
        # Step 2: Get all cars and filter by hard constraints
        all_cars = get_all_cars()
        scored_cars = score_cars(extracted_needs.dict(), all_cars)
        
        if not scored_cars:
            logger.warning("No cars matched the constraints")
            return RecommendationResponse(
                extracted_needs=extracted_needs,
                recommendations=[]
            )
        
        # Step 3: Take top 5 candidates for LLM explanation
        top_candidates = scored_cars[:5]
        
        # Step 4: Generate explanations using LLM
        recommendations = await generate_explanations(extracted_needs, top_candidates, request.language)
        
        return RecommendationResponse(
            extracted_needs=extracted_needs,
            recommendations=recommendations
        )
        
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cars/{car_id}")
async def get_car(car_id: str):
    """Get car details by ID."""
    car = get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail=f"Car with ID {car_id} not found")
    return car

@app.post("/api/cars/compare", response_model=CompareResponse)
async def compare_cars(request: CompareRequest):
    """
    Compare multiple cars side-by-side.
    Returns category winners and overall recommendation.
    """
    try:
        logger.info(f"Compare request: car_ids={request.car_ids}")
        
        # Get car details
        cars_to_compare = []
        for car_id in request.car_ids:
            car = get_car_by_id(car_id)
            if not car:
                raise HTTPException(status_code=404, detail=f"Car with ID {car_id} not found")
            cars_to_compare.append(car)
        
        # Generate comparison using LLM
        comparison = await generate_comparison(cars_to_compare)
        
        return CompareResponse(comparison=comparison)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing cars: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Store user feedback for a car recommendation."""
    try:
        logger.info(f"Feedback received: car_id={request.car_id}, rating={request.rating}")
        
        # Store in memory (for demo purposes)
        feedback_store[request.car_id] = {
            "rating": request.rating,
            "comment": request.comment
        }
        
        return {"status": "success", "message": "Feedback recorded"}
        
    except Exception as e:
        logger.error(f"Error storing feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def extract_needs(query: str, language: str, budget_max: int = None) -> ExtractedNeeds:
    """Extract structured needs from natural language query using LLM."""
    if not client:
        # Fallback: return empty needs if no API key
        logger.warning("No OpenAI client available, returning empty needs")
        return ExtractedNeeds()
    
    try:
        # Add budget to prompt if provided
        budget_hint = f" Budget constraint: ${budget_max}" if budget_max else ""
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": EXTRACT_NEEDS_PROMPT},
                {"role": "user", "content": f"Input: \"{query}\"{budget_hint}"}
            ],
            temperature=0.3
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse JSON response
        needs_data = json.loads(content)
        
        # Override budget if provided in request
        if budget_max:
            needs_data["budget_max"] = budget_max
        
        return ExtractedNeeds(**needs_data)
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {e}")
        logger.error(f"Raw response: {content}")
        return ExtractedNeeds()
    except Exception as e:
        logger.error(f"Error extracting needs: {e}")
        return ExtractedNeeds()

async def generate_explanations(needs: ExtractedNeeds, scored_cars, language: str) -> list:
    """Generate match explanations using LLM."""
    if not client:
        # Fallback: generate simple explanations
        recommendations = []
        for rank, (car, score) in enumerate(scored_cars, 1):
            recommendations.append(CarRecommendation(
                car_id=car["id"],
                score=round(score, 2),
                match_reason=f"Good match with {car['mpg_city']} MPG city and {car['seating_capacity']} seats.",
                trade_offs="Higher price than some alternatives."
            ))
        return recommendations
    
    try:
        # Prepare cars data for prompt
        cars_data = []
        for car, score in scored_cars:
            cars_data.append({
                "id": car["id"],
                "make": car["make"],
                "model": car["model"],
                "year": car["year"],
                "price": car["price_new"],
                "mpg_city": car["mpg_city"],
                "mpg_highway": car["mpg_highway"],
                "seating": car["seating_capacity"],
                "cargo": car["cargo_cu_ft"],
                "towing": car["towing_capacity_lbs"],
                "safety": car["safety_rating"],
                "fuel_type": car["fuel_type"],
                "drivetrain": car["drivetrain"],
                "score": score
            })
        
        prompt = RECOMMEND_PROMPT.format(
            needs=needs.json(),
            cars=json.dumps(cars_data, indent=2)
        )
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        explanations = json.loads(content)
        
        # Convert to CarRecommendation objects
        recommendations = []
        for expl in explanations:
            recommendations.append(CarRecommendation(
                car_id=expl["car_id"],
                score=round(expl["score"], 2),
                match_reason=expl["match_reason"],
                trade_offs=expl["trade_offs"]
            ))
        
        return recommendations
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM explanations: {e}")
        # Fallback to simple explanations
        recommendations = []
        for rank, (car, score) in enumerate(scored_cars, 1):
            recommendations.append(CarRecommendation(
                car_id=car["id"],
                score=round(score, 2),
                match_reason=f"Good match with {car['mpg_city']} MPG city and {car['seating_capacity']} seats.",
                trade_offs="Higher price than some alternatives."
            ))
        return recommendations
    except Exception as e:
        logger.error(f"Error generating explanations: {e}")
        # Fallback to simple explanations
        recommendations = []
        for rank, (car, score) in enumerate(scored_cars, 1):
            recommendations.append(CarRecommendation(
                car_id=car["id"],
                score=round(score, 2),
                match_reason=f"Good match with {car['mpg_city']} MPG city and {car['seating_capacity']} seats.",
                trade_offs="Higher price than some alternatives."
            ))
        return recommendations

async def generate_comparison(cars: list) -> dict:
    """Generate car comparison using LLM."""
    if not client:
        # Fallback: simple comparison
        return {
            "winner_by_category": {
                "fuel_efficiency": cars[0]["id"],
                "space": cars[0]["id"],
                "safety": cars[0]["id"],
                "performance": cars[0]["id"],
                "value": cars[0]["id"]
            },
            "overall_winner": cars[0]["id"],
            "reasoning": "Comparison based on available specifications."
        }
    
    try:
        # Prepare cars data for prompt
        cars_data = []
        for car in cars:
            cars_data.append({
                "id": car["id"],
                "make": car["make"],
                "model": car["model"],
                "year": car["year"],
                "price": car["price_new"],
                "mpg_city": car["mpg_city"],
                "mpg_highway": car["mpg_highway"],
                "seating": car["seating_capacity"],
                "cargo": car["cargo_cu_ft"],
                "towing": car["towing_capacity_lbs"],
                "safety": car["safety_rating"],
                "fuel_type": car["fuel_type"],
                "drivetrain": car["drivetrain"]
            })
        
        prompt = COMPARE_PROMPT.format(
            needs="{}",
            cars=json.dumps(cars_data, indent=2)
        )
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        return json.loads(content)
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM comparison: {e}")
        # Fallback
        return {
            "winner_by_category": {
                "fuel_efficiency": cars[0]["id"],
                "space": cars[0]["id"],
                "safety": cars[0]["id"],
                "performance": cars[0]["id"],
                "value": cars[0]["id"]
            },
            "overall_winner": cars[0]["id"],
            "reasoning": "Comparison based on available specifications."
        }
    except Exception as e:
        logger.error(f"Error generating comparison: {e}")
        # Fallback
        return {
            "winner_by_category": {
                "fuel_efficiency": cars[0]["id"],
                "space": cars[0]["id"],
                "safety": cars[0]["id"],
                "performance": cars[0]["id"],
                "value": cars[0]["id"]
            },
            "overall_winner": cars[0]["id"],
            "reasoning": "Comparison based on available specifications."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)
