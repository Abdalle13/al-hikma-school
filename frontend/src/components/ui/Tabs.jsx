import { cn } from "../../utils/formatter.js";

// controlled tabs. tabs = [{ value, label }]
export function Tabs({ tabs = [], value, onChange, className }) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(tab.value)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-fg"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
