// the school grading scale, see the readme and the project brief.

export function gradeForPercentage(pct) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

// term division from the average percentage
export function divisionForAverage(avg) {
  if (avg >= 60) return "First";
  if (avg >= 45) return "Second";
  return "Third";
}

export function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}
