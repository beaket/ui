import { Label } from "../../components/label";

import { Textarea } from "../../components/textarea";

const args = {
  placeholder: "Type something...",
  disabled: false,
  autoResize: true,
  rows: 4,
};

export default function Example() {
  return <Textarea {...args} />;
}
