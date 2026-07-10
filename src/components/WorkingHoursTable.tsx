import { useEffect, useMemo, useState } from "react";

import type { DriverWorkingHoursRow } from "../types";
import { getWorkingHoursCumulativeRangeLabels, formatWorkingHours } from "../utils/workingHoursUtils";
import TablePager, { buildPaginationMeta, DEFAULT_PAGE_SIZE } from "./TablePager";
import { Card, cn } from "./ui";

const tableHeaderClass =
  "px-4 py-2 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase";

const tableHeaderRightClass =
  "px-4 py-2 text-right text-xs font-semibold tracking-wide text-slate-600";

const tableBodyClass = "px-4 py-2 text-slate-700";

const rowClass = "h-10 border-b border-slate-100 hover:bg-slate-50/60";

type WorkingHoursTableProps = {
  rows: DriverWorkingHoursRow[];
  selectedDate: string;
};

function CumulativeColumnHeader({ title, rangeLabel }: { title: string; rangeLabel: string }) {
  return (
    <div className="inline-flex flex-col items-end gap-0.5 leading-snug">
      <span className="uppercase tracking-wide">{title}</span>
      <span className="text-[10px] font-normal normal-case tracking-normal text-slate-500">
        {rangeLabel}
      </span>
    </div>
  );
}

export default function WorkingHoursTable({ rows, selectedDate }: WorkingHoursTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const pagination = useMemo(
    () => buildPaginationMeta(page, pageSize, rows.length),
    [page, pageSize, rows.length]
  );

  const totalPages = pagination.totalPages;

  useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const cumulativeRangeLabels = useMemo(
    () => getWorkingHoursCumulativeRangeLabels(selectedDate),
    [selectedDate]
  );

  if (rows.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-sm text-gray-500">
          Không có dữ liệu thời gian làm việc phù hợp bộ lọc.
        </div>
      </Card>
    );
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[16%]" />
          <col className="w-[28%]" />
          <col className="w-[28%]" />
        </colgroup>
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className={tableHeaderClass}>Tài xế</th>
            <th className={cn(tableHeaderRightClass, "uppercase")}>Số giờ làm việc</th>
            <th className={tableHeaderRightClass}>
              <CumulativeColumnHeader title="Lũy kế tuần" rangeLabel={cumulativeRangeLabels.weekly} />
            </th>
            <th className={tableHeaderRightClass}>
              <CumulativeColumnHeader title="Lũy kế tháng" rangeLabel={cumulativeRangeLabels.monthly} />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row) => (
            <tr key={row.driverId} className={rowClass}>
              <td className={tableBodyClass}>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 font-semibold text-gray-900">
                  <span className="truncate">{row.driverName}</span>
                  <span className="shrink-0 text-xs font-normal text-gray-500">{row.areaLabel}</span>
                </div>
              </td>
              <td className={`${tableBodyClass} text-right tabular-nums`}>
                {formatWorkingHours(row.dailyHours)}
              </td>
              <td className={`${tableBodyClass} text-right tabular-nums`}>
                {formatWorkingHours(row.weeklyHours)}
              </td>
              <td className={`${tableBodyClass} text-right tabular-nums`}>
                {formatWorkingHours(row.monthlyHours)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TablePager
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        className="px-4 py-3 sm:px-5"
        ariaLabel="Phân trang thời gian làm việc"
      />
    </section>
  );
}
