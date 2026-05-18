#!/usr/bin/env bash
# Register Helm repos (if needed) and build chart dependencies, or trust vendored charts/.
set -euo pipefail

chart_dir="${1:-.}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if "${script_dir}/should-trust-vendored-charts.sh" "${chart_dir}"; then
  echo "Skipping helm repo registration and helm dependency build (vendored charts match Chart.lock)"
  exit 0
fi

echo "Vendored charts incomplete or trust disabled; building dependencies from Chart.lock"
"${script_dir}/register-chart-repos.sh" "${chart_dir}"
cd "${chart_dir}"
helm dependency build
