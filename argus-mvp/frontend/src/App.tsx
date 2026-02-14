import React, { useState, useEffect } from 'react';
import './App.css';
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
    // Refresh data every 5 seconds
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
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-4">ARGUS</div>
          <h2 className="text-2xl font-bold mb-2">ARGUS Loading...</h2>
          <p className="text-gray-400">Fetching satellite data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-blue-500">[A]</span>
            <div>
              <h1 className="text-2xl font-bold text-blue-400">ARGUS</h1>
              <p className="text-sm text-gray-400">Space Debris Tracking</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Tracking {satellites.length} satellites • {conjunctions.length} conjunctions
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column - Statistics & Alerts */}
          <div className="lg:col-span-1 space-y-4">
            <Dashboard 
              satellites={satellites}
              conjunctions={conjunctions}
            />
            <ConjunctionAlerts 
              conjunctions={conjunctions}
              onSelectSatellite={setSelectedSatellite}
            />
          </div>

          {/* Middle Column - Satellite List */}
          <div className="lg:col-span-1">
            <SatelliteList
              satellites={satellites}
              selectedSatellite={selectedSatellite}
              onSelectSatellite={setSelectedSatellite}
            />
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-1">
            {selectedSatellite && (
              <SatelliteDetails
                satelliteId={selectedSatellite}
                onClose={() => setSelectedSatellite(null)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          <p>ARGUS MVP • Open Source Space Traffic Management</p>
          <p className="text-xs mt-1">Always Watching, Always Protecting</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
