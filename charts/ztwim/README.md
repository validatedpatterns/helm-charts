# ztwim

<!-- markdownlint-disable MD013 -->

![Version: 0.1.1](https://img.shields.io/badge/Version-0.1.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square)

<!-- markdownlint-enable MD013 -->

<!-- markdownlint-disable MD013 -->

Zero Trust Workload Identity Manager Helm Chart

<!-- markdownlint-enable MD013 -->

This chart is used to serve as the template for Validated Patterns Charts

## Notable changes

**Homepage:** <https://github.com/validatedpatterns/ztwim-chart>

## Maintainers

| Name                    | Email                                | Url |
| ----------------------- | ------------------------------------ | --- |
| Validated Patterns Team | <validatedpatterns@googlegroups.com> |     |

<!-- markdownlint-disable MD013 MD034 MD060 -->

## Values

| Key                                                                              | Type   | Default                                                                          | Description |
| -------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- | ----------- |
| global.hubClusterDomain                                                          | string | `"hub.example.com"`                                                              |             |
| global.localClusterDomain                                                        | string | `"local.example.com"`                                                            |             |
| spiffe.csi.agentSocketPath                                                       | string | `"/run/spire/agent-sockets"`                                                     |             |
| spire.agent.nodeAttestor.k8sPSATEnabled                                          | string | `"true"`                                                                         |             |
| spire.agent.workloadAttestors.k8sEnabled                                         | string | `"true"`                                                                         |             |
| spire.agent.workloadAttestors.workloadAttestorsVerification.hostCertBasePath     | string | `"/var/lib/kubelet/pki"`                                                         |             |
| spire.agent.workloadAttestors.workloadAttestorsVerification.hostCertFileName     | string | `""`                                                                             |             |
| spire.agent.workloadAttestors.workloadAttestorsVerification.type                 | string | `"auto"`                                                                         |             |
| spire.bundleConfigMap                                                            | string | `"spire-bundle"`                                                                 |             |
| spire.clusterName                                                                | string | `"cluster"`                                                                      |             |
| spire.oidcDiscoveryProvider.ingress.annotations."route.openshift.io/termination" | string | `"reencrypt"`                                                                    |             |
| spire.oidcDiscoveryProvider.ingress.host                                         | string | `"spire-spiffe-oidc-discovery-provider.{{ .Values.global.localClusterDomain }}"` |             |
| spire.oidcDiscoveryProvider.ingress.operatorManaged                              | string | `"true"`                                                                         |             |
| spire.oidcDiscoveryProvider.service.name                                         | string | `"spire-spiffe-oidc-discovery-provider"`                                         |             |
| spire.oidcDiscoveryProvider.service.port                                         | int    | `443`                                                                            |             |
| spire.server.ca.commonName                                                       | string | `"redhat.com"`                                                                   |             |
| spire.server.ca.country                                                          | string | `"US"`                                                                           |             |
| spire.server.ca.organization                                                     | string | `"Red Hat"`                                                                      |             |
| spire.server.datastore.connMaxLifetime                                           | int    | `0`                                                                              |             |
| spire.server.datastore.connectionString                                          | string | `"/run/spire/data/datastore.sqlite3"`                                            |             |
| spire.server.datastore.databaseType                                              | string | `"sqlite3"`                                                                      |             |
| spire.server.datastore.maxIdleConns                                              | int    | `10`                                                                             |             |
| spire.server.datastore.maxOpenConns                                              | int    | `100`                                                                            |             |
| spire.server.federation.bundleEndpoint.profile                                   | string | `"https_spiffe"`                                                                 |             |
| spire.server.federation.enabled                                                  | string | `"false"`                                                                        |             |
| spire.server.federation.federatesWith                                            | list   | `[]`                                                                             |             |
| spire.server.federation.ingress.annotations."route.openshift.io/termination"     | string | `"passthrough"`                                                                  |             |
| spire.server.federation.ingress.host                                             | string | `"spire-server.{{ .Values.global.localClusterDomain }}"`                         |             |
| spire.server.federation.ingress.operatorManaged                                  | string | `"true"`                                                                         |             |
| spire.server.persistence.accessMode                                              | string | `"ReadWriteOnce"`                                                                |             |
| spire.server.persistence.size                                                    | string | `"5Gi"`                                                                          |             |
| spire.server.persistence.storageClass                                            | string | `""`                                                                             |             |
| spire.server.service.name                                                        | string | `"spire-server"`                                                                 |             |
| spire.server.service.port                                                        | int    | `443`                                                                            |             |
| spire.trustDomain                                                                | string | `"{{ .Values.global.localClusterDomain }}"`                                      |             |

<!-- markdownlint-enable MD013 MD034 MD060 -->

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
