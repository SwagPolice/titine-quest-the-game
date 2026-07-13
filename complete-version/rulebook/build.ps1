Set-Location $PSScriptRoot
pandoc rulebook.md -o rulebook.html --template rulebook-template.html -s
Write-Host "rulebook.html regenerated from rulebook.md"
