import { Toaster as HotToaster } from "react-hot-toast";

// wraps react-hot-toast so the toasts use our tokens in both themes
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--fg)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          fontSize: "0.875rem",
        },
        success: { iconTheme: { primary: "var(--success)", secondary: "var(--surface)" } },
        error: { iconTheme: { primary: "var(--danger)", secondary: "var(--surface)" } },
      }}
    />
  );
}

export default Toaster;
