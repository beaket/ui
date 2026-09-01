import { Card } from "../../components/card";

const render = () => (
  <Card elevation="shade" interactive={false} className="max-w-sm">
    <Card.Header>
      <Card.Title>acme-web</Card.Title>
      <Card.Description>Marketing site and docs, deployed on the edge.</Card.Description>
    </Card.Header>
    <Card.Content>
      <p className="text-fg-muted text-sm">
        Deploys run on every push to <code>main</code>. Nothing else to configure.
      </p>
    </Card.Content>
  </Card>
);

export default function Example() {
  return render();
}
