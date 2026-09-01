import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button.jsx";

// a minimal prev / next pager for lists that come back as { page, pages }
export function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-xs text-muted">
        Page <span className="tabular-nums">{page}</span> of <span className="tabular-nums">{pages}</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
