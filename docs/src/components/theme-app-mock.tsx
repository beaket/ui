export function ThemeAppMock() {
  return (
    <div className="border-border bg-bg border" style={{ minHeight: 520 }}>
      {/* App header */}
      <div className="bg-bg-emphasis border-b-iron flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-fg-on-emphasis text-sm font-bold">Acme Dashboard</span>
          <nav className="flex gap-1">
            <span className="bg-iron text-fg-on-emphasis px-3 py-1 text-xs font-medium">
              Overview
            </span>
            <span className="text-aluminum px-3 py-1 text-xs font-medium">Analytics</span>
            <span className="text-aluminum px-3 py-1 text-xs font-medium">Settings</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-success-solid border-success-solid text-fg-on-emphasis border px-2 py-0.5 text-xs font-bold">
            Live
          </span>
          <span className="bg-bg-hover border-border text-fg border px-2 py-0.5 text-xs">
            admin@acme.co
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className="bg-bg-raised border-border w-44 shrink-0 border-r p-3"
          style={{ minHeight: 470 }}
        >
          <div className="text-fg-subtle mb-2 text-xs font-semibold tracking-wider uppercase">
            Navigation
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="bg-bg-emphasis text-fg-on-emphasis px-2 py-1 text-xs font-medium">
              Dashboard
            </span>
            <span className="text-fg hover:bg-bg-hover px-2 py-1 text-xs">Users</span>
            <span className="text-fg hover:bg-bg-hover px-2 py-1 text-xs">Products</span>
            <span className="text-fg hover:bg-bg-hover px-2 py-1 text-xs">Orders</span>
            <span className="text-fg hover:bg-bg-hover px-2 py-1 text-xs">Reports</span>
          </div>
          <div className="border-border my-3 border-t" />
          <div className="text-fg-subtle mb-2 text-xs font-semibold tracking-wider uppercase">
            Status
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">API</span>
              <span
                className="bg-success-solid text-success-fg-on-solid text-xs"
                style={{ padding: "1px 6px", fontWeight: 700 }}
              >
                OK
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">Queue</span>
              <span
                className="bg-warning-solid text-fg text-xs"
                style={{ padding: "1px 6px", fontWeight: 700 }}
              >
                3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted text-xs">Errors</span>
              <span
                className="bg-danger-solid text-fg-on-emphasis text-xs"
                style={{ padding: "1px 6px", fontWeight: 700 }}
              >
                1
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Revenue", value: "$12,840", change: "+14%", positive: true },
              { label: "Users", value: "1,284", change: "+8%", positive: true },
              { label: "Errors", value: "23", change: "+2", positive: false },
            ].map((stat) => (
              <div key={stat.label} className="border-border bg-bg shadow-offset border p-3">
                <div className="text-fg-subtle text-xs font-medium">{stat.label}</div>
                <div className="text-fg mt-1 text-lg font-bold">{stat.value}</div>
                <div
                  className="mt-0.5 text-xs font-semibold"
                  style={{
                    color: stat.positive ? "var(--color-success-fg)" : "var(--color-danger-fg)",
                  }}
                >
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Content area: table + form side by side */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Table */}
            <div className="border-border bg-bg shadow-offset border">
              <div className="border-border border-b px-3 py-2">
                <span className="text-fg text-sm font-bold">Recent Orders</span>
              </div>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr className="border-border-strong border-b">
                    <th className="text-fg-muted px-3 py-1.5 text-left text-xs font-semibold">
                      ID
                    </th>
                    <th className="text-fg-muted px-3 py-1.5 text-left text-xs font-semibold">
                      Customer
                    </th>
                    <th className="text-fg-muted px-3 py-1.5 text-right text-xs font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "#1042",
                      name: "Alice Kim",
                      status: "Shipped",
                      color: "var(--color-success-fg)",
                    },
                    {
                      id: "#1041",
                      name: "Bob Chen",
                      status: "Pending",
                      color: "var(--color-warning-fg)",
                    },
                    {
                      id: "#1040",
                      name: "Carol Wu",
                      status: "Failed",
                      color: "var(--color-danger-fg)",
                    },
                    {
                      id: "#1039",
                      name: "Dan Park",
                      status: "Shipped",
                      color: "var(--color-success-fg)",
                    },
                  ].map((row) => (
                    <tr key={row.id} className="border-border border-b last:border-b-0">
                      <td className="text-fg px-3 py-1.5 font-mono">{row.id}</td>
                      <td className="text-fg px-3 py-1.5">{row.name}</td>
                      <td className="px-3 py-1.5 text-right">
                        <span
                          className="border text-xs font-bold"
                          style={{
                            padding: "1px 6px",
                            backgroundColor: row.color,
                            borderColor: row.color,
                            color: row.status === "Pending" ? "var(--color-fg)" : "var(--color-bg)",
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div className="border-border bg-bg shadow-offset border p-3">
              <div className="text-fg mb-3 text-sm font-bold">Quick Actions</div>

              <div className="mb-2">
                <label className="text-fg mb-1 block text-xs font-semibold">Search Users</label>
                <input
                  type="text"
                  placeholder="Enter name or email..."
                  className="border-border-strong bg-bg-hover text-fg w-full border px-2 py-1.5 text-xs outline-none"
                  style={{ boxSizing: "border-box" }}
                />
              </div>

              <div className="mb-2">
                <label className="text-fg mb-1 block text-xs font-semibold">Category</label>
                <div className="border-border-strong bg-bg text-fg flex items-center justify-between border px-2 py-1.5 text-xs">
                  <span className="text-fg-subtle">Select category...</span>
                  <span className="text-fg-muted">▾</span>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-4">
                <label className="flex items-center gap-1.5">
                  <span className="border-border-strong bg-bg-emphasis flex size-3.5 items-center justify-center border">
                    <svg
                      className="text-fg-on-emphasis size-2.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-fg text-xs">Active only</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="border-border-strong size-3.5 border" />
                  <span className="text-fg text-xs">Include archived</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  className="bg-bg-emphasis text-fg-on-emphasis border-border-strong shadow-offset border px-3 py-1.5 text-xs font-semibold"
                  style={{ cursor: "pointer" }}
                >
                  Search
                </button>
                <button
                  className="border-border bg-bg text-fg shadow-offset border px-3 py-1.5 text-xs font-semibold"
                  style={{ cursor: "pointer" }}
                >
                  Reset
                </button>
                <button
                  className="bg-danger-solid border-danger-solid shadow-offset text-fg-on-emphasis border px-3 py-1.5 text-xs font-semibold"
                  style={{ cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>

              {/* Alert */}
              <div
                className="border-info-solid mt-3 border-l-2 py-1.5 pl-2.5"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <span className="text-fg text-xs">
                  <strong className="text-fg-link">Note:</strong> Deleted users cannot be recovered.
                </span>
              </div>
            </div>
          </div>

          {/* Tabs section — lens grammar: fused hairline strip, glass plate on current */}
          <div className="mt-3">
            <div className="shadow-offset-action inline-flex">
              <span className="border-border-muted text-fg after:border-t-border-muted after:border-l-border-muted after:border-r-border-strong after:border-b-border-strong after:bg-accent-bg-subtle relative isolate border px-3 py-1 text-xs font-medium after:absolute after:inset-1 after:-z-[1] after:border after:content-['']">
                Activity
              </span>
              <span className="border-border-muted text-fg -ml-px border px-3 py-1 text-xs font-medium">
                Logs
              </span>
              <span className="border-border-muted text-fg -ml-px border px-3 py-1 text-xs font-medium">
                Webhooks
              </span>
            </div>
            <div className="border-border bg-bg mt-2 border p-3">
              <div className="flex flex-col gap-1.5">
                {[
                  { time: "2m ago", text: "User alice@acme.co logged in", type: "info" },
                  { time: "5m ago", text: "Order #1042 shipped successfully", type: "success" },
                  { time: "12m ago", text: "Payment failed for order #1040", type: "error" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-fg-subtle text-xs" style={{ minWidth: 48 }}>
                      {item.time}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color:
                          item.type === "error"
                            ? "var(--color-danger-fg)"
                            : item.type === "success"
                              ? "var(--color-success-fg)"
                              : "var(--color-fg)",
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
