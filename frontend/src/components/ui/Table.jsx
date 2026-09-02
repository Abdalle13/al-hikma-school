import { cn } from "../../utils/formatter.js";

// table shell. pass headers as an array of strings, rows as your own <Table.Row> children.
export function Table({ headers = [], children, className }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border bg-surface shadow-card", className)}>
      <table className="w-full border-collapse text-sm">
        {headers.length ? (
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left">
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function Row({ className, ...props }) {
  return <tr className={cn("transition-colors hover:bg-surface-2/60", className)} {...props} />;
}

function Cell({ className, ...props }) {
  return <td className={cn("px-4 py-3 text-fg", className)} {...props} />;
}

Table.Row = Row;
Table.Cell = Cell;

export default Table;
