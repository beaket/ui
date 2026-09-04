---
"@beaket/ui": major
---

Breaking: `RadioGroup.Item`, `<Component>Props` names, and `closeWhen` is gone

Three breaking changes batched into one sign-off, because a major bump is a cost paid once (`docs/git-rules.md`).

### `RadioItem` → `RadioGroup.Item`

Radio was already a true compound component — it shares state through Radix's context — and only the packaging disagreed with `Select` and `Tabs`.

```diff
- import { RadioGroup, RadioItem } from "@/components/ui/radio";
+ import { RadioGroup } from "@/components/ui/radio";

  <RadioGroup defaultValue="a">
-   <RadioItem value="a" />
+   <RadioGroup.Item value="a" />
  </RadioGroup>
```

`RadioItemProps` keeps its name and stays exported. `data-slot="radio-item"` is unchanged.

### Generic `Props` → `<Component>Props`, exported everywhere

`Props` lands in _your_ codebase, where it is un-greppable and forces `import { Props as ButtonProps }`. Four exported names change:

```diff
- import { Button, type Props } from "@/components/ui/button";
+ import { Button, type ButtonProps } from "@/components/ui/button";
```

| Was                    | Now             |
| ---------------------- | --------------- |
| `badge.tsx` `Props`    | `BadgeProps`    |
| `button.tsx` `Props`   | `ButtonProps`   |
| `checkbox.tsx` `Props` | `CheckboxProps` |
| `input.tsx` `Props`    | `InputProps`    |

The rest is free: `AvatarProps`, `DialogProps`, `SheetProps` and `TextareaProps` were generic `Props` that nobody could import, and `AlertProps`, `SelectTriggerProps`, `TooltipProps` and `TooltipProviderProps` were named right but unexported. Exporting a props type is what lets you write a wrapper — the first thing anyone does with a copy-pasted component.

### `closeWhen` removed from Dialog and Sheet

```diff
- <Dialog open={open} onOpenChange={setOpen} closeWhen={result?.ok}>
+ <Dialog open={open} onOpenChange={setOpen}>
```

Close it from the state you already own: `useEffect(() => { if (result?.ok) setOpen(false); }, [result])`.

`closeWhen` was the only reason Dialog and Sheet hand-rolled controlled/uncontrolled state that Radix's `Root` already implements. With it gone, `open` and `onOpenChange` pass straight to Radix, and the render-time ref write that served it disappears with it. The dev warning for `open` without `onOpenChange` is unchanged.
