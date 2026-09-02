import { EmptyState } from "./EmptyState.jsx";
import { CalendarClock } from "lucide-react";

const DAY_ORDER = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// renders a weekly timetable from a flat list of entries. secondaryLabel is a
// function that returns the small line under each slot (teacher name for a class
// view, class name for a teacher view).
export function TimetableGrid({ entries = [], secondaryLabel = () => "", allDays = false }) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No timetable yet"
        description="Nothing has been scheduled here."
      />
    );
  }

  const present = new Set(entries.map((e) => e.day));
  const days = DAY_ORDER.filter((d) => allDays || present.has(d));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {days.map((day) => {
        const slots = entries
          .filter((e) => e.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return (
          <div key={day} className="rounded-2xl border border-border bg-surface p-3">
            <p className="mb-2 text-sm font-semibold text-fg">{day}</p>
            {slots.length === 0 ? (
              <p className="text-xs text-muted">No classes</p>
            ) : (
              <ul className="space-y-2">
                {slots.map((e, i) => (
                  <li key={i} className="rounded-xl bg-surface-2 p-2.5">
                    <p className="text-xs font-medium text-muted tabular-nums">
                      {e.startTime} to {e.endTime}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-fg">
                      {e.subject?.name || "Subject"}
                    </p>
                    {secondaryLabel(e) ? (
                      <p className="text-xs text-muted">{secondaryLabel(e)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TimetableGrid;
