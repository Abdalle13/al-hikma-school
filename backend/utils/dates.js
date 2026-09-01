// normalises a date to the start of that calendar day in utc, so one class
// gets exactly one attendance row per day regardless of the time sent.
export function startOfDayUTC(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export default startOfDayUTC;
