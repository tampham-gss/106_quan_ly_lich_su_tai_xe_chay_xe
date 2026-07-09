import { useEffect, useId, useMemo, useState } from "react";

import type { Vehicle, ViolationRecord } from "../types";
import { getVehicleById } from "../data/mockData";
import { formatViDate } from "../utils/dateUtils";
import TablePager, { buildPaginationMeta, DEFAULT_PAGE_SIZE } from "./TablePager";
import { cn, DangerButton, OutlineButton, tableBodyClass, tableHeaderClass } from "./ui";

type ViolationTableProps = {
  violations: ViolationRecord[];
  onEdit: (record: ViolationRecord) => void;
  onDelete: (id: string) => void;
};

function resultBadgeClass(result: ViolationRecord["result"]): string {
  return result === "Đã xử lý"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-amber-100 text-amber-800";
}

function severityBadgeClass(severity: string): string {
  if (severity === "Nghiêm trọng") return "bg-red-100 text-red-800";
  if (severity === "Nặng") return "bg-orange-100 text-orange-800";
  return "bg-slate-100 text-slate-700";
}

export default function ViolationTable({ violations, onEdit, onDelete }: ViolationTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const deleteDialogTitleId = useId();

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
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className={tableHeaderClass}>Ngày vi phạm</th>
                <th className={tableHeaderClass}>Hình thức quan sát</th>
                <th className={tableHeaderClass}>Số phương tiện</th>
                <th className={tableHeaderClass}>Loại phương tiện</th>
                <th className={tableHeaderClass}>Chi nhánh</th>
                <th className={tableHeaderClass}>Nhân sự vi phạm</th>
                <th className={tableHeaderClass}>Nội dung vi phạm</th>
                <th className={tableHeaderClass}>Phân loại lỗi</th>
                <th className={tableHeaderClass}>Ca trực ghi nhận</th>
                <th className={tableHeaderClass}>Kết quả</th>
                <th className={cn(tableHeaderClass, "text-right")}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => {
                const vehicle = getVehicle(row.vehicleId);
                return (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className={cn(tableBodyClass, "tabular-nums whitespace-nowrap")}>
                      {formatViDate(row.violationDate)}
                    </td>
                    <td className={tableBodyClass}>{row.observationMethod}</td>
                    <td className={cn(tableBodyClass, "font-medium text-gray-900")}>
                      {vehicle?.plateNumber ?? "—"}
                    </td>
                    <td className={tableBodyClass}>{vehicle?.vehicleType ?? "—"}</td>
                    <td className={tableBodyClass}>{vehicle?.areaLabel ?? "—"}</td>
                    <td className={tableBodyClass}>{row.personnelName}</td>
                    <td className={cn(tableBodyClass, "max-w-[12rem]")}>{row.content}</td>
                    <td className={tableBodyClass}>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          severityBadgeClass(row.severity)
                        )}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className={cn(tableBodyClass, "whitespace-nowrap")}>{row.shift}</td>
                    <td className={tableBodyClass}>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          resultBadgeClass(row.result)
                        )}
                      >
                        {row.result}
                      </span>
                    </td>
                    <td className={cn(tableBodyClass, "text-right whitespace-nowrap")}>
                      <div className="inline-flex gap-2">
                        <OutlineButton onClick={() => onEdit(row)}>Sửa</OutlineButton>
                        <DangerButton onClick={() => setPendingDeleteId(row.id)}>Xóa</DangerButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TablePager
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          ariaLabel="Phân trang danh sách vi phạm"
        />
      </section>

      {pendingDeleteId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setPendingDeleteId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={deleteDialogTitleId}
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={deleteDialogTitleId} className="text-lg font-semibold text-gray-900">
              Xác nhận xóa
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bạn có chắc muốn xóa bản ghi vi phạm này? Thao tác không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <OutlineButton onClick={() => setPendingDeleteId(null)}>Hủy</OutlineButton>
              <DangerButton
                onClick={() => {
                  onDelete(pendingDeleteId);
                  setPendingDeleteId(null);
                }}
              >
                Xóa
              </DangerButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
