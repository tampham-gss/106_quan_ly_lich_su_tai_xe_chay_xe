import type { DailyRotation, DriverVehicleAssignmentRow } from "../types";

type DailyDriverVehicleEntry = {
  vehicleId: string;
  plateNumber: string;
  date: string;
  driverId: string;
  driverName: string;
};

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day + days));
  return cursor.toISOString().slice(0, 10);
}

function isNextCalendarDay(previous: string, next: string): boolean {
  return addCalendarDays(previous, 1) === next;
}

function hasOtherVehicleBetween(
  entries: DailyDriverVehicleEntry[],
  fromDate: string,
  toDate: string,
  vehicleId: string,
  driverId: string
): boolean {
  return entries.some(
    (item) =>
      item.date > fromDate &&
      item.date < toDate &&
      item.driverId === driverId &&
      item.vehicleId !== vehicleId
  );
}

function canMergeEntries(
  entries: DailyDriverVehicleEntry[],
  last: DriverVehicleAssignmentRow,
  entry: DailyDriverVehicleEntry
): boolean {
  if (last.vehicleId !== entry.vehicleId) return false;
  if (last.endDate === entry.date) return true;
  if (isNextCalendarDay(last.endDate, entry.date)) return true;
  if (entry.date < last.endDate) return false;

  return !hasOtherVehicleBetween(entries, last.endDate, entry.date, last.vehicleId, last.driverId);
}

function mergeDriverVehicleEntries(
  driverId: string,
  driverName: string,
  plateNumber: string,
  entries: DailyDriverVehicleEntry[]
): DriverVehicleAssignmentRow[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const rows: DriverVehicleAssignmentRow[] = [];

  for (const entry of sorted) {
    const last = rows[rows.length - 1];

    if (last && canMergeEntries(sorted, last, entry)) {
      if (entry.date > last.endDate) last.endDate = entry.date;
      continue;
    }

    rows.push({
      id: `${driverId}|${entry.vehicleId}|${entry.date}|${rows.length}`,
      driverId,
      driverName,
      vehicleId: entry.vehicleId,
      plateNumber,
      startDate: entry.date,
      endDate: entry.date,
    });
  }

  return rows;
}

/** Gom các ngày liên tiếp cùng tài xế trên một xe thành một dòng Từ ngày – Đến ngày, theo từng tài xế. */
export function buildDriverVehicleAssignments(
  rotations: DailyRotation[],
  plateByVehicleId: Map<string, string>
): DriverVehicleAssignmentRow[] {
  const dailyEntries: DailyDriverVehicleEntry[] = [];

  for (const rotation of rotations) {
    const plateNumber = plateByVehicleId.get(rotation.vehicleId);
    if (!plateNumber) continue;

    const seen = new Set<string>();

    for (const trip of rotation.trips) {
      const key = `${trip.driverId}|${rotation.date}`;
      if (seen.has(key)) continue;
      seen.add(key);

      dailyEntries.push({
        vehicleId: rotation.vehicleId,
        plateNumber,
        date: rotation.date,
        driverId: trip.driverId,
        driverName: trip.driverName,
      });
    }
  }

  const byDriver = new Map<string, DailyDriverVehicleEntry[]>();

  for (const entry of dailyEntries) {
    const list = byDriver.get(entry.driverId) ?? [];
    const duplicate = list.some(
      (item) => item.date === entry.date && item.vehicleId === entry.vehicleId
    );
    if (!duplicate) list.push(entry);
    byDriver.set(entry.driverId, list);
  }

  const rows: DriverVehicleAssignmentRow[] = [];

  for (const [driverId, driverEntries] of byDriver) {
    const driverName = driverEntries[0]?.driverName ?? "";
    const byVehicle = new Map<string, DailyDriverVehicleEntry[]>();

    for (const entry of driverEntries) {
      const list = byVehicle.get(entry.vehicleId) ?? [];
      list.push(entry);
      byVehicle.set(entry.vehicleId, list);
    }

    for (const [vehicleId, vehicleEntries] of byVehicle) {
      const plateNumber = plateByVehicleId.get(vehicleId) ?? vehicleEntries[0].plateNumber;
      rows.push(...mergeDriverVehicleEntries(driverId, driverName, plateNumber, vehicleEntries));
    }
  }

  return rows.sort(
    (a, b) =>
      a.driverName.localeCompare(b.driverName) ||
      a.startDate.localeCompare(b.startDate) ||
      a.plateNumber.localeCompare(b.plateNumber)
  );
}
