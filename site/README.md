# Validated Patterns Helm Charts — Documentation Site

A React SPA that serves as the front-end for [charts.validatedpatterns.io](https://charts.validatedpatterns.io). It reads the Helm repository `index.yaml` at runtime and renders a searchable, browsable catalog of all published charts.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **react-router-dom** — client-side routing (`/` catalog, `/charts/:name` detail)
- **js-yaml** — parses `index.yaml` in the browser
- **react-markdown** + **remark-gfm** — renders chart READMEs (GFM tables, etc.)

## Local development

```bash
cd site
npm install
npm run dev
```

The dev server proxies `/index.yaml` to the production Helm repo so you get real chart data locally.

To view chart READMEs locally, create a symlink from the repo-root `docs/` directory:

```bash
ln -s ../../docs site/public/docs
```

Then run the backfill script (from the repo root, on the `gh-pages` branch) to populate `docs/`:

```bash
./scripts/backfill-readmes.sh
```

## Build

```bash
npm run build
```

Output goes to `site/dist/`. In CI, the publish workflow builds the site and deploys the output to the `gh-pages` branch alongside `index.yaml` and `docs/`.

## How it works

1. The app fetches `/index.yaml` (the standard Helm repo index) on load.
2. It parses the YAML into chart metadata: names, versions, descriptions, maintainers, dependencies, and download URLs.
3. The catalog page displays charts as cards with search and sort controls.
4. Each chart detail page fetches `/docs/charts/<name>/README.md` (extracted from the chart `.tgz` during publish) and renders it as Markdown.

## Project structure

```
site/
  src/
    components/    # React components (Catalog, ChartCard, ChartDetail, etc.)
    hooks/         # useCharts (data fetching), useTheme (light/dark/system)
    types.ts       # TypeScript interfaces for chart data
    utils.ts       # Helper functions
    styles.css     # All styles including dark theme
  public/          # Static assets (favicon, icons)
  vite.config.ts   # Vite config with dev proxy
```
