import { useState } from "react";

import { Label } from "../../components/label";

import { Switch } from "../../components/switch";

export default () => (
  <div className="flex items-center gap-3">
    <Switch defaultChecked={false} aria-label="Off" />
    <Switch defaultChecked={true} aria-label="On" />
  </div>
);
