import { Breadcrumb } from "../../components/breadcrumb";

export default () => (
  <div className="space-y-4">
    <div>
      <p className="text-fg-muted mb-2 text-xs">Default separator</p>
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Page>Current</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </div>
    <div>
      <p className="text-fg-muted mb-2 text-xs">Chevron separator</p>
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Separator>&gt;</Breadcrumb.Separator>
            <Breadcrumb.Page>Current</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </div>
  </div>
);
