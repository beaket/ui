import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    elevation: { control: "select", options: ["flat", "shade", "overlay"] },
    interactive: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A surface, not a template. The Card's identity is its material — square corners, a single-ink border, and the drawn grey offset shade that marks a raised surface — and it imposes no structure: pour any content in. `elevation` sets how it lifts (flat / shade / overlay); `interactive` turns the whole card into a pressable link that carries the accent edge. Header / Title / Description / Action / Content / Footer and Section are optional layout helpers, never required anatomy.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { elevation: "shade", interactive: false },
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <Card.Header>
        <Card.Title>acme-web</Card.Title>
        <Card.Description>Marketing site and docs, deployed on the edge.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-fg-muted text-sm">
          Deploys run on every push to <code>main</code>. Nothing else to configure.
        </p>
      </Card.Content>
    </Card>
  ),
};

export const Elevation = () => (
  <div className="flex flex-wrap items-start gap-6">
    {(["flat", "shade", "overlay"] as const).map((e) => (
      <Card key={e} elevation={e} className="w-52">
        <Card.Header>
          <Card.Title>acme-web</Card.Title>
          <Card.Description>{e}</Card.Description>
        </Card.Header>
      </Card>
    ))}
  </div>
);

export const Interactive = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <Card asChild interactive>
      <a href="#acme-web">
        <Card.Header>
          <Card.Title>acme-web</Card.Title>
          <Card.Description>Open the project — the whole card is the link.</Card.Description>
        </Card.Header>
      </a>
    </Card>
    <p className="text-fg-muted text-sm">
      Hover to reveal the accent edge; press to drop the card onto it.
    </p>
  </div>
);

// The same frame every time — only the children change. That is the flexibility:
// identity in the material, content free.
export const AnyContent = () => (
  <div className="grid max-w-3xl grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
    <Card>
      <div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">1.28M</div>
        <div className="text-fg-subtle mt-1 text-xs tracking-wide uppercase">
          requests · this month
        </div>
      </div>
    </Card>

    <Card>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-fg-muted">Plan</dt>
          <dd>Team</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fg-muted">Seats</dt>
          <dd className="tabular-nums">12</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fg-muted">Region</dt>
          <dd>iad1</dd>
        </div>
      </dl>
    </Card>

    <Card>
      <div className="flex items-center gap-3">
        <div className="bg-bg-emphasis text-fg-on-emphasis grid size-11 place-items-center font-semibold">
          J
        </div>
        <div>
          <div className="font-semibold">Jin Ma</div>
          <div className="text-fg-muted text-sm">Maintainer</div>
        </div>
      </div>
    </Card>

    <Card>
      <Card.Section>
        <div
          aria-hidden="true"
          className="bg-bg-hover text-fg flex h-24 items-center justify-center text-xs tracking-wide uppercase"
        >
          figure
        </div>
      </Card.Section>
      <div>
        <div className="font-semibold">Elevation, drawn</div>
        <div className="text-fg-muted text-sm">Depth without light.</div>
      </div>
    </Card>

    <Card>
      <blockquote className="text-sm">
        <p>&ldquo;Ink is never diluted, only rationed.&rdquo;</p>
        <footer className="text-fg-subtle mt-2 text-xs tracking-wide uppercase">
          Ink &amp; Instrument
        </footer>
      </blockquote>
    </Card>

    <Card>
      <div className="text-fg-subtle text-center">
        <div className="text-border font-mono text-2xl">&empty;</div>
        <div className="mt-1 text-sm">No projects yet</div>
      </div>
    </Card>
  </div>
);

export const InteractionTest: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card data-testid="surface" className="max-w-sm">
        <Card.Header>
          <Card.Title data-testid="title">acme-web</Card.Title>
          <Card.Description data-testid="desc">Edge-deployed.</Card.Description>
        </Card.Header>
        <Card.Content data-testid="content">Ready on main.</Card.Content>
      </Card>
      <Card asChild interactive>
        <a href="#open" data-testid="link">
          <Card.Title>Open acme-web</Card.Title>
        </a>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const surface = canvas.getByTestId("surface");
    await expect(surface).toBeInTheDocument();
    await expect(surface).toHaveAttribute("data-slot", "card");

    await expect(canvas.getByTestId("title")).toHaveTextContent("acme-web");
    await expect(canvas.getByTestId("desc")).toHaveTextContent("Edge-deployed.");
    await expect(canvas.getByTestId("content")).toHaveTextContent("Ready on main.");

    // An interactive card renders as a real, focusable link (asChild).
    const link = canvas.getByTestId("link");
    await expect(link.tagName).toBe("A");
    link.focus();
    await expect(link).toHaveFocus();
  },
};
