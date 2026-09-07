"use client";

import { Slot, Slottable } from "@radix-ui/react-slot";
import { type ClassValue, clsx } from "clsx";
import { createContext, useContext, useId, useLayoutEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
type Associations = { label: string[]; description: string[] };
interface FieldContextValue {
  controlId: string;
  invalid: boolean;
  associations: Associations;
  setAssociations: React.Dispatch<React.SetStateAction<Associations>>;
}
const FieldContext = createContext<FieldContextValue | null>(null);
function useFieldContext(part: string) {
  const context = useContext(FieldContext);
  if (!context) throw new Error(`\`${part}\` must be used inside \`<Field>\``);
  return context;
}

// Register mounted parts, including those behind wrappers and conditional branches.
// Unlike a child scan, this also removes references when a message unmounts.
function useFieldPart(part: string, kind: keyof Associations, active: boolean, id?: string) {
  const context = useFieldContext(part);
  const generatedId = useId();
  const partId = id ?? generatedId;
  const { setAssociations } = context;
  useLayoutEffect(() => {
    if (!active) return;
    setAssociations((current) => ({ ...current, [kind]: [...current[kind], partId] }));
    return () =>
      setAssociations((current) => ({
        ...current,
        [kind]: current[kind].filter((value) => value !== partId),
      }));
  }, [active, kind, partId, setAssociations]);
  return { ...context, partId };
}

export interface FieldProps extends Omit<React.ComponentProps<"div">, "children"> {
  asChild?: boolean;
  /** ID for the control and its label, not the root container. Set custom IDs here rather than on the slotted control. */
  controlId?: string;
  /** Validation belongs to the app; this only announces and displays its result. */
  invalid?: boolean;
  /** Optional sugar over Label, Control, Hint and Error. */
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children?: React.ReactNode | ((id: string) => React.ReactElement);
}

function FieldRoot({
  asChild,
  controlId: providedId,
  invalid: providedInvalid,
  label,
  hint,
  error,
  children,
  className,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const controlId = providedId ?? generatedId;
  const invalid = providedInvalid ?? Boolean(error);
  const [associations, setAssociations] = useState<Associations>({ label: [], description: [] });
  const context = useMemo(
    () => ({ controlId, invalid, associations, setAssociations }),
    [controlId, invalid, associations],
  );
  const Comp = asChild ? Slot : "div";
  return (
    <FieldContext.Provider value={context}>
      <Comp
        data-slot="field"
        data-invalid={invalid || undefined}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {label != null && <FieldLabel>{label}</FieldLabel>}
        <Slottable>
          {typeof children === "function" ? (
            <FieldControl>{children(controlId)}</FieldControl>
          ) : (
            children
          )}
        </Slottable>
        {hint != null && <FieldHint>{hint}</FieldHint>}
        {error != null && <FieldError>{error}</FieldError>}
      </Comp>
    </FieldContext.Provider>
  );
}

export interface FieldLabelProps extends React.ComponentProps<"label"> {
  asChild?: boolean;
}
export function FieldLabel({ asChild, id, className, ...props }: FieldLabelProps) {
  const { controlId, partId } = useFieldPart("Field.Label", "label", true, id);
  const Comp = asChild ? Slot : "label";
  return (
    <Comp
      data-slot="field-label"
      id={partId}
      htmlFor={controlId}
      className={cn("text-fg text-sm font-medium", className)}
      {...props}
    />
  );
}

/** Slots one control (Select.Trigger, not Select.Root). Put extra ARIA ID references on this part to append them; child props retain Radix Slot's override semantics. Mounted parts are linked during hydration. */
export type FieldControlProps = React.ComponentProps<typeof Slot>;
export function FieldControl({ className, ...props }: FieldControlProps) {
  const { controlId, invalid, associations } = useFieldContext("Field.Control");
  return (
    <Slot
      {...props}
      data-slot="field-control"
      id={controlId}
      aria-invalid={invalid || undefined}
      aria-labelledby={
        [...associations.label, props["aria-labelledby"]].filter(Boolean).join(" ") || undefined
      }
      aria-describedby={
        [...associations.description, props["aria-describedby"]].filter(Boolean).join(" ") ||
        undefined
      }
      className={cn(className)}
    />
  );
}

export interface FieldHintProps extends React.ComponentProps<"p"> {
  asChild?: boolean;
}
export function FieldHint({ asChild, id, className, children, ...props }: FieldHintProps) {
  const visible = children != null && children !== false && children !== "";
  const { partId } = useFieldPart("Field.Hint", "description", visible, id);
  const Comp = asChild ? Slot : "p";
  return visible ? (
    <Comp
      data-slot="field-hint"
      id={partId}
      className={cn("text-fg-muted text-sm", className)}
      {...props}
    >
      {children}
    </Comp>
  ) : null;
}

export interface FieldErrorProps extends React.ComponentProps<"p"> {
  asChild?: boolean;
}
export function FieldError({ asChild, id, className, children, ...props }: FieldErrorProps) {
  const { invalid } = useFieldContext("Field.Error");
  const visible = invalid && children != null && children !== false && children !== "";
  const { partId } = useFieldPart("Field.Error", "description", visible, id);
  const Comp = asChild ? Slot : "p";
  return visible ? (
    <Comp
      data-slot="field-error"
      id={partId}
      className={cn("text-danger-fg text-sm", className)}
      {...props}
    >
      {children}
    </Comp>
  ) : null;
}

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Control: FieldControl,
  Hint: FieldHint,
  Error: FieldError,
});
