"use client";

import React, { useState } from "react";
import { useSummaryReport, useOverdueReport } from "@/hooks/useReports";
import { KPI } from "@/components/ui/kpi";
import { DataTable } from "@/components/ui/data-table";
import { Chip } from "@/components/ui/chip";
import { formatINR, formatDate } from "@/lib/utils";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import type { Invoice } from "@/mocks/store";
import {
  CalendarBlank,
  ChartBar,
  WarningCircle,
  TrendUp,
  Receipt,
  ArrowsClockwise,
} from "@phosphor-icons/react";

export default function AdminDashboardPage() {
  const [viewDetail, setViewDetail] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Compute date filter ranges
  const getDateRange = () => {
    const now = new Date();
    if (dateFilter === "30d") {
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    if (dateFilter === "90d") {
      const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    return { from: undefined, to: undefined };
  };

  const { from, to } = getDateRange();
  const { data: summary, isLoading: isSummaryLoading, refetch } = useSummaryReport(
    from,
    to
  );
  const { data: overdueData, isLoading: isOverdueLoading } = useOverdueReport({
    page,
    page_size: pageSize,
  });

  const overdueColumns: ColumnDef<Invoice & { daysOverdue: number }>[] = [
    {
      accessorKey: "number",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs font-semibold text-ink">
          {row.original.number}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-ink block">
          {row.original.customerName}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Outstanding",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs font-semibold text-status-overdue">
          {formatINR(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs text-muted">
          {formatDate(row.original.dueDate, "short")}
        </span>
      ),
    },
    {
      accessorKey: "daysOverdue",
      header: "Ageing",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded-leaf text-[11px] font-mono-tabular bg-[#FBECE9] text-status-overdue border border-[#E8B1A7]">
          {row.original.daysOverdue} days overdue
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Financial Dashboard
          </h1>
          <p className="text-sm text-muted">
            Recurring revenue metrics, collections ledger, and receivable ageing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Summary / Detail Toggle */}
          <div className="flex border border-border rounded-leaf p-1 bg-surface">
            <button
              onClick={() => setViewDetail(false)}
              className={`px-3 py-1 rounded-leaf text-xs font-medium transition-colors ${
                !viewDetail ? "bg-sand text-ink" : "text-muted hover:text-ink"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewDetail(true)}
              className={`px-3 py-1 rounded-leaf text-xs font-medium transition-colors ${
                viewDetail ? "bg-sand text-ink" : "text-muted hover:text-ink"
              }`}
            >
              Detailed
            </button>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-leaf text-xs text-ink">
            <CalendarBlank size={14} className="text-muted" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 bg-surface hover:bg-sand/30 border border-border rounded-leaf text-muted hover:text-ink transition-colors cursor-pointer"
            title="Refresh reports"
          >
            <ArrowsClockwise size={16} />
          </button>
        </div>
      </div>

      {/* 4 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Active subscriptions"
          value={summary?.activeSubscriptions || 0}
          trend={{ value: 12, label: "vs last cycle" }}
        />
        <KPI
          label="Total billed revenue"
          value={summary?.totalRevenue || 0}
          isCurrency
          trend={{ value: 18, label: "ARR growth" }}
        />
        <KPI
          label="Collected payments"
          value={summary?.collectedRevenue || 0}
          isCurrency
          trend={{ value: 94, label: "collection rate" }}
        />
        <KPI
          label="Outstanding balance"
          value={summary?.outstandingBalance || 0}
          isCurrency
          className="border-status-overdue/40"
        />
      </div>

      {/* Revenue Chart Section: Green with terracotta outstanding */}
      <div className="bg-surface border border-border shape-leaf p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
              Revenue & Collections Cadence
            </h2>
            <p className="text-xs text-muted">
              Monthly breakdown in INR: Green shows collected cash, Terracotta shows receivables
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-primary rounded-sm" />
              <span>Collected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-accent rounded-sm" />
              <span>Outstanding</span>
            </div>
          </div>
        </div>

        {/* Custom SVG Bar Chart */}
        {summary?.timeSeries && summary.timeSeries.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 px-2 border-b border-border">
              {summary.timeSeries.map((item, idx) => {
                const maxVal = Math.max(
                  ...summary.timeSeries.map((s) => s.revenue),
                  1
                );
                const collectedHeight = (item.collected / maxVal) * 100;
                const outstandingHeight =
                  ((item.revenue - item.collected) / maxVal) * 100;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Hover tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-surface text-[11px] font-mono-tabular px-2.5 py-1 rounded-leaf pointer-events-none whitespace-nowrap z-20">
                      Rev: {formatINR(item.revenue)} &bull; Paid:{" "}
                      {formatINR(item.collected)}
                    </div>

                    <div className="w-full max-w-[44px] flex flex-col justify-end h-full">
                      {/* Terracotta segment (Outstanding) */}
                      <div
                        style={{ height: `${Math.max(4, outstandingHeight)}%` }}
                        className="w-full bg-accent hover:opacity-90 transition-all rounded-t-sm"
                      />
                      {/* Deep green segment (Collected) */}
                      <div
                        style={{ height: `${Math.max(8, collectedHeight)}%` }}
                        className="w-full bg-primary hover:opacity-90 transition-all"
                      />
                    </div>

                    <span className="text-[11px] text-muted font-mono-tabular mt-2 truncate max-w-full">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-muted">
            Generating financial time series...
          </div>
        )}
      </div>

      {/* Overdue Ageing Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WarningCircle size={20} className="text-status-overdue" />
            <h2 className="text-lg font-bold font-[var(--font-bricolage)] text-ink">
              Overdue Receivables Ledger
            </h2>
          </div>
          <span className="text-xs text-muted font-mono-tabular">
            {overdueData?.total || 0} overdue invoices requiring follow-up
          </span>
        </div>

        <DataTable
          columns={overdueColumns}
          data={overdueData?.items || []}
          total={overdueData?.total || 0}
          page={page}
          pageSize={pageSize}
          isLoading={isOverdueLoading}
          onPaginationChange={(p: PaginationState) => {
            setPage(p.pageIndex + 1);
            setPageSize(p.pageSize);
          }}
        />
      </div>
    </div>
  );
}
