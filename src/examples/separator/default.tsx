import { Separator } from "../../components/separator";

const args = {};

const render = () => (
  <div className="max-w-sm">
    <div className="space-y-1">
      <h4 className="text-sm leading-none font-medium">Section Title</h4>
      <p className="text-fg-muted text-sm">Section description text.</p>
    </div>
    <Separator className="my-4" />
    <div className="space-y-1">
      <h4 className="text-sm leading-none font-medium">Another Section</h4>
      <p className="text-fg-muted text-sm">More content here.</p>
    </div>
  </div>
);

export default function Example() {
  return render();
}
