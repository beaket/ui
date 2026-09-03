import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";

export default function DefaultDialogExample() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Dialog trigger={<Button>Open Dialog</Button>}>
        <Dialog.Header>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>
            This is a dialog description that provides additional context.
          </Dialog.Description>
        </Dialog.Header>
        <p className="text-fg text-sm">Dialog content goes here. You can put any content inside.</p>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button>Confirm</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}
