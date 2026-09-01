// tiny classname joiner. keeps falsy values out.
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default cn;
