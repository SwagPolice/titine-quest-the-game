#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
pandoc rulebook.md -o rulebook.html --template rulebook-template.html -s
echo "rulebook.html regenerated from rulebook.md"
