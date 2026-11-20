import { styleText } from "node:util";

/**
 * `prompts` resolves with partial answers after Ctrl+C unless `onCancel`
 * stops the process, so every prompt passes this to avoid treating a cancel
 * as an answer.
 */
export function onCancel(): never {
  console.log(styleText("red", "Cancelled."));
  process.exit(1);
}
