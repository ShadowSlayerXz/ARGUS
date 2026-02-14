import React from 'react';

interface DashboardProps {
  satellites: any[];
  conjunctions: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ satellites, conjunctions }) => {
  const activeSatellites = satellites.filter(s => s.status === 'ACTIVE').length;
  const highRiskConjunctions = conjunctions.filter(c => c.risk_level === 'HIGH').length;
  const mediumRiskConjunctions = conjunctions.filter(c => c.risk_level === 'MEDIUM').length;

  const stats = [
    {
      label: 'Tracked Satellites',
      value: satellites.length,
      icon: '--',
      color: 'blue'
    },
    {
      label: 'Active Conjunctions',
      value: conjunctions.length,
      icon: '!!',
      color: 'yellow'
    },
    {
      label: 'High Risk Events',
      value: highRiskConjunctions,
      icon: '**',
      color: 'red'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2 text-blue-400 font-bold">[S]</span>
        System Overview
      </h2>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded p-3 flex items-center justify-between hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-gray-300">{stat.label}</span>
            </div>
            <span className={`text-2xl font-bold text-${stat.color}-400`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded border border-blue-700">
        <p className="text-sm text-blue-300">
          <strong>MVP Demo Mode</strong> — Using simulated data for demonstration
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
