import { Separator } from "../../components/separator";

export default () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-4 text-sm font-medium">Horizontal (default)</h3>
      <div className="max-w-sm space-y-4">
        <p className="text-fg-muted text-sm">Section A</p>
        <Separator />
        <p className="text-fg-muted text-sm">Section B</p>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Vertical</h3>
      <div className="flex h-6 items-center gap-4">
        <span className="text-fg-muted text-sm">Home</span>
        <Separator orientation="vertical" />
        <span className="text-fg-muted text-sm">About</span>
        <Separator orientation="vertical" />
        <span className="text-fg-muted text-sm">Contact</span>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">In a card-like layout</h3>
      <div className="border-border max-w-sm border p-4">
        <h4 className="font-medium">Card Title</h4>
        <Separator className="my-3" />
        <p className="text-fg-muted text-sm">Card content goes here.</p>
      </div>
    </div>
  </div>
);
