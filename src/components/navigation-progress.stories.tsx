import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { NavigationProgress } from "./navigation-progress";

const meta: Meta<typeof NavigationProgress> = {
  title: "UI/NavigationProgress",
  component: NavigationProgress,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof NavigationProgress>;

export const Default: Story = {
  args: {
    active: true,
  },
  render: (args) => (
    <div className="border-border bg-bg relative h-32 border">
      <NavigationProgress {...args} className="!relative" />
      <div className="p-6 pt-4">
        <p className="text-fg-muted text-sm">
          The progress bar animates at the top. In production it uses <code>fixed</code>{" "}
          positioning.
        </p>
      </div>
    </div>
  ),
};

export const Inactive: Story = {
  args: {
    active: false,
  },
};

export const AllStates = () => (
  <div className="border-border bg-bg relative h-32 border">
    <NavigationProgress active={true} className="!relative" />
    <div className="p-6 pt-4">
      <p className="text-fg-muted text-sm">
        Active state — the bar slides across the top of the container.
      </p>
    </div>
  </div>
);

export const Preview = () => (
  <div className="relative h-6">
    <NavigationProgress active={true} className="!relative" />
  </div>
);

export const RenderTest: Story = {
  args: {
    active: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toBeInTheDocument();
    await expect(progressbar).toHaveAttribute("aria-label", "Loading");
  },
};

export const InactiveRenderTest: Story = {
  args: {
    active: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.queryByRole("progressbar");
    await expect(progressbar).not.toBeInTheDocument();
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
 * Under `prefers-reduced-motion: reduce` the bar stops sweeping and fills the
 * whole track, so it reads as "working" rather than "a third done". The test
 * runner does not emulate the media feature, so the check asserts that the bar
 * carries the reduced-motion utilities and that the stylesheet compiles them
 * inside the media query.
 */
export const ReducedMotion: Story = {
  args: {
    active: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    const bar = progressbar.querySelector('[data-slot="navigation-progress-bar"]');
    await expect(bar).toHaveClass("motion-reduce:w-full", "motion-reduce:animate-none");

    const rules = reducedMotionRules();
    const ruleFor = (utility: string) =>
      rules.find((rule) => rule.selectorText.includes(`.${CSS.escape(utility)}`));
    await expect(ruleFor("motion-reduce:w-full")?.style.width).toBe("100%");
    await expect(ruleFor("motion-reduce:animate-none")?.style.animationName).toBe("none");
  },
};
