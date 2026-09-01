import { Card } from "../../components/card";

export default () => (
  <div className="flex flex-wrap items-start gap-6">
    {(["flat", "shade", "overlay"] as const).map((e) => (
      <Card key={e} elevation={e} className="w-52">
        <Card.Header>
          <Card.Title>acme-web</Card.Title>
          <Card.Description>{e}</Card.Description>
        </Card.Header>
      </Card>
    ))}
  </div>
);
