import React from 'react';

interface ConjunctionAlertsProps {
  conjunctions: any[];
  onSelectSatellite: (id: string) => void;
}

const ConjunctionAlerts: React.FC<ConjunctionAlertsProps> = ({
  conjunctions,
  onSelectSatellite,
}) => {
  const formatPc = (pc: number) => pc.toExponential(2);
  const formatDist = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(2)} km`);

  const sorted = [...conjunctions].sort((a, b) => {
    const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.risk_level] ?? 3) - (order[b.risk_level] ?? 3);
  });

  return (
    <div className="panel flex-1">
      <div className="panel-header">
        <span>Conjunction Alerts</span>
        <span className="badge">{conjunctions.length}</span>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {sorted.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-600">
            No active conjunctions detected.
          </div>
        ) : (
          sorted.map((conj) => (
            <div
              key={conj.id}
              className="list-item"
              onClick={() => onSelectSatellite(conj.primary_satellite_id)}
            >
              {/* Row 1: names + risk */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-300">
                  {conj.primary_name}
                  <span className="text-gray-600 mx-1">&rarr;</span>
                  {conj.secondary_name}
                </span>
                <span className={`risk-label risk-label--${conj.risk_level.toLowerCase()}`}>
                  {conj.risk_level}
                </span>
              </div>

              {/* Row 2: data */}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Pc <span className="mono text-gray-400">{formatPc(conj.probability_collision)}</span></span>
                <span>Miss <span className="mono text-gray-400">{formatDist(conj.miss_distance_m)}</span></span>
                <span>TCA <span className="mono text-gray-400">{conj.time_to_tca_hours}h</span></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConjunctionAlerts;
