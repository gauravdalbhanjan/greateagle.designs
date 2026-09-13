# Regenerates the image manifests so the landing page auto-updates when you
# add / remove / rename files in these folders. Run after any change:
#   powershell -File update-logos.ps1
$root = $PSScriptRoot

function Write-Manifest($dir, $exclude) {
  $files = Get-ChildItem $dir -File -Include *.png,*.jpg,*.jpeg,*.svg,*.webp,*.gif -Recurse |
           Where-Object { -not $exclude -or $_.Name -notmatch $exclude } |
           Sort-Object Name | ForEach-Object { $_.Name }
  $json = "[`n" + (($files | ForEach-Object { '  "' + $_ + '"' }) -join ",`n") + "`n]"
  Set-Content (Join-Path $dir 'images.json') $json -NoNewline
  return $files.Count
}

# Company logos → logos.json
$logoDir = Join-Path $root 'assets\companies-logos'
$logos = Get-ChildItem $logoDir -File -Include *.png,*.jpg,*.jpeg,*.svg,*.webp -Recurse |
         Sort-Object Name | ForEach-Object { $_.Name }
$json = "[`n" + (($logos | ForEach-Object { '  "' + $_ + '"' }) -join ",`n") + "`n]"
Set-Content (Join-Path $logoDir 'logos.json') $json -NoNewline
Write-Host "logos.json  -> $($logos.Count) logos"

# Outside-the-work photos → images.json (skip AI-generated placeholder)
$n = Write-Manifest (Join-Path $root 'assets\outside of work') 'Gemini_Generated'
Write-Host "images.json -> $n photos"
