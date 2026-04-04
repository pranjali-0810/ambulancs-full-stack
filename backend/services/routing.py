import math
from typing import Optional
from sqlalchemy.orm import Session
from models.hospital import Hospital
from models.ambulance import Ambulance


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates in kilometers using Haversine formula."""
    R = 6371  # Earth's radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def calculate_eta(distance_km: float, avg_speed_kmh: float = 40) -> int:
    """Estimate ETA in minutes based on distance and average speed."""
    return max(1, math.ceil((distance_km / avg_speed_kmh) * 60))


def score_hospital(
    hospital: Hospital,
    patient_lat: float,
    patient_lng: float,
    blood_group_needed: Optional[str] = None,
    severity: str = "medium",
) -> dict:
    """
    Score a hospital based on:
    - Bed availability (40% weight)
    - Blood match (30% weight)
    - Distance / proximity (30% weight)
    
    Higher score = better match.
    """
    distance = haversine_distance(patient_lat, patient_lng, hospital.lat, hospital.lng)
    eta = calculate_eta(distance)

    # Bed availability score (0-40)
    total_beds = hospital.total_beds_icu + hospital.total_beds_general
    available_beds = hospital.available_beds_icu + hospital.available_beds_general
    bed_ratio = available_beds / total_beds if total_beds > 0 else 0
    bed_score = bed_ratio * 40

    # Severity boost: high severity prioritizes ICU beds
    if severity == "high" and hospital.available_beds_icu > 0:
        bed_score += 10
    elif severity == "high" and hospital.available_beds_icu == 0:
        bed_score -= 15

    # Blood availability score (0-30)
    blood_score = 15  # default if no blood group specified
    if blood_group_needed:
        blood_inv = hospital.blood_inventory or {}
        units = blood_inv.get(blood_group_needed, 0)
        if units > 10:
            blood_score = 30
        elif units > 5:
            blood_score = 22
        elif units > 0:
            blood_score = 12
        else:
            blood_score = 0  # No stock, heavily penalize

    # Distance score (0-30): closer = higher
    max_distance = 30  # km, maximum useful distance
    distance_score = max(0, (1 - distance / max_distance)) * 30

    total_score = max(0, bed_score + blood_score + distance_score)

    return {
        "hospital_id": hospital.id,
        "name": hospital.name,
        "lat": hospital.lat,
        "lng": hospital.lng,
        "contact": hospital.contact,
        "distance_km": round(distance, 2),
        "eta_minutes": eta,
        "available_beds_icu": hospital.available_beds_icu,
        "available_beds_general": hospital.available_beds_general,
        "total_beds_icu": hospital.total_beds_icu,
        "total_beds_general": hospital.total_beds_general,
        "blood_inventory": hospital.blood_inventory,
        "status": hospital.status,
        "score": round(total_score, 1),
        "bed_score": round(bed_score, 1),
        "blood_score": round(blood_score, 1),
        "distance_score": round(distance_score, 1),
    }


def find_best_hospital(
    db: Session,
    patient_lat: float,
    patient_lng: float,
    blood_group_needed: Optional[str] = None,
    severity: str = "medium",
) -> dict | None:
    """Find the best matching hospital for a patient based on smart routing."""
    hospitals = db.query(Hospital).filter(Hospital.status != "inactive").all()

    if not hospitals:
        return None

    scored = []
    for h in hospitals:
        # Skip hospitals with zero beds
        if h.available_beds_icu + h.available_beds_general == 0:
            continue
        scored.append(score_hospital(h, patient_lat, patient_lng, blood_group_needed, severity))

    if not scored:
        return None

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[0]


def find_nearest_ambulance(
    db: Session,
    target_lat: float,
    target_lng: float,
) -> Ambulance | None:
    """Find the nearest idle ambulance to a target location."""
    ambulances = db.query(Ambulance).filter(Ambulance.status == "idle").all()

    if not ambulances:
        return None

    nearest = None
    min_distance = float("inf")

    for amb in ambulances:
        distance = haversine_distance(target_lat, target_lng, amb.lat, amb.lng)
        if distance < min_distance:
            min_distance = distance
            nearest = amb

    return nearest
