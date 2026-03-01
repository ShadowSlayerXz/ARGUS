"""
ARGUS MVP Backend
FastAPI server with WebSocket support for live updates
Now with real N2YO + SGP4 orbital propagation
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import asyncio
import json
from typing import List
from contextlib import asynccontextmanager
from services.n2yo_client import n2yo_client
from services.satellite_tracker import satellite_tracker
from config import config

from mock_data import get_all_conjunctions, get_conjunction_by_id


# ============================================================================
# LIFESPAN EVENT HANDLER
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize satellite tracking on startup"""
    if config.validate():
        print("\n[*] Initializing satellite tracking system...")
        await satellite_tracker.initialize_default_satellites()
        print("[OK] Satellite tracking ready!\n")
    else:
        print("\n[!] N2YO API key not configured - Real tracking disabled\n")
    
    yield  # Application runs
    
    # Cleanup on shutdown (if needed)
    print("\n[*] Shutting down ARGUS...")


app = FastAPI(
    title="ARGUS API",
    description="Space Debris Tracking & Collision Avoidance Platform",
    version="0.1.0 (MVP)",
    lifespan=lifespan
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
    """Get all tracked satellites with real SGP4 positions"""
    positions = await satellite_tracker.get_all_positions()
    
    # Transform to frontend format
    satellites = []
    for pos in positions:
        satellites.append({
            "id": f"sat_{pos['norad_id']}",
            "name": pos['name'],
            "norad_id": str(pos['norad_id']),
            "altitude_km": round(pos['altitude_km'], 2),
            "latitude": round(pos['latitude'], 4),
            "longitude": round(pos['longitude'], 4),
            "inclination_deg": 51.6,  # TODO: Extract from TLE
            "status": "ACTIVE",
            "operator": "Various",
            "has_propulsion": True,
            "current_state": {
                "position": pos['position'],
                "velocity": pos['velocity'],
                "altitude_km": pos['altitude_km']
            }
        })
    
    return {
        "satellites": satellites,
        "count": len(satellites),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/satellites/{satellite_id}")
async def get_satellite(satellite_id: str):
    """Get specific satellite details with real SGP4 position"""
    # Extract NORAD ID from satellite_id (format: sat_25544)
    try:
        norad_id = int(satellite_id.replace("sat_", ""))
    except:
        return {"error": "Invalid satellite ID format"}, 400
    
    # Get current position
    pos = await satellite_tracker.get_current_position(norad_id)
    
    if not pos:
        return {"error": "Satellite not found or propagation failed"}, 404
    
    satellite = {
        "id": satellite_id,
        "name": pos['name'],
        "norad_id": str(norad_id),
        "altitude_km": round(pos['altitude_km'], 2),
        "latitude": round(pos['latitude'], 4),
        "longitude": round(pos['longitude'], 4),
        "inclination_deg": 51.6,  # TODO: Extract from TLE
        "status": "ACTIVE",
        "operator": "Various",
        "has_propulsion": True,
        "mass_kg": 1000,
        "size_m": 5,
        "launch_date": "2020-01-01",
        "country": "International",
        "current_state": {
            "position": pos['position'],
            "velocity": pos['velocity'],
            "altitude_km": pos['altitude_km']
        }
    }
    
    return {
        "satellite": satellite,
        "conjunctions": [],  # TODO: Implement real conjunction detection
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
    positions = await satellite_tracker.get_all_positions()
    conjunctions = get_all_conjunctions()
    
    active_sats = len(positions)
    high_risk = sum(1 for c in conjunctions if c['risk_level'] == 'HIGH')
    
    return {
        "total_satellites": len(positions),
        "active_satellites": active_sats,
        "total_conjunctions": len(conjunctions),
        "high_risk_conjunctions": high_risk,
        "last_updated": datetime.utcnow().isoformat() + "Z"
    }

# ============================================================================
# N2YO LIVE DATA ENDPOINTS
# ============================================================================

@app.get("/api/n2yo/tle/{norad_id}")
async def get_tle_data(norad_id: int):
    """Get TLE data for a satellite from N2YO API"""
    data = await n2yo_client.get_tle(norad_id)
    if not data:
        return {"error": "Failed to fetch TLE data or API key not configured"}, 404
    return data

@app.get("/api/n2yo/positions/{norad_id}")
async def get_live_positions(norad_id: int, seconds: int = 300):
    """Get live satellite positions from N2YO API"""
    data = await n2yo_client.get_positions(
        norad_id,
        config.DEFAULT_OBSERVER_LAT,
        config.DEFAULT_OBSERVER_LNG,
        config.DEFAULT_OBSERVER_ALT,
        seconds
    )
    if not data:
        return {"error": "Failed to fetch position data or API key not configured"}, 404
    return data

@app.get("/api/n2yo/visual-passes/{norad_id}")
async def get_visual_passes_data(norad_id: int, days: int = 10):
    """Get visual passes for a satellite from your location"""
    data = await n2yo_client.get_visual_passes(
        norad_id,
        config.DEFAULT_OBSERVER_LAT,
        config.DEFAULT_OBSERVER_LNG,
        config.DEFAULT_OBSERVER_ALT,
        days,
        300  # min 300 seconds visibility
    )
    if not data:
        return {"error": "Failed to fetch visual passes or API key not configured"}, 404
    return data

@app.get("/api/n2yo/radio-passes/{norad_id}")
async def get_radio_passes_data(norad_id: int, days: int = 10):
    """Get radio communication passes for a satellite"""
    data = await n2yo_client.get_radio_passes(
        norad_id,
        config.DEFAULT_OBSERVER_LAT,
        config.DEFAULT_OBSERVER_LNG,
        config.DEFAULT_OBSERVER_ALT,
        days,
        40  # min 40 degrees elevation
    )
    if not data:
        return {"error": "Failed to fetch radio passes or API key not configured"}, 404
    return data

@app.get("/api/n2yo/above")
async def get_satellites_above():
    """Get satellites currently above your location (Hyderabad)"""
    data = await n2yo_client.get_above(
        config.DEFAULT_OBSERVER_LAT,
        config.DEFAULT_OBSERVER_LNG,
        config.DEFAULT_OBSERVER_ALT,
        70,  # 70 degree search radius
        0    # 0 = all categories
    )
    if not data:
        return {"error": "Failed to fetch satellites above or API key not configured"}, 404
    return data

# ============================================================================
# WEBSOCKET ENDPOINT
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket for real-time updates with SGP4 propagation
    Sends satellite positions every 5 seconds
    """
    await manager.connect(websocket)
    
    try:
        while True:
            current_time = datetime.utcnow()
            
            # Get real positions for all tracked satellites
            positions = await satellite_tracker.get_all_positions()
            
            updates = []
            for pos in positions:
                updates.append({
                    "id": f"sat_{pos['norad_id']}",
                    "name": pos['name'],
                    "position": pos['position'],
                    "velocity": pos['velocity'],
                    "altitude_km": pos['altitude_km']
                })
            
            # Send updates to client
            await websocket.send_json({
                "type": "position_update",
                "timestamp": current_time.isoformat() + "Z",
                "satellites": updates
            })
            
            # Update every 5 seconds (SGP4 is CPU intensive)
            await asyncio.sleep(5)
            
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
    
    # Display configuration
    config.display()
    
    # Validate API key
    if config.validate():
        print("[OK] N2YO API key configured - Real satellite tracking enabled")
        print("   ISS tracking: http://localhost:8000/api/satellites/sat_25544")
        print("   All satellites: http://localhost:8000/api/satellites")
    else:
        print("[!] N2YO API key not set - Add to backend/.env file")
        print("   Get key from: https://www.n2yo.com/api/")
    
    print("\n[*] ARGUS API Starting...")
    print("  Backend: http://localhost:8000")
    print("  API Docs: http://localhost:8000/docs")
    print("  WebSocket: ws://localhost:8000/ws")
    print("\n" + "="*50 + "\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
