import { Alert } from "../../components/alert";

const args = {};

const render = () => (
  <div className="max-w-lg space-y-4">
    <Alert variant="note">
      <p>This is a note. Use it for general information.</p>
    </Alert>

    <Alert variant="tip">
      <p>This is a tip. Use it for helpful suggestions.</p>
    </Alert>

    <Alert variant="important">
      <p>This is important. Use it for key information.</p>
    </Alert>

    <Alert variant="warning">
      <p>This is a warning. Use it for cautionary messages.</p>
    </Alert>

    <Alert variant="caution">
      <p>This is caution. Use it for dangerous actions.</p>
    </Alert>
  </div>
);

export default function Example() {
  return render();
}
