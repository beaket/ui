import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "./button";
import { ErrorPage } from "./error-page";

const meta: Meta<typeof ErrorPage> = {
  title: "Components/ErrorPage",
  component: ErrorPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ErrorPage>;

export const Default: Story = {
  args: {
    code: 404,
    message: "The page you're looking for doesn't exist.",
  },
};

export const WithAction: Story = {
  args: {
    code: 404,
    message: "The page you're looking for doesn't exist.",
    action: (
      <Button variant="primary" size="lg">
        Go Home
      </Button>
    ),
  },
};

export const ServerError: Story = {
  args: {
    code: 500,
    message: "Something went wrong. Please try again later.",
    action: (
      <Button variant="outline" size="lg">
        Refresh
      </Button>
    ),
  },
};

export const Forbidden: Story = {
  args: {
    code: 403,
    message: "You don't have permission to access this resource.",
  },
};

export const AllStates = () => (
  <div className="flex flex-col gap-8">
    <div className="border-chrome h-[400px] border">
      <ErrorPage code={404} message="Page not found." />
    </div>
    <div className="border-chrome h-[400px] border">
      <ErrorPage
        code={500}
        message="Internal server error."
        action={<Button variant="outline">Retry</Button>}
      />
    </div>
  </div>
);

export const RenderTest: Story = {
  args: {
    code: 404,
    message: "Not Found",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("404")).toBeInTheDocument();
    await expect(canvas.getByText("Not Found")).toBeInTheDocument();
  },
};
