import { Tabs } from "../../components/tabs";

export default () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-4 text-sm font-medium">Two Tabs</h3>
      <Tabs defaultValue="tab1" className="max-w-sm">
        <Tabs.List>
          <Tabs.Trigger value="tab1">First</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">
          <div className="text-fg-muted p-4 text-sm">First tab content</div>
        </Tabs.Content>
        <Tabs.Content value="tab2">
          <div className="text-fg-muted p-4 text-sm">Second tab content</div>
        </Tabs.Content>
      </Tabs>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">With Disabled Tab</h3>
      <Tabs defaultValue="enabled1" className="max-w-md">
        <Tabs.List>
          <Tabs.Trigger value="enabled1">Enabled</Tabs.Trigger>
          <Tabs.Trigger value="disabled" disabled>
            Disabled
          </Tabs.Trigger>
          <Tabs.Trigger value="enabled2">Also Enabled</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="enabled1">
          <div className="text-fg-muted p-4 text-sm">First enabled tab</div>
        </Tabs.Content>
        <Tabs.Content value="enabled2">
          <div className="text-fg-muted p-4 text-sm">Second enabled tab</div>
        </Tabs.Content>
      </Tabs>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Many Tabs</h3>
      <Tabs defaultValue="t1" className="max-w-lg">
        <Tabs.List>
          <Tabs.Trigger value="t1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="t2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="t3">Tab 3</Tabs.Trigger>
          <Tabs.Trigger value="t4">Tab 4</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="t1">
          <div className="text-fg-muted p-4 text-sm">Content 1</div>
        </Tabs.Content>
        <Tabs.Content value="t2">
          <div className="text-fg-muted p-4 text-sm">Content 2</div>
        </Tabs.Content>
        <Tabs.Content value="t3">
          <div className="text-fg-muted p-4 text-sm">Content 3</div>
        </Tabs.Content>
        <Tabs.Content value="t4">
          <div className="text-fg-muted p-4 text-sm">Content 4</div>
        </Tabs.Content>
      </Tabs>
    </div>
  </div>
);
