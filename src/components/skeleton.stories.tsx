import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: "h-4 w-48",
  },
};

export const AllStates = () => (
  <div className="flex flex-col gap-4">
    <div className="space-y-2">
      <p className="text-fg-muted text-xs font-medium">Text lines</p>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
    </div>

    <div className="space-y-2">
      <p className="text-fg-muted text-xs font-medium">Avatar + text</p>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <p className="text-fg-muted text-xs font-medium">Card</p>
      <div className="border-border space-y-3 border p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  </div>
);

export const CardPreview = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 shrink-0" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-11/12" />
      <Skeleton className="h-3.5 w-3/4" />
    </div>
  </div>
);

export const RenderTest: Story = {
  args: {
    className: "h-4 w-48",
  },
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');
    await expect(skeleton).toBeInTheDocument();
  },
};
