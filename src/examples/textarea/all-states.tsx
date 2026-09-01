import { Label } from "../../components/label";

import { Textarea } from "../../components/textarea";

const args = {};

const render = () => (
  <div className="flex max-w-sm flex-col gap-4">
    <div className="space-y-1.5">
      <Label htmlFor="textarea-normal">Normal</Label>
      <Textarea id="textarea-normal" placeholder="Normal textarea" />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="textarea-disabled">Disabled</Label>
      <Textarea id="textarea-disabled" placeholder="Disabled textarea" disabled />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="textarea-readonly">Read Only</Label>
      <Textarea id="textarea-readonly" value="Read-only content" readOnly />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="textarea-invalid">Invalid</Label>
      <Textarea id="textarea-invalid" placeholder="Invalid textarea" aria-invalid={true} />
    </div>
  </div>
);

export default function Example() {
  return render();
}
