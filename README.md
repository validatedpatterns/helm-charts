# Helm Charts Repo

This is an git repo that exposes the https://charts.validatedpatterns.io helm
repository.

The way it works is the following:
1. A remote repository will tag a chart and the tagging will invoke a workflow here
  in the helm-charts repository
2. The workflow in the remote repository will trigger a workflow here like the following:
  ```
  gh workflow run publish-charts.yml \
    --repo validatedpatterns/helm-charts \
    --ref main \
    -f SOURCE_TAG="${{ github.ref_name }}" \
    -f SOURCE_REPO="${{ github.repository }}"
  ```
3. The publish-charts workflow will pull the SOURCE_REPO and SOURCE_TAG, will build the helm package, sign it and update the yaml index

Requirement for this is that the remote repo has a correct token set in the CHARTS_REPOS_TOKEN secret for the repository
