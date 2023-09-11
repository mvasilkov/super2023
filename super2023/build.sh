#!/usr/bin/env bash
set -eo pipefail

# outDir
# brew install jq
out_dir=$(jq -r .compilerOptions.outDir tsconfig.json)

# Clean
git clean -fdx $out_dir
rm -rf build
mkdir build

# Build
virtual/bin/python build.py pictures
virtual/bin/python build.py levels
node_modules/.bin/tsc

# Michikoid
node_modules/.bin/michikoid $(find $out_dir -type f -name '*.js')

# Validate
virtual/bin/python build.py validate

# Bundle
node_modules/.bin/rollup -f iife -o build/app.js --no-freeze $out_dir/app.js

# Optimize
node_modules/.bin/terser -cm --mangle-props only_annotated -o build/app.opt.js --comments false build/app.js
node_modules/.bin/cleancss -O1 -o build/app.opt.css $out_dir/app.css

cat <<END >build/options.json
{
  "collapseWhitespace": true,
  "removeAttributeQuotes": true,
  "removeComments": true
}
END
node_modules/.bin/html-minifier-terser -c build/options.json -o build/index.html $out_dir/index.html

virtual/bin/python build.py manifest

# Roadroller
if [ "$1" = "R1" ] || [ "$1" = "R2" ]; then
  if [ "$1" = "R1" ]; then
    road_opt="-O1"
  else
    road_opt="-O2"
  fi
  mv build/app.opt.js build/app.opt1.js
  node_modules/.bin/roadroller $road_opt -o build/app.opt.js -M256 -v build/app.opt1.js
fi

# Package
virtual/bin/python build.py inline
zip -jX9 build/app.zip build/index.html build/app.json
# brew install advancecomp
advzip -z4 build/app.zip
# https://github.com/fhanau/Efficient-Compression-Tool
ect -10009 -zip build/app.zip

echo Final package size:
wc -c build/app.zip
