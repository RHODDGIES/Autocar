from typing import List, Tuple, Dict, Any
from cars_db import CARS

def score_cars(needs: Dict[str, Any], cars: List[Dict[str, Any]]) -> List[Tuple[Dict[str, Any], float]]:
    """
    Weighted multi-attribute scoring:
    - Hard constraints (must-match): budget, seating, towing → filter out
    - Soft constraints (scored 0-1): fuel efficiency, safety, features match
    - Priority weights from extracted needs: higher weight for user-mentioned attributes
    - Return: sorted list of (car, score) tuples
    """
    scored_cars = []
    
    for car in cars:
        # Check hard constraints
        if not meets_hard_constraints(needs, car):
            continue
        
        # Calculate soft constraint score
        score = calculate_score(needs, car)
        scored_cars.append((car, score))
    
    # Sort by score descending
    scored_cars.sort(key=lambda x: x[1], reverse=True)
    return scored_cars

def meets_hard_constraints(needs: Dict[str, Any], car: Dict[str, Any]) -> bool:
    """Check if car meets hard constraints from user needs."""
    # Budget constraint
    budget_max = needs.get("budget_max")
    if budget_max:
        new_vs_used = needs.get("new_vs_used")
        if new_vs_used == "new":
            if car["price_new"] > budget_max:
                return False
        else:
            # Consider both new and used prices
            if car["price_new"] > budget_max and car["price_used_avg"] > budget_max:
                return False
    
    # Seating capacity constraint
    seating_needed = needs.get("seating_capacity")
    if seating_needed and car["seating_capacity"] < seating_needed:
        return False
    
    # Towing capacity constraint
    towing_needed = needs.get("towing_min_lbs")
    if towing_needed and car["towing_capacity_lbs"] < towing_needed:
        return False
    
    # Fuel type preference
    fuel_pref = needs.get("fuel_type_preference")
    if fuel_pref and car["fuel_type"] not in fuel_pref:
        return False
    
    # Body type preference
    body_types = needs.get("body_types")
    if body_types and car["body_type"] not in body_types:
        return False
    
    # Drivetrain preference
    drivetrain = needs.get("drivetrain")
    if drivetrain and car["drivetrain"] != drivetrain:
        return False
    
    return True

def calculate_score(needs: Dict[str, Any], car: Dict[str, Any]) -> float:
    """Calculate soft constraint score (0-1) based on user priorities."""
    score = 0.0
    weights = get_priority_weights(needs)
    
    # Fuel efficiency score
    if weights["fuel_efficiency"] > 0:
        mpg_score = normalize_mpg(car["mpg_city"], car["mpg_highway"])
        score += mpg_score * weights["fuel_efficiency"]
    
    # Safety score
    if weights["safety"] > 0:
        safety_score = car["safety_rating"] / 5.0
        score += safety_score * weights["safety"]
    
    # Reliability score
    if weights["safety"] > 0 or weights["fuel_efficiency"] > 0:
        reliability_score = car["reliability_score"] / 10.0
        score += reliability_score * 0.1
    
    # Cargo score
    if weights["cargo"] > 0:
        cargo_score = normalize_cargo(car["cargo_cu_ft"])
        score += cargo_score * weights["cargo"]
    
    # Towing score
    if weights["towing"] > 0:
        towing_score = normalize_towing(car["towing_capacity_lbs"])
        score += towing_score * weights["towing"]
    
    # Off-road score
    if weights["off_road"] > 0:
        offroad_score = calculate_offroad_score(car)
        score += offroad_score * weights["off_road"]
    
    # Luxury score
    if weights["luxury"] > 0:
        luxury_score = calculate_luxury_score(car)
        score += luxury_score * weights["luxury"]
    
    # Sportiness score
    if weights["sportiness"] > 0:
        sportiness_score = calculate_sportiness_score(car)
        score += sportiness_score * weights["sportiness"]
    
    # Use case matching
    use_case_tags = needs.get("use_case_tags", [])
    if use_case_tags:
        match_score = calculate_use_case_match(car, use_case_tags)
        score += match_score * 0.2
    
    # Normalize to 0-1
    return min(score, 1.0)

def get_priority_weights(needs: Dict[str, Any]) -> Dict[str, float]:
    """Get priority weights based on user's extracted needs."""
    weights = {
        "fuel_efficiency": 0.1,
        "safety": 0.1,
        "towing": 0.0,
        "off_road": 0.0,
        "luxury": 0.0,
        "sportiness": 0.0,
        "cargo": 0.0
    }
    
    priority_attrs = needs.get("priority_attributes", [])
    if not priority_attrs:
        return weights
    
    # Assign higher weights to mentioned priorities
    for attr in priority_attrs:
        if attr in weights:
            weights[attr] = 0.25
    
    # Normalize weights
    total = sum(weights.values())
    if total > 0:
        for key in weights:
            weights[key] = weights[key] / total
    
    return weights

def normalize_mpg(city_mpg: int, highway_mpg: int) -> float:
    """Normalize MPG to 0-1 score."""
    avg_mpg = (city_mpg + highway_mpg) / 2
    # Assume 50 MPG is excellent, 15 MPG is poor
    return min(avg_mpg / 50.0, 1.0)

def normalize_cargo(cargo_cu_ft: float) -> float:
    """Normalize cargo space to 0-1 score."""
    # Assume 100 cu ft is excellent, 10 cu ft is poor
    return min(cargo_cu_ft / 100.0, 1.0)

def normalize_towing(towing_lbs: int) -> float:
    """Normalize towing capacity to 0-1 score."""
    # Assume 15000 lbs is excellent, 0 lbs is poor
    return min(towing_lbs / 15000.0, 1.0)

def calculate_offroad_score(car: Dict[str, Any]) -> float:
    """Calculate off-road capability score."""
    score = 0.0
    
    # Ground clearance (8+ inches is good)
    if car["ground_clearance_in"] >= 8:
        score += 0.4
    elif car["ground_clearance_in"] >= 6:
        score += 0.2
    
    # 4WD drivetrain
    if car["drivetrain"] in ["4WD", "AWD"]:
        score += 0.3
    
    # Off-road features
    if car["has_roof_rack"]:
        score += 0.1
    
    # Body type
    if car["body_type"] in ["SUV", "truck"]:
        score += 0.2
    
    return min(score, 1.0)

def calculate_luxury_score(car: Dict[str, Any]) -> float:
    """Calculate luxury score."""
    score = 0.0
    
    # Price threshold (luxury cars typically $50kd+)
    if car["price_new"] >= 50000:
        score += 0.4
    elif car["price_new"] >= 35000:
        score += 0.2
    
    # Premium features
    if car["has_adaptive_cruise"]:
        score += 0.2
    if car["has_lane_keep"]:
        score += 0.1
    if car["has_rear_ac"]:
        score += 0.1
    
    # Premium brands
    luxury_brands = ["BMW", "Mercedes-Benz", "Lexus", "Audi", "Tesla"]
    if car["make"] in luxury_brands:
        score += 0.2
    
    return min(score, 1.0)

def calculate_sportiness_score(car: Dict[str, Any]) -> float:
    """Calculate sportiness score."""
    score = 0.0
    
    # RWD or AWD preferred for sportiness
    if car["drivetrain"] in ["RWD", "AWD"]:
        score += 0.3
    
    # Convertible or coupe body types
    if car["body_type"] in ["convertible", "coupe"]:
        score += 0.3
    
    # Manual transmission available
    if car["is_manual_available"]:
        score += 0.2
    
    # Lower ground clearance (sporty cars sit lower)
    if car["ground_clearance_in"] < 6:
        score += 0.2
    
    return min(score, 1.0)

def calculate_use_case_match(car: Dict[str, Any], use_case_tags: List[str]) -> float:
    """Calculate how well car matches use case tags."""
    car_best_for = car.get("best_for", [])
    matches = 0
    
    for tag in use_case_tags:
        if tag in car_best_for:
            matches += 1
    
    return matches / len(use_case_tags) if use_case_tags else 0.0
