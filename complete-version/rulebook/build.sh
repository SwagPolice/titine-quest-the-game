#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
pandoc rulebook.md -o rulebook.html --template rulebook-template.html -s
echo "rulebook.html regenerated from rulebook.md"
pandoc rulebook.fr.md -o rulebook.fr.html --template rulebook-template.html -s
echo "rulebook.fr.html regenerated from rulebook.fr.md"
