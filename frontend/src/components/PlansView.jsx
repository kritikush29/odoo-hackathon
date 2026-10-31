import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, CheckCircle2, XCircle, Shield, RefreshCw } from 'lucide-react';

export default function PlansView({ isAdmin }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('150');
  const [frequency, setFrequency] = useState('monthly');
  const [minQuantity, setMinQuantity] = useState(1);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2028-12-31');
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openNewModal = () => {
    setEditingPlan(null);
    setName('');
    setCost('199');
    setFrequency('monthly');
    setMinQuantity(1);
    setStartDate('2026-01-01');
    setEndDate('2028-12-31');
    setAutoCloseOnEnd(false);
    setAllowPause(true);
    setAllowRenewal(true);
    setAllowEarlyClose(true);
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingPlan(p);
    setName(p.name);
    setCost(p.cost);
    setFrequency(p.frequency);
    setMinQuantity(p.minQuantity || 1);
    setStartDate(p.startDate || '');
    setEndDate(p.endDate || '');
    setAutoCloseOnEnd(Boolean(p.autoCloseOnEnd));
    setAllowPause(Boolean(p.allowPause));
    setAllowRenewal(Boolean(p.allowRenewal));
    setAllowEarlyClose(Boolean(p.allowEarlyClose));
    setDescription(p.description || '');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      cost: Number(cost),
      frequency,
      minQuantity: Number(minQuantity),
      startDate,
      endDate,
      autoCloseOnEnd,
      allowPause,
      allowRenewal,
      allowEarlyClose,
      description
    };

    try {
      const url = editingPlan ? `/api/plans/${editingPlan.id}` : '/api/plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save plan');

      setShowModal(false);
      fetchPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Subscription Plans & Lifecycle Rules</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {plans.length} Configured Plans
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Specify recurring frequency (Daily, Weekly, Monthly, Yearly), minimum seat counts, and policy controls (Auto-close, Pausing, Renewals, Early Closure).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Create Subscription Plan
          </button>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {p.frequency} billing
                </span>
                {isAdmin && (
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{p.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description || 'Standard plan tier.'}</p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 font-mono">₹{p.cost}</span>
                  <span className="text-xs text-slate-500">/ {p.frequency}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Min Qty: <span className="font-bold text-slate-800">{p.minQuantity || 1} seat(s)</span>
                </div>
              </div>

              {/* Policy Badges (Odoo Page 3 requirements) */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
                  Lifecycle Policies:
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Auto-close on end</span>
                  {p.autoCloseOnEnd ? (
                    <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Yes (Auto)</span>
                  ) : (
                    <span className="font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Manual</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Customer can pause</span>
                  {p.allowPause ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Allowed
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-500" /> Locked
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Renewal enabled</span>
                  {p.allowRenewal ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Renewable
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-500" /> Fixed-term
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Early cancellation</span>
                  {p.allowEarlyClose ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Permitted
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-700 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-600" /> Contract lock
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 text-[10px] text-slate-400">
                Available: {p.startDate} to {p.endDate}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingPlan ? `Edit Plan (${editingPlan.name})` : 'Create Subscription Plan'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise Annual Scale"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Until</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              {/* Admin Policy Controls (Page 3) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">Admin Lifecycle Policies:</div>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={autoCloseOnEnd}
                    onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span><strong>Auto-close on end:</strong> Subscriptions automatically close upon reaching expiration date</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowPause}
                    onChange={(e) => setAllowPause(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span><strong>Allow pause:</strong> Allow customer/staff to pause billing temporarily</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowRenewal}
                    onChange={(e) => setAllowRenewal(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span><strong>Allow renewal:</strong> Permit continuous contract extensions upon expiry</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowEarlyClose}
                    onChange={(e) => setAllowEarlyClose(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span><strong>Allow early closure:</strong> Allow cancellation before contract term concludes</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plan marketing highlights, SLA tier, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

