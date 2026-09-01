import { NavigationProgress } from "../../components/navigation-progress";

export default () => (
  <div className="border-border bg-bg relative h-32 border">
    <NavigationProgress active={true} className="!relative" />
    <div className="p-6 pt-4">
      <p className="text-fg-muted text-sm">
        Active state — the bar slides across the top of the container.
      </p>
    </div>
  </div>
);
