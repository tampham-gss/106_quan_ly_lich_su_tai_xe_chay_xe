import { useEffect, useId, useMemo, useState } from "react";

import type { Driver, ObservationMethod, Vehicle, ViolationRecord, ViolationResult } from "../types";
import AutocompleteField from "./AutocompleteField";
import CreatableLookupField from "./CreatableLookupField";
import ModalButton from "./modal/ModalButton";
import ModalFieldError from "./modal/ModalFieldError";
import ModalFieldLabel from "./modal/ModalFieldLabel";
import ModalFooter from "./modal/ModalFooter";
import ModalHeader from "./modal/ModalHeader";
import ViDateInput from "./ViDateInput";
import { cn } from "./ui";
import { MODAL_BODY_CLASS, MODAL_CONTAINER_CLASS, MODAL_NATIVE_INPUT_CLASS } from "../styles/modalStyles";

export type ViolationFormValues = Omit<ViolationRecord, "id">;

type ViolationFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: ViolationFormValues;
  drivers: Driver[];
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

type FieldKey = "driver" | "vehicleId" | "violationDate" | "content";

type FormErrors = Partial<Record<FieldKey, string>>;

function validateForm(form: ViolationFormValues, selectedDriverId: string): FormErrors {
  const errors: FormErrors = {};

  if (!selectedDriverId) errors.driver = "Vui lòng chọn tài xế";
  if (!form.vehicleId) errors.vehicleId = "Vui lòng chọn phương tiện";
  if (!form.violationDate) errors.violationDate = "Vui lòng chọn ngày vi phạm";
  if (!form.content.trim()) errors.content = "Vui lòng nhập nội dung vi phạm";

  return errors;
}

export default function ViolationFormModal({
  open,
  mode,
  initialValues,
  drivers,
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
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initialValues);
    const matchedDriver = drivers.find((driver) => driver.name === initialValues.personnelName);
    setSelectedDriverId(matchedDriver?.id ?? "");
    setSubmitted(false);
  }, [open, initialValues, drivers]);

  const driverOptions = useMemo(
    () => drivers.map((driver) => ({ id: driver.id, label: driver.name })),
    [drivers]
  );

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: vehicle.plateNumber,
        sublabel: vehicle.vehicleType,
      })),
    [vehicles]
  );

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicleId);
  const driverHint = selectedVehicle ? `Khu vực: ${selectedVehicle.areaLabel}` : undefined;
  const vehicleHint = selectedVehicle ? `Loại: ${selectedVehicle.vehicleType}` : undefined;
  const errors = useMemo(() => validateForm(form, selectedDriverId), [form, selectedDriverId]);

  const showError = (field: FieldKey) => submitted && !!errors[field];

  const patchForm = (patch: Partial<ViolationFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    const driver = drivers.find((item) => item.id === driverId);
    patchForm({ personnelName: driver?.name ?? "" });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validateForm(form, selectedDriverId);
    if (Object.keys(nextErrors).length > 0) return;

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
        className={MODAL_CONTAINER_CLASS}
        onClick={(event) => event.stopPropagation()}
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <ModalHeader
            titleId={titleId}
            title={mode === "create" ? "Thêm vi phạm" : "Chỉnh sửa vi phạm"}
            onClose={onClose}
          />

          <div className={cn(MODAL_BODY_CLASS, "grid gap-4 sm:grid-cols-2")}>
            <AutocompleteField
              label="Tài xế"
              required
              value={selectedDriverId}
              options={driverOptions}
              placeholder="Chọn tài xế"
              searchPlaceholder="Tìm tài xế..."
              hint={driverHint}
              error={errors.driver}
              showError={showError("driver")}
              onChange={handleDriverChange}
            />

            <AutocompleteField
              label="Phương tiện"
              required
              value={form.vehicleId}
              options={vehicleOptions}
              placeholder="Chọn phương tiện"
              searchPlaceholder="Tìm biển số..."
              hint={vehicleHint}
              error={errors.vehicleId}
              showError={showError("vehicleId")}
              onChange={(vehicleId) => patchForm({ vehicleId })}
            />

            <div className="space-y-1.5">
              <ModalFieldLabel required htmlFor="violation-date">
                Ngày vi phạm
              </ModalFieldLabel>
              <ViDateInput
                id="violation-date"
                aria-label="Ngày vi phạm"
                aria-invalid={showError("violationDate")}
                className={cn(
                  MODAL_NATIVE_INPUT_CLASS,
                  showError("violationDate") && "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                )}
                value={form.violationDate}
                onChange={(violationDate) => patchForm({ violationDate })}
              />
              {showError("violationDate") ? <ModalFieldError message={errors.violationDate} /> : null}
            </div>

            <AutocompleteField
              label="Hình thức quan sát"
              value={form.observationMethod}
              options={OBSERVATION_ITEMS}
              placeholder="Chọn hình thức quan sát"
              searchable={false}
              onChange={(observationMethod) =>
                patchForm({ observationMethod: observationMethod as ObservationMethod })
              }
            />

            <CreatableLookupField
              label="Nội dung vi phạm"
              required
              value={form.content}
              options={contentOptions}
              placeholder="Chọn nội dung vi phạm"
              error={errors.content}
              showError={showError("content")}
              onChange={(content) => patchForm({ content })}
              onOptionsChange={onContentOptionsChange}
            />

            <CreatableLookupField
              label="Phân loại lỗi"
              value={form.severity}
              options={severityOptions}
              placeholder="Chọn phân loại lỗi"
              onChange={(severity) => patchForm({ severity })}
              onOptionsChange={onSeverityOptionsChange}
            />

            <CreatableLookupField
              label="Ca trực ghi nhận"
              value={form.shift}
              options={shiftOptions}
              placeholder="Chọn ca trực ghi nhận"
              onChange={(shift) => patchForm({ shift })}
              onOptionsChange={onShiftOptionsChange}
            />

            <AutocompleteField
              label="Trạng thái"
              value={form.result}
              options={RESULT_ITEMS}
              placeholder="Chọn trạng thái"
              searchable={false}
              onChange={(result) => patchForm({ result: result as ViolationResult })}
            />
          </div>

          <ModalFooter>
            <ModalButton variant="cancel" type="button" showIcon={false} onClick={onClose}>
              Hủy
            </ModalButton>
            <ModalButton variant="primary" type="submit">
              {mode === "create" ? "Thêm" : "Lưu"}
            </ModalButton>
          </ModalFooter>
        </form>
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
    severity: "",
    shift: "",
    result: "Chưa xử lý",
  };
}
