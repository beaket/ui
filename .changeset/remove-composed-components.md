---
"@beaket/ui": minor
---

Remove 5 composed components in favor of primitive-first philosophy

Removed: ConfirmationDialog, ErrorPage, SidebarLayout, BlankSlate, PageHeader

These components were fixed-layout compositions of existing primitives (Dialog, Button, Alert, etc.) that restricted user freedom. Users should compose their own layouts using the primitive components directly.
