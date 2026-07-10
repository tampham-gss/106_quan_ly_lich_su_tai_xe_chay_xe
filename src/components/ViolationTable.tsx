import { useEffect, useMemo, useState } from "react";
import { LuSquarePen, LuTrash2 } from "react-icons/lu";

import type { Vehicle, ViolationRecord } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatViDate } from "../utils/dateUtils";
import TablePager, { buildPaginationMeta, DEFAULT_PAGE_SIZE } from "./TablePager";
import { Tooltip } from "./Tooltip";
import ViolationDeleteModal from "./ViolationDeleteModal";
import { cn } from "./ui";

const violationTableHeaderClass =
  "px-3 py-2 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase";

const violationTableHeaderCenterClass =
  "px-3 py-2 text-center text-xs font-semibold tracking-wide text-slate-600 uppercase";

const violationTableBodyClass = "px-3 py-2 text-slate-700";

const violationRowClass = "h-10 border-b border-slate-100 hover:bg-slate-50/60";

type ViolationTableProps = {
  violations: ViolationRecord[];
  onEdit: (record: ViolationRecord) => void;
  onDelete: (id: string) => void;
};

function resultBadgeClass(result: ViolationRecord["result"]): string {
  return result === "Đã xử lý"
    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
    : "border-amber-300 bg-amber-50 text-amber-700";
}

function severityBadgeClass(severity: string): string {
  if (severity === "Nghiêm trọng") return "border-red-300 bg-red-50 text-red-700";
  if (severity === "Nặng") return "border-orange-300 bg-orange-50 text-orange-700";
  return "border-slate-300 bg-white text-slate-700";
}

function IconEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Sửa" placement="bottom">
      <button
        type="button"
        aria-label="Sửa"
        onClick={onClick}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
      >
        <LuSquarePen className="h-4 w-4" aria-hidden />
      </button>
    </Tooltip>
  );
}

function IconDeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip label="Xóa" placement="bottom">
      <button
        type="button"
        aria-label="Xóa"
        onClick={onClick}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
      >
        <LuTrash2 className="h-4 w-4" aria-hidden />
      </button>
    </Tooltip>
  );
}

export default function ViolationTable({ violations, onEdit, onDelete }: ViolationTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pagination = useMemo(
    () => buildPaginationMeta(page, pageSize, violations.length),
    [page, pageSize, violations.length]
  );

  const totalPages = pagination.totalPages;

  useEffect(() => {
    setPage(1);
  }, [violations, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return violations.slice(start, start + pageSize);
  }, [violations, page, pageSize]);

  const pendingDeleteRecord = useMemo(
    () => violations.find((record) => record.id === pendingDeleteId) ?? null,
    [violations, pendingDeleteId]
  );

  const getVehicle = (vehicleId: string): Vehicle | undefined => getVehicleById(vehicleId);

  if (violations.length === 0) {
    return (
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="p-8 text-center text-sm text-gray-500">
          Không có dữ liệu vi phạm phù hợp bộ lọc.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[11%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className={violationTableHeaderClass}>Tài xế</th>
              <th className={violationTableHeaderClass}>Phương tiện</th>
              <th className={violationTableHeaderClass}>Ngày vi phạm</th>
              <th className={violationTableHeaderClass}>Hình thức quan sát</th>
              <th className={violationTableHeaderClass}>Nội dung vi phạm</th>
              <th className={violationTableHeaderClass}>Phân loại lỗi</th>
              <th className={violationTableHeaderClass}>Ca trực ghi nhận</th>
              <th className={violationTableHeaderClass}>Trạng thái</th>
              <th className={violationTableHeaderCenterClass}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row) => {
              const vehicle = getVehicle(row.vehicleId);
              return (
                <tr key={row.id} className={violationRowClass}>
                  <td className={violationTableBodyClass}>
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 font-medium text-gray-900">
                      <span className="truncate">{row.personnelName}</span>
                      <span className="shrink-0 text-xs font-normal text-gray-500">
                        {vehicle?.areaLabel ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className={violationTableBodyClass}>
                    <div className="font-medium text-gray-900">{vehicle?.plateNumber ?? "—"}</div>
                    <div className="text-xs text-gray-500">{vehicle?.vehicleType ?? "—"}</div>
                  </td>
                  <td className={cn(violationTableBodyClass, "tabular-nums whitespace-nowrap")}>
                    {formatViDate(row.violationDate)}
                  </td>
                  <td className={violationTableBodyClass}>{row.observationMethod}</td>
                  <td className={cn(violationTableBodyClass, "break-words")}>{row.content}</td>
                  <td className={violationTableBodyClass}>
                    {row.severity ? (
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          severityBadgeClass(row.severity)
                        )}
                      >
                        {row.severity}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={cn(violationTableBodyClass, "break-words")}>{row.shift || "—"}</td>
                  <td className={violationTableBodyClass}>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        resultBadgeClass(row.result)
                      )}
                    >
                      {row.result}
                    </span>
                  </td>
                  <td className={cn(violationTableBodyClass, "text-center whitespace-nowrap")}>
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <IconEditButton onClick={() => onEdit(row)} />
                      <IconDeleteButton onClick={() => setPendingDeleteId(row.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <TablePager
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="px-4 py-3 sm:px-5"
          ariaLabel="Phân trang danh sách vi phạm"
        />
      </section>

      <ViolationDeleteModal
        open={pendingDeleteId !== null}
        record={pendingDeleteRecord}
        vehiclePlate={
          pendingDeleteRecord ? getVehicle(pendingDeleteRecord.vehicleId)?.plateNumber : undefined
        }
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}
