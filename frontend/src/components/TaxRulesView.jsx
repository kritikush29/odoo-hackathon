import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, ShieldCheck, Percent } from 'lucide-react';

export default function TaxRulesView({ isAdmin }) {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [rate, setRate] = useState('18');
  const [isDefault, setIsDefault] = useState(false);
  const [description, setDescription] = useState('');

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/taxes');
      const data = await res.json();
      setTaxes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rate: Number(rate),
          isDefault,
          description
        })
      });
      if (!res.ok) throw new Error('Failed to create tax rule');
      setShowModal(false);
      setName('');
      setRate('18');
      setIsDefault(false);
      setDescription('');
      fetchTaxes();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Admin Tax Rules & Automated Calculation</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Tax Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tax rates are calculated automatically and applied to every invoice line on billing day.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Tax Rule
          </button>
        )}
      </div>

      {/* Taxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {taxes.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-slate-400">{t.id}</span>
                {t.isDefault && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Default Rule
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.description || 'Statutory automated tax rate.'}</p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {t.rate}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Automated computation on billing day
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tax Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Add Statutory Tax Rule</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. EU Digital Goods VAT"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jurisdiction / Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Applicable for European SaaS clients"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Set as default tax rule for new quotes</span>
              </label>

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
                  Save Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

