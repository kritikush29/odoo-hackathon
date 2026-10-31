import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Check, Tag, Info, Layers, DollarSign } from 'lucide-react';

export default function ProductsView({ isAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Software License');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState([
    { id: 'var-1', name: 'Standard Edition', priceAdjustment: 0 },
    { id: 'var-2', name: 'Brand Edition', priceAdjustment: 560 }
  ]);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openNewModal = () => {
    setEditingProduct(null);
    setName('');
    setType('Software License');
    setSalesPrice('1200');
    setCostPrice('350');
    setNotes('');
    setVariants([
      { id: 'v-1', name: 'Standard Edition', priceAdjustment: 0 },
      { id: 'v-2', name: 'Brand Edition', priceAdjustment: 560 }
    ]);
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setType(prod.type);
    setSalesPrice(prod.salesPrice);
    setCostPrice(prod.costPrice);
    setNotes(prod.notes || '');
    setVariants(prod.variants && prod.variants.length > 0 ? prod.variants : [
      { id: 'v-1', name: 'Standard Edition', priceAdjustment: 0 }
    ]);
    setShowModal(true);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: `v-${Date.now()}`, name: 'New Variant (e.g. Enterprise Tier)', priceAdjustment: 100 }
    ]);
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = field === 'priceAdjustment' ? Number(value) : value;
    setVariants(updated);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      type,
      salesPrice: Number(salesPrice),
      costPrice: Number(costPrice || 0),
      notes,
      variants
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save product');

      setShowModal(false);
      fetchProducts();
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
            <h1 className="text-xl font-bold text-slate-900">Products & Variants Catalog</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure base products, license types, and pricing variants (e.g. Brand edition +₹560 modifier).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Launch New Product
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map(prod => (
          <div key={prod.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {prod.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {prod.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{prod.name}</h3>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => openEditModal(prod)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{prod.notes || 'No description provided.'}</p>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline gap-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Sales Price</span>
                  <span className="text-xl font-black text-slate-900 font-mono">₹{Number(prod.salesPrice).toFixed(2)}</span>
                </div>
                {prod.costPrice > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost Price</span>
                    <span className="text-sm font-semibold text-slate-500 font-mono">₹{Number(prod.costPrice).toFixed(2)}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Gross Margin</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono">
                    {Math.round(((prod.salesPrice - prod.costPrice) / prod.salesPrice) * 100)}%
                  </span>
                </div>
              </div>

              {/* Variants Section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Configured Variants & Brand Adders
                </div>
                <div className="space-y-1.5">
                  {prod.variants && prod.variants.length > 0 ? (
                    prod.variants.map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-medium text-slate-800">{v.name}</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {v.priceAdjustment > 0 ? `+₹${v.priceAdjustment}` : 'Included (+₹0)'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No custom variants.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingProduct ? `Edit Product (${editingProduct.id})` : 'Launch New Product'}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brightloop ERP Core"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Software License">Software License</option>
                    <option value="Add-on">Add-on</option>
                    <option value="Service">Service</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Operational details, provisioning notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Variants Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Product Variants (e.g. Brand Modifier)</span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Variant name"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(i, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-slate-500 font-bold">+₹</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={v.priceAdjustment}
                          onChange={(e) => handleUpdateVariant(i, 'priceAdjustment', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="text-slate-400 hover:text-rose-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

