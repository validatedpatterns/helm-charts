# automation-orchestrator-instance

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square)

A Helm chart to install an Automation Orchestrator instance

This chart installs an AutomationOrchestrator resource. It does not install the
automation orchestrator operator, its namespace, or its subscription.

PostgreSQL defaults to the CloudNativePG cluster created by the
vp-cloudnative-pg-cluster chart in the same namespace. Deploy that chart first.
The default connection uses
`orchestrator-postgres-rw.automation-orchestrator.svc`, SSL mode `verify-ca`,
and the cluster CA secret `orchestrator-postgres-ca`. Backend credentials come
from `orchestrator-postgres-secret` and Temporal credentials from
`temporal-postgres-secret`.

### Secrets

Credential Secrets are projected with ExternalSecret resources using the same
mechanism as
[vp-cloudnative-pg-cluster](https://github.com/validatedpatterns/vp-cloudnative-pg-cluster-chart):
`secretStore` + `secrets.*`, `dataFrom.extract`, and a
`kubernetes.io/basic-auth` target template. Patterns supply or generate the
Vault material through `values-secret` (`onMissingValue: generate`).

| Provider | Who projects backend/temporal Secrets |
| --- | --- |
| `cloudnative` (default) | `vp-cloudnative-pg-cluster` (needed for Cluster bootstrap). This chart skips those names unless `secrets.includeDatabaseSecrets` is true. |
| `external` | This chart, for the resolved backend/temporal Secret names |

`secrets.additional` is always projected when `secrets.enabled` is true.
ExternalSecrets use sync-wave `0`; the AutomationOrchestrator uses sync-wave
`1`.

Set `postgres.provider` to `external` to use an existing PostgreSQL 15 instance.
Automation orchestrator does not use the Ansible Automation Platform database.

### Console link

The chart creates an OpenShift `ConsoleLink` in the Application menu (Red Hat
applications), matching the ansible-automation-platform-instance chart. The
href uses `ingress.host` when set; otherwise it uses
`https://<name>-<namespace>.<global.hubClusterDomain>`.

**Homepage:** <https://github.com/validatedpatterns/automation-orchestrator-instance-chart>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| Validated Patterns Team | <validatedpatterns@googlegroups.com> |  |

## Source Code

* <https://github.com/validatedpatterns/automation-orchestrator-instance-chart>

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| global.hubClusterDomain | string | `"example.com"` | Domain used in the OpenShift console link for the orchestrator route. |
| ingress.host | string | `""` | Optional ingress hostname. Empty lets OpenShift assign the route host. |
| ingress.type | string | `"Route"` | Ingress type for automation orchestrator. Route is the OpenShift default. |
| name | string | `"orchestrator"` | Name of the AutomationOrchestrator resource. |
| namespace | string | `"automation-orchestrator"` | Namespace for the AutomationOrchestrator resource. The namespace itself is created outside this chart. |
| postgres.backendDatabaseSecret | string | `""` | Secret containing backend database keys database, username, and password. Empty selects the provider default. |
| postgres.caCertSecret | string | `""` | Secret containing the PostgreSQL CA certificate in key ca.crt. Empty with cloudnative uses the CloudNativePG cluster CA secret. |
| postgres.clusterName | string | `"orchestrator-postgres"` | CloudNativePG cluster name used to derive the service hostname and CA secret. Must match fullnameOverride / cluster name in the vp-cloudnative-pg-cluster chart. |
| postgres.host | string | `""` | PostgreSQL hostname. Required when provider is external. Empty with cloudnative uses the CloudNativePG read-write service. |
| postgres.port | int | `5432` | PostgreSQL port. |
| postgres.provider | string | `"cloudnative"` | PostgreSQL provider. cloudnative connects to the CloudNativePG cluster from the vp-cloudnative-pg-cluster chart. external uses an existing PostgreSQL 15 instance. |
| postgres.sslMode | string | `""` | PostgreSQL SSL mode. Empty selects verify-ca for cloudnative and require for external. |
| postgres.temporalDatabaseSecret | string | `""` | Secret containing Temporal database keys database, username, and password. Empty selects the provider default. |
| secretStore.kind | string | `"ClusterSecretStore"` | External Secrets store kind. |
| secretStore.name | string | `"vault-backend"` | External Secrets store used to project database credentials. |
| secrets.additional | list | `[]` | Extra Secret names to project beyond backend/temporal defaults. |
| secrets.enabled | bool | `true` | Create ExternalSecret resources for database credentials. |
| secrets.includeDatabaseSecrets | bool | `false` | Also project backend/temporal Secrets when provider is cloudnative. Defaults to false so vp-cloudnative-pg-cluster owns those ExternalSecrets. |
| secrets.keyPrefix | string | `"secret/data/hub"` | Vault (or other backend) key prefix used by ExternalSecret remote refs. Patterns typically use secret/data/hub/<name> with the vault backend. |
| secrets.refreshInterval | string | `"15s"` | Refresh interval for ExternalSecret resources. |
| secrets.syncWave | string | `"0"` | Argo CD sync-wave for ExternalSecret resources so credentials exist before the AutomationOrchestrator is applied. Avoid negative waves. |

## Notable changes

### 0.1.0

- Initial AutomationOrchestrator instance chart for Validated Patterns
- ExternalSecret projection matching vp-cloudnative-pg-cluster (`secretStore` /
  `secrets.*`)
- OpenShift ConsoleLink in the Application menu (Red Hat applications)

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
