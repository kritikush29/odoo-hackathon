import React, { useState, useEffect } from 'react';
import {
  Zap, Calendar, CheckCircle, AlertTriangle, ShieldCheck,
  RefreshCw, ArrowRight, FileText, Check, Printer, Send
} from 'lucide-react';

export default function BillingDayView({ onPreviewInvoice, onNavigate }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [targetDate, setTargetDate] = useState('2026-10-31');
  const [forceAllActive, setForceAllActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billingResult, setBillingResult] = useState(null);
  const [dueSubs, setDueSubs] = useState([]);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/subscriptions?status=Active');
      const data = await res.json();
      setSubscriptions(data);

      // Check which are due on targetDate
      const due = data.filter(s => !s.lastBilledDate || s.nextBillingDate <= targetDate);
      setDueSubs(due);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [targetDate]);

  const handleRunBilling = async () => {
    setLoading(true);
    setBillingResult(null);
    try {
      const res = await fetch('/api/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDate, forceAllActive })
      });
      const data = await res.json();
      setBillingResult(data);
      fetchSubscriptions();
    } catch (e) {
      alert('Billing execution failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
              ⚡ Autonomous Billing Engine
            </span>
            <span className="text-xs text-amber-100">Zero Manual Data Entry</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1 text-white">Billing Day Orchestrator</h1>
          <p className="text-xs text-amber-100 mt-1 max-w-2xl">
            Invoices are generated instantly from active subscriptions with customer details, product lines, taxes, and discounts auto-computed. Duplicate guard prevents multiple billings in the same cycle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBilling}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-xl transition transform active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                Generating Invoices...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                Execute Billing Run Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Date & Policy Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Billing Target Cut-off Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl font-medium outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={forceAllActive}
                onChange={(e) => setForceAllActive(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold">Force Bill All Active Subscriptions (Ignore next billing date)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Duplicate Invoicing Guard Active</span>
        </div>
      </div>

      {/* Execution Results Banner (if just run) */}
      {billingResult && (
        <div className="bg-white rounded-2xl border border-emerald-300 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Billing Run Execution Completed!</h3>
                <p className="text-xs text-slate-500">{billingResult.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold font-mono">
                +{billingResult.generatedCount} Invoices Created
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-semibold font-mono">
                {billingResult.skippedCount} Skipped (Duplicate Guard)
              </span>
            </div>
          </div>

          {/* Generated Invoices Table */}
          {billingResult.generatedInvoices?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Newly Generated Recurring Invoices:
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                {billingResult.generatedInvoices.map(inv => (
                  <div key={inv.id} className="p-3 bg-emerald-50/20 hover:bg-emerald-50/50 flex items-center justify-between transition">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-indigo-600">{inv.invoiceNumber}</span>
                      <span className="font-semibold text-slate-900">{inv.customerName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{inv.billingPeriod}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">₹{Number(inv.totalAmount).toFixed(2)}</span>
                      <button
                        onClick={() => onPreviewInvoice(inv)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition"
                      >
                        Inspect / Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped subscriptions reasons */}
          {billingResult.skippedSubs?.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-1">Subscriptions Guarded Against Double-Billing:</span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {billingResult.skippedSubs.map((sk, i) => (
                  <li key={i}><strong className="font-mono">{sk.id}:</strong> {sk.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Due Subscriptions Queue Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Subscriptions Due For Invoicing</h3>
            <p className="text-xs text-slate-500">Subscriptions ready for automated batch invoice generation on {targetDate}</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {dueSubs.length} Subscriptions Due
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Subscription</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Plan</th>
                <th className="py-3 px-6">Last Billed</th>
                <th className="py-3 px-6">Next Billing Due</th>
                <th className="py-3 px-6">Payment Terms</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {subscriptions.map(sub => {
                const isDue = forceAllActive || !sub.lastBilledDate || sub.nextBillingDate <= targetDate;
                return (
                  <tr key={sub.id} className={isDue ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-slate-50/60'}>
                    <td className="py-3 px-6 font-mono font-bold text-indigo-600">{sub.subscriptionNumber}</td>
                    <td className="py-3 px-6 font-semibold text-slate-800">{sub.customerName}</td>
                    <td className="py-3 px-6 text-slate-600">{sub.planName} ({sub.billingFrequency})</td>
                    <td className="py-3 px-6 text-slate-500">{sub.lastBilledDate || 'Never billed'}</td>
                    <td className="py-3 px-6 font-semibold text-slate-900">{sub.nextBillingDate}</td>
                    <td className="py-3 px-6 text-slate-600">{sub.paymentTerms}</td>
                    <td className="py-3 px-6 text-right">
                      {isDue ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Due for Billing
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Up to date
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

