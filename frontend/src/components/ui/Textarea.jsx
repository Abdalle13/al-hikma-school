import { forwardRef, useId } from "react";
import { cn } from "../../utils/formatter.js";
import { Field, fieldBase } from "./Input.jsx";

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, className, id, rows = 4, ...props },
  ref
) {
  const generatedId = useId();
  const areaId = id || generatedId;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={areaId}>
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        className={cn(fieldBase, "resize-y", error && "border-danger focus:ring-danger", className)}
        {...props}
      />
    </Field>
  );
});

export default Textarea;
