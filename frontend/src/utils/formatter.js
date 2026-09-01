// small shared helpers for formatting and class names

// join class names, drop falsy values
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

// money, defaults to the school currency once settings are wired
export function formatCurrency(amount, currency = "USD") {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

// short readable date, e.g. 1 Sep 2026
export function formatDate(input) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
