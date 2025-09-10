#!/bin/bash

# List files in dist folder matching the wheel pattern
WHEEL_PATTERN="photosphere-*-py3-none-any.whl"
DIST_DIR="dist"

# Find the highest version number
latest_version=$(ls $DIST_DIR/$WHEEL_PATTERN 2>/dev/null | \
  grep -oE 'photosphere-[0-9]+\.[0-9]+\.[0-9]+-py3-none-any\.whl' | \
  sed -E 's/photosphere-([0-9]+\.[0-9]+\.[0-9]+)-py3-none-any\.whl/\1/' | \
  sort -V | tail -n 1)

if [ -z "$latest_version" ]; then
  echo "No wheel files found in $DIST_DIR."
  exit 1
fi

# Increment the patch version
IFS='.' read -r major minor patch <<< "$latest_version"
new_patch=$((patch + 1))
new_version="$major.$minor.$new_patch"

# Set new version with uv
uv version $new_version

# Build the new version
uv build

# Install the new wheel locally
new_wheel="$DIST_DIR/photosphere-$new_version-py3-none-any.whl"
if [ -f "$new_wheel" ]; then
  pip install "$new_wheel"
else
  echo "New wheel file $new_wheel not found. Build may have failed."
  exit 1
fi

