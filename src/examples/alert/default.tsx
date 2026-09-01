import { Alert } from "../../components/alert";

const args = {
  children: "This is a note providing additional information.",
};

export default function Example() {
  return <Alert {...args} />;
}
