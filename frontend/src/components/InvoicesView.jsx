import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle, Clock, AlertTriangle, Printer, Send,
  CreditCard, Search, Filter, ShieldCheck, XCircle, ChevronDown
} from 'lucide-react';

export default function InvoicesView({ onPreviewInvoice, onRecordPayment }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await fetch(`/api/invoices/${id}/confirm`, { method: 'PUT' });
      fetchInvoices();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await fetch(`/api/invoices/${id}/cancel`, { method: 'PUT' });
      fetchInvoices();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSend = async (id) => {
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
      const data = await res.json();
      setSendSuccessMsg(data.message);
      setTimeout(() => setSendSuccessMsg(''), 4000);
      fetchInvoices();
    } catch (e) {
      alert(e.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Paid</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Confirmed</span>;
      case 'Overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">Overdue</span>;
      case 'Draft':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">Draft</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 line-through">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = filterStatus === 'ALL' || inv.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Invoices & Billing Statements</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {invoices.length} Invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track full lifecycle: <strong>Draft → Confirmed → Paid</strong>. Send digital statements, inspect line details, and print PDFs.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {sendSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sendSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
        {['ALL', 'Confirmed', 'Paid', 'Overdue', 'Draft', 'Cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st} {st !== 'ALL' && `(${invoices.filter(i => i.status.toLowerCase() === st.toLowerCase()).length})`}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Issue / Due Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Total</th>
                <th className="py-3 px-6 text-right">Balance Due</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-slate-900">{inv.customerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{inv.subscriptionNumber}</div>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    <div>Issued: {inv.issueDate}</div>
                    <div className={inv.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                      Due: {inv.dueDate}
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                    ₹{Number(inv.totalAmount).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold">
                    <span className={inv.balanceDue > 0 ? (inv.status === 'Overdue' ? 'text-rose-600' : 'text-slate-800') : 'text-emerald-600'}>
                      ₹{Number(inv.balanceDue).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                    {inv.status === 'Draft' && (
                      <button
                        onClick={() => handleConfirm(inv.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                      >
                        Confirm ✓
                      </button>
                    )}

                    {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                      <button
                        onClick={() => onRecordPayment(inv)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        + Payment
                      </button>
                    )}

                    <button
                      onClick={() => handleSend(inv.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      title="Send digital invoice"
                    >
                      <Send className="w-3.5 h-3.5 inline mr-1" /> Send
                    </button>

                    <button
                      onClick={() => onPreviewInvoice(inv)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      title="Print or view invoice"
                    >
                      <Printer className="w-3.5 h-3.5 inline mr-1" /> Print
                    </button>

                    {inv.status !== 'Cancelled' && inv.status !== 'Paid' && (
                      <button
                        onClick={() => handleCancel(inv.id)}
                        className="text-slate-400 hover:text-rose-600 px-1 py-1"
                        title="Cancel invoice"
                      >
                        ✕
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

