"""
ARGUS MVP Backend
FastAPI server with WebSocket support for live updates
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import asyncio
import json
from typing import List

from mock_data import (
    get_all_satellites,
    get_satellite_by_id,
    get_all_conjunctions,
    get_conjunction_by_id,
    get_conjunctions_for_satellite,
    propagate_satellite,
    SATELLITES
)

app = FastAPI(
    title="ARGUS API",
    description="Space Debris Tracking & Collision Avoidance Platform",
    version="0.1.0 (MVP)"
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
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
            except:
                pass

manager = ConnectionManager()

# ============================================================================
# REST API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API health check"""
    return {
        "service": "ARGUS API",
        "version": "0.1.0-mvp",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/satellites")
async def list_satellites():
    """Get all tracked satellites with current positions"""
    satellites = get_all_satellites()
    return {
        "satellites": satellites,
        "count": len(satellites),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/satellites/{satellite_id}")
async def get_satellite(satellite_id: str):
    """Get specific satellite details"""
    satellite = get_satellite_by_id(satellite_id)
    if not satellite:
        return {"error": "Satellite not found"}, 404
    
    # Get conjunctions for this satellite
    conjunctions = get_conjunctions_for_satellite(satellite_id)
    
    return {
        "satellite": satellite,
        "conjunctions": conjunctions,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/conjunctions")
async def list_conjunctions():
    """Get all active conjunctions"""
    conjunctions = get_all_conjunctions()
    
    # Add summary statistics
    high_risk = sum(1 for c in conjunctions if c['risk_level'] == 'HIGH')
    medium_risk = sum(1 for c in conjunctions if c['risk_level'] == 'MEDIUM')
    low_risk = sum(1 for c in conjunctions if c['risk_level'] == 'LOW')
    
    return {
        "conjunctions": conjunctions,
        "count": len(conjunctions),
        "summary": {
            "high_risk": high_risk,
            "medium_risk": medium_risk,
            "low_risk": low_risk
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/conjunctions/{conjunction_id}")
async def get_conjunction(conjunction_id: str):
    """Get specific conjunction details"""
    conjunction = get_conjunction_by_id(conjunction_id)
    if not conjunction:
        return {"error": "Conjunction not found"}, 404
    
    return {
        "conjunction": conjunction,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/stats")
async def get_statistics():
    """Get platform statistics"""
    satellites = get_all_satellites()
    conjunctions = get_all_conjunctions()
    
    active_sats = sum(1 for s in satellites if s['status'] == 'ACTIVE')
    high_risk = sum(1 for c in conjunctions if c['risk_level'] == 'HIGH')
    
    return {
        "total_satellites": len(satellites),
        "active_satellites": active_sats,
        "total_conjunctions": len(conjunctions),
        "high_risk_conjunctions": high_risk,
        "last_updated": datetime.utcnow().isoformat() + "Z"
    }

# ============================================================================
# WEBSOCKET ENDPOINT
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket for real-time updates
    Sends satellite positions every second
    """
    await manager.connect(websocket)
    
    try:
        # Keep connection alive and send updates
        start_time = datetime.utcnow()
        
        while True:
            # Calculate time offset for propagation
            current_time = datetime.utcnow()
            time_offset = (current_time - start_time).total_seconds()
            
            # Propagate all satellites
            updates = []
            for sat in SATELLITES:
                state = propagate_satellite(sat, time_offset)
                updates.append({
                    "id": sat['id'],
                    "name": sat['name'],
                    "position": state['position'],
                    "velocity": state['velocity'],
                    "altitude_km": state['altitude_km']
                })
            
            # Send updates to client
            await websocket.send_json({
                "type": "position_update",
                "timestamp": current_time.isoformat() + "Z",
                "satellites": updates
            })
            
            # Update every 1 second
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    print("  ARGUS API Starting...")
    print("  Backend: http://localhost:8000")
    print("  API Docs: http://localhost:8000/docs")
    print("  WebSocket: ws://localhost:8000/ws")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
