import { useCallback, useMemo, useState } from "react";
import { LuClipboardList, LuPlus, LuTriangleAlert, LuUsers } from "react-icons/lu";

import DrivingHistoryTable from "./components/DrivingHistoryTable";
import HistoryFilterCard from "./components/HistoryFilterCard";
import TabBar from "./components/TabBar";
import ViolationFilterCard from "./components/ViolationFilterCard";
import ViolationFormModal, {
  createEmptyViolationForm,
  type ViolationFormValues,
} from "./components/ViolationFormModal";
import ViolationTable from "./components/ViolationTable";
import WorkingHoursFilterCard from "./components/WorkingHoursFilterCard";
import WorkingHoursTable from "./components/WorkingHoursTable";
import { FeaturePageShell, KpiCardsGrid, PageTitle, PrimaryButton } from "./components/ui";
import {
  DEFAULT_ROTATIONS,
  DEFAULT_VIOLATIONS,
  getVehicleById,
  MOCK_DRIVERS,
  MOCK_VEHICLES,
} from "./data/mockData";
import type {
  AppTab,
  AreaCode,
  HistoryFilterState,
  ViolationFilterState,
  ViolationRecord,
  WorkingHoursFilterState,
} from "./types";
import {
  DEFAULT_VIOLATION_CONTENTS,
  DEFAULT_VIOLATION_SEVERITIES,
  DEFAULT_VIOLATION_SHIFTS,
} from "./types";
import { currentMonthDateRange, currentWeekDateRange } from "./utils/dateUtils";
import { buildDriverWorkingHoursRows } from "./utils/workingHoursUtils";

const defaultHistoryRange = currentWeekDateRange();
const defaultViolationRange = currentMonthDateRange();
const defaultWorkingHoursDate = defaultHistoryRange.endDate;

function createId(): string {
  return `vp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("history");

  const [historyFilter, setHistoryFilter] = useState<HistoryFilterState>({
    areaId: "all",
    driverId: "all",
    vehicleId: "all",
    startDate: defaultHistoryRange.startDate,
    endDate: defaultHistoryRange.endDate,
  });

  const [violationFilter, setViolationFilter] = useState<ViolationFilterState>({
    startDate: defaultViolationRange.startDate,
    endDate: defaultViolationRange.endDate,
    areaId: "all",
    driverId: "all",
    vehicleId: "all",
    content: "all",
    result: "all",
  });

  const [workingHoursFilter, setWorkingHoursFilter] = useState<WorkingHoursFilterState>({
    date: defaultWorkingHoursDate,
    areaId: "all",
    driverId: "all",
  });

  const [violations, setViolations] = useState<ViolationRecord[]>(DEFAULT_VIOLATIONS);
  const [contentOptions, setContentOptions] = useState<string[]>([...DEFAULT_VIOLATION_CONTENTS]);
  const [severityOptions, setSeverityOptions] = useState<string[]>([...DEFAULT_VIOLATION_SEVERITIES]);
  const [shiftOptions, setShiftOptions] = useState<string[]>([...DEFAULT_VIOLATION_SHIFTS]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<ViolationFormValues>(
    createEmptyViolationForm(defaultViolationRange.endDate)
  );

  const patchHistoryFilter = useCallback((patch: Partial<HistoryFilterState>) => {
    setHistoryFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  const patchViolationFilter = useCallback((patch: Partial<ViolationFilterState>) => {
    setViolationFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  const patchWorkingHoursFilter = useCallback((patch: Partial<WorkingHoursFilterState>) => {
    setWorkingHoursFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  const plateByVehicleId = useMemo(
    () => new Map(MOCK_VEHICLES.map((vehicle) => [vehicle.id, vehicle.plateNumber])),
    []
  );

  const areaLabelByVehicleId = useMemo(
    () => new Map(MOCK_VEHICLES.map((vehicle) => [vehicle.id, vehicle.areaLabel])),
    []
  );

  const filteredVehiclesForHistory = useMemo(() => {
    return MOCK_VEHICLES.filter((vehicle) => {
      if (historyFilter.areaId !== "all" && vehicle.area !== historyFilter.areaId) return false;
      if (historyFilter.vehicleId !== "all" && vehicle.id !== historyFilter.vehicleId) return false;
      return true;
    });
  }, [historyFilter.areaId, historyFilter.vehicleId]);

  const vehicleIdsForHistory = useMemo(
    () => new Set(filteredVehiclesForHistory.map((vehicle) => vehicle.id)),
    [filteredVehiclesForHistory]
  );

  const filteredRotations = useMemo(() => {
    return DEFAULT_ROTATIONS.filter((row) => {
      if (!vehicleIdsForHistory.has(row.vehicleId)) return false;
      if (row.date < historyFilter.startDate || row.date > historyFilter.endDate) return false;
      if (historyFilter.driverId !== "all") {
        const hasDriver = row.trips.some((trip) => trip.driverId === historyFilter.driverId);
        if (!hasDriver) return false;
      }
      return true;
    });
  }, [historyFilter.driverId, historyFilter.endDate, historyFilter.startDate, vehicleIdsForHistory]);

  const uniqueDriversInHistory = useMemo(() => {
    const ids = new Set<string>();
    for (const row of filteredRotations) {
      for (const trip of row.trips) ids.add(trip.driverId);
    }
    return ids.size;
  }, [filteredRotations]);

  const uniqueVehiclesInHistory = useMemo(() => {
    return new Set(filteredRotations.map((row) => row.vehicleId)).size;
  }, [filteredRotations]);

  const historyKpiItems = useMemo(
    () => [
      {
        key: "drivers",
        label: "Tài xế",
        value: uniqueDriversInHistory,
        icon: LuUsers,
        iconClass: "text-blue-600",
      },
      {
        key: "vehicles",
        label: "Xe tham gia",
        value: uniqueVehiclesInHistory,
        icon: LuClipboardList,
        iconClass: "text-slate-500",
      },
    ],
    [uniqueDriversInHistory, uniqueVehiclesInHistory]
  );

  const violationContentFilterOptions = useMemo(() => {
    const fromRecords = violations.map((row) => row.content).filter(Boolean);
    return [...new Set([...contentOptions, ...fromRecords])].sort((a, b) => a.localeCompare(b));
  }, [contentOptions, violations]);

  const filteredViolations = useMemo(() => {
    const selectedDriver =
      violationFilter.driverId !== "all"
        ? MOCK_DRIVERS.find((driver) => driver.id === violationFilter.driverId)
        : undefined;

    return violations.filter((row) => {
      if (row.violationDate < violationFilter.startDate || row.violationDate > violationFilter.endDate) {
        return false;
      }
      if (violationFilter.vehicleId !== "all" && row.vehicleId !== violationFilter.vehicleId) {
        return false;
      }
      if (violationFilter.result !== "all" && row.result !== violationFilter.result) {
        return false;
      }
      if (violationFilter.content !== "all" && row.content !== violationFilter.content) {
        return false;
      }
      if (violationFilter.areaId !== "all") {
        const vehicle = getVehicleById(row.vehicleId);
        if (!vehicle || vehicle.area !== violationFilter.areaId) return false;
      }
      if (selectedDriver && row.personnelName !== selectedDriver.name) {
        return false;
      }
      return true;
    });
  }, [violationFilter, violations]);

  const violationKpiItems = useMemo(() => {
    const pending = filteredViolations.filter((row) => row.result === "Chưa xử lý").length;
    const resolved = filteredViolations.filter((row) => row.result === "Đã xử lý").length;
    const serious = filteredViolations.filter((row) => row.severity === "Nghiêm trọng").length;

    return [
      {
        key: "total",
        label: "Tổng vi phạm",
        value: filteredViolations.length,
        icon: LuTriangleAlert,
        iconClass: "text-slate-500",
      },
      {
        key: "pending",
        label: "Chưa xử lý",
        value: pending,
        icon: LuTriangleAlert,
        valueClass: "text-amber-700",
        iconClass: "text-amber-500",
      },
      {
        key: "resolved",
        label: "Đã xử lý",
        value: resolved,
        icon: LuTriangleAlert,
        valueClass: "text-emerald-700",
        iconClass: "text-emerald-500",
      },
      {
        key: "serious",
        label: "Nghiêm trọng",
        value: serious,
        icon: LuTriangleAlert,
        valueClass: "text-red-700",
        iconClass: "text-red-500",
      },
    ];
  }, [filteredViolations]);

  const workingHoursRows = useMemo(
    () => buildDriverWorkingHoursRows(DEFAULT_ROTATIONS, workingHoursFilter),
    [workingHoursFilter]
  );

  const openCreateForm = () => {
    setFormMode("create");
    setEditingId(null);
    setFormInitialValues(createEmptyViolationForm(violationFilter.endDate));
    setFormOpen(true);
  };

  const openEditForm = (record: ViolationRecord) => {
    setFormMode("edit");
    setEditingId(record.id);
    setFormInitialValues({
      violationDate: record.violationDate,
      observationMethod: record.observationMethod,
      vehicleId: record.vehicleId,
      personnelName: record.personnelName,
      content: record.content,
      severity: record.severity,
      shift: record.shift,
      result: record.result,
    });
    setFormOpen(true);
  };

  const handleSubmitViolation = (values: ViolationFormValues) => {
    if (formMode === "create") {
      setViolations((prev) => [{ id: createId(), ...values }, ...prev]);
    } else if (editingId) {
      setViolations((prev) =>
        prev.map((row) => (row.id === editingId ? { id: editingId, ...values } : row))
      );
    }
    setFormOpen(false);
  };

  const handleDeleteViolation = (id: string) => {
    setViolations((prev) => prev.filter((row) => row.id !== id));
  };

  const historyAreaVehicles =
    historyFilter.areaId === "all"
      ? MOCK_VEHICLES
      : MOCK_VEHICLES.filter((vehicle) => vehicle.area === (historyFilter.areaId as AreaCode));

  const violationAreaVehicles =
    violationFilter.areaId === "all"
      ? MOCK_VEHICLES
      : MOCK_VEHICLES.filter((vehicle) => vehicle.area === (violationFilter.areaId as AreaCode));

  return (
    <FeaturePageShell>
      <PageTitle>Quản lý hoạt động tài xế</PageTitle>

      <CardWithTabs activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "history" ? (
          <>
            <HistoryFilterCard
              filter={historyFilter}
              drivers={MOCK_DRIVERS}
              vehicles={historyAreaVehicles}
              onChange={patchHistoryFilter}
            />

            <KpiCardsGrid items={historyKpiItems} />

            <DrivingHistoryTable
              rotations={filteredRotations}
              plateByVehicleId={plateByVehicleId}
              areaLabelByVehicleId={areaLabelByVehicleId}
            />
          </>
        ) : activeTab === "violations" ? (
          <>
            <ViolationFilterCard
              filter={violationFilter}
              drivers={MOCK_DRIVERS}
              vehicles={violationAreaVehicles}
              contentOptions={violationContentFilterOptions}
              onChange={patchViolationFilter}
            />

            <KpiCardsGrid items={violationKpiItems} />

            <div className="flex justify-end">
              <PrimaryButton onClick={openCreateForm}>
                <span className="inline-flex items-center gap-1.5">
                  <LuPlus className="h-4 w-4" aria-hidden />
                  Thêm vi phạm
                </span>
              </PrimaryButton>
            </div>

            <ViolationTable
              violations={filteredViolations}
              onEdit={openEditForm}
              onDelete={handleDeleteViolation}
            />
          </>
        ) : (
          <>
            <WorkingHoursFilterCard
              filter={workingHoursFilter}
              drivers={MOCK_DRIVERS}
              onChange={patchWorkingHoursFilter}
            />

            <WorkingHoursTable rows={workingHoursRows} />
          </>
        )}
      </CardWithTabs>

      <ViolationFormModal
        open={formOpen}
        mode={formMode}
        initialValues={formInitialValues}
        drivers={MOCK_DRIVERS}
        vehicles={MOCK_VEHICLES}
        contentOptions={contentOptions}
        severityOptions={severityOptions}
        shiftOptions={shiftOptions}
        onContentOptionsChange={setContentOptions}
        onSeverityOptionsChange={setSeverityOptions}
        onShiftOptionsChange={setShiftOptions}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitViolation}
      />
    </FeaturePageShell>
  );
}

function CardWithTabs({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <TabBar activeTab={activeTab} onChange={onTabChange} />
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4">
        <div className="space-y-3">{children}</div>
      </div>
    </section>
  );
}
