from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from models.hospital import Hospital
from schemas.schemas import HospitalPublic, HospitalUpdateAvailability, HospitalRegister
from services.auth import get_current_hospital, hash_password

router = APIRouter(tags=["Hospitals"])


@router.get("/hospitals", response_model=List[HospitalPublic])
def get_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).filter(Hospital.status != "inactive").all()
    return hospitals


@router.get("/hospitals/{hospital_id}", response_model=HospitalPublic)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital


@router.post("/hospital/register", response_model=HospitalPublic, status_code=201)
def register_hospital(data: HospitalRegister, db: Session = Depends(get_db)):
    existing = db.query(Hospital).filter(Hospital.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hospital = Hospital(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        lat=data.lat,
        lng=data.lng,
        contact=data.contact,
        total_beds_icu=data.total_beds_icu,
        available_beds_icu=data.total_beds_icu,
        total_beds_general=data.total_beds_general,
        available_beds_general=data.total_beds_general,
        blood_inventory={"A+": 0, "A-": 0, "B+": 0, "B-": 0, "O+": 0, "O-": 0, "AB+": 0, "AB-": 0},
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.put("/hospital/update-availability", response_model=HospitalPublic)
def update_availability(
    data: HospitalUpdateAvailability,
    db: Session = Depends(get_db),
):
    hospital = db.query(Hospital).filter(Hospital.id == data.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if data.available_beds_icu is not None:
        hospital.available_beds_icu = min(data.available_beds_icu, hospital.total_beds_icu)
    if data.available_beds_general is not None:
        hospital.available_beds_general = min(data.available_beds_general, hospital.total_beds_general)
    if data.blood_inventory is not None:
        hospital.blood_inventory = data.blood_inventory

    # Auto-detect critical status
    total = hospital.total_beds_icu + hospital.total_beds_general
    available = hospital.available_beds_icu + hospital.available_beds_general
    if total > 0 and (available / total) < 0.1:
        hospital.status = "critical"
    else:
        hospital.status = "active"

    db.commit()
    db.refresh(hospital)
    return hospital
