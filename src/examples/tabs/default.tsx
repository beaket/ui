import { Tabs } from "../../components/tabs";

const args = {};

const render = () => (
  <Tabs defaultValue="account" className="max-w-md">
    <Tabs.List>
      <Tabs.Trigger value="account">Account</Tabs.Trigger>
      <Tabs.Trigger value="password">Password</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="account">
      <div className="p-4">
        <h3 className="font-medium">Account Settings</h3>
        <p className="text-fg-muted mt-2 text-sm">Manage your account settings and preferences.</p>
      </div>
    </Tabs.Content>
    <Tabs.Content value="password">
      <div className="p-4">
        <h3 className="font-medium">Password Settings</h3>
        <p className="text-fg-muted mt-2 text-sm">Update your password and security settings.</p>
      </div>
    </Tabs.Content>
  </Tabs>
);

export default function Example() {
  return render();
}
