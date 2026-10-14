export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dailyStreak(dates: string[], now = new Date()): number {
  const completed = new Set(dates);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (!completed.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completed.has(localDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
export function timerText(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 3600)).padStart(2, "0")}:${String(Math.floor(safe / 60) % 60).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}
