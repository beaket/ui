import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";

import { Badge } from "../../components/badge";

export default () => (
  <div className="flex flex-wrap gap-2">
    <Badge variant="default">Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="success">
      <CircleCheck aria-hidden="true" className="mr-1 size-3" /> Success
    </Badge>
    <Badge variant="error">
      <CircleX aria-hidden="true" className="mr-1 size-3" /> Error
    </Badge>
    <Badge variant="info">
      <Info aria-hidden="true" className="mr-1 size-3" /> Info
    </Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="warning">
      <TriangleAlert aria-hidden="true" className="mr-1 size-3" /> Warning
    </Badge>
    <Badge variant="code">SPEC-001</Badge>
  </div>
);
