export interface ChartVersion {
  apiVersion: string;
  name: string;
  version: string;
  description: string;
  created: string;
  digest: string;
  urls: string[];
  appVersion?: string;
  home?: string;
  icon?: string;
  keywords?: string[];
  maintainers?: { name: string; email?: string; url?: string }[];
  sources?: string[];
  dependencies?: { name: string; repository: string; version: string }[];
  type?: string;
}

export interface ChartSummary {
  name: string;
  latestVersion: string;
  description: string;
  appVersion: string;
  home: string;
  keywords: string[];
  dependencies: { name: string; version: string }[];
  maintainers: { name: string; email?: string }[];
  totalVersions: number;
  created: string;
  downloadUrl: string;
  allVersions: { version: string; created: string; url: string }[];
}

export interface HelmIndex {
  apiVersion: string;
  entries: Record<string, ChartVersion[]>;
}
