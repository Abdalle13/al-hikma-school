import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/formatter.js";

export function Modal({ open, onClose, title, children, footer, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-5",
              className
            )}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              {title ? <h2 className="text-lg font-bold text-fg">{title}</h2> : <span />}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-fg">{children}</div>
            {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
