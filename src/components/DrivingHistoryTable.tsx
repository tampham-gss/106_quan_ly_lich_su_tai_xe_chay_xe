import { Fragment, useEffect, useMemo, useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

import type { DailyRotation, DriverVehicleAssignmentRow } from "../types";
import { buildDriverVehicleAssignments } from "../utils/buildDriverVehicleAssignments";
import { formatViDate } from "../utils/dateUtils";
import TablePager, { buildPaginationMeta, DEFAULT_PAGE_SIZE } from "./TablePager";
import { getDriverSummaryRowTooltip } from "./Tooltip";
import { Card, cn, tableBodyClass, tableHeaderCenterClass, tableHeaderClass } from "./ui";

const summaryRowClass = "h-12 border-b border-slate-200 bg-white outline-none hover:bg-gray-50";
const summaryRowExpandedClass = "bg-white hover:bg-gray-100 border-b border-blue-200";
const detailRowClass =
  "h-11 border-b border-slate-200 border-l-4 border-l-blue-200 bg-slate-100 outline-none hover:bg-slate-200/70";
const iconToggleClass = "inline-flex h-4 w-4 shrink-0 text-gray-600";

type DrivingHistoryTableProps = {
  rotations: DailyRotation[];
  plateByVehicleId: Map<string, string>;
};

type DriverSummary = {
  driverId: string;
  driverName: string;
  plateNumbers: string[];
  startDate: string;
  endDate: string;
  detailRows: DriverVehicleAssignmentRow[];
  hasMultipleVehicles: boolean;
};

function buildDriverSummaries(
  rotations: DailyRotation[],
  plateByVehicleId: Map<string, string>
): DriverSummary[] {
  const assignments = buildDriverVehicleAssignments(rotations, plateByVehicleId);
  const byDriver = new Map<string, DriverVehicleAssignmentRow[]>();

  for (const row of assignments) {
    const list = byDriver.get(row.driverId) ?? [];
    list.push(row);
    byDriver.set(row.driverId, list);
  }

  return [...byDriver.entries()]
    .map(([driverId, detailRows]) => {
      const sortedRows = [...detailRows].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const plateNumbers = [...new Set(sortedRows.map((row) => row.plateNumber))];
      const startDate = sortedRows.reduce(
        (min, row) => (row.startDate < min ? row.startDate : min),
        sortedRows[0].startDate
      );
      const endDate = sortedRows.reduce(
        (max, row) => (row.endDate > max ? row.endDate : max),
        sortedRows[0].endDate
      );

      return {
        driverId,
        driverName: sortedRows[0].driverName,
        plateNumbers,
        startDate,
        endDate,
        detailRows: sortedRows,
        hasMultipleVehicles: plateNumbers.length > 1,
      };
    })
    .sort((a, b) => a.driverName.localeCompare(b.driverName));
}

export default function DrivingHistoryTable({ rotations, plateByVehicleId }: DrivingHistoryTableProps) {
  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const summaries = useMemo(
    () => buildDriverSummaries(rotations, plateByVehicleId),
    [rotations, plateByVehicleId]
  );

  const pagination = useMemo(
    () => buildPaginationMeta(page, pageSize, summaries.length),
    [page, pageSize, summaries.length]
  );

  const totalPages = pagination.totalPages;

  useEffect(() => {
    setPage(1);
  }, [rotations, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedSummaries = useMemo(() => {
    const start = (page - 1) * pageSize;
    return summaries.slice(start, start + pageSize);
  }, [summaries, page, pageSize]);

  const toggleDriver = (driverId: string) => {
    setExpandedDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(driverId)) next.delete(driverId);
      else next.add(driverId);
      return next;
    });
  };

  if (summaries.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-sm text-gray-500">
          Không có dữ liệu lịch sử chạy xe phù hợp bộ lọc.
        </div>
      </Card>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className={tableHeaderClass}>Tài xế</th>
              <th className={tableHeaderClass}>Xe</th>
              <th className={tableHeaderClass}>Từ ngày</th>
              <th className={tableHeaderClass}>Đến ngày</th>
              <th className={cn(tableHeaderCenterClass, "w-12")} aria-hidden />
            </tr>
          </thead>
          <tbody>
            {paginatedSummaries.map((summary) => {
              const isExpanded = summary.hasMultipleVehicles && expandedDrivers.has(summary.driverId);
              const rowTooltip = summary.hasMultipleVehicles
                ? getDriverSummaryRowTooltip(summary.driverName, isExpanded)
                : undefined;

              return (
                <Fragment key={summary.driverId}>
                  <tr
                    className={cn(
                      summaryRowClass,
                      isExpanded && summaryRowExpandedClass,
                      summary.hasMultipleVehicles && "cursor-pointer"
                    )}
                    title={rowTooltip}
                    onClick={
                      summary.hasMultipleVehicles ? () => toggleDriver(summary.driverId) : undefined
                    }
                    onKeyDown={
                      summary.hasMultipleVehicles
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleDriver(summary.driverId);
                            }
                          }
                        : undefined
                    }
                    tabIndex={summary.hasMultipleVehicles ? 0 : undefined}
                    aria-expanded={summary.hasMultipleVehicles ? isExpanded : undefined}
                    aria-label={
                      summary.hasMultipleVehicles
                        ? `${summary.driverName}, ${isExpanded ? "thu gọn" : "mở rộng"} chi tiết xe chạy`
                        : undefined
                    }
                  >
                    <td className={cn(tableBodyClass, "font-semibold text-gray-900")}>
                      {summary.driverName}
                    </td>
                    <td className={tableBodyClass}>{summary.plateNumbers.join(", ")}</td>
                    <td className={cn(tableBodyClass, "tabular-nums")}>{formatViDate(summary.startDate)}</td>
                    <td className={cn(tableBodyClass, "tabular-nums")}>{formatViDate(summary.endDate)}</td>
                    <td className={cn(tableBodyClass, "text-center")}>
                      {summary.hasMultipleVehicles ? (
                        isExpanded ? (
                          <LuChevronUp className={iconToggleClass} aria-hidden />
                        ) : (
                          <LuChevronDown className={iconToggleClass} aria-hidden />
                        )
                      ) : null}
                    </td>
                  </tr>

                  {summary.hasMultipleVehicles && isExpanded
                    ? summary.detailRows.map((row) => (
                        <tr key={row.id} className={detailRowClass}>
                          <td className={tableBodyClass} />
                          <td className={cn(tableBodyClass, "pl-8 text-gray-800")}>{row.plateNumber}</td>
                          <td className={cn(tableBodyClass, "tabular-nums text-gray-700")}>
                            {formatViDate(row.startDate)}
                          </td>
                          <td className={cn(tableBodyClass, "tabular-nums text-gray-700")}>
                            {formatViDate(row.endDate)}
                          </td>
                          <td className={tableBodyClass} />
                        </tr>
                      ))
                    : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <TablePager
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        ariaLabel="Phân trang lịch sử chạy xe"
      />
    </section>
  );
}
