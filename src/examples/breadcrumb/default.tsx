import { Breadcrumb } from "../../components/breadcrumb";

const args = {};

const render = () => (
  <Breadcrumb>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Link href="/docs">Documentation</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Page>Components</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>
);

export default function Example() {
  return render();
}
