import { Button } from "../../../src/components/button";
import { Checkbox } from "../../../src/components/checkbox";
import { Navigation } from "../../../src/components/navigation";
import { Pagination } from "../../../src/components/pagination";
import { Tabs } from "../../../src/components/tabs";

/**
 * A static, server-rendered specimen of the dense state composition used for
 * theme QA in the Overview story. The focus outline is pinned with the same
 * utilities that `focus-visible` applies so all three channels remain visible
 * in a non-interactive documentation snapshot.
 */
export function AccentStateDemo() {
  return (
    <div className="border-border-muted bg-bg-raised flex flex-col gap-5 border border-dashed p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col items-start gap-2">
          <span className="text-fg-subtle font-mono text-xs tracking-wide uppercase">
            Keyboard focus + open owner
          </span>
          <Button
            variant="outline"
            data-state="open"
            className="outline-border-focus outline-2 outline-offset-2"
          >
            Filters open
          </Button>
        </div>
        <div className="flex flex-col items-start gap-2">
          <span className="text-fg-subtle font-mono text-xs tracking-wide uppercase">
            Neutral at rest
          </span>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <Navigation aria-label="State hierarchy example navigation">
        <Navigation.List>
          <Navigation.Item>
            <Navigation.Link href="#state-composition" active>
              Overview
            </Navigation.Link>
          </Navigation.Item>
          <Navigation.Item>
            <Navigation.Link href="#state-precedence">Activity</Navigation.Link>
          </Navigation.Item>
          <Navigation.Item>
            <Navigation.Link href="#component-families">Settings</Navigation.Link>
          </Navigation.Item>
        </Navigation.List>
      </Navigation>

      <Tabs defaultValue="current">
        <Tabs.List>
          <Tabs.Trigger value="current">Current tab</Tabs.Trigger>
          <Tabs.Trigger value="other">Other tab</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="current" className="flex flex-wrap items-center gap-5 py-3">
          <label className="text-fg flex items-center gap-2 text-sm">
            <Checkbox defaultChecked aria-label="Selected option" /> Selected option
          </label>
          <Pagination mode="button" page={2} totalPages={4} onPageChange={() => undefined} />
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
