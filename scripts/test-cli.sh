#!/bin/bash
set -e

# Build CLI first
pnpm --filter @beaket/ui build

CLI="node $(pwd)/packages/cli/dist/index.js"
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo '{"name":"test"}' > package.json
echo '{"compilerOptions":{"paths":{"@/*":["./*"]}}}' > tsconfig.json

$CLI init -y
$CLI add button

test -f beaket.ui.json
test -f components/ui/button.tsx
grep -q "clsx" package.json

rm -rf "$TEMP_DIR"
echo "CLI tests passed"
