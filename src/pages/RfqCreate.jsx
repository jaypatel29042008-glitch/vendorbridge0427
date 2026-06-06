import { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  FileText, Send, Package, Calendar, Code2, Users, CheckSquare,
  Square, Eye, Sparkles, ArrowRight, AlertCircle, Hash, ClipboardList,
  Building2, Tag
} from 'lucide-react';

export default function RfqCreate() {
  const { vendors, addRfq, showToast } = useStore();
  const activeVendors = useMemo(() => vendors.filter(v => v.status === 'ACTIVE'), [vendors]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    sku: '',
    quantity: '',
    deadline: '',
    specs: '{\n  \n}',
    invitedVendors: [],
  });

  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const toggleVendor = (id) => {
    setForm(p => ({
      ...p,
      invitedVendors: p.invitedVendors.includes(id)
        ? p.invitedVendors.filter(v => v !== id)
        : [...p.invitedVendors, id],
    }));
  };

  const parsedSpecs = useMemo(() => {
    try {
      const parsed = JSON.parse(form.specs);
      return typeof parsed === 'object' && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  }, [form.specs]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Valid quantity required';
    if (!form.deadline) e.deadline = 'Deadline is required';
    if (form.invitedVendors.length === 0) e.invitedVendors = 'Select at least one vendor';
    if (!parsedSpecs && form.specs.trim() !== '{}' && form.specs.trim() !== '{\n  \n}') e.specs = 'Invalid JSON';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors before submitting', false);
      return;
    }
    addRfq({
      title: form.title,
      description: form.description,
      sku: form.sku,
      quantity: Number(form.quantity),
      deadline: form.deadline,
      specs: parsedSpecs || {},
      invitedVendors: form.invitedVendors,
      attachments: [],
    });
    showToast('RFQ published successfully!', true);
    // Navigate to dashboard
    if (window.location.hash !== undefined) {
      window.location.hash = '#/dashboard';
    }
  };

  const inputCls = (field) =>
    `w-full bg-surface-50 border ${errors[field] ? 'border-red-500/60 ring-1 ring-red-500/20' : 'border-surface-200'} rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200`;
  const labelCls = 'block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5';

  const selectedVendorNames = activeVendors
    .filter(v => form.invitedVendors.includes(v.id))
    .map(v => v.company);

  return (
    <div className="min-h-screen bg-surface-0 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center shadow-lg shadow-brand-600/20">
          <ClipboardList size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Publish New Request for Quotation</h1>
          <p className="text-sm text-surface-400 mt-0.5">Create an RFQ and invite vendors to submit competitive bids</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Column — 3/5 */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 animate-fade-in stagger-1">

          {/* Section: Basic Info */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-brand-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Basic Information</h2>
            </div>

            <div>
              <label className={labelCls}>RFQ Title *</label>
              <input
                className={inputCls('title')}
                placeholder="e.g. 500x High-Tensile Aerospace Titanium Rods"
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
              {errors.title && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.title}</p>}
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea
                className={`${inputCls('description')} min-h-[100px] resize-y`}
                placeholder="Detailed requirements, certifications needed, quality expectations..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={4}
              />
              {errors.description && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p>}
            </div>

            <div>
              <label className={labelCls}>SKU Code</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  className={`${inputCls('sku')} pl-9`}
                  placeholder="TI-ROD-G5-012"
                  value={form.sku}
                  onChange={e => set('sku', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: Requirements */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Requirements</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className={inputCls('quantity')}
                  placeholder="500"
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                />
                {errors.quantity && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.quantity}</p>}
              </div>
              <div>
                <label className={labelCls}>Deadline *</label>
                <input
                  type="date"
                  className={inputCls('deadline')}
                  value={form.deadline}
                  onChange={e => set('deadline', e.target.value)}
                />
                {errors.deadline && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.deadline}</p>}
              </div>
            </div>
          </div>

          {/* Section: Specifications */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-amber-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Specifications</h2>
              </div>
              {form.specs.trim() && (
                <span className={`badge ${parsedSpecs ? 'badge-success' : 'badge-danger'}`}>
                  {parsedSpecs ? 'Valid JSON' : 'Invalid JSON'}
                </span>
              )}
            </div>
            <textarea
              className={`${inputCls('specs')} font-mono text-xs min-h-[120px] resize-y`}
              placeholder='{"diameter": "25mm", "length": "1000mm"}'
              value={form.specs}
              onChange={e => set('specs', e.target.value)}
              rows={5}
            />
            {errors.specs && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.specs}</p>}
            <p className="text-[11px] text-surface-500">Enter custom specifications as a JSON object. Keys become spec labels.</p>
          </div>

          {/* Section: Vendor Assignment */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Vendor Assignment</h2>
              </div>
              <span className="text-xs font-mono text-surface-400">
                {form.invitedVendors.length}/{activeVendors.length} selected
              </span>
            </div>
            {errors.invitedVendors && <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><AlertCircle size={11} />{errors.invitedVendors}</p>}

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {activeVendors.map(v => {
                const selected = form.invitedVendors.includes(v.id);
                return (
                  <label
                    key={v.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selected
                        ? 'bg-brand-600/10 border-brand-500/30'
                        : 'bg-surface-50/50 border-surface-200/50 hover:border-surface-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleVendor(v.id)}
                      className="sr-only"
                    />
                    {selected ? (
                      <CheckSquare size={18} className="text-brand-400 shrink-0" />
                    ) : (
                      <Square size={18} className="text-surface-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200 truncate">{v.company}</span>
                        <span className="badge badge-neutral text-[10px]">{v.category}</span>
                      </div>
                      <p className="text-[11px] text-surface-500 mt-0.5">{v.city}, {v.state} • Rating: {v.rating}</p>
                    </div>
                    <Building2 size={14} className="text-surface-300 shrink-0" />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              className="flex items-center gap-2.5 px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Send size={16} />
              Publish RFQ
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        {/* Preview Column — 2/5 */}
        <div className="lg:col-span-2 animate-fade-in stagger-2">
          <div className="sticky top-6 space-y-4">
            {/* Preview Card */}
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-brand-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Live Preview</h3>
                </div>
                <span className="badge badge-info">
                  <Sparkles size={10} />
                  Real-time
                </span>
              </div>

              <div className="h-px bg-surface-200/30" />

              {/* Title */}
              <div>
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-1">Title</p>
                <p className="text-base font-bold text-slate-100">
                  {form.title || <span className="text-surface-400 italic font-normal">Untitled RFQ</span>}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-1">Description</p>
                <p className="text-xs text-surface-400 leading-relaxed line-clamp-4">
                  {form.description || <span className="italic">No description provided</span>}
                </p>
              </div>

              {/* SKU + Quantity + Deadline */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-1">SKU</p>
                  <p className="text-sm font-mono font-bold text-slate-200">{form.sku || '—'}</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-1">Qty</p>
                  <p className="text-sm font-mono font-bold text-slate-200">{form.quantity || '—'}</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-sm font-mono font-bold text-slate-200">
                    {form.deadline ? new Date(form.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>

              {/* Specs */}
              {parsedSpecs && Object.keys(parsedSpecs).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Specifications</p>
                  <div className="space-y-1.5">
                    {Object.entries(parsedSpecs).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between bg-surface-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-surface-400 capitalize">{k}</span>
                        <span className="text-xs font-mono font-semibold text-brand-300">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invited Vendors */}
              {selectedVendorNames.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-2">
                    Invited Vendors ({selectedVendorNames.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVendorNames.map(name => (
                      <span key={name} className="badge badge-info text-[10px]">
                        <Building2 size={9} />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${form.title && form.quantity && form.deadline && form.invitedVendors.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <p className="text-xs text-surface-400">
                  {form.title && form.quantity && form.deadline && form.invitedVendors.length > 0
                    ? 'Ready to publish'
                    : 'Fill in required fields to publish'
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
