import { useState, useMemo } from 'react';
import type { ChartSummary } from '../types';
import { ChartCard } from './ChartCard';
import { CodeBlock } from './CodeBlock';

type SortKey = 'latest' | 'az' | 'za' | 'versions';

const SORT_FNS: Record<SortKey, (a: ChartSummary, b: ChartSummary) => number> = {
  latest: (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
  az: (a, b) => a.name.localeCompare(b.name),
  za: (a, b) => b.name.localeCompare(a.name),
  versions: (a, b) => b.totalVersions - a.totalVersions,
};

export function Catalog({ charts }: { charts: ChartSummary[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('latest');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = charts;
    if (q) {
      list = list.filter(
        c => c.name.includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    return [...list].sort(SORT_FNS[sort]);
  }, [charts, query, sort]);

  return (
    <div className="catalog">
      <div style={{ marginBottom: 40 }}>
        <h1 className="catalog-heading">
          Helm Charts for Validated Patterns
          <span className="catalog-pill">{charts.length} charts</span>
        </h1>
        <p className="catalog-subtitle">
          Add this repository to Helm, then install any chart listed below.
        </p>
        <CodeBlock code="helm repo add validated-patterns https://charts.validatedpatterns.io" />
      </div>

      <div className="catalog-controls">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="#b8bbbe">
            <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="#b8bbbe" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#b8bbbe" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Filter charts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }} />
        <div className="sort-wrap">
          <label className="sort-label">Sort</label>
          <select
            className="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
          >
            <option value="latest">Latest updated</option>
            <option value="az">A &rarr; Z</option>
            <option value="za">Z &rarr; A</option>
            <option value="versions">Most versions</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No charts match &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="chart-grid">
          {filtered.map(c => (
            <ChartCard key={c.name} chart={c} />
          ))}
        </div>
      )}
    </div>
  );
}
