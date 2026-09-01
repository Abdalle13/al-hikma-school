import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/formatter.js";
import { Field, fieldBase } from "./Input.jsx";

export const Select = forwardRef(function Select(
  { label, hint, error, className, id, children, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={selectId}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            fieldBase,
            "appearance-none pr-9",
            error && "border-danger focus:ring-danger",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
});

export default Select;
