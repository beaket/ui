"use client";

import { Field } from "../../components/field";
import { Input } from "../../components/input";

export default function Example() {
  return (
    <Field label="Email" hint="Used only for account notifications." className="max-w-sm">
      {(id) => <Input id={id} type="email" placeholder="you@example.com" />}
    </Field>
  );
}
