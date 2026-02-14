import React, { useState, useEffect } from 'react';
import './App.css';
import GlobeView from './components/GlobeView';
import SatelliteList from './components/SatelliteList';
import ConjunctionAlerts from './components/ConjunctionAlerts';
import SatelliteDetails from './components/SatelliteDetails';
import Dashboard from './components/Dashboard';
import { fetchSatellites, fetchConjunctions } from './services/api';

interface Satellite {
  id: string;
  name: string;
  norad_id: string;
  altitude_km: number;
  inclination_deg: number;
  status: string;
  operator: string;
}

interface Conjunction {
  id: string;
  primary_name: string;
  secondary_name: string;
  tca: string;
  miss_distance_m: number;
  probability_collision: number;
  risk_level: string;
}

function App() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [conjunctions, setConjunctions] = useState<Conjunction[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [satsData, conjsData] = await Promise.all([
        fetchSatellites(),
        fetchConjunctions()
      ]);
      setSatellites(satsData.satellites || []);
      setConjunctions(conjsData.conjunctions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0f1117' }}>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-1">ARGUS</p>
          <p className="text-xs text-gray-600">Connecting to tracking systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ background: '#0f1117', color: '#c8cdd5' }}>

      {/* Header */}
      <header style={{ background: '#161920', borderBottom: '1px solid #1e222c' }}>
        <div className="max-w-screen-2xl mx-auto px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-wider text-white">ARGUS</span>
            <span className="text-xs text-gray-600">Space Debris Tracking &amp; Collision Avoidance</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="status-dot status-dot--active" />
              System Operational
            </span>
            <span className="text-gray-700">|</span>
            <span className="mono">{satellites.length} objects tracked</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-4">

        {/* Globe — full width */}
        <div className="mb-3">
          <GlobeView satellites={satellites} onSelectSatellite={setSelectedSatellite} />
        </div>

        {/* Data panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

          {/* Col 1 — Stats + Alerts */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <Dashboard satellites={satellites} conjunctions={conjunctions} />
            <ConjunctionAlerts conjunctions={conjunctions} onSelectSatellite={setSelectedSatellite} />
          </div>

          {/* Col 2 — Satellite List */}
          <div className="lg:col-span-5">
            <SatelliteList
              satellites={satellites}
              selectedSatellite={selectedSatellite}
              onSelectSatellite={setSelectedSatellite}
            />
          </div>

          {/* Col 3 — Details */}
          <div className="lg:col-span-4">
            {selectedSatellite ? (
              <SatelliteDetails
                satelliteId={selectedSatellite}
                onClose={() => setSelectedSatellite(null)}
              />
            ) : (
              <div className="panel">
                <div className="panel-header">Satellite Details</div>
                <div className="panel-body py-16 text-center text-xs text-gray-600">
                  Select a satellite from the list to view its details.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e222c' }}>
        <div className="max-w-screen-2xl mx-auto px-4 h-9 flex items-center justify-between text-xs text-gray-700">
          <span>ARGUS v0.1.0</span>
          <span>Open Source Space Traffic Management</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
