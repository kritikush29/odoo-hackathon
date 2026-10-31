import React, { useState, useEffect } from 'react';
import { FileText, Plus, ArrowRight, CheckCircle2, Shield, Calendar, Layers } from 'lucide-react';

export default function QuotationTemplatesView({ onUseTemplate, isAdmin, isStaff }) {
  const [templates, setTemplates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [planId, setPlanId] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [selectedLines, setSelectedLines] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes, prRes] = await Promise.all([
        fetch('/api/quotation-templates'),
        fetch('/api/plans'),
        fetch('/api/products')
      ]);
      const [tData, pData, prData] = await Promise.all([tRes.json(), pRes.json(), prRes.json()]);
      setTemplates(tData);
      setPlans(pData);
      setProducts(prData);
      if (pData.length > 0) setPlanId(pData[0].id);
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
    setName('');
    setValidityDays(30);
    setPaymentTerms('Net 30');
    if (products.length > 0) {
      setSelectedLines([
        {
          productId: products[0].id,
          variantId: products[0].variants?.[0]?.id || '',
          quantity: 1,
          unitPrice: products[0].salesPrice + (products[0].variants?.[0]?.priceAdjustment || 0)
        }
      ]);
    }
    setShowModal(true);
  };

  const handleAddLine = () => {
    if (products.length === 0) return;
    const p = products[0];
    const v = p.variants?.[0];
    setSelectedLines([
      ...selectedLines,
      {
        productId: p.id,
        variantId: v?.id || '',
        quantity: 1,
        unitPrice: p.salesPrice + (v?.priceAdjustment || 0)
      }
    ]);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...selectedLines];
    if (field === 'productId') {
      const p = products.find(prod => prod.id === value);
      const v = p?.variants?.[0];
      updated[index].productId = value;
      updated[index].variantId = v?.id || '';
      updated[index].unitPrice = (p?.salesPrice || 0) + (v?.priceAdjustment || 0);
    } else if (field === 'variantId') {
      const p = products.find(prod => prod.id === updated[index].productId);
      const v = p?.variants?.find(vr => vr.id === value);
      updated[index].variantId = value;
      updated[index].unitPrice = (p?.salesPrice || 0) + (v?.priceAdjustment || 0);
    } else if (field === 'quantity') {
      updated[index].quantity = Number(value) || 1;
    }
    setSelectedLines(updated);
  };

  const handleRemoveLine = (index) => {
    setSelectedLines(selectedLines.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      planId,
      validityDays: Number(validityDays),
      paymentTerms,
      lines: selectedLines
    };

    try {
      const res = await fetch('/api/quotation-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create template');
      setShowModal(false);
      fetchData();
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
            <h1 className="text-xl font-bold text-slate-900">Quotation Templates</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {templates.length} Active Templates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized commercial offers with pre-configured products, pricing variants, and expiration validity.
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> New Quotation Template
          </button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map(tpl => {
          const plan = plans.find(p => p.id === tpl.planId);
          return (
            <div key={tpl.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {tpl.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{tpl.name}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Valid {tpl.validityDays} Days
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Associated Plan</span>
                    <span className="font-semibold text-slate-800">{plan?.name || tpl.planId} ({plan?.frequency})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Standard Terms</span>
                    <span className="font-semibold text-slate-800">{tpl.paymentTerms}</span>
                  </div>
                </div>

                {/* Pre-bundled Lines */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Pre-bundled Product Lines:
                  </div>
                  <div className="space-y-1.5">
                    {tpl.lines?.map((line, idx) => {
                      const prod = products.find(p => p.id === line.productId);
                      const variant = prod?.variants?.find(v => v.id === line.variantId);
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div>
                            <span className="font-medium text-slate-900">{prod?.name || line.productId}</span>
                            {variant && (
                              <span className="text-slate-500 text-[11px] block">({variant.name})</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-slate-700">x{line.quantity}</span>
                            <span className="font-mono text-slate-500 ml-2">@ ₹{line.unitPrice}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition"
                >
                  Create Offer from this Template <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Create Quotation Template</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Template Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise Foundation Scale Bundle"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none font-mono"
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
              </div>

              {/* Product Lines Selector */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Pre-configured Product Lines</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedLines.map((line, idx) => {
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

