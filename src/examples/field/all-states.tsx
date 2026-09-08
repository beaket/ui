"use client";

import { Field } from "../../components/field";
import { Input } from "../../components/input";

export default function Example() {
  return (
    <div className="max-w-sm space-y-8">
      <Field invalid>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input type="email" defaultValue="not-an-email" />
        </Field.Control>
        <div className="space-y-1">
          <Field.Hint>Used only for account notifications.</Field.Hint>
          <Field.Error>Enter a valid email address.</Field.Error>
        </div>
      </Field>
      <Field label="Account ID" hint="This value cannot be changed.">
        {(id) => <Input id={id} readOnly defaultValue="account_42" />}
      </Field>
    </div>
  );
}
