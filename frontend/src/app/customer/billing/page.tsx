"use client";

import React, { useState } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useRecordPayment } from "@/hooks/usePayments";
import { Drawer } from "@/components/ui/drawer";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { formatINR, formatDate, daysOverdue } from "@/lib/utils";
import type { Invoice } from "@/mocks/store";
import {
  CreditCard,
  QrCode,
  Bank,
  CheckCircle,
  DownloadSimple,
  ShieldCheck,
  Receipt,
} from "@phosphor-icons/react";

export default function CustomerBillingPage() {
  const { data: invoicesData, isLoading, refetch } = useInvoices({ page_size: 50 });
  const recordPaymentMutation = useRecordPayment();

  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [method, setMethod] = useState<"UPI" | "NetBanking" | "Card">("UPI");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("HDFC Bank");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (method === "UPI") {
      if (!upiId.includes("@") || upiId.length < 5) {
        setFormError("Enter a valid UPI ID (e.g. yourname@okhdfcbank)");
        return;
      }
    } else if (method === "Card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setFormError("Enter a valid 16-digit debit/credit card number");
        return;
      }
      if (!cardExpiry || !cardCvv) {
        setFormError("Complete expiry and 3-digit CVV");
        return;
      }
    }

    if (!payingInvoice) return;

    const ref = `PAY_IN_${Date.now().toString().slice(-6)}`;
    await recordPaymentMutation.mutateAsync({
      invoice_id: payingInvoice.id,
      method,
      amount: payingInvoice.total,
      note: `Customer self-service portal: ${method} (${ref})`,
    });

    setPaymentRef(ref);
    setIsSuccess(true);
    refetch();
  };

  const handleCloseDrawer = () => {
    setPayingInvoice(null);
    setIsSuccess(false);
    setFormError(null);
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-bricolage)] text-ink">
          GST Invoices & Payment Center
        </h1>
        <p className="text-sm text-muted">
          Download tax receipts, view payment history, and settle outstanding balances
        </p>
      </div>

      {/* Invoice List */}
      <div className="bg-surface border border-border shape-leaf overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            <span className="text-sm font-semibold text-ink">
              Invoice History ({invoicesData?.total || 0})
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted">
            Loading invoices...
          </div>
        ) : (invoicesData?.items || []).length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No invoices found for this account.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(invoicesData?.items || []).map((inv) => {
              const isOverdue = inv.status !== "Paid" && daysOverdue(inv.dueDate) > 0;
              return (
                <div
                  key={inv.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sand/10 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono-tabular text-xs font-semibold text-ink">
                        {inv.number}
                      </span>
                      <Chip status={isOverdue ? "Overdue" : inv.status} />
                    </div>
                    <span className="text-xs text-muted block">
                      Issued: {formatDate(inv.createdAt, "short")} &bull; Due:{" "}
                      {formatDate(inv.dueDate, "short")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="font-mono-tabular text-sm font-bold text-ink block">
                        {formatINR(inv.total)}
                      </span>
                      <span className="text-[10px] text-muted">
                        Incl. GST: {formatINR(inv.taxTotal)}
                      </span>
                    </div>

                    {inv.status === "Paid" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.print()}
                        className="gap-1.5 text-xs text-muted hover:text-ink"
                      >
                        <DownloadSimple size={14} />
                        <span>Tax Receipt</span>
                      </Button>
                    ) : (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => {
                          setPayingInvoice(inv);
                          setIsSuccess(false);
                        }}
                        className="gap-1.5"
                      >
                        <CreditCard size={14} />
                        <span>Pay Now</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-out Payment Drawer */}
      <Drawer
        open={Boolean(payingInvoice)}
        onClose={handleCloseDrawer}
        title={payingInvoice ? `Pay Invoice ${payingInvoice.number}` : "Settle Invoice"}
      >
        {payingInvoice && (
          <div className="space-y-6">
            {!isSuccess ? (
              <form onSubmit={handlePay} className="space-y-5">
                {/* Invoice Amount Summary */}
                <div className="p-4 bg-sand/30 border border-border rounded-leaf space-y-2 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Taxable Base:</span>
                    <span className="font-mono-tabular text-ink">
                      {formatINR(payingInvoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>GST (CGST/SGST or IGST):</span>
                    <span className="font-mono-tabular text-ink">
                      {formatINR(payingInvoice.taxTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-ink border-t border-border pt-2">
                    <span>Total Payable:</span>
                    <span className="font-mono-tabular text-primary text-base">
                      {formatINR(payingInvoice.total)}
                    </span>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-[#FBECE9] border border-[#E8B1A7] text-status-overdue text-xs rounded-leaf">
                    {formError}
                  </div>
                )}

                {/* Payment Method Selector */}
                <div>
                  <span className="text-xs font-semibold text-ink block mb-2">
                    Select Payment Gateway
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod("UPI")}
                      className={`p-3 rounded-leaf border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                        method === "UPI"
                          ? "bg-primary text-surface border-primary"
                          : "bg-paper text-ink border-border hover:bg-sand/30"
                      }`}
                    >
                      <QrCode size={18} />
                      <span>UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("NetBanking")}
                      className={`p-3 rounded-leaf border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                        method === "NetBanking"
                          ? "bg-primary text-surface border-primary"
                          : "bg-paper text-ink border-border hover:bg-sand/30"
                      }`}
                    >
                      <Bank size={18} />
                      <span>Net Banking</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("Card")}
                      className={`p-3 rounded-leaf border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                        method === "Card"
                          ? "bg-primary text-surface border-primary"
                          : "bg-paper text-ink border-border hover:bg-sand/30"
                      }`}
                    >
                      <CreditCard size={18} />
                      <span>Card</span>
                    </button>
                  </div>
                </div>

                {/* UPI Fields */}
                {method === "UPI" && (
                  <div className="space-y-3 p-4 bg-paper border border-border rounded-leaf">
                    <Field label="Virtual Payment Address (VPA / UPI ID)" required>
                      <Input
                        placeholder="yourbusiness@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </Field>
                    <span className="text-[11px] text-muted block">
                      Supports Google Pay, PhonePe, Paytm, BHIM, and all Indian bank UPI apps.
                    </span>
                  </div>
                )}

                {/* Net Banking Fields */}
                {method === "NetBanking" && (
                  <div className="space-y-3 p-4 bg-paper border border-border rounded-leaf">
                    <Field label="Select Bank" required>
                      <Select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </Select>
                    </Field>
                    <span className="text-[11px] text-muted block">
                      You will be redirected securely to authenticate with {bank}.
                    </span>
                  </div>
                )}

                {/* Card Fields */}
                {method === "Card" && (
                  <div className="space-y-3 p-4 bg-paper border border-border rounded-leaf">
                    <Field label="Card Number" required>
                      <Input
                        placeholder="4532 •••• •••• 8892"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry (MM/YY)" required>
                        <Input
                          placeholder="12/28"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </Field>
                      <Field label="CVV" required>
                        <Input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    className="w-full gap-2"
                    loading={recordPaymentMutation.isPending}
                  >
                    <ShieldCheck size={16} />
                    <span>Authorize Payment of {formatINR(payingInvoice.total)}</span>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-[#EAF3EC] border border-[#B8D8BF] text-status-active rounded-leaf flex items-center justify-center mx-auto">
                  <CheckCircle size={32} weight="fill" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-[var(--font-bricolage)] text-ink">
                    Payment Successful
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Invoice <strong className="text-ink">{payingInvoice.number}</strong> has been marked as Paid.
                  </p>
                </div>

                <div className="p-3 bg-paper border border-border rounded-leaf text-xs space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted">Transaction Reference:</span>
                    <span className="font-mono-tabular font-medium text-ink">
                      {paymentRef}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Payment Channel:</span>
                    <span className="font-medium text-ink">{method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Amount Settled:</span>
                    <span className="font-mono-tabular font-semibold text-primary">
                      {formatINR(payingInvoice.total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleCloseDrawer}
                  >
                    Return to Invoices
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
