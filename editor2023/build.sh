#!/usr/bin/env bash
set -eo pipefail

# Clean
rm -rf build
mkdir build

# Validate
virtual/bin/python build.py validate

# Bundle
node_modules/.bin/rollup -f iife -o build/app.js --no-freeze out/app.js

# Optimize
node_modules/.bin/terser -cmo build/app.opt.js --comments false build/app.js
node_modules/.bin/cleancss -O1 -o build/app.opt.css out/app.css

cat <<END >build/options.json
{
  "collapseWhitespace": true,
  "removeAttributeQuotes": true,
  "removeComments": true
}
END
node_modules/.bin/html-minifier-terser -c build/options.json -o build/index.html out/index.html

# Package
virtual/bin/python build.py inline
zip -jX9 build/app.zip build/index.html
# brew install advancecomp
advzip -z4 build/app.zip
# https://github.com/fhanau/Efficient-Compression-Tool
ect -10009 -zip build/app.zip

echo Final package size:
wc -c build/app.zip
