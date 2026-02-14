import React from 'react';

interface ConjunctionAlertsProps {
  conjunctions: any[];
  onSelectSatellite: (id: string) => void;
}

const ConjunctionAlerts: React.FC<ConjunctionAlertsProps> = ({
  conjunctions,
  onSelectSatellite
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'HIGH': return '[!]';
      case 'MEDIUM': return '[~]';
      case 'LOW': return '[-]';
      default: return '[ ]';
    }
  };

  const formatProbability = (pc: number) => {
    return pc.toExponential(2);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const sortedConjunctions = [...conjunctions].sort((a, b) => {
    const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return riskOrder[a.risk_level as keyof typeof riskOrder] -
      riskOrder[b.risk_level as keyof typeof riskOrder];
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <span className="mr-2"></span>
          Active Conjunctions
        </span>
        <span className="text-sm font-normal text-gray-400">
          {conjunctions.length} events
        </span>
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedConjunctions.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-3xl mb-2"></p>
            <p>No active conjunctions</p>
          </div>
        ) : (
          sortedConjunctions.map((conj) => (
            <div
              key={conj.id}
              className={`bg-gray-700 rounded p-3 border-l-4 border-${getRiskColor(conj.risk_level)}-500 hover:bg-gray-600 transition-colors cursor-pointer`}
              onClick={() => onSelectSatellite(conj.primary_satellite_id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getRiskIcon(conj.risk_level)}</span>
                  <span className="font-semibold text-sm">{conj.risk_level}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded bg-${getRiskColor(conj.risk_level)}-900 text-${getRiskColor(conj.risk_level)}-300`}>
                  Pc: {formatProbability(conj.probability_collision)}
                </span>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Primary:</span>
                  <span className="text-white font-medium">{conj.primary_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Secondary:</span>
                  <span className="text-white">{conj.secondary_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Miss Distance:</span>
                  <span className="text-blue-300">{formatDistance(conj.miss_distance_m)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time to TCA:</span>
                  <span className="text-yellow-300">{conj.time_to_tca_hours}h</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConjunctionAlerts;
