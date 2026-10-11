#!/usr/bin/env bash
# Print a Claude Code run's outcome, cost, and the start of each denied command.
# claude-code-action hides Claude's output; this makes failures and missing permissions visible
# in the log and the job summary without rerunning. Usage: summarize-claude-run.sh <execution-file>
set -euo pipefail

jq -r '.[] | select(.type == "result") |
  "error: \(.is_error)  turns: \(.num_turns)  cost: $\(.total_cost_usd)",
  ((.permission_denials // [])
    | map(.tool_name + (if .tool_name == "Bash" then ": " + ((.tool_input.command // "") | gsub("\\s+"; " ") | .[0:80]) else "" end))
    | group_by(.) | map("denied \(length)x \(.[0])") | .[]),
  (if .is_error then .result else empty end)' "$1" | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"
