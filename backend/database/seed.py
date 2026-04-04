from sqlalchemy.orm import Session
from models.hospital import Hospital
from models.ambulance import Ambulance
from services.auth import hash_password


def seed_database(db: Session):
    """Seed the database with sample hospitals and ambulances."""
    # Check if already seeded
    if db.query(Hospital).count() > 0:
        print("Database already seeded, skipping...")
        return

    print(" Seeding database...")

    # Seed hospitals (Delhi locations)
    hospitals = [
        Hospital(
            name="AIIMS Delhi",
            email="admin@aiims.edu.in",
            password_hash=hash_password("password123"),
            lat=28.5672, lng=77.2100,
            contact="+91-11-2658-8500",
            total_beds_icu=50, available_beds_icu=12,
            total_beds_general=200, available_beds_general=45,
            blood_inventory={"A+": 15, "A-": 5, "B+": 20, "B-": 3, "O+": 25, "O-": 8, "AB+": 10, "AB-": 2},
            status="active",
        ),
        Hospital(
            name="Safdarjung Hospital",
            email="admin@safdarjung.gov.in",
            password_hash=hash_password("password123"),
            lat=28.5685, lng=77.2066,
            contact="+91-11-2673-0000",
            total_beds_icu=40, available_beds_icu=5,
            total_beds_general=150, available_beds_general=30,
            blood_inventory={"A+": 8, "A-": 2, "B+": 12, "B-": 1, "O+": 18, "O-": 4, "AB+": 6, "AB-": 1},
            status="active",
        ),
        Hospital(
            name="Max Super Specialty",
            email="admin@maxhealthcare.com",
            password_hash=hash_password("password123"),
            lat=28.5594, lng=77.2588,
            contact="+91-11-2651-5050",
            total_beds_icu=60, available_beds_icu=20,
            total_beds_general=250, available_beds_general=80,
            blood_inventory={"A+": 22, "A-": 8, "B+": 28, "B-": 5, "O+": 35, "O-": 12, "AB+": 14, "AB-": 4},
            status="active",
        ),
        Hospital(
            name="Fortis Hospital",
            email="admin@fortishealthcare.com",
            password_hash=hash_password("password123"),
            lat=28.5355, lng=77.2510,
            contact="+91-11-4277-6222",
            total_beds_icu=45, available_beds_icu=2,
            total_beds_general=180, available_beds_general=15,
            blood_inventory={"A+": 5, "A-": 1, "B+": 8, "B-": 0, "O+": 10, "O-": 2, "AB+": 3, "AB-": 0},
            status="critical",
        ),
        Hospital(
            name="Apollo Hospital",
            email="admin@apollohospitals.com",
            password_hash=hash_password("password123"),
            lat=28.5440, lng=77.2830,
            contact="+91-11-2987-1010",
            total_beds_icu=55, available_beds_icu=18,
            total_beds_general=220, available_beds_general=65,
            blood_inventory={"A+": 18, "A-": 6, "B+": 24, "B-": 4, "O+": 30, "O-": 10, "AB+": 12, "AB-": 3},
            status="active",
        ),
        Hospital(
            name="Sir Ganga Ram Hospital",
            email="admin@sgrh.com",
            password_hash=hash_password("password123"),
            lat=28.6358, lng=77.1923,
            contact="+91-11-2586-1234",
            total_beds_icu=35, available_beds_icu=8,
            total_beds_general=160, available_beds_general=40,
            blood_inventory={"A+": 12, "A-": 4, "B+": 16, "B-": 2, "O+": 22, "O-": 6, "AB+": 8, "AB-": 2},
            status="active",
        ),
    ]

    for h in hospitals:
        db.add(h)

    db.flush()  # Get IDs assigned

    # Seed ambulances
    ambulances = [
        Ambulance(name="AMB-001", driver="Rajesh Kumar", lat=28.5550, lng=77.2200, status="idle"),
        Ambulance(name="AMB-002", driver="Suresh Singh", lat=28.5700, lng=77.2300, status="idle"),
        Ambulance(name="AMB-003", driver="Amit Sharma", lat=28.5400, lng=77.2600, status="idle"),
        Ambulance(name="AMB-004", driver="Vikram Patel", lat=28.5800, lng=77.1900, status="idle"),
        Ambulance(name="AMB-005", driver="Deepak Verma", lat=28.6000, lng=77.2100, status="idle"),
    ]

    for a in ambulances:
        db.add(a)

    db.commit()
    print(" Database seeded with 6 hospitals and 5 ambulances!")
