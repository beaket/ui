import { Blockquote } from "../../components/blockquote";

const args = {
  children:
    "Simplicity is the ultimate sophistication when every detail serves a purpose and nothing distracts from what truly matters.",
};

export default function Example() {
  return <Blockquote {...args} />;
}
