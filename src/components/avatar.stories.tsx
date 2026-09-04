import type { Meta, StoryObj } from "@storybook/react-vite";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
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

// Kept separate — a distinct async concern, and the deletion trigger for the
// old #291 hydration guard. `Avatar.Image` used to defer rendering until after
// mount because Radix's `useIsHydrated` (via `useSyncExternalStore`) returned
// true during React 19 client hydration, so a cached image rendered <img> where
// the server had rendered the fallback <span>. @radix-ui/react-avatar 1.2.6 no
// longer uses that mechanism — the loading status is a plain `useState("idle")`,
// identical on the server and on the first client render — so the guard is gone.
// This story is what fails if a future Radix bump brings the mismatch back.
//
// Uses an inline data: image (not a network URL) so the load is deterministic —
// no race between the fetch and the assertion.
const INLINE_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const SsrHydrationTest: Story = {
  tags: ["!autodocs"],
  render: () => <div data-testid="ssr-host" />,
  play: async ({ canvasElement }) => {
    const tree = (
      <Avatar>
        <Avatar.Image src={INLINE_PNG} alt="@beaket" />
        <Avatar.Fallback>HG</Avatar.Fallback>
      </Avatar>
    );

    // Warm the browser cache, so the image is `complete` at hydration time —
    // the exact condition #291 needed to reproduce.
    await new Promise<void>((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve();
      probe.onerror = () => resolve();
      probe.src = INLINE_PNG;
    });

    const host = within(canvasElement).getByTestId("ssr-host");
    host.innerHTML = renderToString(tree);

    // The server renders the fallback, never the <img>.
    await expect(host.querySelector("[data-slot='avatar-fallback']")).toBeInTheDocument();
    await expect(host.querySelector("[data-slot='avatar-image']")).not.toBeInTheDocument();

    const recovered: unknown[] = [];
    const root = hydrateRoot(host, tree, {
      onRecoverableError: (error) => recovered.push(error),
    });

    // After hydration the image takes over…
    await waitFor(
      () => {
        expect(host.querySelector("[data-slot='avatar-image']")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // …and React recovered from nothing on the way there.
    await expect(recovered).toEqual([]);

    root.unmount();
  },
};
