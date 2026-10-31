import React, { useState, useEffect } from 'react';
import {
  Users, FileText, Printer, Search, Calendar,
  Building, Mail, DollarSign, CheckCircle, Clock, AlertTriangle, Eye
} from 'lucide-react';

export default function AdminCustomersView({ onPreviewInvoice }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('ALL');

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers-directory');
      const data = await res.json();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  // Collect all invoices across customers (or filtered by selected customer)
  const allInvoices = customers.flatMap(c => (c.invoices || []).map(inv => ({ ...inv, customerCompany: c.company })));
  const displayedInvoices = selectedCustomerId === 'ALL'
    ? allInvoices
    : allInvoices.filter(i => i.customerId === selectedCustomerId);

  const totalInvoicesGenerated = allInvoices.length;
  const totalBilled = customers.reduce((sum, c) => sum + c.totalBilledAmount, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Paid</span>;
      case 'Confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'Overdue':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Overdue</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Registered Customers & Invoices Directory</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin Overview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor every registered customer account, track the exact number of invoices generated per client, and audit customer invoices in ₹.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Customers</span>
            <span className="text-base font-black text-slate-900">{customers.length}</span>
          </div>
          <div className="bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-200">
            <span className="text-indigo-600 block text-[10px] uppercase font-bold">Total Invoices Generated</span>
            <span className="text-base font-black text-indigo-700">{totalInvoicesGenerated}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: EVERY REGISTERED CUSTOMER ON THE WEBSITE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-sm">All Registered Customers ({filteredCustomers.length})</h2>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-6">Customer Name</th>
                <th className="py-3 px-6">Business / Company</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6 text-center">Active Subs</th>
                <th className="py-3 px-6 text-center">No. of Invoices Generated</th>
                <th className="py-3 px-6 text-right">Total Billed</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.map(cust => (
                <tr
                  key={cust.id}
                  className={`hover:bg-slate-50 transition cursor-pointer ${
                    selectedCustomerId === cust.id ? 'bg-indigo-50/50' : ''
                  }`}
                  onClick={() => setSelectedCustomerId(selectedCustomerId === cust.id ? 'ALL' : cust.id)}
                >
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    {cust.name}
                  </td>
                  <td className="py-3.5 px-6 text-slate-700">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {cust.company}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono">
                    {cust.email}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                      {cust.activeSubscriptionsCount} Active
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold font-mono">
                      {cust.invoicesGeneratedCount} Generated
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                    ₹{cust.totalBilledAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerId(cust.id);
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                    >
                      Filter Invoices →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: CUSTOMER INVOICES EXPLORER WITH PRINT OPTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Customer Invoices Ledger ({displayedInvoices.length})
            </h2>
            <p className="text-xs text-slate-500">
              {selectedCustomerId === 'ALL'
                ? 'Showing invoices generated for all registered customers'
                : `Filtered to customer: ${customers.find(c => c.id === selectedCustomerId)?.name || selectedCustomerId}`}
            </p>
          </div>

          {selectedCustomerId !== 'ALL' && (
            <button
              onClick={() => setSelectedCustomerId('ALL')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              Clear Filter (Show All Invoices)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Customer / Company</th>
                <th className="py-3 px-6">Issue Date</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Total Amount</th>
                <th className="py-3 px-6 text-right">Balance Due</th>
                <th className="py-3 px-6 text-right">Invoice Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedInvoices.length > 0 ? (
                displayedInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                    </td>
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
                      {/* Admin Print / Inspect Invoice */}
                      <button
                        onClick={() => onPreviewInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print / View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400 text-xs">
                    No customer invoices found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

