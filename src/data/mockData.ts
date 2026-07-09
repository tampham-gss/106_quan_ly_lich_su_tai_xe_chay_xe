import type { DailyRotation, Driver, TripRecord, Vehicle, ViolationRecord } from "../types";

export const MOCK_DRIVERS: Driver[] = [
  { id: "d1", name: "Nguyễn Văn An" },
  { id: "d2", name: "Trần Minh Bình" },
  { id: "d3", name: "Lê Hoàng Cường" },
  { id: "d4", name: "Phạm Đức Dũng" },
  { id: "d5", name: "Võ Thanh Em" },
  { id: "d6", name: "Huỳnh Quốc Phong" },
  { id: "d7", name: "Đặng Văn Giang" },
  { id: "d8", name: "Bùi Minh Hùng" },
  { id: "d9", name: "Trịnh Văn Khôi" },
  { id: "d10", name: "Ngô Thị Lan" },
  { id: "d11", name: "Đỗ Quang Huy" },
  { id: "d12", name: "Vương Đức Thắng" },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: "v1", plateNumber: "50H-12345", vehicleType: "Đầu kéo", area: "HCM", areaLabel: "HCM" },
  { id: "v2", plateNumber: "51C-67890", vehicleType: "Rơ moóc", area: "HCM", areaLabel: "HCM" },
  { id: "v3", plateNumber: "50H-11223", vehicleType: "Đầu kéo", area: "HCM", areaLabel: "HCM" },
  { id: "v4", plateNumber: "15C-44556", vehicleType: "Xe tải", area: "HAI_PHONG", areaLabel: "Hải Phòng" },
  { id: "v5", plateNumber: "15H-77889", vehicleType: "Tải nhẹ", area: "HAI_PHONG", areaLabel: "Hải Phòng" },
  { id: "v6", plateNumber: "29C-99001", vehicleType: "Đầu kéo", area: "CLO", areaLabel: "CLO" },
  { id: "v7", plateNumber: "29H-22334", vehicleType: "Rơ moóc", area: "CLO", areaLabel: "CLO" },
  { id: "v8", plateNumber: "50H-55667", vehicleType: "Đầu kéo", area: "HCM", areaLabel: "HCM" },
  { id: "v9", plateNumber: "50H-77888", vehicleType: "Xe bồn", area: "HCM", areaLabel: "HCM" },
  { id: "v10", plateNumber: "51H-33445", vehicleType: "Tải nhẹ", area: "HCM", areaLabel: "HCM" },
  { id: "v11", plateNumber: "52C-88990", vehicleType: "Xe tải", area: "HCM", areaLabel: "HCM" },
  { id: "v12", plateNumber: "15C-11223", vehicleType: "Đầu kéo", area: "HAI_PHONG", areaLabel: "Hải Phòng" },
  { id: "v13", plateNumber: "15H-55678", vehicleType: "Rơ moóc", area: "HAI_PHONG", areaLabel: "Hải Phòng" },
  { id: "v14", plateNumber: "29C-44567", vehicleType: "Xe tải", area: "CLO", areaLabel: "CLO" },
  { id: "v15", plateNumber: "29H-99012", vehicleType: "Tải nhẹ", area: "CLO", areaLabel: "CLO" },
];

const ROUTES = [
  "Kho Bình Dương → Kho Q.7",
  "Kho Q.12 → Kho Long An",
  "Kho Hải Phòng → Cảng Lạch Huyện",
  "Kho CLO → Kho Thuận An",
  "Kho Q.9 → Hub Gò Vấp",
  "Kho Đồng Nai → Kho Bình Thạnh",
];

type DriverPeriod = {
  driverId: string;
  startDate: string;
  endDate: string;
};

const VEHICLE_SCHEDULES: Record<string, DriverPeriod[]> = {
  v1: [
    { driverId: "d1", startDate: "2026-07-01", endDate: "2026-07-05" },
    { driverId: "d2", startDate: "2026-07-07", endDate: "2026-07-10" },
    { driverId: "d1", startDate: "2026-07-11", endDate: "2026-07-14" },
  ],
  v2: [{ driverId: "d3", startDate: "2026-07-01", endDate: "2026-07-15" }],
  v3: [
    { driverId: "d4", startDate: "2026-07-01", endDate: "2026-07-04" },
    { driverId: "d5", startDate: "2026-07-07", endDate: "2026-07-11" },
    { driverId: "d4", startDate: "2026-07-12", endDate: "2026-07-15" },
  ],
  v4: [
    { driverId: "d6", startDate: "2026-07-02", endDate: "2026-07-06" },
    { driverId: "d7", startDate: "2026-07-08", endDate: "2026-07-13" },
  ],
  v5: [{ driverId: "d8", startDate: "2026-07-01", endDate: "2026-07-12" }],
  v6: [
    { driverId: "d2", startDate: "2026-07-01", endDate: "2026-07-03" },
    { driverId: "d3", startDate: "2026-07-04", endDate: "2026-07-08" },
    { driverId: "d2", startDate: "2026-07-09", endDate: "2026-07-14" },
  ],
  v7: [{ driverId: "d5", startDate: "2026-07-05", endDate: "2026-07-15" }],
  v8: [
    { driverId: "d1", startDate: "2026-07-01", endDate: "2026-07-02" },
    { driverId: "d6", startDate: "2026-07-03", endDate: "2026-07-07" },
    { driverId: "d7", startDate: "2026-07-08", endDate: "2026-07-15" },
  ],
  v9: [{ driverId: "d9", startDate: "2026-07-01", endDate: "2026-07-15" }],
  v10: [
    { driverId: "d1", startDate: "2026-07-01", endDate: "2026-07-06" },
    { driverId: "d4", startDate: "2026-07-08", endDate: "2026-07-14" },
  ],
  v11: [
    { driverId: "d2", startDate: "2026-07-01", endDate: "2026-07-05" },
    { driverId: "d5", startDate: "2026-07-07", endDate: "2026-07-12" },
    { driverId: "d10", startDate: "2026-07-13", endDate: "2026-07-15" },
  ],
  v12: [{ driverId: "d6", startDate: "2026-07-01", endDate: "2026-07-15" }],
  v13: [
    { driverId: "d7", startDate: "2026-07-01", endDate: "2026-07-07" },
    { driverId: "d8", startDate: "2026-07-09", endDate: "2026-07-15" },
  ],
  v14: [{ driverId: "d3", startDate: "2026-07-02", endDate: "2026-07-14" }],
  v15: [
    { driverId: "d4", startDate: "2026-07-01", endDate: "2026-07-04" },
    { driverId: "d2", startDate: "2026-07-06", endDate: "2026-07-10" },
    { driverId: "d11", startDate: "2026-07-11", endDate: "2026-07-15" },
  ],
};

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function getDriver(driverId: string) {
  const driver = MOCK_DRIVERS.find((item) => item.id === driverId);
  if (!driver) throw new Error(`Unknown driver: ${driverId}`);
  return driver;
}

function buildDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = start;

  while (cursor <= end) {
    dates.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }

  return dates;
}

function buildTripsForDriver(
  vehicleId: string,
  date: string,
  driverId: string,
  tripIndex: number
): TripRecord[] {
  const driver = getDriver(driverId);
  const dayNum = Number(date.slice(-2));
  const tripCount = dayNum % 3 === 0 ? 2 : 1;
  const trips: TripRecord[] = [];

  for (let i = 0; i < tripCount; i += 1) {
    const startHour = 6 + i * 4;
    const endHour = startHour + 3;
    trips.push({
      id: `${vehicleId}-${date}-t${tripIndex + i + 1}`,
      tripCode: `CH-${date.replace(/-/g, "")}-${String(tripIndex + i + 1).padStart(2, "0")}`,
      driverId: driver.id,
      driverName: driver.name,
      startTime: `${String(startHour).padStart(2, "0")}:00`,
      endTime: `${String(endHour).padStart(2, "0")}:30`,
      route: ROUTES[(dayNum + i) % ROUTES.length],
    });
  }

  return trips;
}

function findDriverForDate(vehicleId: string, date: string): string | null {
  const periods = VEHICLE_SCHEDULES[vehicleId] ?? [];
  const match = periods.find((period) => date >= period.startDate && date <= period.endDate);
  return match?.driverId ?? null;
}

function isSunday(isoDate: string): boolean {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0;
}

export function buildMockRotations(startDate = "2026-07-01", endDate = "2026-07-15"): DailyRotation[] {
  const dates = buildDateRange(startDate, endDate);
  const rows: DailyRotation[] = [];

  for (const vehicle of MOCK_VEHICLES) {
    let tripCounter = 0;

    for (const date of dates) {
      if (isSunday(date)) continue;

      const driverId = findDriverForDate(vehicle.id, date);
      if (!driverId) continue;

      const trips = buildTripsForDriver(vehicle.id, date, driverId, tripCounter);
      tripCounter += trips.length;

      rows.push({
        vehicleId: vehicle.id,
        date,
        trips,
      });
    }
  }

  return rows;
}

export const DEFAULT_ROTATIONS = buildMockRotations();

export const DEFAULT_VIOLATIONS: ViolationRecord[] = [
  {
    id: "vp1",
    violationDate: "2026-07-02",
    observationMethod: "Trực tiếp",
    vehicleId: "v1",
    personnelName: "Nguyễn Văn An",
    content: "Không đeo dây an toàn",
    severity: "Nhẹ",
    shift: "Ca 06h-14h",
    result: "Đã xử lý",
  },
  {
    id: "vp2",
    violationDate: "2026-07-03",
    observationMethod: "Online",
    vehicleId: "v8",
    personnelName: "Nguyễn Văn An",
    content: "Sử dụng điện thoại khi lái xe",
    severity: "Nặng",
    shift: "Ca 14h-22h",
    result: "Chưa xử lý",
  },
  {
    id: "vp3",
    violationDate: "2026-07-04",
    observationMethod: "Trực tiếp",
    vehicleId: "v6",
    personnelName: "Trần Minh Bình",
    content: "Vượt quá tốc độ cho phép",
    severity: "Nghiêm trọng",
    shift: "Ca 22h-06h",
    result: "Chưa xử lý",
  },
  {
    id: "vp4",
    violationDate: "2026-07-05",
    observationMethod: "Online",
    vehicleId: "v3",
    personnelName: "Phạm Đức Dũng",
    content: "Không bật đèn xi-nhan",
    severity: "Nhẹ",
    shift: "Ca hành chính",
    result: "Đã xử lý",
  },
  {
    id: "vp5",
    violationDate: "2026-07-06",
    observationMethod: "Trực tiếp",
    vehicleId: "v4",
    personnelName: "Huỳnh Quốc Phong",
    content: "Đỗ xe sai quy định",
    severity: "Nhẹ",
    shift: "Ca 06h-14h",
    result: "Đã xử lý",
  },
  {
    id: "vp6",
    violationDate: "2026-07-07",
    observationMethod: "Online",
    vehicleId: "v11",
    personnelName: "Trần Minh Bình",
    content: "Vi phạm thời gian lái xe liên tục",
    severity: "Nặng",
    shift: "Ca 14h-22h",
    result: "Chưa xử lý",
  },
  {
    id: "vp7",
    violationDate: "2026-07-08",
    observationMethod: "Trực tiếp",
    vehicleId: "v9",
    personnelName: "Trịnh Văn Khôi",
    content: "Không kiểm tra xe trước chuyến",
    severity: "Nhẹ",
    shift: "Ca hành chính",
    result: "Chưa xử lý",
  },
];

export function getVehicleById(vehicleId: string): Vehicle | undefined {
  return MOCK_VEHICLES.find((vehicle) => vehicle.id === vehicleId);
}
