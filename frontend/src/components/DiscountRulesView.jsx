import React, { useState, useEffect } from 'react';
import { Percent, Plus, Tag, ShieldAlert, CheckCircle2, XCircle, Calendar, Hash } from 'lucide-react';

export default function DiscountRulesView({ isAdmin }) {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('percentage'); // 'percentage' or 'fixed'
  const [value, setValue] = useState('20');
  const [minQuantity, setMinQuantity] = useState('1');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('0');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2027-12-31');
  const [maxUsageCount, setMaxUsageCount] = useState('50');
  const [scope, setScope] = useState('whole_subscription');
  const [applicableProductIds, setApplicableProductIds] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, pRes] = await Promise.all([
        fetch('/api/discounts'),
        fetch('/api/products')
      ]);
      const [dData, pData] = await Promise.all([dRes.json(), pRes.json()]);
      setDiscounts(dData);
      setProducts(pData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewModal = () => {
    setCode('');
    setName('');
    setType('percentage');
    setValue('20');
    setMinQuantity('5');
    setMinPurchaseAmount('500');
    setStartDate('2026-01-01');
    setEndDate('2027-12-31');
    setMaxUsageCount('50');
    setScope('whole_subscription');
    setApplicableProductIds([]);
    setShowModal(true);
  };

  const handleProductToggle = (prodId) => {
    if (applicableProductIds.includes(prodId)) {
      setApplicableProductIds(applicableProductIds.filter(id => id !== prodId));
    } else {
      setApplicableProductIds([...applicableProductIds, prodId]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      code,
      name,
      type,
      value: Number(value),
      minQuantity: Number(minQuantity),
      minPurchaseAmount: Number(minPurchaseAmount),
      startDate,
      endDate,
      maxUsageCount: Number(maxUsageCount),
      scope,
      applicableProductIds
    };

    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create discount rule');

      setShowModal(false);
      fetchData();
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
            <h1 className="text-xl font-bold text-slate-900">Admin Discount & Promo Rules</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rules apply automatically on upcoming recurring invoices based on quantity tiers, minimum spend, expiry dates, and usage counters.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Create Discount Rule
          </button>
        )}
      </div>

      {/* Discount Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map(disc => {
          const isExpired = new Date(disc.endDate) < new Date();
          const isLimitReached = disc.currentUsageCount >= disc.maxUsageCount;
          const isActive = disc.isActive && !isExpired && !isLimitReached;

          return (
            <div key={disc.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 uppercase tracking-wide">
                      {disc.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{disc.name}</h3>
                  </div>

                  {isActive ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      {isLimitReached ? 'Limit Reached' : 'Expired'}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {disc.type === 'percentage' ? `${disc.value}% OFF` : `₹${disc.value} FLAT OFF`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Scope: <strong className="text-slate-800">{disc.scope === 'whole_subscription' ? 'Entire Subscription' : 'Specific Products Only'}</strong>
                  </div>
                </div>

                {/* Conditions */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Min Quantity / Seats:</span>
                    <strong className="text-slate-800">{disc.minQuantity || 'No minimum'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Spend Required:</span>
                    <strong className="text-slate-800 font-mono">₹{disc.minPurchaseAmount || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Window:</span>
                    <span className="text-slate-500 font-mono text-[11px]">{disc.startDate} to {disc.endDate}</span>
                  </div>
                </div>

                {/* Usage meter */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Usage Limit Meter</span>
                    <span className="font-bold font-mono text-slate-900">{disc.currentUsageCount} / {disc.maxUsageCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isLimitReached ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(100, Math.round((disc.currentUsageCount / disc.maxUsageCount) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Create New Admin Discount Rule</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon / Promo Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SEATS20"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Volume Expansion Discount"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Rupee (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value {type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Qty / Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Usages</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUsageCount}
                    onChange={(e) => setMaxUsageCount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scope</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="whole_subscription">Apply to Whole Subscription</option>
                  <option value="specific_products">Apply to Specific Products Only</option>
                </select>
              </div>

              {scope === 'specific_products' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block mb-2">Select Eligible Products:</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
                    {products.map(p => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={applicableProductIds.includes(p.id)}
                          onChange={() => handleProductToggle(p.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{p.name} ({p.type})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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
                  Create Discount Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

