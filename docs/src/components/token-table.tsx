interface Token {
  name: string;
  value: string;
  usage: string;
}

export function TokenTable({
  tokens,
  showSwatch = true,
}: {
  tokens: Token[];
  showSwatch?: boolean;
}) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.8125rem",
        margin: "0.5rem 0",
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              textAlign: "left",
              fontWeight: 600,
              padding: "0.375rem 0.75rem",
              borderBottom: "2px solid var(--graphite)",
              whiteSpace: "nowrap",
            }}
          >
            Token
          </th>
          <th
            style={{
              textAlign: "left",
              fontWeight: 600,
              padding: "0.375rem 0.75rem",
              borderBottom: "2px solid var(--graphite)",
              whiteSpace: "nowrap",
            }}
          >
            Value
          </th>
          <th
            style={{
              textAlign: "left",
              fontWeight: 600,
              padding: "0.375rem 0.75rem",
              borderBottom: "2px solid var(--graphite)",
            }}
          >
            Usage
          </th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.name}>
            <td
              style={{
                padding: "0.375rem 0.75rem",
                borderBottom: "1px solid var(--chrome)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
              }}
            >
              {token.name}
            </td>
            <td style={{ padding: "0.375rem 0.75rem", borderBottom: "1px solid var(--chrome)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                {showSwatch && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      backgroundColor: token.value,
                      border: "1px solid var(--chrome)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <code
                  style={{
                    fontSize: "0.75rem",
                    background: "var(--platinum)",
                    padding: "0.1rem 0.2rem",
                  }}
                >
                  {token.value}
                </code>
              </span>
            </td>
            <td
              style={{
                padding: "0.375rem 0.75rem",
                borderBottom: "1px solid var(--chrome)",
                color: "var(--steel)",
              }}
            >
              {token.usage}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
