#!/usr/bin/env bash
# Exit 0 when committed charts/*.tgz match Chart.lock and dependency build can be skipped.
# Exit 1 when helm dependency build (and repo registration) should run.
set -euo pipefail

chart_dir="${1:-.}"
cd "${chart_dir}"

ct_trust_vendored() {
  local ct_file=""
  for candidate in ./ct.yaml ../ct.yaml; do
    if [[ -f "${candidate}" ]]; then
      ct_file="${candidate}"
      break
    fi
  done
  if [[ -z "${ct_file}" ]]; then
    echo "auto"
    return 0
  fi
  if yq -e '.["trust-vendored-charts"]' "${ct_file}" >/dev/null 2>&1; then
    yq -r '.["trust-vendored-charts"]' "${ct_file}"
    return 0
  fi
  echo "auto"
}

if ! yq -e '.dependencies' Chart.yaml >/dev/null 2>&1; then
  echo "No dependencies in Chart.yaml"
  exit 0
fi

trust_mode="$(ct_trust_vendored)"
case "${trust_mode}" in
  false | "false")
    echo "trust-vendored-charts is false in ct.yaml; will run helm dependency build"
    exit 1
    ;;
  true | "true")
    echo "trust-vendored-charts is true in ct.yaml"
    ;;
  auto | "auto")
    ;;
  *)
    echo "::warning::Unknown trust-vendored-charts value \"${trust_mode}\"; using auto"
    ;;
esac

if [[ ! -f Chart.lock ]]; then
  echo "Chart.lock is missing; cannot trust vendored charts"
  exit 1
fi

missing=0
while IFS=$'\t' read -r dep_name dep_version; do
  [[ -z "${dep_name}" ]] && continue
  chart_tgz="charts/${dep_name}-${dep_version}.tgz"
  if [[ ! -f "${chart_tgz}" ]]; then
    echo "Missing vendored chart archive: ${chart_tgz}"
    missing=1
    continue
  fi
  if [[ ! -s "${chart_tgz}" ]]; then
    echo "Vendored chart archive is empty: ${chart_tgz}"
    missing=1
    continue
  fi
  if ! helm show chart "${chart_tgz}" >/dev/null 2>&1; then
    echo "Vendored chart archive is not a valid Helm package: ${chart_tgz}"
    missing=1
  fi
done < <(yq -r '.dependencies[] | [.name, .version] | @tsv' Chart.lock)

if [[ "${missing}" -ne 0 ]]; then
  exit 1
fi

lock_count="$(yq -r '.dependencies | length' Chart.lock)"
yaml_count="$(yq -r '.dependencies | length' Chart.yaml)"
if [[ "${lock_count}" != "${yaml_count}" ]]; then
  echo "Chart.yaml declares ${yaml_count} dependencies but Chart.lock has ${lock_count}"
  exit 1
fi

while IFS=$'\t' read -r dep_name dep_version; do
  [[ -z "${dep_name}" ]] && continue
  lock_version="$(yq -r ".dependencies[] | select(.name == \"${dep_name}\") | .version" Chart.lock | head -n1)"
  if [[ "${lock_version}" != "${dep_version}" ]]; then
    echo "Chart.yaml version for ${dep_name} (${dep_version}) does not match Chart.lock (${lock_version})"
    exit 1
  fi
done < <(yq -r '.dependencies[] | [.name, .version] | @tsv' Chart.yaml)

echo "All ${lock_count} Chart.lock dependencies are present as vendored charts/*.tgz"
exit 0
