import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChartSummary } from '../types';
import { CodeBlock } from './CodeBlock';
import { timeAgo } from '../utils';

type Tab = 'readme' | 'versions';

export function ChartDetail({ charts }: { charts: ChartSummary[] }) {
  const { name } = useParams<{ name: string }>();
  const chart = charts.find(c => c.name === name);
  const [tab, setTab] = useState<Tab>('readme');
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(true);

  useEffect(() => {
    if (!name) return;
    setReadmeLoading(true);
    fetch(`/charts/${name}/README.md`)
      .then(res => {
        if (!res.ok) throw new Error('not found');
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('text/markdown') && !ct.includes('text/plain')) throw new Error('not markdown');
        return res.text();
      })
      .then(text => {
        if (text.trimStart().startsWith('<!')) throw new Error('html fallback');
        setReadme(text);
        setReadmeLoading(false);
      })
      .catch(() => {
        setReadme(null);
        setReadmeLoading(false);
      });
  }, [name]);

  if (!chart) {
    return (
      <div className="detail">
        <Link to="/" className="detail-back">
          <BackArrow /> All Charts
        </Link>
        <p>Chart not found.</p>
      </div>
    );
  }

  const installCmd = `helm repo add validated-patterns https://charts.validatedpatterns.io
helm install ${chart.name} validated-patterns/${chart.name}`;

  return (
    <div className="detail">
      <Link to="/" className="detail-back">
        <BackArrow /> All Charts
      </Link>

      <div className="detail-hero">
        <div>
          <h1 className="detail-title">{chart.name}</h1>
          <p className="detail-desc">{chart.description}</p>
        </div>
        <span className="detail-version-badge">v{chart.latestVersion}</span>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h4 className="detail-section-title">Install</h4>
        <CodeBlock code={installCmd} />
      </div>

      <div className="detail-actions">
        {chart.home && (
          <a href={chart.home} target="_blank" rel="noopener noreferrer" className="detail-action-btn">
            <GithubIcon /> Source
          </a>
        )}
        <a href={chart.downloadUrl} className="detail-action-btn detail-action-btn--primary">
          <DownloadIcon /> Download .tgz
        </a>
      </div>

      <div className="detail-info">
        <InfoItem label="Chart Version" value={chart.latestVersion} />
        {chart.appVersion && <InfoItem label="App Version" value={chart.appVersion} />}
        <InfoItem label="Total Versions" value={String(chart.totalVersions)} />
        <InfoItem label="Last Updated" value={timeAgo(chart.created)} />
        {chart.dependencies.length > 0 && (
          <InfoItem
            label="Dependencies"
            value={chart.dependencies.map(d => `${d.name} (${d.version})`).join(', ')}
          />
        )}
        {chart.maintainers.length > 0 && (
          <InfoItem
            label="Maintainers"
            value={chart.maintainers.map(m => m.name).join(', ')}
          />
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'readme' ? 'tab--active' : ''}`}
          onClick={() => setTab('readme')}
        >
          README
        </button>
        <button
          className={`tab ${tab === 'versions' ? 'tab--active' : ''}`}
          onClick={() => setTab('versions')}
        >
          Versions ({chart.totalVersions})
        </button>
      </div>

      {tab === 'readme' && (
        <div className="readme-container">
          {readmeLoading ? (
            <p className="readme-placeholder">Loading...</p>
          ) : readme ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="table-wrap"><table>{children}</table></div>
                ),
              }}
            >
              {readme.replace(/<!--[\s\S]*?-->/g, '')}
            </ReactMarkdown>
          ) : (
            <p className="readme-placeholder">
              Chart README will be available once extracted from the published package.
              Each chart includes auto-generated documentation with values tables,
              changelogs, and usage instructions.
            </p>
          )}
        </div>
      )}

      {tab === 'versions' && (
        <div className="readme-container">
          <table className="versions-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Created</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {chart.allVersions.map(v => (
                <tr key={v.version}>
                  <td>{v.version}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{timeAgo(v.created)}</td>
                  <td>
                    <a href={v.url}>{chart.name}-{v.version}.tgz</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-info-item">
      <div className="detail-info-label">{label}</div>
      <div className="detail-info-value">{value}</div>
    </div>
  );
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M10 13l-5-5 5-5v10z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" />
      <path d="M2 13h12v1.5H2z" />
    </svg>
  );
}
