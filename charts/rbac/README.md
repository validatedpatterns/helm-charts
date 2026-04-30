# rbac-chart
Helm Chart to define RBAC for application deployments.

Using the chart defaults an rbac will be created (clusterRole, clusterRoleBinding and ServiceAccount)
named `rbac` in the `default` namespace. This role has read (get, list, watch) on all resources. 

| Parameter | Default Value |
| --------- | ------------- |
| name | rbac |
| namespace | default |
| createRole | true |
| scope.cluster | true |
| resources | * |
| verbs | get, list, watch |
| createBinding | true |
| scope.cluster | true |
| subjects | ServiceAccount |
| apiGroup | "" |