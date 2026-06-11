# Get the user's desktop path dynamically
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$zipPath = Join-Path $desktop "PayableDesk_App.zip"

Write-Host "Creating zip package at: $zipPath"

# Remove existing zip if any
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

# Compress all files in the current folder, excluding any other zip files or build scripts
Get-ChildItem -Path "C:\Users\USER\.gemini\antigravity\scratch\accounts-payable-dashboards\*" -Exclude "*.zip", "*.ps1" | 
    Compress-Archive -DestinationPath $zipPath -Force

Write-Host "Success! ZIP archive successfully built at: $zipPath"
