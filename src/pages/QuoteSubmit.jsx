import { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  FileText, Send, DollarSign, Truck, StickyNote, Calculator,
  ChevronDown, Package, Calendar, Code2, AlertTriangle, Shield,
  CheckCircle2, ArrowRight, Sparkles, Tag, Hash, ClipboardCheck,
  Lock, UserX, IndianRupee, Receipt, Percent, BadgeIndianRupee
} from 'lucide-react';

function VendorGate() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="glass-card p-10 max-w-md text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
          <Lock size={28} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Vendor Access Required</h2>
          <p className="text-sm text-surface-400 leading-relaxed">
            Switch to a <span className="font-semibold text-amber-400">Vendor</span> role to submit quotations.
            Only registered vendors can respond to RFQs.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-surface-500">
          <Shield size={12} />
          <span>Role-based access control enforced</span>
        </div>
      </div>
    </div>
  );
}

export default function QuoteSubmit() {
  const { rfqs, currentUser, vendors, addQuotation, showToast } = useStore();

  const isVendor = currentUser?.role === 'VENDOR';

  // Filter RFQs where this vendor is invited
  const availableRfqs = useMemo(() => {
    if (!currentUser?.vendorId) return [];
    return rfqs.filter(
      r => r.status === 'PUBLISHED' && r.invitedVendors?.includes(currentUser.vendorId)
    );
  }, [rfqs, currentUser]);

  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [form, setForm] = useState({ unitPrice: '', deliveryDays: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const selectedRfq = useMemo(() => rfqs.find(r => r.id === Number(selectedRfqId)), [rfqs, selectedRfqId]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Real-time calculations
  const calculations = useMemo(() => {
    const price = parseFloat(form.unitPrice) || 0;
    const qty = selectedRfq?.quantity || 0;
    const total = price * qty;
    const tax = total * 0.18;
    const grand = total + tax;
    return { total, tax, grand, qty, price };
  }, [form.unitPrice, selectedRfq]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRfq) {
      showToast('Please select an RFQ first', false);
      return;
    }
    if (!form.unitPrice || parseFloat(form.unitPrice) <= 0) {
      showToast('Please enter a valid unit price', false);
      return;
    }
    if (!form.deliveryDays || parseInt(form.deliveryDays) <= 0) {
      showToast('Please enter valid delivery days', false);
      return;
    }

    addQuotation({
      rfqId: selectedRfq.id,
      vendorId: currentUser.vendorId,
      unitPrice: parseFloat(form.unitPrice),
      deliveryDays: parseInt(form.deliveryDays),
      notes: form.notes,
    });

    showToast('Quotation submitted successfully!', true);
    setSubmitted(true);
  };

  if (!isVendor) return <VendorGate />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Quotation Submitted!</h2>
            <p className="text-sm text-surface-400">Your bid has been recorded and is now under review.</p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setSelectedRfqId(''); setForm({ unitPrice: '', deliveryDays: '', notes: '' }); }}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition-all"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full bg-surface-50 border border-surface-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200';
  const labelCls = 'block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5';

  const vendorInfo = vendors.find(v => v.id === currentUser?.vendorId);

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

  return (
    <div className="min-h-screen bg-surface-0 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Receipt size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Submit Quotation</h1>
            <p className="text-sm text-surface-400 mt-0.5">
              Responding as <span className="text-emerald-400 font-semibold">{vendorInfo?.company || currentUser?.name}</span>
            </p>
          </div>
        </div>
        <div className="badge badge-success">
          <Shield size={10} />
          Vendor Portal
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: RFQ Selection + Form (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* RFQ Selector */}
          <div className="glass-card p-6 space-y-4 animate-fade-in stagger-1">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck size={16} className="text-brand-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Select RFQ</h2>
            </div>

            {availableRfqs.length === 0 ? (
              <div className="text-center py-10">
                <UserX size={32} className="text-surface-400 mx-auto mb-3" />
                <p className="text-sm text-surface-400">No published RFQs available for your vendor profile.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableRfqs.map(rfq => {
                  const isSelected = Number(selectedRfqId) === rfq.id;
                  return (
                    <button
                      key={rfq.id}
                      type="button"
                      onClick={() => setSelectedRfqId(String(rfq.id))}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-brand-600/10 border-brand-500/40 shadow-lg shadow-brand-600/5'
                          : 'bg-surface-50/50 border-surface-200/50 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-surface-500">RFQ-{rfq.id}</span>
                            <span className="badge badge-success text-[10px]">{rfq.status}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-100 truncate">{rfq.title}</h3>
                          {isSelected && (
                            <p className="text-xs text-surface-400 mt-1 line-clamp-2">{rfq.description}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                          isSelected ? 'border-brand-400 bg-brand-400' : 'border-surface-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-surface-200/30 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
                          <div className="bg-surface-0/50 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-surface-500 uppercase mb-0.5">Quantity</p>
                            <p className="text-sm font-mono font-bold text-slate-200">{rfq.quantity?.toLocaleString()}</p>
                          </div>
                          <div className="bg-surface-0/50 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-surface-500 uppercase mb-0.5">SKU</p>
                            <p className="text-sm font-mono font-bold text-slate-200">{rfq.sku || '—'}</p>
                          </div>
                          <div className="bg-surface-0/50 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-surface-500 uppercase mb-0.5">Deadline</p>
                            <p className="text-sm font-mono font-bold text-slate-200">
                              {new Date(rfq.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="bg-surface-0/50 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-surface-500 uppercase mb-0.5">Specs</p>
                            <p className="text-sm font-mono font-bold text-brand-300">
                              {rfq.specs ? Object.keys(rfq.specs).length : 0} keys
                            </p>
                          </div>

                          {/* Specs detail */}
                          {rfq.specs && Object.keys(rfq.specs).length > 0 && (
                            <div className="col-span-full">
                              <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-1.5">Specifications</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(rfq.specs).map(([k, v]) => (
                                  <span key={k} className="badge badge-info text-[10px]">
                                    <Code2 size={9} />
                                    {k}: {String(v)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quote Form */}
          {selectedRfq && (
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your Quotation</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Unit Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-mono">₹</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={`${inputCls} pl-8`}
                      placeholder="45.00"
                      value={form.unitPrice}
                      onChange={e => set('unitPrice', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Delivery Timeline (Days) *</label>
                  <div className="relative">
                    <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="number"
                      min="1"
                      className={`${inputCls} pl-9`}
                      placeholder="14"
                      value={form.deliveryDays}
                      onChange={e => set('deliveryDays', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes / Remarks</label>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder="Additional terms, certifications, delivery conditions..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2.5 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Send size={16} />
                  Submit Quotation
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Price Calculator (1/3) */}
        <div className="animate-fade-in stagger-2">
          <div className="sticky top-6 space-y-4">
            {/* Calculator */}
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-brand-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Price Calculator</h3>
              </div>

              <div className="h-px bg-surface-200/30" />

              {/* Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Unit Price</span>
                  <span className="text-sm font-mono font-bold text-slate-200">
                    {calculations.price > 0 ? formatCurrency(calculations.price) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">× Quantity</span>
                  <span className="text-sm font-mono font-bold text-slate-200">
                    {calculations.qty > 0 ? calculations.qty.toLocaleString() : '—'}
                  </span>
                </div>

                <div className="h-px bg-surface-200/20" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Subtotal</span>
                  <span className="text-sm font-mono font-semibold text-slate-300">
                    {calculations.total > 0 ? formatCurrency(calculations.total) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400 flex items-center gap-1">
                    <Percent size={10} />
                    GST (18%)
                  </span>
                  <span className="text-sm font-mono font-semibold text-amber-400">
                    {calculations.tax > 0 ? formatCurrency(calculations.tax) : '—'}
                  </span>
                </div>

                <div className="h-px bg-surface-200/30" />

                <div className="flex items-center justify-between bg-surface-50 rounded-xl p-4 -mx-1">
                  <span className="text-sm font-bold text-slate-200">Grand Total</span>
                  <span className={`text-xl font-mono font-black ${calculations.grand > 0 ? 'gradient-text' : 'text-surface-400'}`}>
                    {calculations.grand > 0 ? formatCurrency(calculations.grand) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {form.deliveryDays && (
              <div className="glass-card p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Truck size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">{form.deliveryDays} days</p>
                    <p className="text-xs text-surface-400">Estimated delivery</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  selectedRfq && form.unitPrice && form.deliveryDays
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`} />
                <p className="text-xs text-surface-400">
                  {!selectedRfq
                    ? 'Select an RFQ to begin'
                    : !form.unitPrice
                    ? 'Enter unit price'
                    : !form.deliveryDays
                    ? 'Enter delivery timeline'
                    : 'Ready to submit'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
