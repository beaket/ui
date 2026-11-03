import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import AllStatesExample from "../examples/progress/all-states";
import DefaultExample from "../examples/progress/default";
import { Progress } from "./progress";

export default { title: "UI/Progress", component: Progress, tags: ["autodocs"] } satisfies Meta<
  typeof Progress
>;
type Story = StoryObj<typeof Progress>;
export const Default: Story = { render: () => <DefaultExample /> };
export const AllStates: Story = { render: () => <AllStatesExample /> };

function ProgressExample() {
  const [value, setValue] = useState<number | null>(50);
  return (
    <div className="space-y-4">
      <Progress value={value} max={200} aria-label="Upload">
        <Progress.Indicator data-testid="fill" />
      </Progress>
      <button onClick={() => setValue(200)}>Complete</button>
      <button onClick={() => setValue(null)}>Unknown</button>
      <Progress value={Number.NaN} max={0} aria-label="Invalid data" />
    </div>
  );
}
export const ValueContract: Story = {
  render: () => <ProgressExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("progressbar", { name: "Upload" });
    const fill = canvas.getByTestId("fill");
    await expect(root).toHaveAttribute("aria-valuenow", "50");
    await expect(root).toHaveAttribute("aria-valuemax", "200");
    await expect(root.style.getPropertyValue("--progress-scale")).toBe("0.25");
    await expect(getComputedStyle(fill).transform).toBe("matrix(0.25, 0, 0, 1, 0, 0)");
    await userEvent.click(canvas.getByRole("button", { name: "Complete" }));
    await expect(root).toHaveAttribute("data-state", "complete");
    await expect(root.style.getPropertyValue("--progress-scale")).toBe("1");
    await userEvent.click(canvas.getByRole("button", { name: "Unknown" }));
    await expect(root).not.toHaveAttribute("aria-valuenow");
    await expect(root).toHaveAttribute("data-state", "indeterminate");
    await expect(canvas.getByRole("progressbar", { name: "Invalid data" })).not.toHaveAttribute(
      "aria-valuenow",
    );
  },
};

/** Style rules nested inside `@media (prefers-reduced-motion: reduce)` in the loaded stylesheets. */
function reducedMotionRules() {
  const rules: CSSStyleRule[] = [];
  const walk = (list: CSSRuleList, reduced: boolean) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, reduced || rule.conditionText.includes("prefers-reduced-motion"));
      } else if (rule instanceof CSSStyleRule) {
        if (reduced) rules.push(rule);
        if (rule.cssRules.length) walk(rule.cssRules, reduced);
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, reduced);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules, false);
    } catch {
      // Cross-origin sheets cannot be read; component styles are same-origin.
    }
  }
  return rules;
}

/**
 * Under `prefers-reduced-motion: reduce` an indeterminate indicator stops
 * sweeping and holds a full, static line across the track, so it reads as
 * "working" rather than "a third done". The test runner does not emulate the
 * media feature, so the check asserts that the indicator carries the
 * reduced-motion utilities and that the stylesheet compiles them inside the
 * media query.
 */
export const ReducedMotion: Story = {
  render: () => (
    <Progress value={null} aria-label="Loading">
      <Progress.Indicator data-testid="fill" />
    </Progress>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("progressbar", { name: "Loading" });
    const fill = canvas.getByTestId("fill");
    await expect(root).toHaveAttribute("data-state", "indeterminate");
    await expect(fill).toHaveClass(
      "data-[state=indeterminate]:motion-reduce:w-full",
      "motion-reduce:animate-none",
    );

    const rules = reducedMotionRules();
    const ruleFor = (utility: string) =>
      rules.find((rule) => rule.selectorText.includes(`.${CSS.escape(utility)}`));
    await expect(ruleFor("data-[state=indeterminate]:motion-reduce:w-full")?.style.width).toBe(
      "100%",
    );
    await expect(ruleFor("motion-reduce:animate-none")?.style.animationName).toBe("none");
    // The root sets --progress-scale to 1 while indeterminate, so scaleX does not collapse the line.
    await expect(root.style.getPropertyValue("--progress-scale")).toBe("1");
  },
};
