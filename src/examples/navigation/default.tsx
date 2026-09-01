import { Navigation } from "../../components/navigation";

const args = {};

const render = () => (
  <Navigation>
    <Navigation.List>
      <Navigation.Item>
        <Navigation.Link href="/" active>
          Home
        </Navigation.Link>
      </Navigation.Item>
      <Navigation.Item>
        <Navigation.Link href="/docs">Docs</Navigation.Link>
      </Navigation.Item>
      <Navigation.Item>
        <Navigation.Link href="/about">About</Navigation.Link>
      </Navigation.Item>
    </Navigation.List>
  </Navigation>
);

export default function Example() {
  return render();
}
