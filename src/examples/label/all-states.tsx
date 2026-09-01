import { Checkbox } from "../../components/checkbox";

import { Input } from "../../components/input";

import { Label } from "../../components/label";

const args = {};

const render = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2">
      <Checkbox id="terms-1" />
      <Label htmlFor="terms-1">Default label with checkbox</Label>
    </div>
    <div className="flex max-w-sm flex-col gap-1.5">
      <Label htmlFor="input-1">Label with input</Label>
      <Input id="input-1" placeholder="Type here..." />
    </div>
    <div className="flex max-w-sm flex-col gap-1.5">
      <Label htmlFor="input-required">
        Required field
        <span className="text-danger-fg ml-1">*</span>
      </Label>
      <Input id="input-required" required placeholder="Required" />
    </div>
  </div>
);

export default function Example() {
  return render();
}
