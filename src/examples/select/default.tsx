import { Label } from "../../components/label";

import { Select } from "../../components/select";

const args = {};

const render = () => (
  <div className="w-full">
    <Select>
      <Select.Trigger aria-label="Select a fruit">
        <Select.Value placeholder="Select a fruit" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="orange">Orange</Select.Item>
        <Select.Item value="grape">Grape</Select.Item>
      </Select.Content>
    </Select>
  </div>
);

export default function Example() {
  return render();
}
