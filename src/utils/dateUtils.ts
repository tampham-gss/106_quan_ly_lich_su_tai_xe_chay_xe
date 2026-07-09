export function datesInRange(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || startDate > endDate) return [];

  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const last = new Date(`${endDate}T00:00:00`);

  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function formatViDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function currentWeekDateRange(): { startDate: string; endDate: string } {
  const today = new Date("2026-07-09T00:00:00");
  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10),
  };
}

export function currentMonthDateRange(): { startDate: string; endDate: string } {
  return {
    startDate: "2026-07-01",
    endDate: "2026-07-09",
  };
}
