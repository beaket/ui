import { Checkbox } from "../../components/checkbox";

export default () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2">
      <Checkbox id="normal" />
      <label htmlFor="normal" className="text-sm">
        Normal
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="checked" defaultChecked />
      <label htmlFor="checked" className="text-sm">
        Checked
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="disabled" disabled />
      <label htmlFor="disabled" className="text-sm">
        Disabled
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <label htmlFor="disabled-checked" className="text-sm">
        Disabled & Checked
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="invalid" aria-invalid />
      <label htmlFor="invalid" className="text-sm">
        Invalid
      </label>
    </div>
  </div>
);
