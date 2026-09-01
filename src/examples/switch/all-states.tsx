import { useState } from "react";

import { Label } from "../../components/label";

import { Switch } from "../../components/switch";

const args = {};

const render = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <Switch defaultChecked={false} aria-label="Unchecked switch" />
      <span className="text-sm">Unchecked</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch defaultChecked={true} aria-label="Checked switch" />
      <span className="text-sm">Checked</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch disabled aria-label="Disabled unchecked switch" />
      <span className="text-sm">Disabled (unchecked)</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch disabled defaultChecked={true} aria-label="Disabled checked switch" />
      <span className="text-sm">Disabled (checked)</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch aria-invalid aria-label="Invalid switch" />
      <span className="text-sm">Invalid</span>
    </div>
  </div>
);

export default function Example() {
  return render();
}
