#!/bin/bash

# Step 1: Increment version number
VERSION_FILE="spa/public/version.txt"
if [[ -f "$VERSION_FILE" ]]; then
    VERSION=$(cat "$VERSION_FILE")
    if [[ "$VERSION" =~ ^[0-9]+$ ]]; then
        NEW_VERSION=$((VERSION + 1))
        echo "$NEW_VERSION" > "$VERSION_FILE"
        echo "Version updated to $NEW_VERSION"
    else
        echo "1" > "$VERSION_FILE"
        echo "Version file was not a number. Set to 1."
    fi
else
    echo "1" > "$VERSION_FILE"
    echo "Version file not found. Created and set to 1."
fi

# Step 2: Build project
cd spa || exit 1
npm run build

# Step 3: Deploy with Firebase
cd ..
firebase deploy --only hosting
