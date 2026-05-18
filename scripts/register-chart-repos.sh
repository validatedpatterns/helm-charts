#!/usr/bin/env bash
# Register Helm chart repositories required by Chart.yaml / Chart.lock before
# helm dependency build. Used by publish-charts CI and runnable locally.
set -euo pipefail

chart_dir="${1:-.}"
cd "${chart_dir}"

declare -A chart_repos=()

load_ct_chart_repos() {
  local ct_file=""
  for candidate in ./ct.yaml ../ct.yaml; do
    if [[ -f "${candidate}" ]] && yq -e '.["chart-repos"]' "${candidate}" >/dev/null 2>&1; then
      ct_file="${candidate}"
      break
    fi
  done
  if [[ -z "${ct_file}" ]]; then
    return 0
  fi
  echo "Loading chart-repos from ${ct_file}"
  while IFS= read -r entry; do
    [[ -z "${entry}" ]] && continue
    local name="${entry%%=*}"
    local url="${entry#*=}"
    chart_repos["${name}"]="${url}"
  done < <(yq -r '.["chart-repos"][]?' "${ct_file}")
}

resolve_alias_url() {
  local dep_name="$1"
  local alias="$2"
  local url=""

  if [[ -n "${chart_repos[${alias}]+x}" ]]; then
    echo "${chart_repos[${alias}]}"
    return 0
  fi

  if [[ -f Chart.lock ]]; then
    url="$(yq -r ".dependencies[] | select(.name == \"${dep_name}\") | .repository" Chart.lock | head -n1)"
    if [[ "${url}" == http://* || "${url}" == https://* ]]; then
      echo "${url}"
      return 0
    fi
  fi

  return 1
}

helm_repo_safe_name() {
  printf '%s' "$1" | sha256sum | awk '{print $1}' | cut -c1-16 | awk '{print "ext-" $1}'
}

register_http_repo() {
  local repo_url="$1"
  local repo_name
  repo_name="$(helm_repo_safe_name "${repo_url}")"
  echo "Adding repo: ${repo_name} -> ${repo_url}"
  helm repo add "${repo_name}" "${repo_url}" --force-update
}

register_alias_repo() {
  local alias="$1"
  local repo_url="$2"
  echo "Adding repo: ${alias} -> ${repo_url}"
  helm repo add "${alias}" "${repo_url}" --force-update
}

normalize_alias() {
  local repo_ref="$1"
  if [[ "${repo_ref}" == @* ]]; then
    echo "${repo_ref#@}"
    return 0
  fi
  if [[ "${repo_ref}" == alias:* ]]; then
    echo "${repo_ref#alias:}"
    return 0
  fi
  return 1
}

main() {
  if ! yq -e '.dependencies' Chart.yaml >/dev/null 2>&1; then
    echo "No dependencies declared in Chart.yaml"
    exit 0
  fi

  load_ct_chart_repos

  while IFS=$'\t' read -r dep_name repo_ref; do
    [[ -z "${repo_ref}" ]] && continue
    local alias=""
    if alias="$(normalize_alias "${repo_ref}")"; then
      local url=""
      if ! url="$(resolve_alias_url "${dep_name}" "${alias}")"; then
        echo "::error::Cannot resolve Helm repository alias \"${alias}\" for dependency \"${dep_name}\". Define it in ct.yaml chart-repos (name=url), commit a Chart.lock with an HTTPS repository URL, or use an HTTPS repository URL in Chart.yaml."
        exit 1
      fi
      register_alias_repo "${alias}" "${url}"
    fi
  done < <(yq -r '.dependencies[]? | select(.repository) | [.name, .repository] | @tsv' Chart.yaml)

  local tmp
  tmp="$(mktemp)"
  yq -r '.dependencies[]? | select(.repository) | .repository' Chart.yaml >>"${tmp}"
  if [[ -f Chart.lock ]]; then
    yq -r '.dependencies[]? | select(.repository) | .repository' Chart.lock >>"${tmp}"
  fi

  sort -u "${tmp}" | while read -r repo_url; do
    [[ -z "${repo_url}" ]] && continue
    if [[ "${repo_url}" == @* || "${repo_url}" == alias:* ]]; then
      continue
    fi
    if [[ "${repo_url}" == http://* || "${repo_url}" == https://* ]]; then
      register_http_repo "${repo_url}"
      continue
    fi
    if [[ "${repo_url}" == oci://* ]]; then
      echo "Skipping OCI repository (use helm registry login in CI if needed): ${repo_url}"
      continue
    fi
    if [[ "${repo_url}" == file://* ]]; then
      echo "Skipping file repository (local path): ${repo_url}"
      continue
    fi
    echo "Skipping unsupported repository reference: ${repo_url}"
  done
  rm -f "${tmp}"

  local repo_count
  repo_count="$(helm repo list -o json 2>/dev/null | jq 'length' 2>/dev/null || echo 0)"
  if [[ "${repo_count}" -gt 0 ]]; then
    helm repo update
  else
    echo "Skipping helm repo update: no HTTP chart repositories were registered"
  fi
}

main "$@"
