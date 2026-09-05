import { Card } from "../../components/card";

export const Elevation = () => (
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
export const Interactive = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <Card asChild interactive>
      <a href="#acme-web">
        <Card.Header>
          <Card.Title>acme-web</Card.Title>
          <Card.Description>Open the project — the whole card is the link.</Card.Description>
        </Card.Header>
      </a>
    </Card>
    <p className="text-fg-muted text-sm">
      Hover to reveal the accent edge; press to drop the card onto it.
    </p>
  </div>
);

export default () => (
  <div className="grid max-w-3xl grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
    <Card>
      <div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">1.28M</div>
        <div className="text-fg-subtle mt-1 text-xs tracking-wide uppercase">
          requests · this month
        </div>
      </div>
    </Card>

    <Card>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-fg-muted">Plan</dt>
          <dd>Team</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fg-muted">Seats</dt>
          <dd className="tabular-nums">12</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fg-muted">Region</dt>
          <dd>iad1</dd>
        </div>
      </dl>
    </Card>

    <Card>
      <div className="flex items-center gap-3">
        <div className="bg-bg-emphasis text-fg-on-emphasis grid size-11 place-items-center font-semibold">
          J
        </div>
        <div>
          <div className="font-semibold">Jin Ma</div>
          <div className="text-fg-muted text-sm">Maintainer</div>
        </div>
      </div>
    </Card>

    <Card>
      <Card.Section>
        <div className="bg-bg-hover text-fg-muted flex h-24 items-center justify-center text-xs tracking-wide uppercase">
          figure
        </div>
      </Card.Section>
      <div>
        <div className="font-semibold">Elevation, drawn</div>
        <div className="text-fg-muted text-sm">Depth without light.</div>
      </div>
    </Card>

    <Card>
      <blockquote className="text-sm">
        <p>&ldquo;Ink is never diluted, only rationed.&rdquo;</p>
        <footer className="text-fg-subtle mt-2 text-xs tracking-wide uppercase">
          Ink &amp; Instrument
        </footer>
      </blockquote>
    </Card>

    <Card>
      <div className="text-fg-subtle text-center">
        <div className="text-border font-mono text-2xl">&empty;</div>
        <div className="mt-1 text-sm">No projects yet</div>
      </div>
    </Card>
  </div>
);
