import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Avatar } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// The default — an image with a fallback. The image, fallback, single-letter,
// and shadow variants are shown together in AllStates; sizing in CustomSizes.
export const Default: Story = {
  render: () => (
    <Avatar>
      <Avatar.Image src="https://github.com/beaket.png" alt="@beaket" />
      <Avatar.Fallback>BK</Avatar.Fallback>
    </Avatar>
  ),
};

// Compositions for docs
export const AllStates = () => (
  <div className="flex items-center gap-4">
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Image src="https://github.com/beaket.png" alt="@beaket" />
        <Avatar.Fallback>BK</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">With Image</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">Fallback</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>A</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">Single Letter</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar shadow>
        <Avatar.Fallback>SH</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">Shadow</span>
    </div>
  </div>
);

export const CustomSizes = () => (
  <div className="flex items-end gap-4">
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-6">
        <Avatar.Fallback className="text-xs">XS</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">24px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-8">
        <Avatar.Fallback className="text-sm">SM</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">32px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">40px (default)</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-12">
        <Avatar.Fallback className="text-lg">LG</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">48px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-16">
        <Avatar.Fallback className="text-xl">XL</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">64px</span>
    </div>
  </div>
);

export const AvatarGroup = () => (
  <div className="flex gap-2">
    <Avatar>
      <Avatar.Fallback>BK</Avatar.Fallback>
    </Avatar>
    <Avatar>
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar>
    <Avatar>
      <Avatar.Fallback>AB</Avatar.Fallback>
    </Avatar>
    <Avatar>
      <Avatar.Fallback>+3</Avatar.Fallback>
    </Avatar>
  </div>
);

// One consolidated test — folds the deterministic paths: fallback renders,
// a broken image falls back, and the shadow prop + data-slot land on the root.
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <div className="flex gap-4">
      <div data-testid="fallback-avatar">
        <Avatar>
          <Avatar.Fallback>FB</Avatar.Fallback>
        </Avatar>
      </div>
      <div data-testid="broken-avatar">
        <Avatar>
          <Avatar.Image src="/broken-image.jpg" alt="User" />
          <Avatar.Fallback>BR</Avatar.Fallback>
        </Avatar>
      </div>
      <div data-testid="shadow-avatar">
        <Avatar shadow>
          <Avatar.Fallback>SH</Avatar.Fallback>
        </Avatar>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fallback renders
    await expect(within(canvas.getByTestId("fallback-avatar")).getByText("FB")).toBeInTheDocument();

    // A broken image falls back to the initials
    await expect(within(canvas.getByTestId("broken-avatar")).getByText("BR")).toBeInTheDocument();

    // Shadow prop + data-slot land on the avatar root
    const shadowAvatar = canvas.getByTestId("shadow-avatar").querySelector("[data-slot='avatar']");
    await expect(shadowAvatar).toBeInTheDocument();
    await expect(shadowAvatar).toHaveAttribute("data-slot", "avatar");
    await expect(shadowAvatar).toHaveClass("shadow-offset");
  },
};

// Kept separate — a distinct async concern: Avatar.Image defers rendering until
// after mount (hydration guard), so the image element only appears once mounted
// and loaded. Uses an inline data: image (not a network URL) so the load is
// deterministic — no race between the fetch and the assertion.
const INLINE_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const HydrationGuardTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Avatar>
      <Avatar.Image src={INLINE_PNG} alt="@beaket" />
      <Avatar.Fallback>HG</Avatar.Fallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    // The image element only exists after the hydration guard clears (it renders
    // client-side, post-mount) and the inline image loads.
    await waitFor(
      () => {
        const img = canvasElement.querySelector("[data-slot='avatar-image']");
        expect(img).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};
