import { Progress } from "../../components/progress";

export default function AllStatesExample() {
  return (
    <div className="w-full space-y-4">
      <p>Uploading — 40%</p>
      <Progress value={40} aria-label="Upload progress" />
      <p>Complete</p>
      <Progress value={100} aria-label="Completed upload" />
      <p>Connecting — duration unknown</p>
      <Progress aria-label="Connecting" />
    </div>
  );
}
