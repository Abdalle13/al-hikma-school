// a time aware greeting, recomputed on every render so it always matches the
// clock: "Good morning" before noon, "Good afternoon" until 17:00, then
// "Good evening".
export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default greeting;
