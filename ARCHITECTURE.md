# ARGUS — Technical Architecture

This document covers the internal architecture, API surface, and technology choices behind ARGUS. For a high-level overview of the project, see [`README.md`](README.md).

---

## Project Structure

```
argus-mvp/
├── backend/                 # Python / FastAPI
│   ├── main.py              # API server (REST + WebSocket)
│   ├── mock_data.py         # Data loader and orbit propagation
│   ├── data/
│   │   ├── satellites.txt   # Satellite catalogue (JSON)
│   │   └── conjunctions.txt # Conjunction events (JSON)
│   └── requirements.txt
│
├── frontend/                # React 18 / TypeScript
│   ├── src/
│   │   ├── App.tsx          # Application shell and layout
│   │   ├── components/
│   │   │   ├── GlobeView.tsx        # 3D orbital visualisation (Three.js)
│   │   │   ├── Dashboard.tsx        # System overview statistics
│   │   │   ├── SatelliteList.tsx     # Tracked objects table
│   │   │   ├── ConjunctionAlerts.tsx # Conjunction event feed
│   │   │   └── SatelliteDetails.tsx  # Object detail panel
│   │   └── services/
│   │       └── api.ts       # API client and WebSocket helper
│   └── package.json
│
├── ARCHITECTURE.md          # ← You are here
└── README.md
```

---

## Backend

The backend is a **FastAPI** application that serves satellite and conjunction data over a REST API and pushes real-time position updates via WebSocket.

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/satellites` | GET | List all tracked satellites with current state vectors |
| `/api/satellites/{id}` | GET | Get a single satellite with its upcoming conjunctions |
| `/api/conjunctions` | GET | List all active conjunction events with risk summary |
| `/api/conjunctions/{id}` | GET | Get details on a specific conjunction |
| `/api/stats` | GET | Platform-wide statistics |
| `/ws` | WS | Real-time satellite position stream (1 Hz) |

Interactive API documentation is auto-generated at `http://localhost:8000/docs` when the server is running.

### Data Layer

Data is loaded from JSON-formatted text files in `backend/data/`. Timestamps for conjunction events are computed dynamically relative to the current time at server startup.

### Orbit Propagation

Orbit propagation currently uses a simplified circular-orbit model (sufficient for demonstration). Production would use SGP4 with real TLE data from sources like Space-Track.org.

---

## Frontend

The frontend is a **React 18** application built with **TypeScript** and **Tailwind CSS**. It connects to the backend API on startup and refreshes data every 5 seconds.

### Key Views

- **Orbital View** — Interactive 3D globe (Three.js / react-three-fiber) showing Earth, satellite orbits, and animated position markers. Supports mouse rotation and zoom.
- **System Overview** — Summary statistics: tracked objects, active conjunctions, and high-risk event count.
- **Satellite List** — Tabular list of all tracked objects with status, NORAD ID, altitude, and operator.
- **Conjunction Alerts** — Chronological feed of conjunction events sorted by risk, showing collision probability, miss distance, and time to closest approach.
- **Satellite Details** — Detailed view of a selected satellite including orbital parameters, operator information, propulsion capability, and associated conjunctions.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| API server | FastAPI | REST endpoints, WebSocket, automatic OpenAPI docs |
| ASGI server | Uvicorn | High-performance async server |
| Frontend framework | React 18 | Component-based UI |
| Language | TypeScript | Type safety across the frontend |
| 3D visualisation | Three.js / react-three-fiber | Orbital globe rendering |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| HTTP client | Axios | API communication |

---

## Demo Data

The MVP ships with a built-in scenario designed to demonstrate all risk levels:

| Object | NORAD ID | Altitude | Status | Notes |
|---|---|---|---|---|
| ISS (ZARYA) | 25544 | 420 km | Active | International Space Station |
| DEMO-SAT-1 | 99001 | 418 km | Active | Close approach to ISS (HIGH risk) |
| STARLINK-1234 | 48274 | 550 km | Active | Starlink constellation member |
| DEBRIS-9876 | 87654 | 415 km | Inactive | Uncontrolled debris fragment |
| CUBESAT-XYZ | 99002 | 600 km | Active | University research satellite |

### Conjunction Scenario

- **DEMO-SAT-1 / ISS** — HIGH risk (Pc = 2.3 × 10⁻⁴, miss distance 847 m, TCA in 8 days)
- **DEMO-SAT-1 / DEBRIS-9876** — MEDIUM risk (Pc = 1.2 × 10⁻⁵, miss distance 2,340 m, TCA in 3 days)
- **CUBESAT-XYZ / STARLINK-1234** — LOW risk (Pc = 3.4 × 10⁻⁶, miss distance 5,230 m, TCA in 12 days)
