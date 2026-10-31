"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useInvoices,
  useTransitionInvoice,
  useSendInvoice,
} from "@/hooks/useInvoices";
import { useRunBillingJob, useBillingJobStatus } from "@/hooks/useBillingJob";
import { useRecordPayment } from "@/hooks/usePayments";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Dialog } from "@/components/ui/dialog";
import { Stepper } from "@/components/ui/stepper";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { formatINR, formatDate, daysOverdue } from "@/lib/utils";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import type { Invoice } from "@/mocks/store";
import {
  MagnifyingGlass,
  Play,
  Printer,
  PaperPlaneTilt,
  CheckCircle,
  CurrencyInr,
  XCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";

const INVOICE_STEPS = ["Draft", "Confirmed", "Paid"];
const STATUS_TABS = ["All", "Draft", "Confirmed", "Paid", "Overdue"];

function InvoicesContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Billing day state
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingDate, setBillingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Payment recording state
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "UPI" | "NetBanking" | "Card" | "Cash" | "Bank"
  >("UPI");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Auto-open billing day if query parameter is present
  useEffect(() => {
    if (searchParams.get("action") === "billing-day") {
      setBillingOpen(true);
    }
  }, [searchParams]);

  const runBillingMutation = useRunBillingJob();
  const billingJobQuery = useBillingJobStatus(currentJobId);
  const transitionMutation = useTransitionInvoice();
  const sendMutation = useSendInvoice();
  const recordPaymentMutation = useRecordPayment();

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  const { data, isLoading, refetch } = useInvoices({
    page,
    page_size: pageSize,
    status: statusFilter !== "All" ? statusFilter : undefined,
    q: search || undefined,
    sort: sortField,
    order: sortOrder,
  });

  const columns: ColumnDef<Invoice>[] = [
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
        <div>
          <span className="text-xs font-semibold text-ink block">
            {row.original.customerName}
          </span>
          <span className="text-[11px] font-mono-tabular text-muted">
            {row.original.subscriptionNumber}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const inv = row.original;
        const overdue = inv.status === "Confirmed" && daysOverdue(inv.dueDate) > 0;
        return <Chip status={overdue ? "Overdue" : inv.status} />;
      },
    },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-mono-tabular text-xs font-semibold text-ink">
          {formatINR(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const overdueDays = daysOverdue(row.original.dueDate);
        const isOverdue = row.original.status !== "Paid" && overdueDays > 0;
        return (
          <div>
            <span className="font-mono-tabular text-xs text-ink block">
              {formatDate(row.original.dueDate, "short")}
            </span>
            {isOverdue && (
              <span className="text-[10px] text-status-overdue font-mono-tabular font-medium">
                {overdueDays}d overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedInvoice(row.original);
            setPaymentAmount(row.original.total);
            setPaymentSuccess(false);
          }}
          className="text-xs text-primary font-medium hover:underline cursor-pointer"
        >
          View &bull; Pay
        </button>
      ),
    },
  ];

  const handleStartBilling = async () => {
    const res = await runBillingMutation.mutateAsync(billingDate);
    setCurrentJobId(res.job_id);
  };

  const handleTransition = async (toStatus: string) => {
    if (!selectedInvoice) return;
    const updated = await transitionMutation.mutateAsync({
      id: selectedInvoice.id,
      to: toStatus,
    });
    setSelectedInvoice(updated);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    await recordPaymentMutation.mutateAsync({
      invoice_id: selectedInvoice.id,
      method: paymentMethod,
      amount: paymentAmount,
      note: paymentNote,
    });

    setPaymentSuccess(true);
    setSelectedInvoice((prev) => (prev ? { ...prev, status: "Paid" } : null));
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Invoices & Billing Ledger
          </h1>
          <p className="text-sm text-muted">
            GST compliant invoices, automated cycle runs, and payment collection
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => {
            setBillingOpen(true);
            setCurrentJobId(null);
          }}
          className="gap-2"
        >
          <Play size={14} weight="fill" />
          <span>Execute Billing Day</span>
        </Button>
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
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-paper border border-border rounded-leaf text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Invoices Data Table */}
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

      {/* Billing Day Modal with Celery Job Polling */}
      <Dialog
        open={billingOpen}
        onClose={() => setBillingOpen(false)}
        title="Execute Recurring Billing Day"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Runs the automated billing engine for all subscriptions due up to the
            selected target date. Invoices will be generated with GST line-items.
            The job is strictly <strong className="text-ink">idempotent</strong>:
            re-running for the same period skips already generated invoices.
          </p>

          <Field label="Target Billing Date">
            <Input
              type="date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              disabled={Boolean(currentJobId && billingJobQuery.data?.status === "running")}
            />
          </Field>

          {!currentJobId ? (
            <div className="pt-2">
              <Button
                variant="accent"
                size="md"
                className="w-full gap-2"
                loading={runBillingMutation.isPending}
                onClick={handleStartBilling}
              >
                <Play size={16} weight="fill" />
                <span>Start Billing Cycle</span>
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-paper border border-border rounded-leaf space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">
                  Job ID: {currentJobId.slice(0, 8)}...
                </span>
                <span className="font-mono-tabular capitalize text-primary font-medium flex items-center gap-1.5">
                  {billingJobQuery.data?.status === "running" && (
                    <ArrowClockwise size={14} className="animate-spin" />
                  )}
                  {billingJobQuery.data?.status || "Processing..."}
                </span>
              </div>

              {billingJobQuery.data && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                  <div className="p-2.5 bg-surface border border-border rounded-leaf text-center">
                    <span className="text-[11px] text-muted block">Invoices Created</span>
                    <span className="text-lg font-bold font-mono-tabular text-status-active">
                      {billingJobQuery.data.created}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-leaf text-center">
                    <span className="text-[11px] text-muted block">Already Billed</span>
                    <span className="text-lg font-bold font-mono-tabular text-muted">
                      {billingJobQuery.data.skipped}
                    </span>
                  </div>
                </div>
              )}

              {billingJobQuery.data?.status === "completed" && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setBillingOpen(false);
                      setCurrentJobId(null);
                      refetch();
                    }}
                  >
                    Done &bull; View Invoices
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>

      {/* Invoice Detail & Payment Drawer */}
      <Drawer
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `${selectedInvoice.number} — ${selectedInvoice.customerName}` : ""}
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Stepper */}
            <div className="p-4 bg-paper border border-border rounded-leaf">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-3">
                Invoice Status
              </span>
              <Stepper steps={INVOICE_STEPS} current={selectedInvoice.status} />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedInvoice.status === "Draft" && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={transitionMutation.isPending}
                  onClick={() => handleTransition("Confirmed")}
                  className="gap-1.5"
                >
                  <CheckCircle size={14} />
                  <span>Confirm Invoice</span>
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                loading={sendMutation.isPending}
                onClick={async () => {
                  await sendMutation.mutateAsync(selectedInvoice.id);
                  alert(`Invoice ${selectedInvoice.number} sent to customer email.`);
                }}
                className="gap-1.5"
              >
                <PaperPlaneTilt size={14} />
                <span>Send to Customer</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </Button>
            </div>

            {/* Payment Recording Panel */}
            {selectedInvoice.status !== "Paid" && (
              <div className="p-4 bg-surface border border-border rounded-leaf space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <CurrencyInr size={18} className="text-status-active" />
                  <span>Record Customer Payment</span>
                </div>

                {paymentSuccess ? (
                  <div className="p-3 bg-[#EAF3EC] border border-[#B8D8BF] text-status-active text-xs rounded-leaf flex items-center gap-2">
                    <CheckCircle size={16} weight="fill" />
                    <span>Payment recorded successfully! Invoice marked as Paid.</span>
                  </div>
                ) : (
                  <form onSubmit={handleRecordPayment} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Payment Method" required>
                        <Select
                          value={paymentMethod}
                          onChange={(e) =>
                            setPaymentMethod(
                              e.target.value as "UPI" | "NetBanking" | "Card" | "Cash" | "Bank"
                            )
                          }
                        >
                          <option value="UPI">UPI</option>
                          <option value="NetBanking">Net Banking</option>
                          <option value="Card">Credit/Debit Card</option>
                          <option value="Bank">Direct Bank Transfer</option>
                          <option value="Cash">Cash</option>
                        </Select>
                      </Field>

                      <Field label="Amount Received (₹)" required>
                        <Input
                          type="number"
                          step="0.01"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        />
                      </Field>
                    </div>

                    <Field label="Reference / Transaction Note">
                      <Input
                        placeholder="UPI ref: 4029192931 / HDFC Cheque"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                      />
                    </Field>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full mt-2"
                      loading={recordPaymentMutation.isPending}
                    >
                      Confirm Payment Receipt
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Printable Invoice Summary */}
            <div className="p-5 bg-paper border border-border rounded-leaf space-y-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold font-[var(--font-bricolage)] text-ink">
                    TAX INVOICE
                  </h3>
                  <span className="font-mono-tabular text-xs text-muted block">
                    {selectedInvoice.number}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-muted block">Due Date</span>
                  <span className="font-mono-tabular font-medium text-ink">
                    {formatDate(selectedInvoice.dueDate, "medium")}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-leaf overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-sand/30 border-b border-border text-muted">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Tax Rate</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {selectedInvoice.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium text-ink">{l.productName}</td>
                        <td className="p-2 text-center font-mono-tabular">{l.quantity}</td>
                        <td className="p-2 text-right font-mono-tabular">{l.taxRate}%</td>
                        <td className="p-2 text-right font-mono-tabular font-semibold">
                          {formatINR(l.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations */}
              <div className="space-y-1.5 text-xs text-right border-t border-border pt-3">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span className="font-mono-tabular">{formatINR(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST Total:</span>
                  <span className="font-mono-tabular">{formatINR(selectedInvoice.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ink border-t border-border pt-2">
                  <span>Total Due:</span>
                  <span className="font-mono-tabular text-primary">
                    {formatINR(selectedInvoice.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading invoices...
          </div>
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
