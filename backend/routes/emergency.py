from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import get_db
from models.request import EmergencyRequest
from models.hospital import Hospital
from models.ambulance import Ambulance
from schemas.schemas import EmergencyRequestCreate, EmergencyRequestResponse, HospitalPublic, AmbulanceResponse
from services.routing import find_best_hospital, find_nearest_ambulance, calculate_eta, haversine_distance

router = APIRouter(tags=["Emergency"])


@router.post("/request-emergency")
def request_emergency(data: EmergencyRequestCreate, db: Session = Depends(get_db)):
    # 1. Find best hospital using smart routing
    best = find_best_hospital(
        db,
        patient_lat=data.patient_lat,
        patient_lng=data.patient_lng,
        blood_group_needed=data.blood_group_needed,
        severity=data.severity,
    )

    if not best:
        raise HTTPException(
            status_code=503,
            detail="No suitable hospital found with available beds",
        )

    # 2. Find nearest idle ambulance
    ambulance = find_nearest_ambulance(db, data.patient_lat, data.patient_lng)

    if not ambulance:
        raise HTTPException(
            status_code=503,
            detail="No ambulance currently available",
        )

    # 3. Calculate ETA from ambulance to patient to hospital
    amb_to_patient = haversine_distance(ambulance.lat, ambulance.lng, data.patient_lat, data.patient_lng)
    patient_to_hospital = best["distance_km"]
    total_eta = calculate_eta(amb_to_patient + patient_to_hospital)

    # 4. Create emergency request record
    request = EmergencyRequest(
        patient_name=data.patient_name,
        patient_phone=data.patient_phone,
        patient_lat=data.patient_lat,
        patient_lng=data.patient_lng,
        blood_group_needed=data.blood_group_needed,
        severity=data.severity,
        assigned_hospital_id=best["hospital_id"],
        ambulance_id=ambulance.id,
        status="assigned",
        eta_minutes=total_eta,
    )
    db.add(request)

    # 5. Update ambulance status
    ambulance.status = "assigned"
    ambulance.assigned_hospital_id = best["hospital_id"]
    ambulance.assigned_request_id = request.id

    db.commit()
    db.refresh(request)

    # 6. Get full hospital object for response
    hospital = db.query(Hospital).filter(Hospital.id == best["hospital_id"]).first()

    return {
        "request_id": request.id,
        "status": "assigned",
        "message": "Emergency request processed successfully",
        "hospital": {
            "id": hospital.id,
            "name": hospital.name,
            "lat": hospital.lat,
            "lng": hospital.lng,
            "contact": hospital.contact,
            "distance_km": best["distance_km"],
            "available_beds_icu": hospital.available_beds_icu,
            "available_beds_general": hospital.available_beds_general,
            "blood_inventory": hospital.blood_inventory,
            "match_score": best["score"],
        },
        "ambulance": {
            "id": ambulance.id,
            "name": ambulance.name,
            "driver": ambulance.driver,
            "lat": ambulance.lat,
            "lng": ambulance.lng,
        },
        "eta_minutes": total_eta,
        "routing_details": {
            "bed_score": best["bed_score"],
            "blood_score": best["blood_score"],
            "distance_score": best["distance_score"],
            "total_score": best["score"],
        },
    }
