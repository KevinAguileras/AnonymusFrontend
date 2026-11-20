#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ -x .tools/node/bin/node ]]; then
  export PATH="$PWD/.tools/node/bin:$PATH"
fi
if [[ -z "${CHROME_BIN:-}" && -x .tools/chromium/chrome ]]; then
  export CHROME_BIN="$PWD/.tools/chromium/chrome"
fi
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(major<22 || (major===22 && minor<12)) {console.error("Este frontend requiere Node >=22.12; se recomienda Node 24."); process.exit(1)}'
if [[ ! -d node_modules ]]; then
  echo 'Primero instala dependencias con Node 24: npm ci' >&2
  exit 1
fi
if [[ $# -eq 0 ]]; then set -- dev; fi
exec npm run "$@"
