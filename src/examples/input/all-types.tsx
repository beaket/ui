import { Input } from "@/components/input";

export default function AllTypesExample() {
  return (
    <div className="flex w-64 flex-col gap-4">
      <Input type="text" placeholder="Text" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Number" />
      <Input type="tel" placeholder="Telephone" />
      <Input type="url" placeholder="URL" />
      <Input type="search" placeholder="Search" />
    </div>
  );
}
