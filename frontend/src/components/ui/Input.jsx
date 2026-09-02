import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/formatter.js";

const fieldBase =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-fg shadow-sm placeholder:text-muted/70 " +
  "transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 " +
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
  { label, hint, error, className, id, type = "text", ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && reveal ? "text" : type;

  const field = (
    <input
      ref={ref}
      id={inputId}
      type={inputType}
      className={cn(
        fieldBase,
        isPassword && "pr-11",
        error && "border-danger focus:border-danger focus:ring-danger/30",
        className
      )}
      {...props}
    />
  );

  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId}>
      {isPassword ? (
        <div className="relative">
          {field}
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:text-fg"
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      ) : (
        field
      )}
    </Field>
  );
});

export default Input;
export { Field, fieldBase };
