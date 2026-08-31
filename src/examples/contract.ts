import type { ComponentType } from "react";

export type ExampleBehavior = "static" | "interactive";
export type ExampleHydration = "none" | "visible";

/** Metadata that is intentionally separate from the consumer-facing example module. */
export interface PublicExample {
  id: string;
  component: string;
  /** Compatibility key: the existing registry still names sections as CSF exports. */
  story: string;
  title: string;
  behavior: ExampleBehavior;
  hydration: ExampleHydration;
  module: string;
  Component: ComponentType;
  source: string;
}
