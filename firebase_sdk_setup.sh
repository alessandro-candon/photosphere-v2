#!/bin/bash
firebase apps:sdkconfig > firebase.json
# JSON fragment to append
NEW_JSON_FRAGMENT='{"storage":{"rules":"storage.rules"},"hosting":{"public":"spa/dist","ignore":["firebase.json","**/.*","**/node_modules/**"],"rewrites":[{"source":"**","destination":"/index.html"}],"headers":[{"source":"index.html","headers":[{"key":"Cache-Control","value":"no-cache, no-store"}]},{"source":"version.txt","headers":[{"key":"Cache-Control","value":"no-cache, no-store"}]}]}}'

# Merge the new fragment into firebase.json
jq -s '.[0] * .[1]' firebase.json <(echo "$NEW_JSON_FRAGMENT") > firebase.json.tmp && mv firebase.json.tmp firebase.json