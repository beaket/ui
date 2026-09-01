import { Label } from "../../components/label";

import { Select } from "../../components/select";

const args = {};

const render = () => (
  <div className="max-w-sm space-y-1.5">
    <Label htmlFor="select-with-groups">Food category</Label>
    <Select>
      <Select.Trigger id="select-with-groups">
        <Select.Value placeholder="Select food" />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Fruits</Select.Label>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>Vegetables</Select.Label>
          <Select.Item value="carrot">Carrot</Select.Item>
          <Select.Item value="potato">Potato</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select>
  </div>
);

export default function Example() {
  return render();
}
