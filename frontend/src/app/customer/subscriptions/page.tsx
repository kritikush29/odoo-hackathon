"use client";

import React, { useState } from "react";
import { useSubscriptions, useTransitionSubscription } from "@/hooks/useSubscriptions";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatINR, formatDate } from "@/lib/utils";
import type { Subscription } from "@/mocks/store";
import {
  Receipt,
  Pause,
  Play,
  XCircle,
  Plus,
  Check,
} from "@phosphor-icons/react";

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
}

export default function CustomerSubscriptionsPage() {
  const { data: subsData, isLoading } = useSubscriptions({ page_size: 20 });
  const transitionMutation = useTransitionSubscription();

  const [confirmDialog, setConfirmDialog] = useState<{
    sub: Subscription;
    action: "pause" | "cancel";
  } | null>(null);

  // Sample self-service addons
  const [addons, setAddons] = useState<Addon[]>([
    {
      id: "addon-1",
      name: "24/7 Dedicated Support SLA",
      description: "Priority ticket escalation and direct phone access",
      price: 499,
      enabled: false,
    },
    {
      id: "addon-2",
      name: "Multi-tenant Isolated Database",
      description: "Dedicated PostgreSQL tenant instance with custom encryption",
      price: 1200,
      enabled: true,
    },
    {
      id: "addon-3",
      name: "Custom White-label Domain",
      description: "Serve customer portal on your own domain with SSL",
      price: 350,
      enabled: false,
    },
  ]);

  const toggleAddon = (id: string) => {
    setAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleActionConfirm = async () => {
    if (!confirmDialog) return;
    const { sub, action } = confirmDialog;
    const targetStatus = action === "cancel" ? "Closed" : "Paused";
    await transitionMutation.mutateAsync({ id: sub.id, to: targetStatus });
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
          My Subscriptions & Add-ons
        </h1>
        <p className="text-sm text-muted">
          Manage your software subscription tier, add-on features, and renewal status
        </p>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
          Active Subscription Plans
        </h2>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted">
            Loading subscriptions...
          </div>
        ) : (subsData?.items || []).length === 0 ? (
          <div className="p-8 bg-surface border border-border shape-leaf text-center text-xs text-muted">
            No active subscriptions found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {(subsData?.items || []).slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="bg-surface border border-border shape-leaf p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono-tabular text-xs font-semibold text-muted">
                        {sub.number}
                      </span>
                      <Chip status={sub.status} />
                    </div>
                    <h3 className="text-lg font-bold font-[var(--font-bricolage)] text-ink">
                      {sub.planName}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-mono-tabular text-xl font-bold text-primary block">
                      {formatINR(sub.total)}
                    </span>
                    <span className="text-xs text-muted block capitalize">
                      Billed {sub.period || "monthly"} &bull; Next renewal:{" "}
                      {formatDate(sub.nextInvoiceDate || sub.expiryDate, "short")}
                    </span>
                  </div>
                </div>

                {/* Lines breakdown */}
                <div className="space-y-2 text-xs">
                  <span className="font-medium text-muted block">Includes:</span>
                  <div className="divide-y divide-border border border-border rounded-leaf overflow-hidden bg-paper">
                    {sub.lines.map((l, i) => (
                      <div
                        key={i}
                        className="px-3.5 py-2 flex justify-between items-center"
                      >
                        <span className="font-medium text-ink">
                          {l.productName} ({l.quantity} seats)
                        </span>
                        <span className="font-mono-tabular text-muted">
                          {formatINR(l.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-service management buttons */}
                {sub.status === "Active" && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setConfirmDialog({ sub, action: "pause" })
                      }
                      className="gap-1.5"
                    >
                      <Pause size={14} />
                      <span>Pause Subscription</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConfirmDialog({ sub, action: "cancel" })
                      }
                      className="text-status-overdue hover:bg-[#FBECE9] gap-1.5"
                    >
                      <XCircle size={14} />
                      <span>Cancel Plan</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modular Add-ons Section */}
      <div className="bg-surface border border-border shape-leaf p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
            Available Self-Service Add-ons
          </h2>
          <p className="text-xs text-muted">
            Toggle on-demand capability upgrades. Add-ons are pro-rated and added to your next billing cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="p-4 bg-paper border border-border rounded-leaf flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-ink block">
                    {addon.name}
                  </span>
                  <span className="font-mono-tabular text-xs font-bold text-primary">
                    +{formatINR(addon.price)}/mo
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {addon.description}
                </p>
              </div>

              <Button
                variant={addon.enabled ? "secondary" : "primary"}
                size="sm"
                onClick={() => toggleAddon(addon.id)}
                className="w-full gap-2"
              >
                {addon.enabled ? (
                  <>
                    <Check size={14} className="text-status-active" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Add to Subscription</span>
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Pause/Cancel Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmDialog)}
        onClose={() => setConfirmDialog(null)}
        title={
          confirmDialog?.action === "cancel"
            ? "Cancel Subscription"
            : "Pause Recurring Billing"
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            {confirmDialog?.action === "cancel"
              ? "Are you sure you want to cancel this plan? Your access will remain active until the end of the current billing cycle."
              : "Pausing your subscription will halt future automatic invoice generation. You can resume at any time."}
          </p>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDialog(null)}
            >
              Keep Active
            </Button>
            <Button
              type="button"
              variant={confirmDialog?.action === "cancel" ? "danger" : "primary"}
              loading={transitionMutation.isPending}
              onClick={handleActionConfirm}
            >
              Confirm {confirmDialog?.action === "cancel" ? "Cancellation" : "Pause"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
