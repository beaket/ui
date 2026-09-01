import { Avatar } from "../../components/avatar";

export default () => (
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
