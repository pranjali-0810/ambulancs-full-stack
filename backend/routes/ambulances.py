from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from models.ambulance import Ambulance
from schemas.schemas import AmbulanceResponse, AssignAmbulance

router = APIRouter(tags=["Ambulances"])


@router.get("/ambulances", response_model=List[AmbulanceResponse])
def get_ambulances(db: Session = Depends(get_db)):
    return db.query(Ambulance).all()


@router.get("/ambulances/{ambulance_id}", response_model=AmbulanceResponse)
def get_ambulance(ambulance_id: int, db: Session = Depends(get_db)):
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return ambulance


@router.post("/assign-ambulance", response_model=AmbulanceResponse)
def assign_ambulance(data: AssignAmbulance, db: Session = Depends(get_db)):
    ambulance = db.query(Ambulance).filter(Ambulance.id == data.ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    if ambulance.status != "idle":
        raise HTTPException(status_code=400, detail="Ambulance is not available")

    ambulance.status = "assigned"
    ambulance.assigned_hospital_id = data.hospital_id
    if data.request_id:
        ambulance.assigned_request_id = data.request_id

    db.commit()
    db.refresh(ambulance)
    return ambulance


@router.put("/ambulances/{ambulance_id}/status")
def update_ambulance_status(
    ambulance_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    valid_statuses = ["idle", "assigned", "on_route", "emergency"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    ambulance.status = status
    if status == "idle":
        ambulance.assigned_hospital_id = None
        ambulance.assigned_request_id = None

    db.commit()
    db.refresh(ambulance)
    return {"message": f"Ambulance {ambulance_id} status updated to {status}"}
