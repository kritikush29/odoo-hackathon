"use client";

import React from "react";
import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useInvoices } from "@/hooks/useInvoices";
import { KPI } from "@/components/ui/kpi";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Receipt,
  CreditCard,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function CustomerDashboardPage() {
  const { data: subsData } = useSubscriptions({ page_size: 5 });
  const { data: invoicesData } = useInvoices({ page_size: 5 });

  const activeSubs = (subsData?.items || []).filter(
    (s) => s.status === "Active" || s.status === "Confirmed"
  );
  const nextRenewalSub = activeSubs[0];

  // Calculate unpaid invoices
  const unpaidInvoices = (invoicesData?.items || []).filter(
    (inv) => inv.status !== "Paid"
  );
  const outstandingBalance = unpaidInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Subscriber Portal
          </h1>
          <p className="text-sm text-muted">
            Manage your company subscriptions, renewal schedules, and GST receipts
          </p>
        </div>

        {outstandingBalance > 0 && (
          <Link href="/customer/billing">
            <Button variant="accent" size="sm" className="gap-2">
              <CreditCard size={14} />
              <span>Pay Outstanding ({formatINR(outstandingBalance)})</span>
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI
          label="Active software plans"
          value={activeSubs.length}
        />
        <div className="bg-surface border border-border shape-leaf px-5 py-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">
            Next renewal cycle
          </span>
          <div>
            <span className="text-xl font-bold font-mono-tabular text-ink block">
              {nextRenewalSub
                ? formatDate(
                    nextRenewalSub.nextInvoiceDate || nextRenewalSub.expiryDate,
                    "short"
                  )
                : "No renewals"}
            </span>
            <span className="text-xs text-muted">
              {nextRenewalSub ? formatINR(nextRenewalSub.total) : "—"}
            </span>
          </div>
        </div>
        <KPI
          label="Outstanding balance"
          value={outstandingBalance}
          isCurrency
          className={outstandingBalance > 0 ? "border-status-overdue/40" : ""}
        />
      </div>

      {/* Active Plans Section */}
      <div className="bg-surface border border-border shape-leaf p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
              Current Subscription Services
            </h2>
          </div>
          <Link
            href="/customer/subscriptions"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            Manage all <ArrowRight size={12} />
          </Link>
        </div>

        {activeSubs.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            No active subscriptions found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-paper border border-border rounded-leaf space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-ink">
                    {sub.planName}
                  </span>
                  <Chip status={sub.status} />
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-xs text-muted">
                    <span>Next billing: </span>
                    <strong className="text-ink font-mono-tabular">
                      {formatDate(sub.nextInvoiceDate || sub.expiryDate, "short")}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono-tabular text-primary">
                      {formatINR(sub.total)}
                    </span>
                    <span className="text-[11px] text-muted block capitalize">
                      {sub.period}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Invoices Preview */}
      <div className="bg-surface border border-border shape-leaf p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-accent" />
            <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
              Recent Billing Invoices
            </h2>
          </div>
          <Link
            href="/customer/billing"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            Billing history <ArrowRight size={12} />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {(invoicesData?.items || []).slice(0, 4).map((inv) => (
            <div
              key={inv.id}
              className="py-3 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono-tabular font-semibold text-ink block">
                  {inv.number}
                </span>
                <span className="text-muted block">
                  Issued: {formatDate(inv.createdAt, "short")} &bull; Due:{" "}
                  {formatDate(inv.dueDate, "short")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono-tabular font-bold text-ink text-sm">
                  {formatINR(inv.total)}
                </span>
                <Chip status={inv.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
