from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# --- Hospital Schemas ---
class HospitalBase(BaseModel):
    name: str
    lat: float
    lng: float
    contact: Optional[str] = None
    total_beds_icu: int = 0
    available_beds_icu: int = 0
    total_beds_general: int = 0
    available_beds_general: int = 0
    blood_inventory: dict = {}


class HospitalRegister(BaseModel):
    name: str
    email: str
    password: str
    lat: float
    lng: float
    contact: Optional[str] = None
    total_beds_icu: int = 0
    total_beds_general: int = 0


class HospitalUpdateAvailability(BaseModel):
    hospital_id: int
    available_beds_icu: Optional[int] = None
    available_beds_general: Optional[int] = None
    blood_inventory: Optional[dict] = None


class HospitalResponse(HospitalBase):
    id: int
    email: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HospitalPublic(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    contact: Optional[str] = None
    total_beds_icu: int
    available_beds_icu: int
    total_beds_general: int
    available_beds_general: int
    blood_inventory: dict
    status: str

    class Config:
        from_attributes = True


# --- Ambulance Schemas ---
class AmbulanceBase(BaseModel):
    name: str
    driver: str
    lat: float
    lng: float
    status: str = "idle"


class AmbulanceResponse(AmbulanceBase):
    id: int
    assigned_hospital_id: Optional[int] = None

    class Config:
        from_attributes = True


class AssignAmbulance(BaseModel):
    ambulance_id: int
    hospital_id: int
    request_id: Optional[int] = None


# --- Emergency Request Schemas ---
class EmergencyRequestCreate(BaseModel):
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    patient_lat: float
    patient_lng: float
    blood_group_needed: Optional[str] = None
    severity: str = "medium"


class EmergencyRequestResponse(BaseModel):
    id: int
    patient_name: Optional[str] = None
    patient_lat: float
    patient_lng: float
    blood_group_needed: Optional[str] = None
    severity: str
    status: str
    assigned_hospital: Optional[HospitalPublic] = None
    ambulance: Optional[AmbulanceResponse] = None
    eta_minutes: Optional[int] = None

    class Config:
        from_attributes = True


# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    hospital_id: int
    hospital_name: str


# --- WebSocket Message ---
class WSMessage(BaseModel):
    type: str  # hospital_update, ambulance_update, emergency_alert, etc.
    data: dict
