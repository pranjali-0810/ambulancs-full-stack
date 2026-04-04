from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.sql import func
from database.connection import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    contact = Column(String(50))
    total_beds_icu = Column(Integer, default=0)
    available_beds_icu = Column(Integer, default=0)
    total_beds_general = Column(Integer, default=0)
    available_beds_general = Column(Integer, default=0)
    blood_inventory = Column(JSON, default=lambda: {
        "A+": 0, "A-": 0, "B+": 0, "B-": 0,
        "O+": 0, "O-": 0, "AB+": 0, "AB-": 0
    })
    status = Column(String(20), default="active")  # active, critical, inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
