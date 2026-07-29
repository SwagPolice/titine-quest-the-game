Set-Location $PSScriptRoot

# Pandoc writes each language straight to its own file (not captured via a
# PowerShell variable) because capturing external-process stdout as text
# mangles multi-byte UTF-8 (emoji) under Windows PowerShell's console codepage.
pandoc rulebook.md --template rulebook-fragment-template.html -s --metadata lang=en -o rulebook-en.fragment.html
pandoc rulebook.fr.md --template rulebook-fragment-template.html -s --metadata lang=fr --metadata hidden=true -o rulebook-fr.fragment.html

$parts = "rulebook-head.html", "rulebook-en.fragment.html", "rulebook-fr.fragment.html", "rulebook-foot.html"
$stream = [System.IO.File]::Create((Join-Path $PSScriptRoot "rulebook.html"))
foreach ($f in $parts) {
    $bytes = [System.IO.File]::ReadAllBytes((Join-Path $PSScriptRoot $f))
    $stream.Write($bytes, 0, $bytes.Length)
}
$stream.Close()

Remove-Item rulebook-en.fragment.html, rulebook-fr.fragment.html
Write-Host "rulebook.html regenerated (EN + FR) from rulebook.md / rulebook.fr.md"
