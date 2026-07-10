import { getVehicleById } from "../data/mockData";
import { formatCumulativeDateRange } from "./dateUtils";
import type { DailyRotation, DriverWorkingHoursRow, WorkingHoursFilterState } from "../types";

function tripDurationHours(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
}

export function startOfWeek(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() - daysFromMonday);
  return date.toISOString().slice(0, 10);
}

export function startOfMonth(isoDate: string): string {
  return `${isoDate.slice(0, 7)}-01`;
}

export function getWorkingHoursCumulativeRangeLabels(selectedDate: string) {
  const weekStart = startOfWeek(selectedDate);
  const monthStart = startOfMonth(selectedDate);

  return {
    weekly: formatCumulativeDateRange(weekStart, selectedDate),
    monthly: formatCumulativeDateRange(monthStart, selectedDate),
  };
}

export function formatWorkingHours(hours: number): string {
  return `${hours.toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} giờ`;
}

type DriverAccumulator = {
  driverId: string;
  driverName: string;
  areaLabels: Set<string>;
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
};

function matchesAreaFilter(vehicleId: string, areaId: WorkingHoursFilterState["areaId"]): boolean {
  if (areaId === "all") return true;
  const vehicle = getVehicleById(vehicleId);
  return vehicle?.area === areaId;
}

function accumulateRotationHours(
  accumulators: Map<string, DriverAccumulator>,
  rotation: DailyRotation,
  selectedDate: string,
  weekStart: string,
  monthStart: string
): void {
  for (const trip of rotation.trips) {
    const hours = tripDurationHours(trip.startTime, trip.endTime);
    const existing = accumulators.get(trip.driverId) ?? {
      driverId: trip.driverId,
      driverName: trip.driverName,
      areaLabels: new Set<string>(),
      dailyHours: 0,
      weeklyHours: 0,
      monthlyHours: 0,
    };

    const vehicle = getVehicleById(rotation.vehicleId);
    if (vehicle?.areaLabel) {
      existing.areaLabels.add(vehicle.areaLabel);
    }

    if (rotation.date === selectedDate) {
      existing.dailyHours += hours;
    }
    if (rotation.date >= weekStart && rotation.date <= selectedDate) {
      existing.weeklyHours += hours;
    }
    if (rotation.date >= monthStart && rotation.date <= selectedDate) {
      existing.monthlyHours += hours;
    }

    accumulators.set(trip.driverId, existing);
  }
}

export function buildDriverWorkingHoursRows(
  rotations: DailyRotation[],
  filter: WorkingHoursFilterState
): DriverWorkingHoursRow[] {
  const weekStart = startOfWeek(filter.date);
  const monthStart = startOfMonth(filter.date);
  const accumulators = new Map<string, DriverAccumulator>();

  for (const rotation of rotations) {
    if (rotation.date > filter.date) continue;
    if (!matchesAreaFilter(rotation.vehicleId, filter.areaId)) continue;

    const hasSelectedDriver =
      filter.driverId === "all" ||
      rotation.trips.some((trip) => trip.driverId === filter.driverId);
    if (!hasSelectedDriver) continue;

    accumulateRotationHours(accumulators, rotation, filter.date, weekStart, monthStart);
  }

  return [...accumulators.values()]
    .filter((row) => filter.driverId === "all" || row.driverId === filter.driverId)
    .filter((row) => row.dailyHours > 0 || row.weeklyHours > 0 || row.monthlyHours > 0)
    .map((row) => ({
      driverId: row.driverId,
      driverName: row.driverName,
      areaLabel: [...row.areaLabels].sort((a, b) => a.localeCompare(b)).join(", ") || "—",
      dailyHours: row.dailyHours,
      weeklyHours: row.weeklyHours,
      monthlyHours: row.monthlyHours,
    }))
    .sort((a, b) => a.driverName.localeCompare(b.driverName));
}
