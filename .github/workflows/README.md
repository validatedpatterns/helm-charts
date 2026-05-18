There are two workflows here:
1. update-helm-repo.yml which should be added to each charts' repository
2. publish-charts.yml gets invoked by the 'update-helm-repo.yml' any time a new version tag is pushed to the charts repository

### Helm repository aliases (`@name` / `alias:name`)

Charts may declare HTTP chart repository dependencies using a Helm repo alias in `Chart.yaml`:

```yaml
dependencies:
  - name: reloader
    version: 2.2.11
    repository: "@stakater"
```

`publish-charts` registers those aliases before `helm dependency build` by:

1. Reading `chart-repos` from `ct.yaml` (same `name=https://url` format as [chart-testing](https://github.com/helm/chart-testing)), searched in the chart directory and repo root
2. Falling back to the resolved HTTPS `repository` URL for the same dependency name in `Chart.lock`

Example `ct.yaml` for a root-level chart:

```yaml
chart-dirs:
  - .
chart-repos:
  - stakater=https://stakater.github.io/stakater-charts
```

Direct `https://` repository URLs continue to work without `ct.yaml`. Git (`git:`), OCI (`oci://`), and `file://` dependencies are not registered via `helm repo add`; use vendored `charts/*.tgz`, HTTPS/OCI URLs, or extend CI separately for those cases.

In order for the charts-repo github action to be able to invoke a workflow from
the umbrella repository it needs a PAT token with the following permissions:
- Actions: r/w
- Commit statuses: r/w
- Contents: r/w
- Deployments: r/w
- Pages: r/w

Ideally these permissions are limited to the umbrella repository.
The content of this PAT token needs to live in each charts' repository
as a secret called CHARTS_REPOS_TOKEN which contains.
