#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
{
  cat rulebook-head.html
  pandoc rulebook.md --template rulebook-fragment-template.html -s --metadata lang=en
  pandoc rulebook.fr.md --template rulebook-fragment-template.html -s --metadata lang=fr --metadata hidden=true
  cat rulebook-foot.html
} > rulebook.html
echo "rulebook.html regenerated (EN + FR) from rulebook.md / rulebook.fr.md"
