export function ThemeAppMock() {
  return (
    <div className="border-chrome bg-surface-0 border" style={{ minHeight: 520 }}>
      {/* App header */}
      <div className="bg-branch border-b-iron flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-inverse text-sm font-bold">Acme Dashboard</span>
          <nav className="flex gap-1">
            <span className="bg-iron text-inverse px-3 py-1 text-xs font-medium">Overview</span>
            <span className="text-aluminum px-3 py-1 text-xs font-medium">Analytics</span>
            <span className="text-aluminum px-3 py-1 text-xs font-medium">Settings</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-signal-green border-signal-green text-paper border px-2 py-0.5 text-xs font-bold">
            Live
          </span>
          <span className="bg-frost border-chrome text-ink border px-2 py-0.5 text-xs">
            admin@acme.co
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className="bg-surface-1 border-chrome w-44 shrink-0 border-r p-3"
          style={{ minHeight: 470 }}
        >
          <div className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            Navigation
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="bg-branch text-inverse px-2 py-1 text-xs font-medium">Dashboard</span>
            <span className="text-ink hover:bg-frost px-2 py-1 text-xs">Users</span>
            <span className="text-ink hover:bg-frost px-2 py-1 text-xs">Products</span>
            <span className="text-ink hover:bg-frost px-2 py-1 text-xs">Orders</span>
            <span className="text-ink hover:bg-frost px-2 py-1 text-xs">Reports</span>
          </div>
          <div className="border-chrome my-3 border-t" />
          <div className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            Status
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-steel text-xs">API</span>
              <span
                className="bg-signal-green text-paper text-xs"
                style={{ padding: "1px 6px", fontWeight: 700 }}
              >
                OK
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-steel text-xs">Queue</span>
              <span
                className="bg-signal-amber text-graphite text-xs"
                style={{ padding: "1px 6px", fontWeight: 700 }}
              >
                3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-steel text-xs">Errors</span>
              <span
                className="bg-signal-red text-paper text-xs"
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
              <div key={stat.label} className="border-chrome bg-paper shadow-offset border p-3">
                <div className="text-muted text-xs font-medium">{stat.label}</div>
                <div className="text-ink mt-1 text-lg font-bold">{stat.value}</div>
                <div
                  className="mt-0.5 text-xs font-semibold"
                  style={{
                    color: stat.positive ? "var(--color-signal-green)" : "var(--color-signal-red)",
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
            <div className="border-chrome bg-paper shadow-offset border">
              <div className="border-chrome border-b px-3 py-2">
                <span className="text-ink text-sm font-bold">Recent Orders</span>
              </div>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr className="border-graphite border-b">
                    <th className="text-steel px-3 py-1.5 text-left text-xs font-semibold">ID</th>
                    <th className="text-steel px-3 py-1.5 text-left text-xs font-semibold">
                      Customer
                    </th>
                    <th className="text-steel px-3 py-1.5 text-right text-xs font-semibold">
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
                      color: "var(--color-signal-green)",
                    },
                    {
                      id: "#1041",
                      name: "Bob Chen",
                      status: "Pending",
                      color: "var(--color-signal-amber)",
                    },
                    {
                      id: "#1040",
                      name: "Carol Wu",
                      status: "Failed",
                      color: "var(--color-signal-red)",
                    },
                    {
                      id: "#1039",
                      name: "Dan Park",
                      status: "Shipped",
                      color: "var(--color-signal-green)",
                    },
                  ].map((row) => (
                    <tr key={row.id} className="border-chrome border-b last:border-b-0">
                      <td className="text-ink px-3 py-1.5 font-mono">{row.id}</td>
                      <td className="text-ink px-3 py-1.5">{row.name}</td>
                      <td className="px-3 py-1.5 text-right">
                        <span
                          className="border text-xs font-bold"
                          style={{
                            padding: "1px 6px",
                            backgroundColor: row.color,
                            borderColor: row.color,
                            color:
                              row.status === "Pending"
                                ? "var(--color-graphite)"
                                : "var(--color-paper)",
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
            <div className="border-chrome bg-paper shadow-offset border p-3">
              <div className="text-ink mb-3 text-sm font-bold">Quick Actions</div>

              <div className="mb-2">
                <label className="text-ink mb-1 block text-xs font-semibold">Search Users</label>
                <input
                  type="text"
                  placeholder="Enter name or email..."
                  className="border-graphite bg-frost text-ink w-full border px-2 py-1.5 text-xs outline-none"
                  style={{ boxSizing: "border-box" }}
                />
              </div>

              <div className="mb-2">
                <label className="text-ink mb-1 block text-xs font-semibold">Category</label>
                <div className="border-graphite bg-paper text-ink flex items-center justify-between border px-2 py-1.5 text-xs">
                  <span className="text-muted">Select category...</span>
                  <span className="text-steel">▾</span>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-4">
                <label className="flex items-center gap-1.5">
                  <span className="border-graphite bg-ink flex size-3.5 items-center justify-center border">
                    <svg
                      className="text-paper size-2.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-ink text-xs">Active only</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="border-graphite size-3.5 border" />
                  <span className="text-ink text-xs">Include archived</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  className="bg-branch text-inverse border-branch shadow-offset border px-3 py-1.5 text-xs font-semibold"
                  style={{ cursor: "pointer" }}
                >
                  Search
                </button>
                <button
                  className="border-chrome bg-paper text-ink shadow-offset border px-3 py-1.5 text-xs font-semibold"
                  style={{ cursor: "pointer" }}
                >
                  Reset
                </button>
                <button
                  className="bg-signal-red border-signal-red shadow-offset text-paper border px-3 py-1.5 text-xs font-semibold"
                  style={{ cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>

              {/* Alert */}
              <div
                className="border-signal-blue mt-3 border-l-2 py-1.5 pl-2.5"
                style={{ backgroundColor: "var(--color-frost)" }}
              >
                <span className="text-ink text-xs">
                  <strong className="text-signal-blue">Note:</strong> Deleted users cannot be
                  recovered.
                </span>
              </div>
            </div>
          </div>

          {/* Tabs section */}
          <div className="mt-3">
            <div className="border-chrome flex border-b">
              <span className="bg-branch text-inverse border-chrome border-t border-r border-l px-3 py-1 text-xs font-semibold">
                Activity
              </span>
              <span className="text-ink px-3 py-1 text-xs">Logs</span>
              <span className="text-ink px-3 py-1 text-xs">Webhooks</span>
            </div>
            <div className="border-chrome bg-paper border-r border-b border-l p-3">
              <div className="flex flex-col gap-1.5">
                {[
                  { time: "2m ago", text: "User alice@acme.co logged in", type: "info" },
                  { time: "5m ago", text: "Order #1042 shipped successfully", type: "success" },
                  { time: "12m ago", text: "Payment failed for order #1040", type: "error" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-muted text-xs" style={{ minWidth: 48 }}>
                      {item.time}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color:
                          item.type === "error"
                            ? "var(--color-signal-red)"
                            : item.type === "success"
                              ? "var(--color-signal-green)"
                              : "var(--color-ink)",
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
