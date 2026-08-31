import { Input } from "@/components/input";
import { Label } from "@/components/label";

export default function AllStatesExample() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="input-normal">Normal</Label>
        <Input id="input-normal" placeholder="Email address" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-disabled">Disabled</Label>
        <Input id="input-disabled" placeholder="Disabled input" disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-readonly">Read-only</Label>
        <Input id="input-readonly" defaultValue="Read-only value" readOnly />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-invalid">Invalid</Label>
        <Input id="input-invalid" defaultValue="invalid@" aria-invalid={true} />
        <span className="text-danger-fg text-xs">This field is required</span>
      </div>
    </div>
  );
}
