import { Card, CardContent, DateInput, FilterField, FilterSelect } from "./ui";
import type { Driver, HistoryFilterState, Vehicle } from "../types";
import { AREA_OPTIONS } from "../types";

type HistoryFilterCardProps = {
  filter: HistoryFilterState;
  drivers: Driver[];
  vehicles: Vehicle[];
  onChange: (patch: Partial<HistoryFilterState>) => void;
};

export default function HistoryFilterCard({ filter, drivers, vehicles, onChange }: HistoryFilterCardProps) {
  const driverItems = [
    { id: "all", label: "Tất cả tài xế" },
    ...drivers.map((driver) => ({ id: driver.id, label: driver.name })),
  ];

  const vehicleItems = [
    { id: "all", label: "Tất cả xe" },
    ...vehicles.map((vehicle) => ({
      id: vehicle.id,
      label: `${vehicle.plateNumber} (${vehicle.areaLabel})`,
    })),
  ];

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-end gap-3 lg:flex-nowrap">
          <DateInput
            label="Từ ngày"
            className="shrink-0"
            inputClassName="w-[10.5rem]"
            value={filter.startDate}
            max={filter.endDate}
            onChange={(startDate) => onChange({ startDate })}
          />
          <DateInput
            label="Đến ngày"
            className="shrink-0"
            inputClassName="w-[10.5rem]"
            value={filter.endDate}
            min={filter.startDate}
            onChange={(endDate) => onChange({ endDate })}
          />
          <FilterField label="Khu vực" className="w-[11rem] shrink-0">
            <FilterSelect
              aria-label="Khu vực"
              className="w-full"
              value={filter.areaId}
              items={AREA_OPTIONS.map((item) => ({ id: item.id, label: item.label }))}
              onChange={(areaId) =>
                onChange({ areaId: areaId as HistoryFilterState["areaId"], vehicleId: "all" })
              }
            />
          </FilterField>
          <FilterField label="Tài xế" className="w-[13.5rem] shrink-0">
            <FilterSelect
              aria-label="Tài xế"
              className="w-full"
              value={filter.driverId}
              items={driverItems}
              onChange={(driverId) => onChange({ driverId })}
            />
          </FilterField>
          <FilterField label="Xe" className="w-[13.5rem] shrink-0">
            <FilterSelect
              aria-label="Xe"
              className="w-full"
              value={filter.vehicleId}
              items={vehicleItems}
              onChange={(vehicleId) => onChange({ vehicleId })}
            />
          </FilterField>
        </div>
      </CardContent>
    </Card>
  );
}
