import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { SidebarLayout } from "./sidebar-layout";

const meta: Meta<typeof SidebarLayout> = {
  title: "Components/SidebarLayout",
  component: SidebarLayout,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SidebarLayout>;

export const Default = () => (
  <SidebarLayout>
    <SidebarLayout.Content>
      <div className="border-chrome bg-paper border p-6">
        <h2 className="text-sm font-medium">Main Content</h2>
        <p className="text-steel mt-2 text-sm">
          This area takes up the remaining space and shrinks as needed.
        </p>
      </div>
    </SidebarLayout.Content>
    <SidebarLayout.Sidebar>
      <div className="border-chrome bg-paper border p-4">
        <h3 className="text-sm font-medium">Sidebar</h3>
        <p className="text-steel mt-2 text-sm">
          Fixed width on desktop (280px), full width on mobile.
        </p>
      </div>
    </SidebarLayout.Sidebar>
  </SidebarLayout>
);

export const WithMultipleSidebarSections = () => (
  <SidebarLayout>
    <SidebarLayout.Content>
      <div className="border-chrome bg-paper space-y-4 border p-6">
        <h2 className="text-sm font-medium">Document Content</h2>
        <p className="text-steel text-sm">Primary content area with full available width.</p>
        <div className="bg-frost h-32" />
      </div>
    </SidebarLayout.Content>
    <SidebarLayout.Sidebar>
      <div className="border-chrome bg-paper border p-4">
        <h3 className="text-steel text-xs font-medium uppercase">Details</h3>
        <p className="mt-2 text-sm">Section one</p>
      </div>
      <div className="border-chrome bg-paper border p-4">
        <h3 className="text-steel text-xs font-medium uppercase">Related</h3>
        <p className="mt-2 text-sm">Section two</p>
      </div>
    </SidebarLayout.Sidebar>
  </SidebarLayout>
);

export const AllStates = () => (
  <div className="flex flex-col gap-6">
    <div>
      <p className="text-steel mb-2 text-xs font-medium">Basic layout</p>
      <SidebarLayout>
        <SidebarLayout.Content>
          <div className="border-chrome border p-4 text-sm">Content</div>
        </SidebarLayout.Content>
        <SidebarLayout.Sidebar>
          <div className="border-chrome border p-4 text-sm">Sidebar</div>
        </SidebarLayout.Sidebar>
      </SidebarLayout>
    </div>
  </div>
);

export const RenderTest: Story = {
  render: () => (
    <SidebarLayout>
      <SidebarLayout.Content>
        <div>Content area</div>
      </SidebarLayout.Content>
      <SidebarLayout.Sidebar>
        <div>Sidebar area</div>
      </SidebarLayout.Sidebar>
    </SidebarLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Content area")).toBeInTheDocument();
    await expect(canvas.getByText("Sidebar area")).toBeInTheDocument();
  },
};
