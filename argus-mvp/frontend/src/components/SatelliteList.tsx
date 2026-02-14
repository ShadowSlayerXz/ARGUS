import React from 'react';

interface SatelliteListProps {
  satellites: any[];
  selectedSatellite: string | null;
  onSelectSatellite: (id: string) => void;
}

const SatelliteList: React.FC<SatelliteListProps> = ({
  satellites,
  selectedSatellite,
  onSelectSatellite,
}) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <span>Tracked Satellites</span>
        <span className="badge">{satellites.length} objects</span>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 600 }}>
        {/* Table header */}
        <div className="flex items-center px-3.5 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ borderBottom: '1px solid #1e222c', fontSize: 10 }}>
          <span className="w-5" />
          <span className="flex-1">Name</span>
          <span className="w-24 text-right">Altitude</span>
          <span className="w-28 text-right">Operator</span>
        </div>

        {satellites.map((sat) => {
          const isSelected = selectedSatellite === sat.id;
          return (
            <div
              key={sat.id}
              className={`list-item ${isSelected ? 'list-item--selected' : ''}`}
              onClick={() => onSelectSatellite(sat.id)}
            >
              <div className="flex items-center">
                <span className={`status-dot mr-3 ${sat.status === 'ACTIVE' ? 'status-dot--active' : 'status-dot--inactive'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-200">{sat.name}</span>
                    <span className="tag">{sat.norad_id}</span>
                  </div>
                </div>
                <span className="w-24 text-right text-xs mono text-gray-400">{sat.altitude_km} km</span>
                <span className="w-28 text-right text-xs text-gray-500 truncate">{sat.operator}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SatelliteList;
