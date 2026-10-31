import React, { useState, useEffect } from 'react';
import {
  Building, CheckCircle, Clock, AlertTriangle, Layers, CreditCard,
  Printer, ToggleLeft, ToggleRight, ShieldCheck, ChevronRight, Zap,
  PlusCircle, FileText
} from 'lucide-react';

export default function CustomerPortalView({
  currentUser,
  onPreviewInvoice,
  onRecordPayment
}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [msg, setMsg] = useState('');

  // Use currentUser id or default to Acme Corp Sarah Chen
  const customerId = currentUser?.role === 'CUSTOMER' ? currentUser.id : 'USR-003';
  const customerName = currentUser?.role === 'CUSTOMER' ? currentUser.name : 'Sarah Chen';
  const companyName = currentUser?.company || 'Acme Corp';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, iRes, pRes] = await Promise.all([
        fetch(`/api/subscriptions?customerId=${customerId}`),
        fetch(`/api/invoices?customerId=${customerId}`),
        fetch('/api/products')
      ]);
      const [sData, iData, pData] = await Promise.all([sRes.json(), iRes.json(), pRes.json()]);
      setSubscriptions(sData);
      setInvoices(iData);
      setProducts(pData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customerId]);

  const handleGenerateInvoice = async (subscriptionId) => {
    try {
      setGeneratingInvoice(true);
      const res = await fetch('/api/invoices/generate-customer-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, subscriptionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate invoice');
      setMsg(`Invoice ${data.invoice.invoiceNumber} generated successfully!`);
      setTimeout(() => setMsg(''), 4000);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleToggleAddon = async (subId, productId, enable) => {
    try {
      const res = await fetch(`/api/subscriptions/${subId}/toggle-addon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, enable })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update add-on');
      setMsg(data.message);
      setTimeout(() => setMsg(''), 4000);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Active</span>;
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Paid</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Due</span>;
      case 'Overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const activeSub = subscriptions.find(s => s.status === 'Active') || subscriptions[0];
  const addons = products.filter(p => p.type === 'Add-on');

  return (
    <div className="space-y-6">
      
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
              Customer Portal Dashboard
            </span>
            <span className="text-xs text-emerald-200">Self-Service Billing</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1 text-white">
            Welcome back, {customerName}
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Account for <strong>{companyName}</strong>. Generate invoices on demand, print official receipts, and manage add-ons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGenerateInvoice(activeSub?.id)}
            disabled={generatingInvoice}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-emerald-900 font-bold rounded-xl text-xs shadow-lg transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            {generatingInvoice ? 'Generating...' : 'Generate New Invoice'}
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Grid: My Active Subscriptions + Real-time Add-on Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subscriptions Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">My Subscriptions</h2>
            {activeSub && (
              <button
                onClick={() => handleGenerateInvoice(activeSub.id)}
                disabled={generatingInvoice}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" /> Generate Invoice for Subscription
              </button>
            )}
          </div>

          {subscriptions.length > 0 ? (
            subscriptions.map(sub => (
              <div key={sub.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                      {sub.subscriptionNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">{sub.planName}</h3>
                    <p className="text-xs text-slate-500">
                      Billed <span className="font-semibold text-slate-800">{sub.billingFrequency}</span> • Terms: {sub.paymentTerms}
                    </p>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Contract Term</span>
                    <span className="font-semibold text-slate-800">{sub.startDate} to {sub.expiryDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Next Billing Day</span>
                    <span className="font-semibold text-slate-800">{sub.nextBillingDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Coupon Applied</span>
                    <span className="font-mono font-semibold text-emerald-600">{sub.discountCode || 'None'}</span>
                  </div>
                </div>

                {/* Subscribed lines */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Included Products:</h4>
                  <div className="space-y-1.5">
                    {sub.lines?.map((line, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-medium text-slate-900">{line.productName} ({line.variantName})</span>
                        <span className="font-mono text-slate-600">Qty: {line.quantity} × ₹{line.unitPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No subscriptions found for this account.
            </div>
          )}
        </div>

        {/* Add-on Switcher */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Self-Service Add-Ons</h2>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <p className="text-xs text-slate-500">
              Activate or remove extra modules instantly. Changes reflect automatically on your next billing statement.
            </p>

            {activeSub ? (
              <div className="space-y-3">
                {addons.map(addon => {
                  const isEnabled = activeSub.lines?.some(l => l.productId === addon.id);
                  return (
                    <div
                      key={addon.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isEnabled
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{addon.name}</h4>
                          <span className="text-[11px] font-mono font-semibold text-indigo-600">
                            +₹{addon.salesPrice} / month
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleAddon(activeSub.id, addon.id, !isEnabled)}
                          className={`p-1 rounded-lg transition ${
                            isEnabled ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {isEnabled ? (
                            <ToggleRight className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-300" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{addon.notes}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No active subscription available to attach add-ons.</div>
            )}
          </div>
        </div>

      </div>

      {/* Customer Invoices Section with Generate and Print options */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">My Invoices & Billing Statements</h3>
            <p className="text-xs text-slate-500">View, generate on demand, and print official invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGenerateInvoice(activeSub?.id)}
              disabled={generatingInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
            </button>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
              {invoices.length} Invoices
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Issue Date</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Total Amount</th>
                <th className="py-3 px-6 text-right">Balance Due</th>
                <th className="py-3 px-6 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-6 text-slate-600">{inv.issueDate}</td>
                  <td className="py-3.5 px-6 text-slate-600">{inv.dueDate}</td>
                  <td className="py-3.5 px-6">{getStatusBadge(inv.status)}</td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">₹{Number(inv.totalAmount).toFixed(2)}</td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold">
                    <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      ₹{Number(inv.balanceDue).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-2 whitespace-nowrap">
                    {/* Print Invoice Option */}
                    <button
                      onClick={() => onPreviewInvoice(inv)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      title="Print or download official invoice PDF"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Invoice
                    </button>

                    {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                      <button
                        onClick={() => onRecordPayment(inv)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        Pay Online
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
