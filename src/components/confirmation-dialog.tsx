import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Alert } from "./alert";
import { Button } from "./button";
import { Dialog } from "./dialog";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface ConfirmationDialogProps {
  /** Controlled open state */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description text */
  description: string;
  /** Optional warning message shown in an Alert */
  warning?: {
    /** Alert title, defaults to "Warning" */
    title?: string;
    /** Warning message content */
    message: string;
  };
  /** Cancel button label, defaults to "Cancel" */
  cancelLabel?: string;
  /** Confirm button label */
  confirmLabel: string;
  /** Confirm button variant */
  confirmVariant?: "destructive" | "primary";
  /** Called when the confirm button is clicked */
  onConfirm: () => void;
  /** Shows loading state on confirm button and disables all buttons */
  isLoading?: boolean;
  /** Additional condition to disable confirm button */
  confirmDisabled?: boolean;
  /** Optional content to render between description and footer */
  children?: React.ReactNode;
  /** Additional CSS classes for the dialog */
  className?: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  warning,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmVariant = "destructive",
  onConfirm,
  isLoading = false,
  confirmDisabled = false,
  children,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      preventClose={isLoading}
      hideCloseButton={isLoading}
    >
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
      </Dialog.Header>

      {warning && (
        <Alert variant="caution" title={warning.title ?? "Warning"}>
          {warning.message}
        </Alert>
      )}

      {children}

      <Dialog.Footer>
        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading || confirmDisabled}
          loading={isLoading}
        >
          {confirmLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
