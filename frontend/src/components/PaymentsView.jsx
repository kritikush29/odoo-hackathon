import React, { useState, useEffect } from 'react';
import {
  CreditCard, Plus, CheckCircle, AlertTriangle, Send, DollarSign,
  Calendar, FileText, Check, ShieldCheck, Clock
} from 'lucide-react';

export default function PaymentsView({
  selectedInvoiceForPayment,
  clearSelectedInvoice,
  onPreviewInvoice
}) {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' or 'outstanding'

  // Payment Form State
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Credit Card (Stripe)');
  const [note, setNote] = useState('');
  const [recordedBy, setRecordedBy] = useState('Staff (Marcus Brody)');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, iRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/invoices')
      ]);
      const [pData, iData] = await Promise.all([pRes.json(), iRes.json()]);
      setPayments(pData);
      setInvoices(iData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When triggered from another view with a preselected invoice
  useEffect(() => {
    if (selectedInvoiceForPayment) {
      setInvoiceId(selectedInvoiceForPayment.id);
      setAmount(String(selectedInvoiceForPayment.balanceDue));
      setNote(`Payment for ${selectedInvoiceForPayment.invoiceNumber}`);
      setShowModal(true);
      clearSelectedInvoice();
    }
  }, [selectedInvoiceForPayment]);

  const openNewModal = () => {
    const unpaid = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled');
    if (unpaid.length > 0) {
      setInvoiceId(unpaid[0].id);
      setAmount(String(unpaid[0].balanceDue));
    } else {
      setInvoiceId('');
      setAmount('');
    }
    setNote('');
    setShowModal(true);
  };

  const handleInvoiceSelect = (id) => {
    setInvoiceId(id);
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setAmount(String(inv.balanceDue));
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amount: Number(amount),
          method,
          note,
          recordedBy
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed to record');

      setSuccessMsg(`Payment of ₹${Number(amount).toFixed(2)} recorded successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChase = async (id) => {
    try {
      const res = await fetch(`/api/invoices/${id}/chase`, { method: 'POST' });
      const data = await res.json();
      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const outstandingInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled');
  const totalSettled = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Payments & Collections Ledger</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              ₹{totalSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Total Collected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record incoming payments by method (Credit Card, Wire, ACH, UPI), update balances, and chase overdue invoices.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Record Incoming Payment
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation tabs between Payments Ledger and Outstanding Tracking */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'ledger'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Settled Payments Ledger ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'outstanding'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Outstanding & Overdue Invoices ({outstandingInvoices.length})
        </button>
      </div>

      {/* SETTLED PAYMENTS LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Payment Ref</th>
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Method</th>
                  <th className="py-3 px-6 text-right">Amount Paid</th>
                  <th className="py-3 px-6">Payment Date</th>
                  <th className="py-3 px-6">Notes / Bank Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{p.paymentNumber}</td>
                    <td className="py-3.5 px-6 font-mono font-semibold text-indigo-600">{p.invoiceNumber}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{p.customerName}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-600">
                      +₹{Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{p.paymentDate}</td>
                    <td className="py-3.5 px-6 text-slate-500 text-[11px] truncate max-w-xs">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OUTSTANDING & OVERDUE CHASING BOARD */}
      {activeTab === 'outstanding' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Total</th>
                  <th className="py-3 px-6 text-right">Balance Due</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {outstandingInvoices.map(inv => (
                  <tr key={inv.id} className={inv.status === 'Overdue' ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/60'}>
                    <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={inv.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {inv.dueDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      {inv.status === 'Overdue' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-slate-600">₹{Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-rose-600">₹{Number(inv.balanceDue).toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setInvoiceId(inv.id);
                          setAmount(String(inv.balanceDue));
                          setNote(`Payment for ${inv.invoiceNumber}`);
                          setShowModal(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Record Payment
                      </button>
                      <button
                        onClick={() => handleChase(inv.id)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                        title="Send email reminder to customer"
                      >
                        <Send className="w-3.5 h-3.5 inline mr-1" /> Chase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Record Incoming Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Invoice</label>
                <select
                  value={invoiceId}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="">Select Invoice...</option>
                  {invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customerName} (Bal: ₹{inv.balanceDue})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                  >
                    <option value="Credit Card (Stripe)">Credit Card (Stripe)</option>
                    <option value="Bank Wire / ACH">Bank Wire / ACH</option>
                    <option value="UPI / Instant Pay">UPI / Instant Pay</option>
                    <option value="Cash / Cheque">Cash / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Reference / Internal Notes</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Wire Ref #W8841092 / Stripe token"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

