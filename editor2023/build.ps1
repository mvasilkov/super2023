#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

# Python
$python = $null
foreach ($path in @('virtual/Scripts/python', 'virtual/bin/python')) {
  try {
    Get-Command $path
    $python = $path
    break
  }
  catch {
  }
}
if ($null -eq $python) {
  throw 'Could not find the Python interpreter.'
}

# Clean
Remove-Item build -Recurse -ErrorAction SilentlyContinue
if (Test-Path build -PathType Container) {
  throw 'Could not delete the build directory.'
}
$null = mkdir build

# Validate
& $python build.py validate

# Bundle
node_modules/.bin/rollup -f iife -o build/app.js --no-freeze out/app.js

# Optimize
node_modules/.bin/terser -cmo build/app.opt.js --comments false build/app.js
node_modules/.bin/cleancss -O1 -o build/app.opt.css out/app.css

@'
{
  "collapseWhitespace": true,
  "removeAttributeQuotes": true,
  "removeComments": true
}
'@ | Set-Content build/options.json
node_modules/.bin/html-minifier-terser -c build/options.json -o build/index.html out/index.html

# Package
& $python build.py inline
zip -jX9 build/app.zip build/index.html
# https://www.advancemame.it/download
advzip -z4 build/app.zip
# https://github.com/fhanau/Efficient-Compression-Tool
ect -10009 -zip build/app.zip

Write-Output 'Final package size:'
(Get-Item build/app.zip).Length
