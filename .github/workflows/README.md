There are two workflows here:
1. update-helm-repo.yml which should be added to each charts' repository
2. publish-charts.yml gets invoked by the 'update-helm-repo.yml' any time a new version tag is pushed to the charts repository

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
