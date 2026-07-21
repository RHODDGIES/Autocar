import pytest
from fastapi.testclient import TestClient
from main import app
from models import RecommendationRequest, FeedbackRequest
from cars_db import get_car_by_id, get_all_cars
from scoring import score_cars, meets_hard_constraints, calculate_score

client = TestClient(app)

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_valid_recommendation_request():
    """Test valid recommendation request."""
    request_data = {
        "query": "I have 3 kids and commute 2 hours",
        "budget_max": 45000,
        "language": "en"
    }
    response = client.post("/api/recommendations", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "extracted_needs" in data
    assert "recommendations" in data

def test_vague_query_handling():
    """Test handling of vague queries."""
    request_data = {
        "query": "I need a car",
        "language": "en"
    }
    response = client.post("/api/recommendations", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "extracted_needs" in data

def test_budget_too_low():
    """Test when budget is too low for any car."""
    request_data = {
        "query": "I need a family car",
        "budget_max": 5000,
        "language": "en"
    }
    response = client.post("/api/recommendations", json=request_data)
    assert response.status_code == 200
    data = response.json()
    # Should return empty recommendations if no cars match
    assert isinstance(data["recommendations"], list)

def test_invalid_request():
    """Test invalid request (422 error)."""
    request_data = {
        "query": "hi",  # Too short (min 5 chars)
        "budget_max": 45000
    }
    response = client.post("/api/recommendations", json=request_data)
    assert response.status_code == 422

def test_car_not_found():
    """Test car not found (404 error)."""
    response = client.get("/api/cars/nonexistent_car")
    assert response.status_code == 404

def test_get_car_by_id():
    """Test getting a valid car by ID."""
    car = get_car_by_id("honda_crv_hybrid_2026")
    assert car is not None
    assert car["make"] == "Honda"
    assert car["model"] == "CR-V"

def test_compare_endpoint():
    """Test car comparison endpoint."""
    request_data = {
        "car_ids": ["honda_crv_hybrid_2026", "toyota_camry_hybrid_2026"]
    }
    response = client.post("/api/cars/compare", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "comparison" in data

def test_compare_invalid_car():
    """Test comparison with invalid car ID."""
    request_data = {
        "car_ids": ["honda_crv_hybrid_2026", "invalid_car_id"]
    }
    response = client.post("/api/cars/compare", json=request_data)
    assert response.status_code == 404

def test_feedback_endpoint():
    """Test feedback submission endpoint."""
    request_data = {
        "car_id": "honda_crv_hybrid_2026",
        "rating": 5,
        "comment": "Great car!"
    }
    response = client.post("/api/feedback", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_scoring_hard_constraints_budget():
    """Test scoring with budget hard constraint."""
    needs = {"budget_max": 30000}
    car = get_car_by_id("honda_crv_hybrid_2026")
    # Honda CR-V is $42000, should fail budget constraint
    assert not meets_hard_constraints(needs, car)

def test_scoring_hard_constraints_seating():
    """Test scoring with seating hard constraint."""
    needs = {"seating_capacity": 7}
    car = get_car_by_id("honda_crv_hybrid_2026")
    # Honda CR-V has 5 seats, should fail seating constraint
    assert not meets_hard_constraints(needs, car)

def test_scoring_hard_constraints_towing():
    """Test scoring with towing hard constraint."""
    needs = {"towing_min_lbs": 5000}
    car = get_car_by_id("honda_crv_hybrid_2026")
    # Honda CR-V tows 1500 lbs, should fail towing constraint
    assert not meets_hard_constraints(needs, car)

def test_scoring_soft_constraints():
    """Test soft constraint scoring."""
    needs = {"priority_attributes": ["fuel_efficiency"]}
    all_cars = get_all_cars()
    scored = score_cars(needs, all_cars)
    assert len(scored) > 0
    # Check that scores are between 0 and 1
    for car, score in scored:
        assert 0 <= score <= 1

def test_scoring_family_priority():
    """Test scoring with family priority."""
    needs = {
        "seating_capacity": 7,
        "priority_attributes": ["safety", "cargo"],
        "use_case_tags": ["family"]
    }
    all_cars = get_all_cars()
    scored = score_cars(needs, all_cars)
    assert len(scored) > 0
    # Top cars should be family-oriented (Sienna, Telluride, Ascent)
    top_car_id = scored[0][0]["id"]
    assert top_car_id in ["toyota_sienna_2026", "kia_telluride_2026", "subaru_ascent_2026"]

def test_scoring_towing_priority():
    """Test scoring with towing priority."""
    needs = {
        "towing_min_lbs": 5000,
        "priority_attributes": ["towing"],
        "use_case_tags": ["adventure"]
    }
    all_cars = get_all_cars()
    scored = score_cars(needs, all_cars)
    assert len(scored) > 0
    # Top cars should have high towing capacity
    top_car = scored[0][0]
    assert top_car["towing_capacity_lbs"] >= 5000

def test_french_query():
    """Test French language query."""
    request_data = {
        "query": "J'ai 3 enfants et je fais du covoiturage",
        "budget_max": 45000,
        "language": "fr"
    }
    response = client.post("/api/recommendations", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "extracted_needs" in data

def test_get_all_cars():
    """Test getting all cars from database."""
    cars = get_all_cars()
    assert len(cars) == 20
    # Check that first car has required fields
    assert "id" in cars[0]
    assert "make" in cars[0]
    assert "model" in cars[0]
    assert "price_new" in cars[0]

def test_scoring_no_matches():
    """Test scoring when no cars match constraints."""
    needs = {
        "budget_max": 1000,
        "seating_capacity": 10,
        "towing_min_lbs": 20000
    }
    all_cars = get_all_cars()
    scored = score_cars(needs, all_cars)
    assert len(scored) == 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
