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

# outDir
$tsconfig = Get-Content -Path "tsconfig.json" -Raw | ConvertFrom-Json
$outDir = $tsconfig.compilerOptions.outDir
if ($null -eq $outDir) {
  throw 'Could not find the outDir in tsconfig.json.'
}

# Clean
git clean -fdx $outDir
Remove-Item build -Recurse -ErrorAction SilentlyContinue
if (Test-Path build -PathType Container) {
  throw 'Could not delete the build directory.'
}
$null = mkdir build

# Build
& $python build.py pictures
node_modules/.bin/tsc

# Michikoid
Get-ChildItem $outDir -Filter *.js -File -Recurse | ForEach-Object {
  node_modules/.bin/michikoid $_.FullName
}

# Validate
& $python build.py validate

# Bundle
node_modules/.bin/rollup -f iife -o build/app.js --no-freeze $outDir/app.js

# Optimize
node_modules/.bin/terser -cmo build/app.opt.js --comments false build/app.js
node_modules/.bin/cleancss -O1 -o build/app.opt.css $outDir/app.css

@'
{
  "collapseWhitespace": true,
  "removeAttributeQuotes": true,
  "removeComments": true
}
'@ | Set-Content build/options.json
node_modules/.bin/html-minifier-terser -c build/options.json -o build/index.html $outDir/index.html

# Roadroller
if ($args[0] -eq 'R1' -or $args[0] -eq 'R2') {
  if ($args[0] -eq 'R1') {
    $road_opt = '-O1'
  }
  else {
    $road_opt = '-O2'
  }
  Move-Item build/app.opt.js build/app.opt1.js
  node_modules/.bin/roadroller $road_opt -o build/app.opt.js -M256 -v build/app.opt1.js
}

# Package
& $python build.py inline
zip -jX9 build/app.zip build/index.html
# https://www.advancemame.it/download
advzip -z4 build/app.zip
# https://github.com/fhanau/Efficient-Compression-Tool
ect -10009 -zip build/app.zip

Write-Output 'Final package size:'
(Get-Item build/app.zip).Length
