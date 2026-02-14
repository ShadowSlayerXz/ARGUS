import React from 'react';

interface DashboardProps {
  satellites: any[];
  conjunctions: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ satellites, conjunctions }) => {
  const active = satellites.filter(s => s.status === 'ACTIVE').length;
  const inactive = satellites.length - active;
  const highRisk = conjunctions.filter(c => c.risk_level === 'HIGH').length;

  return (
    <div className="panel">
      <div className="panel-header">System Overview</div>

      <div className="stat-card">
        <div className="stat-label">Tracked Objects</div>
        <div className="flex items-baseline gap-3">
          <span className="stat-value stat-value--blue">{satellites.length}</span>
          <span className="text-xs text-gray-600">{active} active &middot; {inactive} inactive</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Active Conjunctions</div>
        <div className="flex items-baseline gap-3">
          <span className="stat-value stat-value--yellow">{conjunctions.length}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">High-Risk Events</div>
        <div className="flex items-baseline gap-3">
          <span className={`stat-value ${highRisk > 0 ? 'stat-value--red' : 'stat-value--green'}`}>
            {highRisk}
          </span>
          <span className="text-xs text-gray-600">{highRisk > 0 ? 'Action required' : 'Nominal'}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
