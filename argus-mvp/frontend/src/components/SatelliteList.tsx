import React from 'react';

interface SatelliteListProps {
  satellites: any[];
  selectedSatellite: string | null;
  onSelectSatellite: (id: string) => void;
}

const SatelliteList: React.FC<SatelliteListProps> = ({
  satellites,
  selectedSatellite,
  onSelectSatellite
}) => {
  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'green' : 'gray';
  };

  const getStatusIcon = (status: string) => {
    return status === 'ACTIVE' ? '[ON]' : '[OFF]';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <span className="mr-2 text-blue-400 font-bold">[SAT]</span>
          Tracked Satellites
        </span>
        <span className="text-sm font-normal text-gray-400">
          {satellites.length} objects
        </span>
      </h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {satellites.map((sat) => (
          <div
            key={sat.id}
            className={`bg-gray-700 rounded p-3 cursor-pointer transition-all ${selectedSatellite === sat.id
                ? 'ring-2 ring-blue-500 bg-gray-600'
                : 'hover:bg-gray-600'
              }`}
            onClick={() => onSelectSatellite(sat.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(sat.status)}</span>
                <div>
                  <div className="font-semibold text-white">{sat.name}</div>
                  <div className="text-xs text-gray-400">NORAD {sat.norad_id}</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-blue-900 text-blue-300">
                {sat.altitude_km} km
              </span>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Operator:</span>
                <span className="text-gray-300">{sat.operator}</span>
              </div>
              {sat.has_propulsion && (
                <div className="flex items-center space-x-1 text-green-400">
                  <span className="font-semibold">[M]</span>
                  <span>Maneuverable</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SatelliteList;
