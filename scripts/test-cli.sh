#!/bin/bash
set -e

# Build CLI first
pnpm --filter @beaket/ui build

CLI="node $(pwd)/packages/cli/dist/index.js"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT
cd "$TEMP_DIR"

echo '{"name":"test","devDependencies":{"typescript":"6.0.3"}}' > package.json
echo '{"compilerOptions":{"paths":{"@/*":["./*"]}}}' > tsconfig.json

# Test init
$CLI init -y
test -f beaket.ui.json
if grep -q '"\$schema"' beaket.ui.json; then
  echo 'unexpected $schema in beaket.ui.json'
  exit 1
fi

# Test single component add
$CLI add button --latest
test -f components/ui/button.tsx
grep -q "clsx" package.json

# Test multiple components add
$CLI add alert label input --latest
test -f components/ui/alert.tsx
test -f components/ui/label.tsx
test -f components/ui/input.tsx

echo "CLI tests passed"
