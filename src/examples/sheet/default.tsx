import { useState } from "react";

import { Button } from "../../components/button";

import { Sheet } from "../../components/sheet";

const args = {
  trigger: <Button>Open Sheet</Button>,
  children: (
    <>
      <Sheet.Header>
        <Sheet.Title>Sheet Title</Sheet.Title>
        <Sheet.Description>
          This is a sheet description that provides additional context.
        </Sheet.Description>
      </Sheet.Header>
      <div className="py-4">
        <p className="text-fg-muted text-sm">Sheet content goes here.</p>
      </div>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Cancel</Button>
        </Sheet.Close>
        <Button>Save</Button>
      </Sheet.Footer>
    </>
  ),
};

export default function Example() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Sheet {...args} />
    </div>
  );
}
