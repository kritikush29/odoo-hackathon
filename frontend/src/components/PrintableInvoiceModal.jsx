import React from 'react';
import { X, Printer, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PrintableInvoiceModal({ invoice, onClose, onRecordPayment }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" /> PAID
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" /> CONFIRMED / DUE
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> OVERDUE
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            DRAFT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Modal Controls (Hidden when printed) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Invoice Document Preview</span>
            {getStatusBadge(invoice.status)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            {invoice.status !== 'Paid' && onRecordPayment && (
              <button
                onClick={() => onRecordPayment(invoice)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
              >
                Pay Now
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice-area" className="p-8 md:p-12 text-slate-800 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  B
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brightloop Software</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Autonomous Subscription & Recurring Billing</p>
              <div className="text-xs text-slate-600 mt-3 space-y-0.5">
                <p>100 Innovation Way, Suite 400</p>
                <p>San Francisco, CA 94105</p>
                <p>billing@brightloop.com | +1 (800) 555-LOOP</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">INVOICE</div>
              <div className="text-sm font-mono font-semibold text-indigo-600 mt-1">{invoice.invoiceNumber}</div>
              <div className="mt-4 text-xs text-slate-500 space-y-1">
                <div><span className="font-medium text-slate-700">Issue Date:</span> {invoice.issueDate}</div>
                <div><span className="font-medium text-slate-700">Due Date:</span> {invoice.dueDate}</div>
                <div><span className="font-medium text-slate-700">Terms:</span> {invoice.paymentTerms || 'Net 30'}</div>
                {invoice.subscriptionNumber && (
                  <div><span className="font-medium text-slate-700">Subscription:</span> {invoice.subscriptionNumber}</div>
                )}
              </div>
            </div>
          </div>

          {/* Bill To & Billing Period */}
          <div className="grid grid-cols-2 gap-8 my-8">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Billed To</div>
              <div className="font-semibold text-slate-900 text-base">{invoice.customerName}</div>
              <div className="text-sm text-slate-600 mt-1">{invoice.customerEmail}</div>
              <div className="text-xs text-slate-500 mt-1">Customer ID: {invoice.customerId}</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Billing Cycle Info</div>
              <div className="text-sm text-slate-700 font-medium">
                Period: <span className="font-normal text-slate-900">{invoice.billingPeriod || 'Recurring Subscription Cycle'}</span>
              </div>
              <div className="text-sm text-slate-700 mt-2 font-medium">
                Payment Status: {getStatusBadge(invoice.status)}
              </div>
              {invoice.sentAt && (
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  E-Delivered & Authenticated: {new Date(invoice.sentAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-sm mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3">Description / Item</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Unit Price</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.lines?.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 pr-4">
                    <span className="font-medium text-slate-900">{line.productName}</span>
                  </td>
                  <td className="py-3.5 text-center text-slate-600">{line.quantity}</td>
                  <td className="py-3.5 text-right text-slate-600">₹{Number(line.unitPrice).toFixed(2)}</td>
                  <td className="py-3.5 text-right font-medium text-slate-900">₹{Number(line.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Calculation Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">₹{Number(invoice.subtotal).toFixed(2)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied:</span>
                  <span>-₹{Number(invoice.discountAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Taxes ({invoice.taxRate}%):</span>
                <span className="font-medium text-slate-900">₹{Number(invoice.taxAmount).toFixed(2)}</span>
              </div>

              <div className="border-t-2 border-slate-900 pt-2.5 flex justify-between font-bold text-base text-slate-900">
                <span>Total Amount:</span>
                <span className="text-indigo-600">₹{Number(invoice.totalAmount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600 text-xs pt-1">
                <span>Amount Paid:</span>
                <span className="font-semibold text-emerald-600">₹{Number(invoice.amountPaid).toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-sm bg-slate-100 p-2 rounded-lg text-slate-900">
                <span>Balance Due:</span>
                <span className={invoice.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}>
                  ₹{Number(invoice.balanceDue).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notes & Banking Details */}
          <div className="border-t border-slate-200 mt-12 pt-6 text-xs text-slate-500 flex justify-between items-end">
            <div>
              <p className="font-semibold text-slate-700 mb-1">Payment Instructions:</p>
              <p>Direct Bank Deposit: HDFC Bank (Account: 5020-0082-1921 | IFSC: HDFC0000240)</p>
              <p>UPI, Credit Card & Net Banking accepted. Please reference invoice number on payment.</p>
            </div>
            <div className="text-right text-slate-400 font-mono">
              Thank you for trusting Brightloop Software.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

