# ARGUS MVP - Space Debris Tracking & Collision Avoidance

**Hackathon Demo Version**

ARGUS is an open-source platform for satellite operators to track space debris and avoid collisions.

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

## Project Structure

```
argus-mvp/
├── backend/              # FastAPI backend
│   ├── main.py          # Main API server
│   ├── data/            # External data files
│   │   ├── satellites.txt
│   │   └── conjunctions.txt
│   ├── mock_data.py     # Data loader & orbit propagation
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   └── App.tsx
│   └── package.json
├── scripts/             # Utility scripts
└── README.md
```

## MVP Features

### Implemented
- 3D Earth visualization with satellite orbits (Cesium.js)
- Real-time satellite tracking (5 demo satellites)
- Conjunction detection and alerts
- Risk assessment (HIGH / MEDIUM / LOW)
- Interactive satellite details
- Live orbit propagation

### Planned (Post-MVP)
- Real TLE data from Space-Track.org
- User authentication
- Database persistence
- Email / SMS notifications
- Production deployment
- Advanced Pc calculations

## Demo Scenario

The MVP demonstrates:
1. **ISS** at 420 km altitude
2. **DEMO-SAT-1** (your satellite) at 418 km - close approach to ISS
3. **STARLINK-1234** at 550 km
4. **DEBRIS-9876** at 415 km - collision risk
5. **CUBESAT-XYZ** at 600 km

**High-Risk Event:** DEMO-SAT-1 vs ISS conjunction in 8 days (Pc = 2.3E-4)

## Technology Stack

**Backend:**
- FastAPI (Python web framework)
- Uvicorn (ASGI server)
- Mock data loaded from external files (no database for MVP)

**Frontend:**
- React 18 + TypeScript
- Cesium.js (3D globe visualization)
- Tailwind CSS (styling)
- Axios (API calls)

## API Endpoints

```
GET  /api/satellites          # List all satellites
GET  /api/satellites/{id}     # Get satellite details
GET  /api/conjunctions        # List all conjunctions
GET  /api/conjunctions/{id}   # Get conjunction details
WS   /ws                      # WebSocket for live updates
```

## Demo Tips

1. **Start with the 3D view** - Shows Earth with satellite orbits
2. **Click on satellites** - View details and upcoming conjunctions
3. **Alerts panel** - Shows high-risk conjunctions
4. **Watch live propagation** - Orbits update every second

## Notes

- This is a **hackathon MVP** with mock data
- Orbital mechanics are **simplified** for demo purposes
- Real implementation would use SGP4 and actual TLE data
- Collision probability uses a simplified formula (suitable for demonstration)

## Roadmap (Post-Hackathon)

1. Integrate real TLE data from Space-Track.org
2. Implement proper SGP4 propagation
3. Add PostgreSQL database
4. Build user authentication
5. Deploy to cloud (AWS / GCP)
6. Add email / SMS alerting

## License

Apache 2.0 - Open Source

## Team

Your Name / Your Team Name

Built for [Hackathon Name] 2025

---

**ARGUS: Always Watching, Always Protecting**
