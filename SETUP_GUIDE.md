# ARGUS MVP - Complete Setup Guide

This guide will walk you through setting up the ARGUS MVP from scratch.

## Prerequisites

Before you begin, ensure you have:
- **Python 3.10+** installed (`python --version`)
- **Node.js 18+** installed (`node --version`)
- **npm** or **yarn** installed
- A code editor (VS Code recommended)
- Terminal/Command Prompt

---

## Part 1: Backend Setup (FastAPI)

### Step 1: Navigate to Backend Directory

```bash
cd argus-mvp/backend
```

### Step 2: Create Python Virtual Environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- WebSockets support

### Step 4: Test Backend

```bash
python main.py
```

You should see:
```
🛰️  ARGUS API Starting...
📍 Backend: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
🔴 WebSocket: ws://localhost:8000/ws
```

### Step 5: Test API in Browser

Open your browser and visit:
- `http://localhost:8000` - Should show API status
- `http://localhost:8000/docs` - Interactive API documentation
- `http://localhost:8000/api/satellites` - Should show 5 mock satellites

**Keep this terminal running!**

---

## Part 2: Frontend Setup (React)

### Step 1: Open New Terminal

Keep the backend running, and open a **new terminal window**.

### Step 2: Navigate to Frontend Directory

```bash
cd argus-mvp/frontend
```

### Step 3: Install Node Dependencies

```bash
npm install
```

This will take 2-3 minutes to download all packages.

If you see warnings, that's okay. Errors would prevent installation.

### Step 4: Start React Development Server

```bash
npm start
```

The app should automatically open in your browser at `http://localhost:3000`.

If it doesn't open automatically, manually navigate to `http://localhost:3000`.

---

## Part 3: Verify Everything Works

### You Should See:

**Backend Terminal:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Frontend Terminal:**
```
Compiled successfully!

You can now view argus-frontend in the browser.

  Local:            http://localhost:3000
```

**Browser (http://localhost:3000):**
- ARGUS header with logo
- Dashboard showing statistics
- List of 5 satellites
- Active conjunctions panel
- Dark theme UI

### Test Interactivity:

1. **Click on a satellite** in the satellite list
2. **Details panel** should appear on the right
3. **Conjunction alerts** should show HIGH/MEDIUM/LOW risk events
4. **Statistics** should show:
   - 5 Tracked Satellites
   - 3 Active Conjunctions
   - 1 High Risk Event

---

## Part 4: Understanding the Demo Data

### Mock Satellites:

1. **ISS (ZARYA)** - 420 km altitude
2. **DEMO-SAT-1** - 418 km (YOUR satellite - has high-risk conjunction with ISS)
3. **STARLINK-1234** - 550 km
4. **DEBRIS-9876** - 415 km (inactive debris)
5. **CUBESAT-XYZ** - 600 km

### Mock Conjunctions:

1. **HIGH RISK:** DEMO-SAT-1 vs ISS
   - Miss distance: 847 meters
   - Pc: 2.3E-4
   - TCA: 8 days from now

2. **MEDIUM RISK:** DEMO-SAT-1 vs DEBRIS-9876
   - Miss distance: 2,340 meters
   - Pc: 1.2E-5
   - TCA: 3 days from now

3. **LOW RISK:** CUBESAT-XYZ vs STARLINK-1234
   - Miss distance: 5,230 meters
   - Pc: 3.4E-6
   - TCA: 12 days from now

---

## Part 5: Demo Walkthrough for Hackathon

### Suggested Presentation Flow:

1. **Show the Problem**
   - "There are 30,000 tracked objects in space"
   - "Small satellite operators can't afford $200K/year tracking services"
   - "Collisions create dangerous debris cascades"

2. **Show the Dashboard**
   - "ARGUS tracks all your satellites in real-time"
   - Point to statistics panel
   - Show active conjunction alerts

3. **Show High-Risk Event**
   - Click on DEMO-SAT-1
   - "This is YOUR satellite at 418 km"
   - "In 8 days, it will pass within 847 meters of the ISS"
   - "Collision probability: 2.3E-4 (HIGH RISK)"
   - "System recommends a 1.2 m/s maneuver"

4. **Show Features**
   - Real-time position updates (WebSocket)
   - Multiple risk levels (color-coded)
   - Satellite details (maneuverable status)
   - Maneuver recommendations

5. **Show Technology**
   - "Built with Python FastAPI backend"
   - "React + TypeScript frontend"
   - "Orbital mechanics calculations"
   - "Open-source and free"

---

## Part 6: Troubleshooting

### Backend Not Starting?

**Error: "Port 8000 already in use"**
```bash
# Kill existing process
# On macOS/Linux:
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Error: "Module not found"**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Not Starting?

**Error: "Port 3000 already in use"**
- The frontend will automatically try port 3001
- Or kill the existing process

**Error: "Cannot find module"**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "API connection failed"**
- Make sure backend is running on port 8000
- Check `http://localhost:8000` in browser
- Check browser console for CORS errors

### WebSocket Not Connecting?

- Check browser console (F12 → Console tab)
- Should see "WebSocket connected"
- Backend terminal should show WebSocket connection logs

---

## Part 7: Making Changes

### Modifying Mock Data:

Edit `backend/mock_data.py`:
- Change satellite names
- Adjust altitudes
- Modify conjunction risk levels
- Add more satellites

**Restart backend** after changes:
```bash
# Ctrl+C to stop
python main.py
```

### Modifying UI:

Edit files in `frontend/src/components/`:
- `Dashboard.tsx` - Statistics panel
- `ConjunctionAlerts.tsx` - Alert list
- `SatelliteList.tsx` - Satellite list
- `SatelliteDetails.tsx` - Detail view

**Frontend auto-reloads** on file save (no restart needed).

### Changing Colors/Styles:

Edit `frontend/src/App.css` for custom styles.

---

## Part 8: Deployment (Optional)

### Deploy Backend (Heroku):

```bash
# In backend/ directory
heroku create argus-api
git push heroku main
```

### Deploy Frontend (Vercel):

```bash
# In frontend/ directory
vercel deploy
```

Or use Netlify, AWS, etc.

---

## Part 9: Next Steps (Post-Hackathon)

After the hackathon, you can:

1. **Integrate Real TLE Data**
   - Space-Track.org API
   - Implement SGP4 propagation
   - Use `sgp4` Python library

2. **Add 3D Visualization**
   - Integrate Cesium.js
   - Show Earth globe with orbits
   - Animate satellite positions

3. **Add Authentication**
   - User registration/login
   - API key management
   - Multi-tenant support

4. **Add Notifications**
   - Email alerts (SendGrid)
   - SMS alerts (Twilio)
   - Webhooks

5. **Database**
   - Replace in-memory data with PostgreSQL
   - Add TimescaleDB for time-series
   - Implement data persistence

---

## Part 10: Getting Help

### Resources:

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Docs:** https://react.dev/
- **Orbital Mechanics:** "Fundamentals of Astrodynamics" book
- **Space-Track API:** https://www.space-track.org/documentation

### Common Issues:

**Q: How do I add more satellites?**
A: Edit `backend/mock_data.py`, add to `SATELLITES` list, restart backend

**Q: Can I change the orbital mechanics?**
A: Yes! Modify `propagate_satellite()` function in `mock_data.py`

**Q: How do I deploy this?**
A: Backend → Heroku/Railway, Frontend → Vercel/Netlify

**Q: Is this production-ready?**
A: No, it's an MVP. Needs real TLE data, authentication, database, etc.

---

## Success Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can see 5 satellites in the dashboard
- [ ] Can see 3 conjunctions
- [ ] Can click on satellites to see details
- [ ] High-risk conjunction shows in red
- [ ] WebSocket connected (check browser console)

If all items are checked, you're ready to demo! 🚀

---

**ARGUS: Always Watching, Always Protecting**

Good luck with your hackathon! 🛰️
