---
"@beaket/ui": minor
---

Button's `loading` falls back to the form's pending state

React 19's `useFormStatus` is documented as a **design-system** hook: a submit button nested in a `<form>` can read the form's pending state directly, with no prop drilling and no wiring by the consumer. Until now every consumer wired `loading` by hand for the most common case there is.

```tsx
<form action={save}>
  <Button type="submit">Save</Button> {/* spins and disables on its own */}
</form>
```

`loading` remains the override — supplied, it wins, including `loading={false}`. The fallback applies only to a `type="submit"` button; an ordinary button is untouched, and under `asChild` the component still injects nothing at all.

No new registry dependency: `react-dom` ships in lockstep with `react`, and adding it to a component's `dependencies` would run `npm install react-dom` in your project.
