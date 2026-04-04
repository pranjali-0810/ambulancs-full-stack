from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
from typing import List

from database.connection import engine, Base, SessionLocal
from database.seed import seed_database
from routes import auth, hospitals, ambulances, emergency


# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


# --- App Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    print("🚑 AetherAid Backend is running!")
    yield
    # Shutdown
    print("Backend shutting down...")


# --- FastAPI App ---
app = FastAPI(
    title="AetherAid API",
    description="Real-time emergency response system API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(ambulances.router)
app.include_router(emergency.router)


# --- Root ---
@app.get("/")
def root():
    return {
        "name": "AetherAid API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


# --- Health Check ---
@app.get("/health")
def health():
    return {"status": "healthy"}


# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            # Broadcast updates to all connected clients
            await manager.broadcast(message)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
