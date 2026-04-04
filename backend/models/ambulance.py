from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.connection import Base


class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    driver = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String(20), default="idle")  # idle, assigned, on_route, emergency
    assigned_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    assigned_request_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
