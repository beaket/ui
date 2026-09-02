import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Eye, EyeOff, Mail, Search, X } from "lucide-react";
import { useState } from "react";

export default function AffixesExample() {
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="input-prefix">Prefix icon</Label>
        <Input id="input-prefix" placeholder="Email address" prefix={<Mail />} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-suffix">Suffix icon</Label>
        <Input id="input-suffix" placeholder="Search..." suffix={<Search />} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-clearable">Clearable (prefix + suffix)</Label>
        <Input
          id="input-clearable"
          placeholder="Search..."
          prefix={<Search />}
          suffix={
            search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-fg focus-visible:outline-border-focus flex size-6 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label="Clear"
              >
                <X />
              </button>
            )
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-password">Password toggle</Label>
        <Input
          id="input-password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-fg focus-visible:outline-border-focus flex size-6 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
        />
      </div>
    </div>
  );
}
