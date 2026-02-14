# ARGUS

**Open-source space debris tracking and collision avoidance platform.**

ARGUS provides satellite operators with real-time situational awareness of the orbital environment. It detects potential conjunctions (close approaches between objects), assesses collision risk, and recommends avoidance manoeuvres — giving operators the information they need to protect their assets in orbit.

---

## The Problem

There are over 30,000 tracked objects in Earth orbit and millions of pieces of untracked debris. A collision at orbital speeds (7–8 km/s) can destroy an operational satellite and generate thousands of new debris fragments, worsening the problem in a chain reaction known as the Kessler Syndrome.

Most satellite operators today rely on periodic Conjunction Data Messages (CDMs) from government agencies, then manually evaluate threats and plan responses. This process is slow, fragmented, and doesn't scale.

## What ARGUS Does

ARGUS aims to consolidate the conjunction assessment workflow into a single platform:

1. **Track** — Ingest orbital data (TLE/ephemeris) and maintain a catalogue of tracked objects.
2. **Detect** — Identify upcoming close approaches between objects and compute miss distance, relative velocity, and collision probability.
3. **Assess** — Classify events by risk level (HIGH / MEDIUM / LOW) so operators can prioritise their attention.
4. **Visualise** — Render the orbital environment in an interactive 3D view, making it easy to understand the geometry of a conjunction at a glance.
5. **Recommend** — For maneuverable satellites, suggest avoidance manoeuvres (delta-v, direction, timing, fuel cost).

> **Current status:** This is an early MVP using simulated data. It demonstrates the core user experience and interface design. Integration with live orbital data sources (e.g. Space-Track.org) is planned.

---

## Architecture

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
└── README.md
```

### Backend

The backend is a FastAPI application that serves satellite and conjunction data over a REST API and pushes real-time position updates via WebSocket.

| Endpoint | Method | Description |
|---|---|---|
| `/api/satellites` | GET | List all tracked satellites with current state vectors |
| `/api/satellites/{id}` | GET | Get a single satellite with its upcoming conjunctions |
| `/api/conjunctions` | GET | List all active conjunction events with risk summary |
| `/api/conjunctions/{id}` | GET | Get details on a specific conjunction |
| `/api/stats` | GET | Platform-wide statistics |
| `/ws` | WS | Real-time satellite position stream (1 Hz) |

Data is loaded from JSON-formatted text files in `backend/data/`. Timestamps for conjunction events are computed dynamically relative to the current time at server startup.

Orbit propagation uses a simplified circular-orbit model (sufficient for demonstration; production would use SGP4 with real TLE data).

### Frontend

The frontend is a React 18 application built with TypeScript and Tailwind CSS. It connects to the backend API on startup and refreshes data every 5 seconds.

Key views:

- **Orbital View** — Interactive 3D globe (Three.js / react-three-fiber) showing Earth, satellite orbits, and animated position markers. Supports mouse rotation and zoom.
- **System Overview** — Summary statistics: tracked objects, active conjunctions, and high-risk event count.
- **Satellite List** — Tabular list of all tracked objects with status, NORAD ID, altitude, and operator.
- **Conjunction Alerts** — Chronological feed of conjunction events sorted by risk, showing collision probability, miss distance, and time to closest approach.
- **Satellite Details** — Detailed view of a selected satellite including orbital parameters, operator information, propulsion capability, and associated conjunctions.

---

## Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later
- npm

### 1. Clone the repository

```bash
git clone https://github.com/ShadowSlayerXz/ARGUS.git
cd ARGUS/argus-mvp
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The API server starts at **http://localhost:8000**. Interactive API documentation is available at http://localhost:8000/docs.

### 3. Start the frontend

```bash
cd frontend
npm install
npm start
```

The application opens at **http://localhost:3000**.

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

The scenario includes three conjunction events:

- **DEMO-SAT-1 / ISS** — HIGH risk (Pc = 2.3 × 10⁻⁴, miss distance 847 m, TCA in 8 days)
- **DEMO-SAT-1 / DEBRIS-9876** — MEDIUM risk (Pc = 1.2 × 10⁻⁵, miss distance 2,340 m, TCA in 3 days)
- **CUBESAT-XYZ / STARLINK-1234** — LOW risk (Pc = 3.4 × 10⁻⁶, miss distance 5,230 m, TCA in 12 days)

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

## Roadmap

The following items are planned for future development:

- [ ] Integrate live TLE data from Space-Track.org
- [ ] Implement SGP4 orbit propagation for accurate positioning
- [ ] Add PostgreSQL database for persistent storage
- [ ] User authentication and role-based access
- [ ] Email and SMS alerting for high-risk conjunctions
- [ ] Cloud deployment (AWS / GCP)
- [ ] Historical conjunction analysis and trending

---

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.

## License

Apache 2.0
