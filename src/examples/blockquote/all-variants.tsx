import { Blockquote } from "../../components/blockquote";

export default () => (
  <div className="space-y-6">
    <Blockquote>Simplicity is the ultimate sophistication.</Blockquote>
    <Blockquote author="Dieter Rams">Good design is as little design as possible.</Blockquote>
    <Blockquote author="Product Team" authorTitle="Design Lead">
      Clarity over decoration. Function before form. Every pixel accountable.
    </Blockquote>
  </div>
);
