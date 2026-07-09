export type AreaCode = "HCM" | "HAI_PHONG" | "CLO";

export type VehicleType = "Đầu kéo" | "Rơ moóc" | "Tải nhẹ" | "Xe tải" | "Xe bồn";

export type Driver = {
  id: string;
  name: string;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  area: AreaCode;
  areaLabel: string;
};

export type TripRecord = {
  id: string;
  tripCode: string;
  driverId: string;
  driverName: string;
  startTime: string;
  endTime: string;
  route: string;
};

export type DailyRotation = {
  vehicleId: string;
  date: string;
  trips: TripRecord[];
};

export type DriverVehicleAssignmentRow = {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  plateNumber: string;
  startDate: string;
  endDate: string;
};

export type HistoryFilterState = {
  areaId: "all" | AreaCode;
  driverId: "all" | string;
  vehicleId: "all" | string;
  startDate: string;
  endDate: string;
};

export type ObservationMethod = "Trực tiếp" | "Online";

export type ViolationSeverity = "Nhẹ" | "Nặng" | "Nghiêm trọng";

export type ViolationShift =
  | "Ca 14h-22h"
  | "Ca 06h-14h"
  | "Ca 22h-06h"
  | "Ca hành chính";

export type ViolationResult = "Chưa xử lý" | "Đã xử lý";

export type ViolationRecord = {
  id: string;
  violationDate: string;
  observationMethod: ObservationMethod;
  vehicleId: string;
  personnelName: string;
  content: string;
  severity: string;
  shift: string;
  result: ViolationResult;
};

export type ViolationFilterState = {
  startDate: string;
  endDate: string;
  vehicleId: "all" | string;
  result: "all" | ViolationResult;
  keyword: string;
};

export const AREA_OPTIONS: { id: HistoryFilterState["areaId"]; label: string }[] = [
  { id: "all", label: "Tất cả khu vực" },
  { id: "HCM", label: "HCM" },
  { id: "HAI_PHONG", label: "Hải Phòng" },
  { id: "CLO", label: "CLO" },
];

export const DEFAULT_VIOLATION_CONTENTS = [
  "Không đeo dây an toàn",
  "Sử dụng điện thoại khi lái xe",
  "Vượt quá tốc độ cho phép",
  "Không bật đèn xi-nhan",
  "Đỗ xe sai quy định",
  "Không kiểm tra xe trước chuyến",
  "Vi phạm thời gian lái xe liên tục",
];

export const DEFAULT_VIOLATION_SEVERITIES: ViolationSeverity[] = ["Nhẹ", "Nặng", "Nghiêm trọng"];

export const DEFAULT_VIOLATION_SHIFTS: ViolationShift[] = [
  "Ca 14h-22h",
  "Ca 06h-14h",
  "Ca 22h-06h",
  "Ca hành chính",
];

export type AppTab = "history" | "violations";
