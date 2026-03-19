import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";
import { Dialog } from "./dialog";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface FormDialogProps {
  /** Controlled open state */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** When truthy, automatically close the dialog (e.g., on submission success) */
  closeOnSuccess?: unknown;
  /** Optional trigger element */
  trigger?: React.ReactNode;
  /** Form content */
  children: React.ReactNode;
}

/**
 * A Dialog wrapper for forms that handles common patterns:
 * - preventClose during submission
 * - hideCloseButton during submission
 * - Auto-close on success via closeWhen
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  isSubmitting,
  closeOnSuccess,
  trigger,
  children,
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      preventClose={isSubmitting}
      hideCloseButton={isSubmitting}
      closeWhen={closeOnSuccess}
    >
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        {description && <Dialog.Description>{description}</Dialog.Description>}
      </Dialog.Header>
      {children}
    </Dialog>
  );
}

export interface FormDialogFooterProps {
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Submit button label */
  submitLabel: string;
  /** Cancel button label, defaults to "Cancel" */
  cancelLabel?: string;
  /** Additional disabled condition for submit button */
  submitDisabled?: boolean;
  /** Tooltip for submit button when disabled */
  submitDisabledTitle?: string;
}

/**
 * Standard footer for form dialogs with Cancel and Submit buttons.
 */
function FormDialogFooter({
  isSubmitting,
  submitLabel,
  cancelLabel = "Cancel",
  submitDisabled = false,
  submitDisabledTitle,
}: FormDialogFooterProps) {
  return (
    <Dialog.Footer>
      <Dialog.Close>
        <Button type="button" variant="outline" disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      </Dialog.Close>
      <Button
        type="submit"
        disabled={isSubmitting || submitDisabled}
        loading={isSubmitting}
        title={submitDisabled ? submitDisabledTitle : undefined}
      >
        {submitLabel}
      </Button>
    </Dialog.Footer>
  );
}

export interface FormDialogErrorProps {
  /** Error message to display. When null/undefined, nothing is rendered. */
  error: string | null | undefined;
}

/**
 * Standard error display for form dialogs.
 */
function FormDialogError({ error }: FormDialogErrorProps) {
  if (!error) return null;

  return (
    <div data-slot="form-dialog-error" className="border-signal-red bg-frost border px-3 py-2.5">
      <p className="text-signal-red text-sm">{error}</p>
    </div>
  );
}

FormDialog.Footer = FormDialogFooter;
FormDialog.Error = FormDialogError;
