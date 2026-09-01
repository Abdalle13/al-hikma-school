import { forwardRef, useId } from "react";
import { cn } from "../../utils/formatter.js";

const fieldBase =
  "w-full rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted " +
  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { label, hint, error, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId}>
      <input
        ref={ref}
        id={inputId}
        className={cn(fieldBase, error && "border-danger focus:ring-danger", className)}
        {...props}
      />
    </Field>
  );
});

export default Input;
export { Field, fieldBase };
