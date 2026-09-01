import { Avatar } from "../../components/avatar";

// Compositions for docs
export const AllStates = () => (
  <div className="flex items-center gap-4">
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Image src="https://github.com/beaket.png" alt="@beaket" />
        <Avatar.Fallback>BK</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">With Image</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">Fallback</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>A</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">Single Letter</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar shadow>
        <Avatar.Fallback>SH</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">Shadow</span>
    </div>
  </div>
);

export default () => (
  <div className="flex items-end gap-4">
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-6">
        <Avatar.Fallback className="text-xs">XS</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">24px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-8">
        <Avatar.Fallback className="text-sm">SM</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">32px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">40px (default)</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-12">
        <Avatar.Fallback className="text-lg">LG</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">48px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-16">
        <Avatar.Fallback className="text-xl">XL</Avatar.Fallback>
      </Avatar>
      <span className="text-fg-muted text-xs">64px</span>
    </div>
  </div>
);
