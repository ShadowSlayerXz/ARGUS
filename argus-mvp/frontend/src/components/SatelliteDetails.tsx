import React, { useState, useEffect } from 'react';
import { fetchSatellite } from '../services/api';

interface SatelliteDetailsProps {
  satelliteId: string;
  onClose: () => void;
}

const SatelliteDetails: React.FC<SatelliteDetailsProps> = ({ satelliteId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSatelliteData();
  }, [satelliteId]);

  const loadSatelliteData = async () => {
    try {
      const result = await fetchSatellite(satelliteId);
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error loading satellite:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-center text-gray-400 py-8">
          Loading...
        </div>
      </div>
    );
  }

  if (!data || !data.satellite) {
    return null;
  }

  const sat = data.satellite;
  const conjunctions = data.conjunctions || [];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2 text-blue-400 font-bold">[DTL]</span>
          Satellite Details
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Satellite Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-2">{sat.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">NORAD ID:</span>
              <p className="text-white">{sat.norad_id}</p>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <p className={`${sat.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'}`}>
                {sat.status}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Altitude:</span>
              <p className="text-white">{sat.altitude_km} km</p>
            </div>
            <div>
              <span className="text-gray-400">Inclination:</span>
              <p className="text-white">{sat.inclination_deg}°</p>
            </div>
            <div>
              <span className="text-gray-400">Mass:</span>
              <p className="text-white">{sat.mass_kg} kg</p>
            </div>
            <div>
              <span className="text-gray-400">Size:</span>
              <p className="text-white">{sat.size_m} m</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-3">
          <div className="text-sm">
            <div className="mb-2">
              <span className="text-gray-400">Operator:</span>
              <p className="text-white">{sat.operator}</p>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Country:</span>
              <p className="text-white">{sat.country}</p>
            </div>
            <div>
              <span className="text-gray-400">Launch Date:</span>
              <p className="text-white">{sat.launch_date}</p>
            </div>
          </div>
        </div>

        {sat.has_propulsion && (
          <div className="bg-green-900 bg-opacity-30 rounded p-3 border border-green-700">
            <div className="flex items-center space-x-2 text-green-300">
              <span className="font-semibold">[M]</span>
              <span className="font-semibold">Maneuverable</span>
            </div>
            <p className="text-xs text-green-400 mt-1">
              This satellite can perform collision avoidance maneuvers
            </p>
          </div>
        )}

        {/* Conjunctions */}
        <div className="border-t border-gray-700 pt-3">
          <h4 className="font-semibold mb-2 flex items-center justify-between">
            <span>Upcoming Conjunctions</span>
            <span className="text-sm font-normal text-gray-400">
              {conjunctions.length} events
            </span>
          </h4>

          {conjunctions.length === 0 ? (
            <div className="text-center text-gray-400 py-4 text-sm">
              <p>No active conjunctions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conjunctions.map((conj: any) => (
                <div
                  key={conj.id}
                  className="bg-gray-700 rounded p-2 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{conj.secondary_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${conj.risk_level === 'HIGH' ? 'bg-red-900 text-red-300' :
                        conj.risk_level === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-green-900 text-green-300'
                      }`}>
                      {conj.risk_level}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <div>Pc: {conj.probability_collision.toExponential(2)}</div>
                    <div>Miss: {conj.miss_distance_m} m</div>
                    <div>TCA: {conj.time_to_tca_hours}h</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SatelliteDetails;
