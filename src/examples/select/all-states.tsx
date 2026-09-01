import { Label } from "../../components/label";

import { Select } from "../../components/select";

const args = {};

const render = () => (
  <div className="flex max-w-sm flex-col gap-4">
    <div className="space-y-1.5">
      <Label htmlFor="select-normal">Normal</Label>
      <Select>
        <Select.Trigger id="select-normal">
          <Select.Value placeholder="Normal select" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="1">Option 1</Select.Item>
          <Select.Item value="2">Option 2</Select.Item>
        </Select.Content>
      </Select>
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="select-disabled">Disabled</Label>
      <Select disabled>
        <Select.Trigger id="select-disabled">
          <Select.Value placeholder="Disabled select" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="1">Option 1</Select.Item>
        </Select.Content>
      </Select>
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="select-invalid">Invalid</Label>
      <Select>
        <Select.Trigger id="select-invalid" aria-invalid={true}>
          <Select.Value placeholder="Invalid select" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="1">Option 1</Select.Item>
        </Select.Content>
      </Select>
    </div>
  </div>
);

export default function Example() {
  return render();
}
