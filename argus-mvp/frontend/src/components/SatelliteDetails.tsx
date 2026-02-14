import React, { useState, useEffect, useCallback } from 'react';
import { fetchSatellite } from '../services/api';

interface SatelliteDetailsProps {
  satelliteId: string;
  onClose: () => void;
}

const SatelliteDetails: React.FC<SatelliteDetailsProps> = ({ satelliteId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchSatellite(satelliteId);
      setData(result);
    } catch (error) {
      console.error('Error loading satellite:', error);
    } finally {
      setLoading(false);
    }
  }, [satelliteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">Satellite Details</div>
        <div className="panel-body py-12 text-center text-xs text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!data || !data.satellite) return null;

  const sat = data.satellite;
  const conjunctions = data.conjunctions || [];

  return (
    <div className="panel">
      {/* Header */}
      <div className="panel-header">
        <span>Satellite Details</span>
        <button className="btn-close" onClick={onClose} aria-label="Close">&times;</button>
      </div>

      <div className="panel-body">
        {/* Name & status */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`status-dot ${sat.status === 'ACTIVE' ? 'status-dot--active' : 'status-dot--inactive'}`} />
          <h3 className="text-sm font-bold text-white">{sat.name}</h3>
          <span className="tag ml-auto">{sat.status}</span>
        </div>

        {/* Orbital parameters */}
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{ fontSize: 10 }}>
          Orbital Parameters
        </div>
        <div className="mb-4" style={{ background: '#12151c', borderRadius: 4, padding: '8px 12px' }}>
          <div className="data-row">
            <span className="label">NORAD ID</span>
            <span className="value">{sat.norad_id}</span>
          </div>
          <div className="data-row">
            <span className="label">Altitude</span>
            <span className="value">{sat.altitude_km} km</span>
          </div>
          <div className="data-row">
            <span className="label">Inclination</span>
            <span className="value">{sat.inclination_deg}&deg;</span>
          </div>
          <div className="data-row">
            <span className="label">Mass</span>
            <span className="value">{sat.mass_kg.toLocaleString()} kg</span>
          </div>
          <div className="data-row">
            <span className="label">Size</span>
            <span className="value">{sat.size_m} m</span>
          </div>
        </div>

        {/* Operator info */}
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{ fontSize: 10 }}>
          Operator Information
        </div>
        <div className="mb-4" style={{ background: '#12151c', borderRadius: 4, padding: '8px 12px' }}>
          <div className="data-row">
            <span className="label">Operator</span>
            <span className="value">{sat.operator}</span>
          </div>
          <div className="data-row">
            <span className="label">Country</span>
            <span className="value">{sat.country}</span>
          </div>
          <div className="data-row">
            <span className="label">Launch Date</span>
            <span className="value">{sat.launch_date}</span>
          </div>
          <div className="data-row">
            <span className="label">Propulsion</span>
            <span className="value" style={{ color: sat.has_propulsion ? '#4ade80' : '#6b7280' }}>
              {sat.has_propulsion ? 'Available' : 'None'}
            </span>
          </div>
        </div>

        {/* Conjunctions */}
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{ fontSize: 10 }}>
          Upcoming Conjunctions ({conjunctions.length})
        </div>

        {conjunctions.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-600">
            No active conjunctions for this object.
          </div>
        ) : (
          <div>
            {conjunctions.map((conj: any) => (
              <div key={conj.id} style={{ background: '#12151c', borderRadius: 4, padding: '8px 12px', marginBottom: 6 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-300">{conj.secondary_name}</span>
                  <span className={`risk-label risk-label--${conj.risk_level.toLowerCase()}`}>
                    {conj.risk_level}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>Pc <span className="mono text-gray-400">{conj.probability_collision.toExponential(2)}</span></span>
                  <span>Miss <span className="mono text-gray-400">{conj.miss_distance_m} m</span></span>
                  <span>TCA <span className="mono text-gray-400">{conj.time_to_tca_hours}h</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteDetails;
