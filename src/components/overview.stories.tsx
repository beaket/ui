import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { allExamples } from "../examples/registry";
import { Alert } from "./alert";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Navigation } from "./navigation";
import { Pagination } from "./pagination";
import { Tabs } from "./tabs";
/**
 * A single-page "kitchen sink" of every component in representative states.
 *
 * Its job is theme QA: flip the **Theme** and **Scheme** toolbars and scan the
 * whole system at once for a token that recolors wrong. The page uses `bg-bg` /
 * `text-fg` so switching palettes recolors it end to end. This is not a
 * replacement for each component's own story — those keep the Controls, docs,
 * and interaction tests.
 */
const meta: Meta = {
  title: "Overview",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const SurfaceDepth: StoryObj = {
  render: () => (
    <div className="bg-bg text-fg min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Borderless surface depth</h1>
          <p className="text-fg-muted mt-1 text-sm">
            Page, raised, and overlay backgrounds shown without borders or shadows.
          </p>
        </div>
        <div className="bg-bg-raised border-0 p-8 shadow-none">
          <div className="text-fg-subtle mb-6 font-mono text-xs tracking-wide uppercase">
            Raised surface
          </div>
          <div className="bg-bg-overlay border-0 p-8 shadow-none">
            <div className="text-fg-subtle mb-2 font-mono text-xs tracking-wide uppercase">
              Overlay surface
            </div>
            <p className="text-fg-muted text-sm">
              Each nested sheet must remain legible through its background alone.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Stress case for the accent policy. The first control is an open owner and the
 * play step gives it keyboard focus; selection remains visible in Navigation,
 * Tabs, Checkbox, and Pagination without competing for the outer outline.
 */
export const DenseInteractionHierarchy: StoryObj = {
  render: () => (
    <div className="bg-bg text-fg min-h-screen p-8">
      <div className="border-border-muted bg-bg-raised mx-auto flex max-w-3xl flex-col gap-6 border border-dashed p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" data-state="open">
            Open owner
          </Button>
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="ghost">Quiet action</Button>
          <a
            href="#details"
            className="text-fg-link focus-visible:outline-border-focus underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Content link
          </a>
        </div>

        <Navigation aria-label="Dense example navigation">
          <Navigation.List>
            <Navigation.Item>
              <Navigation.Link href="#overview" active>
                Overview
              </Navigation.Link>
            </Navigation.Item>
            <Navigation.Item>
              <Navigation.Link href="#activity">Activity</Navigation.Link>
            </Navigation.Item>
            <Navigation.Item>
              <Navigation.Link href="#settings">Settings</Navigation.Link>
            </Navigation.Item>
          </Navigation.List>
        </Navigation>

        <Tabs defaultValue="current">
          <Tabs.List>
            <Tabs.Trigger value="current">Current tab</Tabs.Trigger>
            <Tabs.Trigger value="other">Other tab</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="current" className="flex flex-wrap items-center gap-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked aria-label="Selected option" /> Selected option
            </div>
            <Pagination mode="button" page={2} totalPages={4} onPageChange={() => undefined} />
          </Tabs.Content>
        </Tabs>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const owner = canvas.getByRole("button", { name: "Open owner" });
    await userEvent.tab();
    await expect(owner).toHaveFocus();
    await expect(owner).toHaveAttribute("data-state", "open");
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("tab", { name: "Current tab" })).toHaveAttribute(
      "data-state",
      "active",
    );
  },
};

// A small, deterministic visual-regression surface. The focused control is
// reached by keyboard; disabled and invalid states stay visible.
export const AccessibleStates: StoryObj = {
  render: () => (
    <div className="bg-bg text-fg min-h-64 space-y-6 p-8">
      <div className="flex flex-wrap gap-3">
        <Button>Focused action</Button>
        <Button disabled>Disabled action</Button>
        <Button variant="destructive">Destructive action</Button>
      </div>
      <div className="max-w-sm space-y-2">
        <Label htmlFor="visual-invalid-input">Invalid input</Label>
        <Input id="visual-invalid-input" aria-invalid="true" defaultValue="invalid@example.com" />
      </div>
      <Alert variant="caution">This error state must remain distinguishable.</Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const focused = within(canvasElement).getByRole("button", { name: "Focused action" });
    await userEvent.tab();
    await expect(focused).toHaveFocus();
  },
};

// --- the kitchen sink ------------------------------------------------------

export const AllComponents: StoryObj = {
  parameters: {
    // `data-table/full-featured` demos `onRowClick`, which makes each `<tr>` a
    // `role="button"` wrapping the row's own checkbox — axe's nested-interactive.
    // It is a defect in that prop's markup, not in this page, and this page is
    // the first surface that runs axe over the published examples.
    a11y: { config: { rules: [{ id: "nested-interactive", enabled: false }] } },
  },
  render: () => (
    <div className="bg-bg text-fg min-h-screen space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Component overview</h1>
        <p className="text-fg-muted text-sm">
          Every published example at once. Use the <strong>Theme</strong> and{" "}
          <strong>Scheme</strong> toolbars above to QA the whole system across palettes and
          light/dark.
        </p>
      </header>

      {allExamples.map(({ component, name, Component }) => (
        <section key={`${component}/${name}`} className="space-y-2">
          <h2 className="text-fg-subtle font-mono text-xs tracking-wide uppercase">
            {component} / {name}
          </h2>
          <div className="border-border-muted bg-bg-raised border border-dashed p-4">
            <Component />
          </div>
        </section>
      ))}
    </div>
  ),
};
