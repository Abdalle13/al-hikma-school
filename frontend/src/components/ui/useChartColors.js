import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";

// reads the design tokens as real colour strings for recharts, and refreshes
// them whenever the theme flips.
export function useChartColors() {
  const { theme } = useTheme();
  const [colors, setColors] = useState(read);

  useEffect(() => {
    // let the theme class land on <html> before reading
    const id = requestAnimationFrame(() => setColors(read()));
    return () => cancelAnimationFrame(id);
  }, [theme]);

  return colors;
}

function read() {
  if (typeof window === "undefined") return fallback;
  const s = getComputedStyle(document.documentElement);
  const get = (name, def) => s.getPropertyValue(name).trim() || def;
  return {
    primary: get("--primary", fallback.primary),
    accent: get("--accent", fallback.accent),
    success: get("--success", fallback.success),
    warning: get("--warning", fallback.warning),
    danger: get("--danger", fallback.danger),
    muted: get("--muted", fallback.muted),
    border: get("--border", fallback.border),
    fg: get("--fg", fallback.fg),
    surface: get("--surface", fallback.surface),
  };
}

const fallback = {
  primary: "#15803D",
  accent: "#F59E0B",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  muted: "#78716C",
  border: "#E7E5E4",
  fg: "#1C1917",
  surface: "#FFFFFF",
};

export default useChartColors;
