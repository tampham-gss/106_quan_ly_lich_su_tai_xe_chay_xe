import { useMemo } from "react";

import type { Driver, HistoryFilterState, Vehicle } from "../types";
import { AREA_OPTIONS } from "../types";
import FilterAutocomplete from "./FilterAutocomplete";
import { Card, CardContent, DateInput, FilterField } from "./ui";

type HistoryFilterCardProps = {
  filter: HistoryFilterState;
  drivers: Driver[];
  vehicles: Vehicle[];
  onChange: (patch: Partial<HistoryFilterState>) => void;
};

export default function HistoryFilterCard({ filter, drivers, vehicles, onChange }: HistoryFilterCardProps) {
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

  return (
    <Card>
      <CardContent>
        <div className="grid min-w-0 grid-cols-2 items-end gap-3 md:grid-cols-3 xl:grid-cols-5">
          <DateInput
            label="Từ ngày"
            className="min-w-0"
            value={filter.startDate}
            max={filter.endDate}
            onChange={(startDate) => onChange({ startDate })}
          />
          <DateInput
            label="Đến ngày"
            className="min-w-0"
            value={filter.endDate}
            min={filter.startDate}
            onChange={(endDate) => onChange({ endDate })}
          />
          <FilterField label="Khu vực" className="min-w-0">
            <FilterAutocomplete
              aria-label="Khu vực"
              value={filter.areaId}
              options={areaOptions}
              placeholder="Tất cả khu vực"
              searchable={false}
              onChange={(areaId) =>
                onChange({ areaId: areaId as HistoryFilterState["areaId"], vehicleId: "all" })
              }
            />
          </FilterField>
          <FilterField label="Tài xế" className="min-w-0">
            <FilterAutocomplete
              aria-label="Tài xế"
              value={filter.driverId}
              options={driverOptions}
              placeholder="Tất cả tài xế"
              searchPlaceholder="Tìm tài xế..."
              onChange={(driverId) => onChange({ driverId })}
            />
          </FilterField>
          <FilterField label="Xe" className="min-w-0">
            <FilterAutocomplete
              aria-label="Xe"
              value={filter.vehicleId}
              options={vehicleOptions}
              placeholder="Tất cả xe"
              searchPlaceholder="Tìm biển số..."
              onChange={(vehicleId) => onChange({ vehicleId })}
            />
          </FilterField>
        </div>
      </CardContent>
    </Card>
  );
}
