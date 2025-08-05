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
- **ADDITIONAL_HELM_REPOS** (optional): Additional helm repositories to add in JSON format, e.g.:

  ```json
  [{"name":"myrepo","url":"https://example.com/charts"}]
  ```

## Dependency Handling

The workflow automatically handles helm chart dependencies by:

1. **Auto-detecting chart location**: Looks for Chart.yaml in common locations if TEMPLATE_DIR is not specified
2. **Discovering required repositories**: Automatically extracts repository URLs from Chart.yaml dependencies and adds them as helm repositories
3. **Smart repository naming**: Converts repository URLs to names by removing the protocol (https://) and common prefixes
4. **Adding custom repositories**: Processes any additional repositories specified in ADDITIONAL_HELM_REPOS
5. **Updating dependencies**: Runs `helm dependency update` to download all chart dependencies
6. **Verification**: Confirms dependencies were successfully downloaded

### Example with dependencies

```bash
gh workflow run publish-charts.yml \
  --repo validatedpatterns/helm-charts \
  --ref main \
  -f SOURCE_TAG="${{ github.ref_name }}" \
  -f SOURCE_REPO="${{ github.repository }}" \
  -f TEMPLATE_DIR="helm-chart" \
  -f ADDITIONAL_HELM_REPOS='[{"name":"mycompany","url":"https://charts.mycompany.com"}]'
```

## Requirements

- The remote repo must have a correct token set in the CHARTS_REPOS_TOKEN secret for the repository
- If using dependencies, ensure all required helm repositories are properly specified in the Chart.yaml dependencies with valid repository URLs, or included in ADDITIONAL_HELM_REPOS
- Repository URLs in dependencies should be complete URLs (e.g., `https://charts.bitnami.com/bitnami`)
