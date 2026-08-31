import { Button } from "@/components/button";

export default function AllSizesExample() {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">+</Button>
    </div>
  );
}
