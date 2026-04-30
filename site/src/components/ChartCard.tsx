import { useNavigate } from 'react-router-dom';
import type { ChartSummary } from '../types';
import { timeAgo } from '../utils';

export function ChartCard({ chart }: { chart: ChartSummary }) {
  const navigate = useNavigate();

  return (
    <div
      className="chart-card"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/charts/${chart.name}`)}
      onKeyDown={e => { if (e.key === 'Enter') navigate(`/charts/${chart.name}`); }}
    >
      <div className="card-header">
        <h3 className="card-name">{chart.name}</h3>
        <span className="card-version">v{chart.latestVersion}</span>
      </div>
      <p className="card-desc">{chart.description}</p>
      <div className="card-meta">
        {chart.appVersion && (
          <span className="card-tag">App: {chart.appVersion}</span>
        )}
        {chart.dependencies.length > 0 && (
          <span className="card-tag card-tag--muted">
            {chart.dependencies.length} dep{chart.dependencies.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="card-footer">
        <span className="card-footer-text">
          {chart.totalVersions} version{chart.totalVersions !== 1 ? 's' : ''} &middot; {timeAgo(chart.created)}
        </span>
        <a
          href={chart.downloadUrl}
          onClick={e => e.stopPropagation()}
          className="card-dl-btn"
          title={`Download ${chart.name}-${chart.latestVersion}.tgz`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" />
            <path d="M2 13h12v1.5H2z" />
          </svg>
          .tgz
        </a>
      </div>
    </div>
  );
}
