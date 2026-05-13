# Helm Charts Repo

This is an git repo that exposes the <https://charts.validatedpatterns.io> helm
repository.

The way it works is the following:

1. A remote repository will tag a chart and the tagging will invoke a workflow here
   in the helm-charts repository
2. The workflow in the remote repository will trigger a workflow here like the following:

   ```bash
   gh workflow run publish-charts.yml \
     --repo validatedpatterns/helm-charts \
     --ref main \
     -f SOURCE_TAG="${{ github.ref_name }}" \
     -f SOURCE_REPO="${{ github.repository }}"
   ```

3. The publish-charts workflow will pull the SOURCE_REPO and SOURCE_TAG, handle any helm chart dependencies, build the helm package, sign it and update the yaml index

## Workflow Inputs

The `publish-charts.yml` workflow supports the following inputs:

- **SOURCE_TAG** (required): The tag of the helm chart repo to build
- **SOURCE_REPO** (required): The helm chart repo in `owner/repo` format
- **SOURCE_BRANCH_OVERRIDE** (optional): If specified, checks out the head of this branch rather than the commit tagged by SOURCE_TAG
- **TEMPLATE_DIR** (optional): Directory containing the helm chart (relative to repo root). If not specified, will auto-detect Chart.yaml location by looking in common locations (., chart/, helm/)

## Dependency Handling

The workflow automatically handles helm chart dependencies declared in `Chart.yaml`:

1. **Auto-detecting chart location**: Looks for `Chart.yaml` in common locations (`.`, `chart/`, `helm/`) if `TEMPLATE_DIR` is not specified
2. **Registering repositories**: Extracts repository URLs from `Chart.yaml` dependencies and registers them with `helm repo add`
3. **Building dependencies**: Runs `helm dependency build` to download all declared dependencies into the `charts/` directory
4. **Bundling**: `helm package` produces a `.tgz` that includes the chart and all its dependencies

All chart dependencies must be declared in `Chart.yaml` with valid repository URLs.

### Example with a custom chart directory

```bash
gh workflow run publish-charts.yml \
  --repo validatedpatterns/helm-charts \
  --ref main \
  -f SOURCE_TAG="${{ github.ref_name }}" \
  -f SOURCE_REPO="${{ github.repository }}" \
  -f TEMPLATE_DIR="helm-chart"
```

## Requirements

- The remote repo must have a correct token set in the CHARTS_REPOS_TOKEN secret for the repository
- All required helm repositories must be specified in the `Chart.yaml` dependencies with complete URLs (e.g., `https://charts.bitnami.com/bitnami`)
