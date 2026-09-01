import {
  Cloud,
  Code,
  CreditCard,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import { useState } from "react";

import { Button } from "../../components/button";

import { DropdownMenu } from "../../components/dropdown-menu";

export default () => (
  <div className="flex flex-wrap gap-4">
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Default</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Actions</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>View</DropdownMenu.Item>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Item>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">With Icons</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          <User className="size-4" />
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Settings className="size-4" />
          Settings
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive">
          <LogOut className="size-4" />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">With Shortcuts</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          Copy
          <DropdownMenu.Shortcut>⌘C</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          Paste
          <DropdownMenu.Shortcut>⌘V</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          Cut
          <DropdownMenu.Shortcut>⌘X</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">Disabled Items</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Enabled</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Disabled</DropdownMenu.Item>
        <DropdownMenu.Item>Enabled</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  </div>
);
