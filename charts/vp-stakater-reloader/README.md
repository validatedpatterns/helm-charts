# vp-stakater-reloader

![Version: 0.1.2](https://img.shields.io/badge/Version-0.1.2-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square)

Wrapper Helm chart for Stakater Reloader with defaults for cluster-wide OpenShift, ConfigMap/Secret watching, and Secrets Store CSI integration.

## Prerequisites

- OpenShift (or Kubernetes) cluster
- A [Validated Patterns](https://validatedpatterns.io/) deployment (for example [multicloud-gitops](https://github.com/validatedpatterns/multicloud-gitops)) with `clusterGroup` hub values, or Helm 3 if you install the chart directly
- Optional: [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/) and its CRDs if you rely on CSI-backed secret rotation (Reloader watches those APIs when `reloader.reloader.enableCSIIntegration` is true)

## Install

### Validated Patterns (`clusterGroup`)

Declare a dedicated namespace and an Argo CD application in your hub (or site) values, alongside an `argoProject` that already exists in the same file. When this chart is published to the [Validated Patterns Helm charts](https://github.com/validatedpatterns/helm-charts) repository, reference it by chart name and a `0.1.*` version range (same style as other catalog charts in multicloud-gitops `values-hub.yaml`):

```yaml
clusterGroup:
  namespaces:
    vp-stakater-reloader:
  argoProjects:
    - hub
    # ... other projects ...
  applications:
    vp-stakater-reloader:
      name: vp-stakater-reloader
      namespace: vp-stakater-reloader
      argoProject: hub
      chart: vp-stakater-reloader
      chartVersion: 0.1.*
      overrides:
        - name: reloader.reloader.deployment.securityContext.runAsUser
          value: "null"
```

Ensure `argoProjects` includes the `argoProject` you reference. The `runAsUser` override clears the subchart default (`65534`) so OpenShift 4.13+ can assign a UID from the namespace SCC. To deploy from a Git source instead of the catalog, use `repoURL`, `chartVersion` (target revision), and `path` as in the upstream Reloader chart packaging workflows.

### OpenShift UID / SCC (recommended)

Upstream Reloader defaults `runAsUser: 65534`. On OpenShift 4.13+, Stakater recommends letting the namespace SCC assign the UID; the Validated Patterns example above includes that override on the application entry.

Standalone Helm equivalent:

```bash
helm install vp-stakater-reloader /path/to/vp-stakater-reloader-chart \
  --namespace vp-stakater-reloader \
  --create-namespace \
  --set reloader.reloader.deployment.securityContext.runAsUser=null
```

### Annotation-only reloads (`autoReloadAll`)

By default `reloader.reloader.autoReloadAll` is `true`, so Reloader rolls workloads on ConfigMap or Secret changes unless you opt a workload out with `reloader.stakater.com/auto: "false"`. To require explicit Reloader annotations on every workload instead, set:

```yaml
      overrides:
        - name: reloader.reloader.autoReloadAll
          value: "false"
```

Standalone Helm: `--set reloader.reloader.autoReloadAll=false`.

### Direct Helm install

If you are not using Validated Patterns, install from a clone or packaged chart:

```bash
helm install vp-stakater-reloader /path/to/vp-stakater-reloader-chart \
  --namespace vp-stakater-reloader \
  --create-namespace
```

## Upstream documentation

- [Reloader OSS documentation](https://docs.stakater.com/reloader/)
- [Annotations reference](https://docs.stakater.com/reloader/1.4/reference/annotations.html)

## Maintainer tasks

Refresh the vendored subchart after editing `Chart.yaml` dependencies:

```bash
make helm-deps
```

**Homepage:** <https://github.com/stakater/Reloader>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| Validated Patterns |  |  |

## Source Code

* <https://github.com/stakater/Reloader>

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://stakater.github.io/stakater-charts | reloader | 2.2.11 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| reloader.reloader.autoReloadAll | bool | `true` | Reload on ConfigMap or Secret changes by default; opt out per workload with reloader.stakater.com/auto: "false" |
| reloader.reloader.deployment.replicas | int | `2` | Number of controller replicas (requires enableHA when greater than 1) |
| reloader.reloader.deployment.securityContext.runAsNonRoot | bool | `true` | Run as non-root |
| reloader.reloader.deployment.securityContext.seccompProfile.type | string | `"RuntimeDefault"` | Seccomp profile for the pod |
| reloader.reloader.enableCSIIntegration | bool | `true` | Watch Secrets Store CSI SecretProviderClass and SecretProviderClassPodStatus resources |
| reloader.reloader.enableHA | bool | `true` | Enable leader election for multiple replicas |
| reloader.reloader.ignoreConfigMaps | bool | `false` | Ignore ConfigMaps when true (cannot be true together with ignoreSecrets) |
| reloader.reloader.ignoreCronJobs | bool | `false` | Exclude CronJobs from reload monitoring |
| reloader.reloader.ignoreJobs | bool | `false` | Exclude Jobs from reload monitoring |
| reloader.reloader.ignoreSecrets | bool | `false` | Ignore Secrets when true (cannot be true together with ignoreConfigMaps) |
| reloader.reloader.isOpenshift | bool | `true` | Enable OpenShift DeploymentConfig RBAC when the API exists |
| reloader.reloader.reloadOnCreate | bool | `true` | Trigger rollouts when new ConfigMaps or Secrets appear |
| reloader.reloader.syncAfterRestart | bool | `true` | With HA, reconcile after leader restart (pairs with reloadOnCreate) |
| reloader.reloader.watchGlobally | bool | `true` | Cluster-wide watch of all namespaces |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
