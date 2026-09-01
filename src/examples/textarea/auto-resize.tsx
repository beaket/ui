import { Label } from "../../components/label";

import { Textarea } from "../../components/textarea";

const args = {};

const render = () => (
  <div className="flex max-w-sm flex-col gap-4">
    <div className="space-y-1.5">
      <Label htmlFor="textarea-auto">Auto Resize (default)</Label>
      <Textarea
        id="textarea-auto"
        placeholder="Type multiple lines and watch it grow..."
        defaultValue={"Line 1\nLine 2\nLine 3"}
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="textarea-resizable">Auto Resize + Manual (resizable)</Label>
      <Textarea
        id="textarea-resizable"
        resizable
        placeholder="Grows with content — drag the handle to make it taller."
        defaultValue={"Line 1\nLine 2"}
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="textarea-fixed">Fixed Height (autoResize=false)</Label>
      <Textarea
        id="textarea-fixed"
        autoResize={false}
        resizable
        rows={4}
        placeholder="Fixed height with manual resize handle"
      />
    </div>
  </div>
);

export default function Example() {
  return render();
}
