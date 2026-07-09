import { useMemo } from "react";

import type { Vehicle, ViolationFilterState } from "../types";
import { Card, CardContent, DateInput, FilterField, FilterSelect, inputClass } from "./ui";

type ViolationFilterCardProps = {
  filter: ViolationFilterState;
  vehicles: Vehicle[];
  onChange: (patch: Partial<ViolationFilterState>) => void;
};

export default function ViolationFilterCard({ filter, vehicles, onChange }: ViolationFilterCardProps) {
  const vehicleItems = useMemo(
    () => [
      { id: "all", label: "Tất cả xe" },
      ...vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.plateNumber} (${vehicle.areaLabel})`,
      })),
    ],
    [vehicles]
  );

  const resultItems = [
    { id: "all", label: "Tất cả kết quả" },
    { id: "Chưa xử lý", label: "Chưa xử lý" },
    { id: "Đã xử lý", label: "Đã xử lý" },
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
          <FilterField label="Xe" className="w-[13.5rem] shrink-0">
            <FilterSelect
              aria-label="Xe"
              className="w-full"
              value={filter.vehicleId}
              items={vehicleItems}
              onChange={(vehicleId) => onChange({ vehicleId })}
            />
          </FilterField>
          <FilterField label="Kết quả" className="w-[11rem] shrink-0">
            <FilterSelect
              aria-label="Kết quả"
              className="w-full"
              value={filter.result}
              items={resultItems}
              onChange={(result) => onChange({ result: result as ViolationFilterState["result"] })}
            />
          </FilterField>
          <FilterField label="Từ khóa" className="min-w-[12rem] flex-1">
            <input
              type="search"
              aria-label="Từ khóa"
              placeholder="Nhân sự, nội dung vi phạm..."
              className={inputClass}
              value={filter.keyword}
              onChange={(event) => onChange({ keyword: event.target.value })}
            />
          </FilterField>
        </div>
      </CardContent>
    </Card>
  );
}
