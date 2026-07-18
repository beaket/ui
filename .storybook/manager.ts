import { addons } from "storybook/manager-api";

// Hide Storybook's core canvas "zoom" tool. Its internal PopoverProvider doesn't yet
// pass the `ariaLabel` that Storybook 11 will make mandatory, so it emitted a
// non-actionable deprecation warning on every manager load. We can't add the prop to
// Storybook's own component, so we stop the tool from mounting instead (not a masked
// console — the warning's source never renders). Drop this once Storybook ships the fix.
addons.setConfig({ toolbar: { zoom: { hidden: true } } });
