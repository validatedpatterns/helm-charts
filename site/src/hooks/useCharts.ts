import { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import type { HelmIndex, ChartSummary } from '../types';

export function useCharts() {
  const [charts, setCharts] = useState<ChartSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/index.yaml')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch index.yaml: ${res.status}`);
        return res.text();
      })
      .then(text => {
        const data = yaml.load(text) as HelmIndex;
        const summaries: ChartSummary[] = [];

        for (const [name, versions] of Object.entries(data.entries)) {
          const sorted = [...versions].sort(
            (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
          );
          const latest = sorted[0];

          summaries.push({
            name,
            latestVersion: latest.version,
            description: latest.description || '',
            appVersion: latest.appVersion || '',
            home: latest.home || '',
            keywords: latest.keywords || [],
            dependencies: (latest.dependencies || []).map(d => ({
              name: d.name,
              version: d.version,
            })),
            maintainers: (latest.maintainers || []).map(m => ({
              name: m.name,
              email: m.email,
            })),
            totalVersions: versions.length,
            created: latest.created,
            downloadUrl: latest.urls?.[0] || '',
            allVersions: sorted.map(v => ({
              version: v.version,
              created: v.created,
              url: v.urls?.[0] || '',
            })),
          });
        }

        setCharts(summaries);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { charts, loading, error };
}
