import { cn } from "../../lib/cn.js";

// table shell. pass headers as an array of strings, rows as your own <Table.Row> children.
export function Table({ headers = [], children, className }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full border-collapse text-sm">
        {headers.length ? (
          <thead>
            <tr className="bg-surface-2 text-left">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-muted">
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
  return <tr className={cn("bg-surface hover:bg-surface-2/60", className)} {...props} />;
}

function Cell({ className, ...props }) {
  return <td className={cn("px-4 py-3 text-fg", className)} {...props} />;
}

Table.Row = Row;
Table.Cell = Cell;

export default Table;
