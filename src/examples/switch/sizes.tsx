import { useState } from "react";

import { Label } from "../../components/label";

import { Switch } from "../../components/switch";

const args = {};

const render = () => (
  <div className="flex items-center gap-4">
    <div className="flex flex-col items-center gap-2">
      <Switch size="sm" defaultChecked aria-label="Small switch" />
      <span className="text-fg-muted text-xs">Small</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Switch size="md" defaultChecked aria-label="Medium switch" />
      <span className="text-fg-muted text-xs">Medium</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Switch size="lg" defaultChecked aria-label="Large switch" />
      <span className="text-fg-muted text-xs">Large</span>
    </div>
  </div>
);

export default function Example() {
  return render();
}
