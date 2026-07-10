import { useMemo } from "react";

import type { Driver, WorkingHoursFilterState } from "../types";
import { AREA_OPTIONS } from "../types";
import {
  FILTER_AREA_FIELD_CLASS,
  FILTER_BAR_LAYOUT_CLASS,
  FILTER_DATE_FIELD_CLASS,
  FILTER_DRIVER_FIELD_CLASS,
} from "../styles/fieldStyles";
import FilterAutocomplete from "./FilterAutocomplete";
import { Card, CardContent, DatePickerInput, FilterField } from "./ui";
type WorkingHoursFilterCardProps = {
  filter: WorkingHoursFilterState;
  drivers: Driver[];
  onChange: (patch: Partial<WorkingHoursFilterState>) => void;
};

export default function WorkingHoursFilterCard({
  filter,
  drivers,
  onChange,
}: WorkingHoursFilterCardProps) {
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

  return (
    <Card>
      <CardContent>
        <div className={FILTER_BAR_LAYOUT_CLASS}>
          <DatePickerInput
            label="Ngày"
            className={FILTER_DATE_FIELD_CLASS}
            value={filter.date}
            onChange={(date) => onChange({ date })}
          />
          <FilterField label="Khu vực" className={FILTER_AREA_FIELD_CLASS}>            <FilterAutocomplete
              aria-label="Khu vực"
              value={filter.areaId}
              options={areaOptions}
              placeholder="Tất cả khu vực"
              searchable={false}
              onChange={(areaId) =>
                onChange({ areaId: areaId as WorkingHoursFilterState["areaId"] })
              }
            />
          </FilterField>
          <FilterField label="Tài xế" className={FILTER_DRIVER_FIELD_CLASS}>            <FilterAutocomplete
              aria-label="Tài xế"
              value={filter.driverId}
              options={driverOptions}
              placeholder="Tất cả tài xế"
              searchPlaceholder="Tìm tài xế..."
              onChange={(driverId) => onChange({ driverId })}
            />
          </FilterField>
        </div>
      </CardContent>
    </Card>
  );
}
