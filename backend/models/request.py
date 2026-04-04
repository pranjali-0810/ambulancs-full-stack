from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.connection import Base


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_name = Column(String(200))
    patient_phone = Column(String(20))
    patient_lat = Column(Float, nullable=False)
    patient_lng = Column(Float, nullable=False)
    blood_group_needed = Column(String(10))
    severity = Column(String(20), default="medium")  # low, medium, high
    assigned_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    status = Column(String(20), default="pending")  # pending, assigned, in_progress, completed, cancelled
    eta_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
