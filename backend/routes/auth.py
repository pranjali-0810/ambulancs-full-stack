from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.hospital import Hospital
from schemas.schemas import LoginRequest, TokenResponse, HospitalRegister
from services.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.email == request.email).first()
    if not hospital or not verify_password(request.password, hospital.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={"hospital_id": hospital.id, "email": hospital.email}
    )
    return TokenResponse(
        access_token=token,
        hospital_id=hospital.id,
        hospital_name=hospital.name,
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(request: HospitalRegister, db: Session = Depends(get_db)):
    existing = db.query(Hospital).filter(Hospital.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hospital = Hospital(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        lat=request.lat,
        lng=request.lng,
        contact=request.contact,
        total_beds_icu=request.total_beds_icu,
        available_beds_icu=request.total_beds_icu,
        total_beds_general=request.total_beds_general,
        available_beds_general=request.total_beds_general,
        blood_inventory={"A+": 0, "A-": 0, "B+": 0, "B-": 0, "O+": 0, "O-": 0, "AB+": 0, "AB-": 0},
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)

    token = create_access_token(
        data={"hospital_id": hospital.id, "email": hospital.email}
    )
    return TokenResponse(
        access_token=token,
        hospital_id=hospital.id,
        hospital_name=hospital.name,
    )
