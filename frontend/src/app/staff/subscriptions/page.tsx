"use client";

import React, { useState } from "react";
import {
  useSubscriptions,
  useTransitionSubscription,
  useCreateSubscriptionFromTemplate,
} from "@/hooks/useSubscriptions";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts, usePlans } from "@/hooks/useProducts";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Dialog } from "@/components/ui/dialog";
import { Stepper } from "@/components/ui/stepper";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { formatINR, formatDate } from "@/lib/utils";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import type { Subscription } from "@/mocks/store";
import {
  Plus,
  MagnifyingGlass,
  Kanban,
  Table as TableIcon,
  CheckCircle,
  ArrowRight,
  Receipt,
} from "@phosphor-icons/react";

const STEPS = ["Draft", "Quotation", "Confirmed", "Active", "Closed"];
const STATUS_TABS = ["All", "Draft", "Quotation", "Confirmed", "Active", "Closed"];

export default function SubscriptionsPage() {
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // New quote state
  const [newCustomerId, setNewCustomerId] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [newPlanId, setNewPlanId] = useState("");
  const [newQty, setNewQty] = useState(1);

  const transitionMutation = useTransitionSubscription();
  const createSubMutation = useCreateSubscriptionFromTemplate();

  const { data: customersData } = useCustomers({ page_size: 100 });
  const { data: productsData } = useProducts({ page_size: 50 });
  const { data: plansData } = usePlans();

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  const { data, isLoading } = useSubscriptions({
    page,
    page_size: viewMode === "board" ? 100 : pageSize,
    status: statusFilter !== "All" ? statusFilter : undefined,
    q: search || undefined,
    sort: sortField,
    order: sortOrder,
  });

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: "number",
      header: "Number",
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
      accessorKey: "planName",
      header: "Plan & Billing",
      cell: ({ row }) => (
        <div>
          <span className="text-xs text-ink font-medium block">
            {row.original.planName}
          </span>
          <span className="text-[11px] text-muted capitalize">
            {row.original.period || "monthly"} cycle
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Chip status={row.original.status} />,
    },
    {
      accessorKey: "total",
      header: "Recurring Total",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs font-semibold text-ink">
          {formatINR(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "nextInvoiceDate",
      header: "Next Billing",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs text-muted">
          {formatDate(row.original.nextInvoiceDate || row.original.expiryDate, "short")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedSub(row.original)}
          className="text-xs text-primary font-medium hover:underline cursor-pointer"
        >
          View Details
        </button>
      ),
    },
  ];

  const handleTransition = async (toStatus: string) => {
    if (!selectedSub) return;
    const updated = await transitionMutation.mutateAsync({
      id: selectedSub.id,
      to: toStatus,
    });
    setSelectedSub(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newPlanId) return;

    await createSubMutation.mutateAsync({
      customerId: newCustomerId,
      productId: newProductId || (productsData?.items[0]?.id ?? ""),
      planId: newPlanId,
      quantity: Number(newQty) || 1,
    });

    setCreateOpen(false);
    setNewCustomerId("");
    setNewProductId("");
    setNewPlanId("");
    setNewQty(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Subscription Pipeline
          </h1>
          <p className="text-sm text-muted">
            Track quotations, active recurring plans, and customer lifecycles
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Board Toggle */}
          <div className="flex border border-border rounded-leaf p-1 bg-surface">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-leaf text-xs font-medium transition-colors ${
                viewMode === "table" ? "bg-sand text-ink" : "text-muted hover:text-ink"
              }`}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-leaf text-xs font-medium transition-colors ${
                viewMode === "board" ? "bg-sand text-ink" : "text-muted hover:text-ink"
              }`}
              title="Pipeline Board"
            >
              <Kanban size={16} />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-2"
          >
            <Plus size={14} />
            <span>New Quotation</span>
          </Button>
        </div>
      </div>

      {/* Filter and Status Bar */}
      <div className="bg-surface border border-border shape-leaf p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-leaf text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab
                  ? "bg-primary text-surface"
                  : "bg-paper text-muted hover:text-ink border border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72 relative">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search subscriptions or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-paper border border-border rounded-leaf text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table Mode */}
      {viewMode === "table" && (
        <DataTable
          columns={columns}
          data={data?.items || []}
          total={data?.total || 0}
          page={page}
          pageSize={pageSize}
          sorting={sorting}
          isLoading={isLoading}
          onPaginationChange={(p: PaginationState) => {
            setPage(p.pageIndex + 1);
            setPageSize(p.pageSize);
          }}
          onSortingChange={setSorting}
        />
      )}

      {/* Kanban Board Mode */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STEPS.map((step) => {
            const items = (data?.items || []).filter((sub) => sub.status === step);
            return (
              <div
                key={step}
                className="bg-surface border border-border shape-leaf p-3.5 flex flex-col min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                  <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                    {step}
                  </span>
                  <span className="text-[11px] font-mono-tabular bg-paper px-2 py-0.5 rounded-full border border-border text-muted">
                    {items.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 flex-1">
                  {items.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-muted">
                      No items
                    </div>
                  ) : (
                    items.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className="p-3 bg-paper border border-border rounded-leaf hover:border-primary/50 transition-colors cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono-tabular font-semibold text-ink">
                            {sub.number}
                          </span>
                          <span className="font-mono-tabular font-semibold text-ink">
                            {formatINR(sub.total)}
                          </span>
                        </div>
                        <span className="text-xs text-ink block font-medium truncate">
                          {sub.customerName}
                        </span>
                        <div className="text-[10px] text-muted flex items-center justify-between pt-1 border-t border-border/50">
                          <span>{sub.planName}</span>
                          <span className="capitalize">{sub.period}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        open={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        title={selectedSub ? `${selectedSub.number} — ${selectedSub.customerName}` : ""}
      >
        {selectedSub && (
          <div className="space-y-6">
            {/* 5-Node Stepper */}
            <div className="p-4 bg-paper border border-border rounded-leaf">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-3">
                Lifecycle Progression
              </span>
              <Stepper steps={STEPS} current={selectedSub.status} />
            </div>

            {/* Lifecycle Transition Buttons */}
            <div className="flex items-center gap-2">
              {selectedSub.status === "Draft" && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={transitionMutation.isPending}
                  onClick={() => handleTransition("Quotation")}
                  className="gap-2"
                >
                  <ArrowRight size={14} />
                  <span>Send Quotation</span>
                </Button>
              )}
              {selectedSub.status === "Quotation" && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={transitionMutation.isPending}
                  onClick={() => handleTransition("Confirmed")}
                  className="gap-2"
                >
                  <CheckCircle size={14} />
                  <span>Confirm Subscription</span>
                </Button>
              )}
              {selectedSub.status === "Confirmed" && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={transitionMutation.isPending}
                  onClick={() => handleTransition("Active")}
                  className="gap-2"
                >
                  <CheckCircle size={14} />
                  <span>Activate Recurring Billing</span>
                </Button>
              )}
              {selectedSub.status === "Active" && (
                <Button
                  variant="danger"
                  size="sm"
                  loading={transitionMutation.isPending}
                  onClick={() => handleTransition("Closed")}
                >
                  Close Subscription
                </Button>
              )}
            </div>

            {/* Subscription Info */}
            <div className="p-4 bg-paper border border-border rounded-leaf space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Customer:</span>
                <span className="font-semibold text-ink">{selectedSub.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Plan:</span>
                <span className="font-medium text-ink">{selectedSub.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Billing Cycle:</span>
                <span className="capitalize font-mono-tabular text-ink">
                  {selectedSub.period}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Next Invoice Generation:</span>
                <span className="font-mono-tabular text-ink">
                  {formatDate(selectedSub.nextInvoiceDate || selectedSub.expiryDate, "medium")}
                </span>
              </div>
            </div>

            {/* Lines Table */}
            <div>
              <span className="text-xs font-semibold text-ink block mb-2">
                Order & Billing Items
              </span>
              <div className="border border-border rounded-leaf overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-sand/30 border-b border-border text-muted font-medium">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {selectedSub.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-ink">
                          {line.productName}
                        </td>
                        <td className="p-2.5 text-center font-mono-tabular">
                          {line.quantity}
                        </td>
                        <td className="p-2.5 text-right font-mono-tabular">
                          {formatINR(line.unitPrice)}
                        </td>
                        <td className="p-2.5 text-right font-mono-tabular font-semibold">
                          {formatINR(line.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Block */}
            <div className="p-4 bg-sand/20 border border-border rounded-leaf space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal:</span>
                <span className="font-mono-tabular">{formatINR(selectedSub.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>GST Tax (CGST + SGST / IGST):</span>
                <span className="font-mono-tabular">{formatINR(selectedSub.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-ink border-t border-border pt-2">
                <span>Recurring Total:</span>
                <span className="font-mono-tabular text-primary">
                  {formatINR(selectedSub.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Quotation Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Subscription Quotation"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <Field label="Customer Account" required>
            <Select
              required
              value={newCustomerId}
              onChange={(e) => setNewCustomerId(e.target.value)}
            >
              <option value="">Select customer...</option>
              {customersData?.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company || c.state})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Product Plan" required>
            <Select
              required
              value={newPlanId}
              onChange={(e) => {
                setNewPlanId(e.target.value);
                const plan = plansData?.find((p) => p.id === e.target.value);
                if (plan) setNewProductId(plan.productId);
              }}
            >
              <option value="">Select plan...</option>
              {plansData?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} &bull; {formatINR(p.price)} / {p.period}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Subscription Quantity" required>
            <Input
              type="number"
              min={1}
              value={newQty}
              onChange={(e) => setNewQty(Number(e.target.value))}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createSubMutation.isPending}
            >
              Create Draft Quotation
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
