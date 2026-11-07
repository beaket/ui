import { Card } from "../../components/card";

export const Elevation = () => (
  <div className="flex flex-wrap items-start gap-6">
    {(["hairline", "mat", "flat", "shade", "overlay"] as const).map((e) => (
      <Card key={e} elevation={e} className="w-52">
        <Card.Header>
          <Card.Title>acme-web</Card.Title>
          <Card.Description>{e}</Card.Description>
        </Card.Header>
      </Card>
    ))}
  </div>
);

export default () => (
  <div className="flex max-w-sm flex-col gap-3">
    <Card asChild interactive>
      <a href="#acme-web">
        <Card.Header>
          <Card.Title>acme-web</Card.Title>
          <Card.Description>Open the project — the whole card is the link.</Card.Description>
        </Card.Header>
      </a>
    </Card>
    <Card asChild interactive elevation="mat">
      <a href="#acme-docs">
        <Card.Header>
          <Card.Title>acme-docs</Card.Title>
          <Card.Description>The mount stays put while the shade changes voice.</Card.Description>
        </Card.Header>
      </a>
    </Card>
    <p className="text-fg-muted text-sm">
      Hover to turn the shade accent and grow it; press to drop the card onto it.
    </p>
  </div>
);
