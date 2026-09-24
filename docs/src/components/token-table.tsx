import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

interface Token {
  name: string;
  value: string;
  usage: string;
}

/**
 * A materials schedule: the ink on the left at a size you can actually judge,
 * its name and value beside it, what it is for on the right.
 */
export function TokenTable({
  tokens,
  showSwatch = true,
}: {
  tokens: Token[];
  showSwatch?: boolean;
}) {
  return (
    <div className="token-table">
      <Table scrollLabel="Tokens">
        <TableHeader>
          <TableRow>
            {showSwatch && (
              <TableHead scope="col">
                <span className="sr-only">Swatch</span>
              </TableHead>
            )}
            <TableHead scope="col">Token</TableHead>
            <TableHead scope="col">Value</TableHead>
            <TableHead scope="col">Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.name}>
              {showSwatch && (
                <TableCell className="token-swatch-cell">
                  <span className="swatch" style={{ backgroundColor: token.value }} />
                </TableCell>
              )}
              <TableCell className="token-name">{token.name}</TableCell>
              <TableCell className="token-value">{token.value}</TableCell>
              <TableCell className="token-usage">{token.usage}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
