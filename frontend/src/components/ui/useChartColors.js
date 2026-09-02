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
  const secondary = get("--secondary", fallback.secondary);
  return {
    primary: get("--primary", fallback.primary),
    secondary,
    accent: secondary, // kept so older charts that reference `accent` still work
    info: get("--info", fallback.info),
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
  primary: "#1E3A5F",
  secondary: "#A0AC4F",
  accent: "#A0AC4F",
  info: "#2563EB",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  muted: "#64748B",
  border: "#E2E8F0",
  fg: "#1F2937",
  surface: "#FFFFFF",
};

export default useChartColors;
