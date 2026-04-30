#!/usr/bin/env bash
# Backfill README.md and values.yaml for all existing charts.
# Downloads the latest .tgz for each chart from GitHub releases,
# extracts docs, and places them in docs/charts/<name>/.
#
# Usage: ./scripts/backfill-readmes.sh
# Run from the repo root on the gh-pages branch.

set -euo pipefail

REPO="validatedpatterns/helm-charts"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "Fetching release assets from $REPO..."
ASSETS=$(gh api "repos/${REPO}/releases/latest" --jq '.assets[].browser_download_url' 2>/dev/null || true)

if [ -z "$ASSETS" ]; then
  echo "No release assets found. Make sure 'gh' is authenticated."
  exit 1
fi

# Build a map of chart-name -> latest .tgz URL (highest version)
declare -A LATEST_URL
for url in $ASSETS; do
  filename=$(basename "$url")
  # Skip non-tgz files (e.g. .prov signature files)
  [[ "$filename" == *.tgz ]] || continue

  # Extract chart name: everything before the last -<version>.tgz
  # e.g. "aap-config-0.2.2.tgz" -> "aap-config"
  name=$(echo "$filename" | sed -E 's/-[0-9]+\.[0-9]+\.[0-9]+(-.*)?\.tgz$//')
  version=$(echo "$filename" | sed -E 's/.*-([0-9]+\.[0-9]+\.[0-9]+(-.*)?)\.tgz$/\1/')

  # Keep the URL — later entries with higher versions overwrite earlier ones
  # Since we process all, the last one wins. For correctness we compare versions.
  if [ -z "${LATEST_URL[$name]+x}" ]; then
    LATEST_URL[$name]="$url"
  else
    current_file=$(basename "${LATEST_URL[$name]}")
    current_ver=$(echo "$current_file" | sed -E 's/.*-([0-9]+\.[0-9]+\.[0-9]+(-.*)?)\.tgz$/\1/')
    # Simple version compare using sort -V
    higher=$(printf '%s\n%s' "$current_ver" "$version" | sort -V | tail -1)
    if [ "$higher" = "$version" ]; then
      LATEST_URL[$name]="$url"
    fi
  fi
done

echo "Found ${#LATEST_URL[@]} charts to backfill."
echo ""

SUCCESS=0
FAIL=0

for name in $(echo "${!LATEST_URL[@]}" | tr ' ' '\n' | sort); do
  url="${LATEST_URL[$name]}"
  filename=$(basename "$url")
  echo -n "  $name ($filename)... "

  # Download
  if ! curl -sLo "$TMPDIR/$filename" "$url"; then
    echo "FAILED (download)"
    ((FAIL++)) || true
    continue
  fi

  # Create output dir
  mkdir -p "docs/charts/$name"

  # Extract README.md and values.yaml (compatible with both BSD and GNU tar)
  extracted=0
  EXTRACT_TMP="$TMPDIR/extract"
  rm -rf "$EXTRACT_TMP"
  mkdir -p "$EXTRACT_TMP"
  if tar xzf "$TMPDIR/$filename" -C "$EXTRACT_TMP" "$name/README.md" 2>/dev/null; then
    mv "$EXTRACT_TMP/$name/README.md" "docs/charts/$name/"
    extracted=1
  fi
  if tar xzf "$TMPDIR/$filename" -C "$EXTRACT_TMP" "$name/values.yaml" 2>/dev/null; then
    mv "$EXTRACT_TMP/$name/values.yaml" "docs/charts/$name/"
    extracted=1
  fi
  rm -rf "$EXTRACT_TMP"

  if [ "$extracted" -eq 1 ]; then
    files=$(ls "docs/charts/$name/" 2>/dev/null | tr '\n' ' ')
    echo "OK ($files)"
    ((SUCCESS++)) || true
  else
    echo "SKIP (no README.md or values.yaml in package)"
    rmdir "docs/charts/$name" 2>/dev/null || true
    ((FAIL++)) || true
  fi

  # Clean up download
  rm -f "$TMPDIR/$filename"
done

echo ""
echo "Done. $SUCCESS charts extracted, $FAIL skipped/failed."
echo ""
echo "Next steps:"
echo "  git add docs/"
echo "  git commit -m 'Backfill chart README and values docs'"
echo "  git push origin gh-pages"
