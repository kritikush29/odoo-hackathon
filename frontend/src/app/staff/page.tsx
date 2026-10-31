"use client";

import React from "react";
import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useInvoices } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";
import { KPI } from "@/components/ui/kpi";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate, daysOverdue } from "@/lib/utils";
import {
  Receipt,
  Users,
  Coins,
  Play,
  ArrowRight,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react";

export default function StaffDashboardPage() {
  const { data: subData } = useSubscriptions({ page: 1, page_size: 5 });
  const { data: pendingQuotes } = useSubscriptions({
    page: 1,
    page_size: 5,
    status: "Quotation",
  });
  const { data: overdueInvoices } = useInvoices({
    page: 1,
    page_size: 5,
    status: "Overdue",
  });
  const { data: customersData } = useCustomers({ page: 1, page_size: 5 });

  const activeCount = subData?.total || 0;
  const overdueCount = overdueInvoices?.total || 0;
  const quotesCount = pendingQuotes?.total || 0;

  return (
    <div className="space-y-8">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            Operations Desk
          </h1>
          <p className="text-sm text-muted">
            Customer onboarding, subscription pipeline, and billing cycles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/staff/invoices?action=billing-day">
            <Button variant="accent" size="sm" className="gap-2">
              <Play size={14} weight="fill" />
              <span>Run Billing Day</span>
            </Button>
          </Link>
          <Link href="/staff/subscriptions?action=new">
            <Button variant="primary" size="sm" className="gap-2">
              <Receipt size={14} />
              <span>New Quotation</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI
          label="Active subscriptions"
          value={activeCount}
          className="border-border"
        />
        <KPI
          label="Pending quotations"
          value={quotesCount}
          className="border-border"
        />
        <KPI
          label="Overdue invoices"
          value={overdueCount}
          className="border-border"
        />
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Quotations */}
        <div className="bg-surface border border-border shape-leaf p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-confirmed" />
                <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
                  Pending Quotations
                </h2>
              </div>
              <Link
                href="/staff/subscriptions?status=Quotation"
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {pendingQuotes?.items && pendingQuotes.items.length > 0 ? (
              <div className="divide-y divide-border">
                {pendingQuotes.items.map((sub) => (
                  <div
                    key={sub.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono-tabular text-xs font-semibold text-ink">
                          {sub.number}
                        </span>
                        <Chip status={sub.status} />
                      </div>
                      <span className="text-xs text-muted block">
                        {sub.customerName} &bull; {sub.planName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-tabular text-sm font-semibold text-ink block">
                        {formatINR(sub.total)}
                      </span>
                      <span className="text-[11px] text-muted font-mono-tabular">
                        {formatDate(sub.createdAt, "short")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted">
                No quotations currently awaiting confirmation.
              </div>
            )}
          </div>
        </div>

        {/* Urgent Overdue Invoices */}
        <div className="bg-surface border border-border shape-leaf p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <WarningCircle size={18} className="text-status-overdue" />
                <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
                  Urgent Overdue Invoices
                </h2>
              </div>
              <Link
                href="/staff/invoices?status=Overdue"
                className="text-xs text-status-overdue font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {overdueInvoices?.items && overdueInvoices.items.length > 0 ? (
              <div className="divide-y divide-border">
                {overdueInvoices.items.map((inv) => (
                  <div
                    key={inv.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono-tabular text-xs font-semibold text-ink">
                          {inv.number}
                        </span>
                        <Chip status="Overdue" />
                      </div>
                      <span className="text-xs text-muted block">
                        {inv.customerName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-tabular text-sm font-semibold text-status-overdue block">
                        {formatINR(inv.total)}
                      </span>
                      <span className="text-[11px] text-muted font-mono-tabular">
                        Due: {formatDate(inv.dueDate, "short")} ({daysOverdue(inv.dueDate)}d overdue)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted">
                Zero overdue invoices right now!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Customer Directory Preview */}
      <div className="bg-surface border border-border shape-leaf p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
              Recent Customer Accounts
            </h2>
          </div>
          <Link
            href="/staff/customers"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            All customers <ArrowRight size={12} />
          </Link>
        </div>

        {customersData?.items && customersData.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {customersData.items.slice(0, 3).map((cust) => (
              <div
                key={cust.id}
                className="p-3.5 bg-paper border border-border rounded-leaf flex flex-col justify-between"
              >
                <div>
                  <span className="text-sm font-semibold text-ink block truncate">
                    {cust.name}
                  </span>
                  <span className="text-xs text-muted block truncate mb-2">
                    {cust.email}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted border-t border-border/60 pt-2">
                  <span>{cust.state}</span>
                  <span className="font-mono-tabular">{cust.company || "Direct"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
