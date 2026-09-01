#!/bin/bash
set -e

# Build CLI first
pnpm --filter @beaket/ui build

CLI="node $(pwd)/packages/cli/dist/index.js"
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo '{"name":"test"}' > package.json
echo '{"compilerOptions":{"paths":{"@/*":["./*"]}}}' > tsconfig.json

# Test init
$CLI init -y
test -f beaket.ui.json
! grep -q '"\$schema"' beaket.ui.json

# Test single component add
$CLI add button
test -f components/ui/button.tsx
grep -q "clsx" package.json

# Test multiple components add
$CLI add alert label input
test -f components/ui/alert.tsx
test -f components/ui/label.tsx
test -f components/ui/input.tsx

rm -rf "$TEMP_DIR"
echo "CLI tests passed"
