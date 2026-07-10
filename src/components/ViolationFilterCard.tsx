import { useMemo } from "react";

import type { Driver, Vehicle, ViolationFilterState } from "../types";
import { AREA_OPTIONS } from "../types";
import {
  FILTER_AREA_FIELD_CLASS,
  FILTER_BAR_LAYOUT_CLASS,
  FILTER_CONTENT_FIELD_CLASS,
  FILTER_DATE_FIELD_CLASS,
  FILTER_DRIVER_FIELD_CLASS,
  FILTER_STATUS_FIELD_CLASS,
  FILTER_VEHICLE_FIELD_CLASS,
} from "../styles/fieldStyles";
import FilterAutocomplete from "./FilterAutocomplete";
import { Card, CardContent, DateInput, FilterField } from "./ui";

type ViolationFilterCardProps = {
  filter: ViolationFilterState;
  drivers: Driver[];
  vehicles: Vehicle[];
  contentOptions: string[];
  onChange: (patch: Partial<ViolationFilterState>) => void;
};

export default function ViolationFilterCard({
  filter,
  drivers,
  vehicles,
  contentOptions,
  onChange,
}: ViolationFilterCardProps) {
  const areaOptions = useMemo(
    () => AREA_OPTIONS.map((item) => ({ id: item.id, label: item.label })),
    []
  );

  const driverOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả tài xế" },
      ...drivers.map((driver) => ({ id: driver.id, label: driver.name })),
    ],
    [drivers]
  );

  const vehicleOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả xe" },
      ...vehicles.map((vehicle) => ({ id: vehicle.id, label: vehicle.plateNumber })),
    ],
    [vehicles]
  );

  const contentFilterOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả nội dung" },
      ...contentOptions.map((content) => ({ id: content, label: content })),
    ],
    [contentOptions]
  );

  const statusOptions = useMemo(
    () => [
      { id: "all", label: "Tất cả trạng thái" },
      { id: "Chưa xử lý", label: "Chưa xử lý" },
      { id: "Đã xử lý", label: "Đã xử lý" },
    ],
    []
  );

  return (
    <Card>
      <CardContent>
        <div className={FILTER_BAR_LAYOUT_CLASS}>
          <DateInput
            label="Từ ngày"
            className={FILTER_DATE_FIELD_CLASS}
            value={filter.startDate}
            max={filter.endDate}
            onChange={(startDate) => onChange({ startDate })}
          />
          <DateInput
            label="Đến ngày"
            className={FILTER_DATE_FIELD_CLASS}
            value={filter.endDate}
            min={filter.startDate}
            onChange={(endDate) => onChange({ endDate })}
          />
          <FilterField label="Khu vực" className={FILTER_AREA_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Khu vực"
              value={filter.areaId}
              options={areaOptions}
              placeholder="Tất cả khu vực"
              searchable={false}
              onChange={(areaId) =>
                onChange({
                  areaId: areaId as ViolationFilterState["areaId"],
                  vehicleId: "all",
                })
              }
            />
          </FilterField>
          <FilterField label="Tài xế" className={FILTER_DRIVER_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Tài xế"
              value={filter.driverId}
              options={driverOptions}
              placeholder="Tất cả tài xế"
              searchPlaceholder="Tìm tài xế..."
              onChange={(driverId) => onChange({ driverId })}
            />
          </FilterField>
          <FilterField label="Xe" className={FILTER_VEHICLE_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Xe"
              value={filter.vehicleId}
              options={vehicleOptions}
              placeholder="Tất cả xe"
              searchPlaceholder="Tìm biển số..."
              onChange={(vehicleId) => onChange({ vehicleId })}
            />
          </FilterField>
          <FilterField label="Nội dung vi phạm" className={FILTER_CONTENT_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Nội dung vi phạm"
              value={filter.content}
              options={contentFilterOptions}
              placeholder="Tất cả nội dung"
              searchPlaceholder="Tìm nội dung vi phạm..."
              onChange={(content) => onChange({ content })}
            />
          </FilterField>
          <FilterField label="Trạng thái" className={FILTER_STATUS_FIELD_CLASS}>
            <FilterAutocomplete
              aria-label="Trạng thái"
              value={filter.result}
              options={statusOptions}
              placeholder="Tất cả trạng thái"
              searchable={false}
              onChange={(result) => onChange({ result: result as ViolationFilterState["result"] })}
            />
          </FilterField>
        </div>
      </CardContent>
    </Card>
  );
}
