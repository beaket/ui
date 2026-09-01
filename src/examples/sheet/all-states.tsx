import { useState } from "react";

import { Button } from "../../components/button";

import { Sheet } from "../../components/sheet";

export default () => (
  <div className="flex flex-wrap gap-4">
    <Sheet trigger={<Button>Right (Default)</Button>}>
      <Sheet.Header>
        <Sheet.Title>Right Sheet</Sheet.Title>
        <Sheet.Description>Default position.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet side="left" trigger={<Button variant="outline">Left</Button>}>
      <Sheet.Header>
        <Sheet.Title>Left Sheet</Sheet.Title>
        <Sheet.Description>Slides from left.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet side="top" trigger={<Button variant="outline">Top</Button>}>
      <Sheet.Header>
        <Sheet.Title>Top Sheet</Sheet.Title>
        <Sheet.Description>Slides from top.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet side="bottom" trigger={<Button variant="outline">Bottom</Button>}>
      <Sheet.Header>
        <Sheet.Title>Bottom Sheet</Sheet.Title>
        <Sheet.Description>Slides from bottom.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet preventClose trigger={<Button variant="outline">Prevent Close</Button>}>
      <Sheet.Header>
        <Sheet.Title>Cannot Dismiss</Sheet.Title>
        <Sheet.Description>Must use buttons to close.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button>Got it</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet fullScreen side="left" trigger={<Button variant="success">Full Screen</Button>}>
      <Sheet.Header>
        <Sheet.Title>Full Screen Sheet</Sheet.Title>
        <Sheet.Description>Takes up full width.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>
  </div>
);
