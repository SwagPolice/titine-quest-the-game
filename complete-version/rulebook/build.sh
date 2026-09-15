#!/usr/bin/env bash
# Regenerates rulebook.html. Requires `npm install` (once, from the repo root).
set -e
cd "$(dirname "$0")"
node build.js
