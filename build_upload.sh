#!/usr/bin/env bash
set -eo pipefail

(cd super2023 && ./build.sh)
(cd editor2023 && ./build.sh)

mv super2023/build/index.html index.html
mv editor2023/build/index.html editor.html
