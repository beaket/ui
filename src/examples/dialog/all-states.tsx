import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";

export default function AllDialogStatesExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <Dialog trigger={<Button>Default</Button>}>
        <Dialog.Header>
          <Dialog.Title>Default Dialog</Dialog.Title>
          <Dialog.Description>A standard dialog with title and description.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Close</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>
      <Dialog trigger={<Button variant="outline">With Form</Button>}>
        <Dialog.Header>
          <Dialog.Title>Form Dialog</Dialog.Title>
          <Dialog.Description>Dialog containing a form.</Dialog.Description>
        </Dialog.Header>
        <div className="py-4">
          <Input placeholder="Enter something..." />
        </div>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button>Submit</Button>
        </Dialog.Footer>
      </Dialog>
      <Dialog preventClose trigger={<Button variant="outline">Prevent Close</Button>}>
        <Dialog.Header>
          <Dialog.Title>Cannot Dismiss</Dialog.Title>
          <Dialog.Description>Must use buttons to close.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Got it</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>
      <Dialog trigger={<Button variant="destructive">Destructive</Button>}>
        <Dialog.Header>
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Description>This action is irreversible.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button variant="destructive">Delete</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>
      <Dialog
        hideCloseButton
        preventClose
        trigger={<Button variant="secondary">No X Button</Button>}
      >
        <Dialog.Header>
          <Dialog.Title>Action Required</Dialog.Title>
          <Dialog.Description>No X button, must use actions.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Acknowledge</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}
