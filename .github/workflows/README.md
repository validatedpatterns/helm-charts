There are two workflows here:
1. update-helm-repo.yml which should be added to each charts' repository
2. publish-charts.yml gets invoked by the 'update-helm-repo.yml' any time a new version tag is pushed to the charts repository

## Authentication (org GitHub App)

Chart repos call `update-helm-repo.yml` with `secrets: inherit`. The org must provide
these secrets (org-level, shared with all chart repos):

| Secret | Value |
|--------|-------|
| `CHARTS_REPOS_APP_ID` | GitHub App ID |
| `CHARTS_REPOS_APP_PRIVATE_KEY` | GitHub App private key (full PEM) |
