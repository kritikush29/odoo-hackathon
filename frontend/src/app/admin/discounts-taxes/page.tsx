"use client";

import React, { useState } from "react";
import {
  useTaxes,
  useDiscounts,
  useCreateTax,
  useCreateDiscount,
} from "@/hooks/useTaxesAndDiscounts";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { formatINR } from "@/lib/utils";
import type { Tax, Discount } from "@/mocks/store";
import {
  Percent,
  Receipt,
  Plus,
  Scales,
  Eye,
} from "@phosphor-icons/react";

export default function DiscountsTaxesPage() {
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);

  // New tax form
  const [taxName, setTaxName] = useState("GST 18%");
  const [taxType, setTaxType] = useState<"CGST" | "SGST" | "IGST">("CGST");
  const [taxRate, setTaxRate] = useState(9);
  const [taxState, setTaxState] = useState("Maharashtra");

  // New discount form
  const [discName, setDiscName] = useState("Festive Startup Discount");
  const [discType, setDiscType] = useState<"fixed" | "percent">("percent");
  const [discValue, setDiscValue] = useState(15);
  const [discMinPurchase, setDiscMinPurchase] = useState(1000);
  const [discMinQty, setDiscMinQty] = useState(1);
  const [discScope, setDiscScope] = useState<"product" | "subscription">("subscription");

  // Live preview interactive state
  const [previewSubtotal, setPreviewSubtotal] = useState(5000);
  const [previewDiscountPercent, setPreviewDiscountPercent] = useState(10);
  const [previewCustomerState, setPreviewCustomerState] = useState("Maharashtra");

  const { data: taxes } = useTaxes();
  const { data: discounts } = useDiscounts();

  const createTaxMutation = useCreateTax();
  const createDiscountMutation = useCreateDiscount();

  // Calculations for live preview
  const discountAmount = (previewSubtotal * previewDiscountPercent) / 100;
  const taxableAmount = Math.max(0, previewSubtotal - discountAmount);
  const isIntraState = previewCustomerState === "Maharashtra"; // Home state is MH
  const cgst = isIntraState ? taxableAmount * 0.09 : 0;
  const sgst = isIntraState ? taxableAmount * 0.09 : 0;
  const igst = !isIntraState ? taxableAmount * 0.18 : 0;
  const totalTax = cgst + sgst + igst;
  const previewNetTotal = taxableAmount + totalTax;

  const handleTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTaxMutation.mutateAsync({
      name: taxName,
      type: taxType,
      rate: Number(taxRate),
      state: taxState,
    });
    setTaxModalOpen(false);
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDiscountMutation.mutateAsync({
      name: discName,
      type: discType,
      value: Number(discValue),
      minPurchase: Number(discMinPurchase),
      minQty: Number(discMinQty),
      startDate: new Date().toISOString(),
    });
    setDiscountModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
            GST Rules & Discount Policies
          </h1>
          <p className="text-sm text-muted">
            Configure statutory Indian GST rules (CGST, SGST, IGST) and recurring promotion rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTaxModalOpen(true)}
            className="gap-2"
          >
            <Scales size={14} />
            <span>New Tax Rule</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setDiscountModalOpen(true)}
            className="gap-2"
          >
            <Plus size={14} />
            <span>Create Discount</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GST Rule Manager */}
        <div className="bg-surface border border-border shape-leaf p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scales size={18} className="text-primary" />
              <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
                Active GST Tax Rules
              </h2>
            </div>
            <span className="text-xs text-muted font-mono-tabular">
              Origin: Maharashtra (MH-27)
            </span>
          </div>

          <div className="divide-y divide-border">
            {(taxes || []).map((t) => (
              <div
                key={t.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-ink block">{t.name}</span>
                  <span className="text-muted block">
                    {t.type === "IGST"
                      ? "Inter-state supply (IGST)"
                      : `Intra-state supply in ${t.state} (${t.type})`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono-tabular font-bold text-ink text-sm">
                    {t.rate}%
                  </span>
                  <span className="text-[11px] text-muted block capitalize">
                    {t.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-paper border border-border rounded-leaf text-xs text-muted leading-relaxed">
            <strong className="text-ink">Statutory GST Logic:</strong> If the customer billing address is within Maharashtra, CGST (9%) and SGST (9%) are levied. For any outside state, integrated IGST (18%) applies automatically.
          </div>
        </div>

        {/* Discount Rules */}
        <div className="bg-surface border border-border shape-leaf p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent size={18} className="text-accent" />
              <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
                Promotional Discount Codes
              </h2>
            </div>
            <span className="text-xs text-muted font-mono-tabular">
              {discounts?.length || 0} active policies
            </span>
          </div>

          <div className="divide-y divide-border">
            {(discounts || []).map((d) => (
              <div
                key={d.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-ink block">{d.name}</span>
                  <span className="text-muted block">
                    Min order: {formatINR(d.minPurchase)} &bull; Min qty: {d.minQty}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono-tabular font-bold text-accent text-sm">
                    {d.type === "percent" ? `${d.value}% OFF` : `-${formatINR(d.value)}`}
                  </span>
                  <span className="text-[11px] text-muted block capitalize">
                    {d.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview of Next Invoice */}
      <div className="bg-surface border border-border shape-leaf p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Eye size={18} className="text-primary" />
          <h2 className="text-base font-semibold font-[var(--font-bricolage)] text-ink">
            Live Invoice Engine Simulator
          </h2>
        </div>
        <p className="text-xs text-muted">
          Adjust parameters below to verify real-time GST tax breakdowns and discount deductions before issuing invoices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-paper border border-border rounded-leaf">
          <Field label="Sample Base Subscription (₹)">
            <Input
              type="number"
              value={previewSubtotal}
              onChange={(e) => setPreviewSubtotal(Number(e.target.value))}
            />
          </Field>

          <Field label="Applied Discount (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={previewDiscountPercent}
              onChange={(e) => setPreviewDiscountPercent(Number(e.target.value))}
            />
          </Field>

          <Field label="Customer State">
            <Select
              value={previewCustomerState}
              onChange={(e) => setPreviewCustomerState(e.target.value)}
            >
              <option value="Maharashtra">Maharashtra (Same State &bull; CGST+SGST)</option>
              <option value="Karnataka">Karnataka (Inter-State &bull; IGST)</option>
              <option value="Delhi">Delhi (Inter-State &bull; IGST)</option>
              <option value="Tamil Nadu">Tamil Nadu (Inter-State &bull; IGST)</option>
            </Select>
          </Field>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="p-5 bg-sand/30 border border-border rounded-leaf max-w-xl mx-auto space-y-2.5 text-xs">
          <div className="flex justify-between text-muted">
            <span>Base Subscription Amount:</span>
            <span className="font-mono-tabular text-ink">{formatINR(previewSubtotal)}</span>
          </div>

          <div className="flex justify-between text-accent font-medium">
            <span>Discount ({previewDiscountPercent}%):</span>
            <span className="font-mono-tabular">-{formatINR(discountAmount)}</span>
          </div>

          <div className="flex justify-between text-muted border-t border-border pt-1.5">
            <span>Net Taxable Base:</span>
            <span className="font-mono-tabular text-ink">{formatINR(taxableAmount)}</span>
          </div>

          {isIntraState ? (
            <>
              <div className="flex justify-between text-muted">
                <span>Central GST (CGST @ 9%):</span>
                <span className="font-mono-tabular text-ink">{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>State GST (SGST @ 9%):</span>
                <span className="font-mono-tabular text-ink">{formatINR(sgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-muted">
              <span>Integrated GST (IGST @ 18%):</span>
              <span className="font-mono-tabular text-ink">{formatINR(igst)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-ink border-t border-border pt-2">
            <span>Final Billed Invoice Total:</span>
            <span className="font-mono-tabular text-primary text-base">
              {formatINR(previewNetTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Modal */}
      <Dialog
        open={taxModalOpen}
        onClose={() => setTaxModalOpen(false)}
        title="Add Tax Rate Rule"
      >
        <form onSubmit={handleTaxSubmit} className="space-y-4">
          <Field label="Tax Name" required>
            <Input
              required
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tax Type" required>
              <Select
                value={taxType}
                onChange={(e) =>
                  setTaxType(e.target.value as "CGST" | "SGST" | "IGST")
                }
              >
                <option value="CGST">CGST (Central)</option>
                <option value="SGST">SGST (State)</option>
                <option value="IGST">IGST (Integrated)</option>
              </Select>
            </Field>

            <Field label="Rate Percentage (%)" required>
              <Input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Applicable State" required>
            <Input
              value={taxState}
              onChange={(e) => setTaxState(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTaxModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createTaxMutation.isPending}
            >
              Save Rule
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Discount Modal */}
      <Dialog
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        title="Create Promotional Discount"
      >
        <form onSubmit={handleDiscountSubmit} className="space-y-4">
          <Field label="Discount Code / Title" required>
            <Input
              required
              value={discName}
              onChange={(e) => setDiscName(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" required>
              <Select
                value={discType}
                onChange={(e) =>
                  setDiscType(e.target.value as "fixed" | "percent")
                }
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </Select>
            </Field>

            <Field label="Value" required>
              <Input
                type="number"
                value={discValue}
                onChange={(e) => setDiscValue(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Purchase (₹)">
              <Input
                type="number"
                value={discMinPurchase}
                onChange={(e) => setDiscMinPurchase(Number(e.target.value))}
              />
            </Field>

            <Field label="Min Seats / Qty">
              <Input
                type="number"
                value={discMinQty}
                onChange={(e) => setDiscMinQty(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDiscountModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createDiscountMutation.isPending}
            >
              Save Discount
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
