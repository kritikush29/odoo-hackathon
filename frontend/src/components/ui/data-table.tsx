"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { useState, useCallback, useRef, useEffect } from "react";
import { CaretUp, CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════
   Server-side paginated, sortable data table
   - Leaf-cornered container
   - Table rows use 14px 3px 14px 3px border radius
   - Staggered row fade-in on data change
   ═══════════════════════════════════════════════════════════════ */

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  sorting?: SortingState;
  onPaginationChange: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  sorting = [],
  onPaginationChange,
  onSortingChange,
  isLoading,
  emptyMessage = "No results found",
}: DataTableProps<T>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(sorting);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const pageCount = Math.ceil(total / pageSize);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting: internalSorting,
      pagination: { pageIndex: page - 1, pageSize },
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(internalSorting) : updater;
      setInternalSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onPaginationChange: (updater) => {
      const current = { pageIndex: page - 1, pageSize };
      const next = typeof updater === "function" ? updater(current) : updater;
      onPaginationChange({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize,
      });
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  // Stagger rows in on data change
  useEffect(() => {
    if (!tbodyRef.current || data.length === 0) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const rows = tbodyRef.current.querySelectorAll("tr");
    gsap.fromTo(
      rows,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: "power3.out",
        clearProps: "all",
      }
    );
  }, [data]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      onPaginationChange({ pageIndex: newPage - 1, pageSize });
    },
    [onPaginationChange, pageSize]
  );

  return (
    <div className="border border-border shape-leaf overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider",
                      "font-[var(--font-instrument)]",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none hover:text-ink transition-colors"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === "asc" && (
                        <CaretUp size={14} weight="bold" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <CaretDown size={14} weight="bold" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody ref={tbodyRef}>
            {isLoading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 last:border-b-0 hover:bg-sand/20 transition-colors table-row-leaf"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted font-mono-tabular">
            {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              icon={<CaretLeft size={16} />}
              aria-label="Previous page"
            />
            {generatePageNumbers(page, pageCount).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-muted text-xs">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(p as number)}
                  className="min-w-[32px] font-mono-tabular"
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => handlePageChange(page + 1)}
              icon={<CaretRight size={16} />}
              aria-label="Next page"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Generate visible page numbers with ellipsis */
function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
