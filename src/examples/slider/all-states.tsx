import { Slider } from "../../components/slider";

export default function AllStatesExample() {
  return (
    <div className="w-full space-y-4">
      <p>Volume</p>
      <Slider defaultValue={[40]} thumbLabels={["Volume"]} />
      <p>Price range</p>
      <Slider defaultValue={[20, 80]} thumbLabels={["Minimum price", "Maximum price"]} />
      <p>Unavailable</p>
      <Slider defaultValue={[60]} disabled thumbLabels={["Unavailable volume"]} />
    </div>
  );
}
