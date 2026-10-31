import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, CheckCircle, Clock, Pause, Play, RotateCw, XCircle,
  FileCheck, ShieldAlert, ArrowRight, Eye, Tag, ChevronDown, Check
} from 'lucide-react';

export default function SubscriptionsView({ onPreviewInvoice, templateToLoad, clearLoadedTemplate }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [actionError, setActionError] = useState('');

  // Form State for new subscription/quote
  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [taxId, setTaxId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [lines, setLines] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes, prRes, tRes, uRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/plans'),
        fetch('/api/products'),
        fetch('/api/taxes'),
        fetch('/api/users')
      ]);
      const [sData, pData, prData, tData, uData] = await Promise.all([
        sRes.json(), pRes.json(), prRes.json(), tRes.json(), uRes.json()
      ]);
      setSubscriptions(sData);
      setPlans(pData);
      setProducts(prData);
      setTaxes(tData);
      setUsers(uData.filter(u => u.role === 'CUSTOMER'));

      if (uData.length > 0) setCustomerId(uData[0].id);
      if (pData.length > 0) setPlanId(pData[0].id);
      if (tData.length > 0) setTaxId(tData[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When a template is passed from QuotationTemplatesView
  useEffect(() => {
    if (templateToLoad && products.length > 0 && plans.length > 0) {
      setPlanId(templateToLoad.planId);
      setPaymentTerms(templateToLoad.paymentTerms);
      setTaxId(templateToLoad.taxId || taxes[0]?.id || '');
      setDiscountCode(templateToLoad.discountCode || '');
      
      const loadedLines = (templateToLoad.lines || []).map((tl, i) => {
        const prod = products.find(p => p.id === tl.productId);
        const variant = prod?.variants?.find(v => v.id === tl.variantId) || prod?.variants?.[0];
        return {
          id: `line-${Date.now()}-${i}`,
          productId: tl.productId,
          productName: prod?.name || 'Product',
          variantId: variant?.id || '',
          variantName: variant?.name || 'Standard',
          quantity: tl.quantity || 1,
          unitPrice: tl.unitPrice || prod?.salesPrice || 0
        };
      });

      setLines(loadedLines);
      setShowModal(true);
      clearLoadedTemplate();
    }
  }, [templateToLoad, products, plans]);

  const openNewModal = () => {
    if (products.length > 0) {
      const p = products[0];
      const v = p.variants?.[0];
      setLines([
        {
          id: `line-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          variantId: v?.id || '',
          variantName: v?.name || 'Standard',
          quantity: 1,
          unitPrice: p.salesPrice + (v?.priceAdjustment || 0)
        }
      ]);
    }
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('');
    setShowModal(true);
  };

  const handleAddLine = () => {
    if (products.length === 0) return;
    const p = products[0];
    const v = p.variants?.[0];
    setLines([
      ...lines,
      {
        id: `line-${Date.now()}-${lines.length}`,
        productId: p.id,
        productName: p.name,
        variantId: v?.id || '',
        variantName: v?.name || 'Standard',
        quantity: 1,
        unitPrice: p.salesPrice + (v?.priceAdjustment || 0)
      }
    ]);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    if (field === 'productId') {
      const p = products.find(prod => prod.id === value);
      const v = p?.variants?.[0];
      updated[index].productId = value;
      updated[index].productName = p?.name || 'Product';
      updated[index].variantId = v?.id || '';
      updated[index].variantName = v?.name || 'Standard';
      updated[index].unitPrice = (p?.salesPrice || 0) + (v?.priceAdjustment || 0);
    } else if (field === 'variantId') {
      const p = products.find(prod => prod.id === updated[index].productId);
      const v = p?.variants?.find(vr => vr.id === value);
      updated[index].variantId = value;
      updated[index].variantName = v?.name || 'Standard';
      updated[index].unitPrice = (p?.salesPrice || 0) + (v?.priceAdjustment || 0);
    } else if (field === 'quantity') {
      updated[index].quantity = Number(value) || 1;
    }
    setLines(updated);
  };

  const handleRemoveLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setActionError('');

    const customer = users.find(u => u.id === customerId);

    const payload = {
      customerId,
      customerName: customer ? `${customer.name} (${customer.company})` : 'Customer',
      customerEmail: customer?.email || 'customer@example.com',
      planId,
      startDate,
      expiryDate: expiryDate || undefined,
      paymentTerms,
      taxId,
      discountCode,
      lines
    };

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create subscription');
      setShowModal(false);
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // State Transition (Draft -> Quotation -> Confirmed -> Active -> Closed)
  const handleTransition = async (subId, nextStatus) => {
    setActionError('');
    try {
      const res = await fetch(`/api/subscriptions/${subId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transition failed');
      fetchData();
      if (selectedSub?.id === subId) {
        setSelectedSub(data);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Renew Subscription
  const handleRenew = async (subId) => {
    setActionError('');
    try {
      const res = await fetch(`/api/subscriptions/${subId}/renew`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Renewal failed');
      fetchData();
      if (selectedSub?.id === subId) {
        setSelectedSub(data.subscription);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Toggle Add-on
  const handleToggleAddon = async (subId, productId, variantId, enable) => {
    try {
      const res = await fetch(`/api/subscriptions/${subId}/toggle-addon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, enable })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle add-on');
      fetchData();
      if (selectedSub?.id === subId) {
        setSelectedSub(data.subscription);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Active</span>;
      case 'Quotation':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">Quotation</span>;
      case 'Draft':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">Draft</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Confirmed</span>;
      case 'Paused':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Paused</span>;
      case 'Closed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const filteredSubs = filterStatus === 'ALL'
    ? subscriptions
    : subscriptions.filter(s => s.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Subscription & Quotation Management</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {subscriptions.length} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete five-stage lifecycle: <strong>Draft → Quotation → Confirmed → Active → Closed</strong> with policy validation.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> New Quote / Subscription
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-500 font-bold">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
        {['ALL', 'Active', 'Quotation', 'Draft', 'Confirmed', 'Paused', 'Closed'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st} {st !== 'ALL' && `(${subscriptions.filter(s => s.status.toLowerCase() === st.toLowerCase()).length})`}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Number</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Plan & Frequency</th>
                <th className="py-3 px-6">Contract Period</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Payment Terms</th>
                <th className="py-3 px-6 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSubs.map(sub => {
                const plan = plans.find(p => p.id === sub.planId);
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-800">{sub.planName}</div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{sub.billingFrequency}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <div>{sub.startDate} <span className="text-slate-400">to</span></div>
                      <div className="font-semibold text-slate-800">{sub.expiryDate}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono">
                      {sub.paymentTerms}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* Lifecycle Transitions */}
                      {sub.status === 'Draft' && (
                        <button
                          onClick={() => handleTransition(sub.id, 'Quotation')}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                        >
                          Send Quote →
                        </button>
                      )}

                      {sub.status === 'Quotation' && (
                        <button
                          onClick={() => handleTransition(sub.id, 'Confirmed')}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold"
                        >
                          Confirm Order ✓
                        </button>
                      )}

                      {sub.status === 'Confirmed' && (
                        <button
                          onClick={() => handleTransition(sub.id, 'Active')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Activate Subscription ⚡
                        </button>
                      )}

                      {sub.status === 'Active' && (
                        <>
                          <button
                            onClick={() => handleTransition(sub.id, 'Paused')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold"
                            title="Pause subscription"
                          >
                            Pause ⏸
                          </button>
                          <button
                            onClick={() => handleRenew(sub.id)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                            title="Renew subscription"
                          >
                            Renew ↻
                          </button>
                          <button
                            onClick={() => handleTransition(sub.id, 'Closed')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold"
                            title="Close subscription"
                          >
                            Close ✕
                          </button>
                        </>
                      )}

                      {sub.status === 'Paused' && (
                        <button
                          onClick={() => handleTransition(sub.id, 'Active')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold"
                        >
                          Resume ▶
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Inspector Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-600 text-sm">{selectedSub.subscriptionNumber}</span>
                {getStatusBadge(selectedSub.status)}
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Customer</span>
                  <span className="font-semibold text-slate-900 text-sm">{selectedSub.customerName}</span>
                  <span className="text-slate-500 block">{selectedSub.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Plan & Schedule</span>
                  <span className="font-semibold text-slate-900 text-sm">{selectedSub.planName}</span>
                  <span className="text-slate-500 block">Bills {selectedSub.billingFrequency} | Terms: {selectedSub.paymentTerms}</span>
                </div>
              </div>

              {/* Line items */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Subscription Lines</h4>
                <div className="space-y-1.5">
                  {selectedSub.lines?.map((line, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{line.productName}</span>
                        <span className="text-slate-500 text-[11px] block">{line.variantName}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-600">Qty: {line.quantity} × ₹{line.unitPrice}</span>
                        <span className="font-bold text-slate-900 ml-3">₹{line.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-on Manager (Page 2: "add-ons customers switch on and off") */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Optional Add-Ons (Live Switch):
                </h4>
                <div className="space-y-2">
                  {products.filter(p => p.type === 'Add-on').map(addon => {
                    const isActive = selectedSub.lines?.some(l => l.productId === addon.id);
                    return (
                      <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="font-semibold text-slate-900">{addon.name}</span>
                          <span className="text-slate-500 block text-[11px]">+₹{addon.salesPrice} / month</span>
                        </div>
                        <button
                          onClick={() => handleToggleAddon(selectedSub.id, addon.id, addon.variants?.[0]?.id, !isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isActive ? 'Deactivate Add-on ✕' : 'Activate Add-on +'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Create New Quotation / Subscription</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.company})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Plan</label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.frequency})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rule</label>
                  <select
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    {taxes.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Coupon Code (Optional)</label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="e.g. SEATS20 or STARTUP100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none font-mono uppercase"
                />
              </div>

              {/* Line items */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Subscription Product Lines</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    + Add Product
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lines.map((line, idx) => {
                    const currentProd = products.find(p => p.id === line.productId);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <select
                          value={line.productId}
                          onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                          className="flex-1 px-2 py-1 border border-slate-300 rounded-lg text-xs"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        {currentProd?.variants && currentProd.variants.length > 0 && (
                          <select
                            value={line.variantId}
                            onChange={(e) => handleLineChange(idx, 'variantId', e.target.value)}
                            className="w-36 px-2 py-1 border border-slate-300 rounded-lg text-xs"
                          >
                            {currentProd.variants.map(v => (
                              <option key={v.id} value={v.id}>{v.name} (+₹{v.priceAdjustment})</option>
                            ))}
                          </select>
                        )}

                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                          className="w-14 px-2 py-1 border border-slate-300 rounded-lg text-xs text-center font-mono"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-400 hover:text-rose-600 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Create Quotation (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

