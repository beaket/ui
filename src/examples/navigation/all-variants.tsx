import { Navigation } from "../../components/navigation";

export default () => (
  <div className="space-y-6">
    <div>
      <p className="text-fg-muted mb-2 text-xs">Horizontal navigation</p>
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
    </div>
    <div>
      <p className="text-fg-muted mb-2 text-xs">Vertical navigation</p>
      <Navigation>
        <Navigation.List className="w-48 flex-col [&>li+li]:-mt-px [&>li+li]:ml-0">
          <Navigation.Item>
            <Navigation.Link href="/" active className="w-full">
              Dashboard
            </Navigation.Link>
          </Navigation.Item>
          <Navigation.Item>
            <Navigation.Link href="/settings" className="w-full">
              Settings
            </Navigation.Link>
          </Navigation.Item>
        </Navigation.List>
      </Navigation>
    </div>
  </div>
);
