import { useEffect, useId, useMemo, useState } from "react";
import { LuPlus } from "react-icons/lu";

import type {
  ObservationMethod,
  Vehicle,
  ViolationRecord,
  ViolationResult,
} from "../types";
import {
  Card,
  CardContent,
  DateInput,
  FilterField,
  FilterSelect,
  OutlineButton,
  PrimaryButton,
  cn,
  inputClass,
} from "./ui";

type CreatableSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onOptionsChange: (options: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
};

function CreatableSelect({
  label,
  value,
  options,
  onChange,
  onOptionsChange,
  placeholder,
  ariaLabel,
}: CreatableSelectProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const allOptions = useMemo(() => {
    const merged = [...options];
    if (value && !merged.includes(value)) merged.push(value);
    return merged;
  }, [options, value]);

  useEffect(() => {
    if (value && !options.includes(value)) {
      setCustomMode(true);
      setCustomValue(value);
    }
  }, [options, value]);

  const handleSelectChange = (next: string) => {
    if (next === "__custom__") {
      setCustomMode(true);
      setCustomValue(value);
      return;
    }
    setCustomMode(false);
    onChange(next);
  };

  const applyCustomValue = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    if (!options.includes(trimmed)) onOptionsChange([...options, trimmed]);
    onChange(trimmed);
    setCustomMode(false);
  };

  return (
    <FilterField label={label}>
      {customMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            aria-label={ariaLabel}
            className={cn(inputClass, "flex-1")}
            value={customValue}
            placeholder={placeholder ?? "Nhập giá trị mới..."}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyCustomValue();
              }
            }}
          />
          <OutlineButton onClick={applyCustomValue}>Áp dụng</OutlineButton>
          <OutlineButton
            onClick={() => {
              setCustomMode(false);
              if (options.length > 0) onChange(options[0]);
            }}
          >
            Hủy
          </OutlineButton>
        </div>
      ) : (
        <FilterSelect
          aria-label={ariaLabel}
          value={value || allOptions[0] || ""}
          items={[
            ...allOptions.map((option) => ({ id: option, label: option })),
            { id: "__custom__", label: "+ Nhập thêm..." },
          ]}
          onChange={handleSelectChange}
        />
      )}
    </FilterField>
  );
}

export type ViolationFormValues = Omit<ViolationRecord, "id">;

type ViolationFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: ViolationFormValues;
  vehicles: Vehicle[];
  contentOptions: string[];
  severityOptions: string[];
  shiftOptions: string[];
  onContentOptionsChange: (options: string[]) => void;
  onSeverityOptionsChange: (options: string[]) => void;
  onShiftOptionsChange: (options: string[]) => void;
  onClose: () => void;
  onSubmit: (values: ViolationFormValues) => void;
};

const OBSERVATION_ITEMS = [
  { id: "Trực tiếp", label: "Trực tiếp" },
  { id: "Online", label: "Online" },
];

const RESULT_ITEMS = [
  { id: "Chưa xử lý", label: "Chưa xử lý" },
  { id: "Đã xử lý", label: "Đã xử lý" },
];

export default function ViolationFormModal({
  open,
  mode,
  initialValues,
  vehicles,
  contentOptions,
  severityOptions,
  shiftOptions,
  onContentOptionsChange,
  onSeverityOptionsChange,
  onShiftOptionsChange,
  onClose,
  onSubmit,
}: ViolationFormModalProps) {
  const titleId = useId();
  const [form, setForm] = useState<ViolationFormValues>(initialValues);

  useEffect(() => {
    if (open) setForm(initialValues);
  }, [open, initialValues]);

  const vehicleItems = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.plateNumber} — ${vehicle.vehicleType} (${vehicle.areaLabel})`,
      })),
    [vehicles]
  );

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicleId);

  const patchForm = (patch: Partial<ViolationFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = () => {
    if (!form.violationDate || !form.vehicleId || !form.personnelName.trim() || !form.content.trim()) {
      return;
    }
    onSubmit({
      ...form,
      personnelName: form.personnelName.trim(),
      content: form.content.trim(),
      severity: form.severity.trim(),
      shift: form.shift.trim(),
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {mode === "create" ? "Thêm vi phạm" : "Sửa vi phạm"}
          </h2>
        </div>

        <Card className="border-0 shadow-none">
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DateInput
              label="Ngày vi phạm"
              value={form.violationDate}
              onChange={(violationDate) => patchForm({ violationDate })}
            />

            <FilterField label="Hình thức quan sát">
              <FilterSelect
                aria-label="Hình thức quan sát"
                value={form.observationMethod}
                items={OBSERVATION_ITEMS}
                onChange={(value) => patchForm({ observationMethod: value as ObservationMethod })}
              />
            </FilterField>

            <FilterField label="Số phương tiện">
              <FilterSelect
                aria-label="Số phương tiện"
                value={form.vehicleId}
                items={vehicleItems}
                onChange={(vehicleId) => patchForm({ vehicleId })}
              />
            </FilterField>

            <FilterField label="Loại phương tiện">
              <input
                type="text"
                aria-label="Loại phương tiện"
                className={cn(inputClass, "bg-gray-50")}
                value={selectedVehicle?.vehicleType ?? ""}
                readOnly
              />
            </FilterField>

            <FilterField label="Chi nhánh">
              <input
                type="text"
                aria-label="Chi nhánh"
                className={cn(inputClass, "bg-gray-50")}
                value={selectedVehicle?.areaLabel ?? ""}
                readOnly
              />
            </FilterField>

            <FilterField label="Nhân sự vi phạm">
              <input
                type="text"
                aria-label="Nhân sự vi phạm"
                className={inputClass}
                value={form.personnelName}
                placeholder="Nhập tên nhân sự"
                onChange={(event) => patchForm({ personnelName: event.target.value })}
              />
            </FilterField>

            <div className="sm:col-span-2">
              <CreatableSelect
                label="Nội dung vi phạm"
                ariaLabel="Nội dung vi phạm"
                value={form.content}
                options={contentOptions}
                onChange={(content) => patchForm({ content })}
                onOptionsChange={onContentOptionsChange}
                placeholder="Nhập nội dung vi phạm mới..."
              />
            </div>

            <CreatableSelect
              label="Phân loại lỗi"
              ariaLabel="Phân loại lỗi"
              value={form.severity}
              options={severityOptions}
              onChange={(severity) => patchForm({ severity })}
              onOptionsChange={onSeverityOptionsChange}
              placeholder="Nhập phân loại lỗi mới..."
            />

            <CreatableSelect
              label="Ca trực ghi nhận"
              ariaLabel="Ca trực ghi nhận"
              value={form.shift}
              options={shiftOptions}
              onChange={(shift) => patchForm({ shift })}
              onOptionsChange={onShiftOptionsChange}
              placeholder="Nhập ca trực mới..."
            />

            <FilterField label="Kết quả">
              <FilterSelect
                aria-label="Kết quả"
                value={form.result}
                items={RESULT_ITEMS}
                onChange={(value) => patchForm({ result: value as ViolationResult })}
              />
            </FilterField>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <OutlineButton onClick={onClose}>Hủy</OutlineButton>
          <PrimaryButton onClick={handleSubmit}>
            {mode === "create" ? (
              <span className="inline-flex items-center gap-1.5">
                <LuPlus className="h-4 w-4" aria-hidden />
                Thêm
              </span>
            ) : (
              "Lưu"
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function createEmptyViolationForm(today: string): ViolationFormValues {
  return {
    violationDate: today,
    observationMethod: "Trực tiếp",
    vehicleId: "",
    personnelName: "",
    content: "",
    severity: "Nhẹ",
    shift: "Ca 06h-14h",
    result: "Chưa xử lý",
  };
}
