import { Fragment, useEffect, useMemo, useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

import type { DailyRotation, DriverVehicleAssignmentRow } from "../types";
import { buildDriverVehicleAssignments } from "../utils/buildDriverVehicleAssignments";
import { formatViDate } from "../utils/dateUtils";
import TablePager, { buildPaginationMeta, DEFAULT_PAGE_SIZE } from "./TablePager";
import { getDriverSummaryRowTooltip } from "./Tooltip";
import { Card, cn } from "./ui";

const historyTableHeaderClass =
  "px-4 py-2 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase";

const historyTableHeaderCenterClass =
  "px-4 py-2 text-center text-xs font-semibold tracking-wide text-slate-600 uppercase";

const historyTableBodyClass = "px-4 py-2 text-slate-700";

const summaryRowClass = "h-10 border-b border-slate-200 bg-white outline-none hover:bg-gray-50";
const summaryRowExpandedClass = "bg-white hover:bg-gray-100 border-b border-blue-200";
const detailRowClass =
  "h-9 border-b border-slate-200 border-l-4 border-l-blue-200 bg-slate-100 outline-none hover:bg-slate-200/70";
const iconToggleClass = "inline-flex h-4 w-4 shrink-0 text-gray-600";

type DrivingHistoryTableProps = {
  rotations: DailyRotation[];
  plateByVehicleId: Map<string, string>;
  areaLabelByVehicleId: Map<string, string>;
};

type DriverSummary = {
  driverId: string;
  driverName: string;
  areaLabel: string;
  plateNumbers: string[];
  startDate: string;
  endDate: string;
  detailRows: DriverVehicleAssignmentRow[];
  hasMultipleVehicles: boolean;
};

function buildDriverAreaLabel(
  detailRows: DriverVehicleAssignmentRow[],
  areaLabelByVehicleId: Map<string, string>
): string {
  const labels = [
    ...new Set(
      detailRows
        .map((row) => areaLabelByVehicleId.get(row.vehicleId))
        .filter((label): label is string => Boolean(label))
    ),
  ];

  return labels.length > 0 ? labels.join(", ") : "—";
}

function buildDriverSummaries(
  rotations: DailyRotation[],
  plateByVehicleId: Map<string, string>,
  areaLabelByVehicleId: Map<string, string>
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
        areaLabel: buildDriverAreaLabel(sortedRows, areaLabelByVehicleId),
        plateNumbers,
        startDate,
        endDate,
        detailRows: sortedRows,
        hasMultipleVehicles: plateNumbers.length > 1,
      };
    })
    .sort((a, b) => a.driverName.localeCompare(b.driverName));
}

export default function DrivingHistoryTable({
  rotations,
  plateByVehicleId,
  areaLabelByVehicleId,
}: DrivingHistoryTableProps) {
  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const summaries = useMemo(
    () => buildDriverSummaries(rotations, plateByVehicleId, areaLabelByVehicleId),
    [rotations, plateByVehicleId, areaLabelByVehicleId]
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
    <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-[34%]" />
          <col className="w-[28%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col className="w-[6%]" />
        </colgroup>
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className={historyTableHeaderClass}>Tài xế</th>
            <th className={historyTableHeaderClass}>Xe</th>
            <th className={historyTableHeaderClass}>Từ ngày</th>
            <th className={historyTableHeaderClass}>Đến ngày</th>
            <th className={cn(historyTableHeaderCenterClass, "w-12")} aria-hidden />
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
                    <td className={historyTableBodyClass}>
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 font-semibold text-gray-900">
                        <span className="truncate">{summary.driverName}</span>
                        <span className="shrink-0 text-xs font-normal text-gray-500">{summary.areaLabel}</span>
                      </div>
                    </td>
                    <td className={cn(historyTableBodyClass, "break-words")}>{summary.plateNumbers.join(", ")}</td>
                    <td className={cn(historyTableBodyClass, "tabular-nums whitespace-nowrap")}>
                      {formatViDate(summary.startDate)}
                    </td>
                    <td className={cn(historyTableBodyClass, "tabular-nums whitespace-nowrap")}>
                      {formatViDate(summary.endDate)}
                    </td>
                    <td className={cn(historyTableBodyClass, "text-center")}>
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
                          <td className={historyTableBodyClass} />
                          <td className={cn(historyTableBodyClass, "break-words pl-8 text-gray-800")}>
                            {row.plateNumber}
                          </td>
                          <td className={cn(historyTableBodyClass, "tabular-nums whitespace-nowrap text-gray-700")}>
                            {formatViDate(row.startDate)}
                          </td>
                          <td className={cn(historyTableBodyClass, "tabular-nums whitespace-nowrap text-gray-700")}>
                            {formatViDate(row.endDate)}
                          </td>
                          <td className={historyTableBodyClass} />
                        </tr>
                      ))
                    : null}
                </Fragment>
              );
            })}
        </tbody>
      </table>

      <TablePager
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        className="px-4 py-3 sm:px-5"
        ariaLabel="Phân trang lịch sử chạy xe"
      />
    </section>
  );
}
