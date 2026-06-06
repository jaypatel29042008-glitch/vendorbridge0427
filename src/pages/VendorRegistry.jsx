import { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  Building2, Search, Plus, Star, Phone, Mail, MapPin, Shield,
  ShieldCheck, ShieldAlert, X, Hash, Filter, CheckCircle2, Ban,
  BadgeCheck, Clock, AlertTriangle, Sparkles, ChevronDown
} from 'lucide-react';

const CATEGORIES = ['All', 'Raw Materials', 'Logistics', 'Hardware', 'Packaging'];

const statusConfig = {
  ACTIVE: { badge: 'badge-success', icon: CheckCircle2, label: 'Active' },
  PENDING: { badge: 'badge-warning', icon: Clock, label: 'Pending' },
  SUSPENDED: { badge: 'badge-danger', icon: AlertTriangle, label: 'Suspended' },
};

const categoryColors = {
  'Raw Materials': 'badge-info',
  'Logistics': 'badge-neutral',
  'Hardware': 'badge-warning',
  'Packaging': 'badge-success',
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={
            i <= full
              ? 'text-amber-400 fill-amber-400'
              : i === full + 1 && hasHalf
              ? 'text-amber-400 fill-amber-400/50'
              : 'text-surface-300'
          }
        />
      ))}
      <span className="ml-1 text-xs font-mono text-surface-500">{rating.toFixed(1)}</span>
    </div>
  );
}

function VendorModal({ onClose }) {
  const { addVendor, showToast } = useStore();
  const [form, setForm] = useState({
    company: '', category: 'Raw Materials', gst: '', phone: '',
    email: '', address: '', city: '', state: '', zip: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.gst || !form.email) {
      showToast('Please fill all required fields', false);
      return;
    }
    addVendor(form);
    showToast(`${form.company} registered successfully!`, true);
    onClose();
  };

  const inputCls = 'w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200';
  const labelCls = 'block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl glass-card p-0 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
              <Building2 size={20} className="text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Register New Vendor</h2>
              <p className="text-xs text-surface-400">Add a supplier to the procurement network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Company + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Company Name *</label>
              <input className={inputCls} placeholder="e.g. Hindustan Titanium & Alloys" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* GST + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>GST Number *</label>
              <input className={inputCls} placeholder="27AAAAA1111A1Z1" value={form.gst} onChange={e => set('gst', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email *</label>
            <input className={inputCls} type="email" placeholder="vendor@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          {/* Address */}
          <div>
            <label className={labelCls}>Address</label>
            <input className={inputCls} placeholder="Plot 42, Industrial Estate" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>

          {/* City + State + Zip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input className={inputCls} placeholder="Mumbai" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input className={inputCls} placeholder="Maharashtra" value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Zip Code</label>
              <input className={inputCls} placeholder="400001" value={form.zip} onChange={e => set('zip', e.target.value)} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200/50 bg-surface-0/50">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-slate-100 rounded-lg hover:bg-surface-100 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 transition-all duration-200 flex items-center gap-2">
            <Plus size={16} />
            Register Vendor
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorRegistry() {
  const { vendors, currentUser, updateVendorStatus, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      const matchSearch = !search ||
        v.company.toLowerCase().includes(search.toLowerCase()) ||
        v.gst.toLowerCase().includes(search.toLowerCase()) ||
        v.city.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || v.category === category;
      return matchSearch && matchCat;
    });
  }, [vendors, search, category]);

  const stats = useMemo(() => ({
    total: vendors.length,
    active: vendors.filter(v => v.status === 'ACTIVE').length,
    pending: vendors.filter(v => v.status === 'PENDING').length,
    suspended: vendors.filter(v => v.status === 'SUSPENDED').length,
  }), [vendors]);

  const handleVerify = (vendorId, company) => {
    updateVendorStatus(vendorId, 'ACTIVE');
    showToast(`${company} verified & activated`, true);
  };

  const handleSuspend = (vendorId, company) => {
    updateVendorStatus(vendorId, 'SUSPENDED');
    showToast(`${company} suspended`, false);
  };

  return (
    <div className="min-h-screen bg-surface-0 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-lg shadow-brand-600/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Vendor Registry & Compliance Vetting</h1>
            <p className="text-sm text-surface-400 mt-0.5">Manage, vet, and monitor your supplier network</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Register Vendor
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in stagger-1">
        {[
          { label: 'Total Vendors', value: stats.total, icon: Building2, color: 'text-brand-400', bg: 'bg-brand-600/10' },
          { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-600/10' },
          { label: 'Suspended', value: stats.suspended, icon: Ban, color: 'text-red-400', bg: 'bg-red-600/10' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-100">{s.value}</p>
              <p className="text-xs text-surface-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in stagger-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search vendors by name, GST, or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="appearance-none bg-surface-50 border border-surface-200 rounded-xl pl-9 pr-10 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all cursor-pointer min-w-[180px]"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-xs text-surface-400 animate-fade-in stagger-2">
        <Sparkles size={12} className="text-brand-400" />
        <span>Showing <span className="font-mono text-slate-300">{filtered.length}</span> vendor{filtered.length !== 1 ? 's' : ''}</span>
        {search && <span className="text-surface-500">matching "{search}"</span>}
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((vendor, idx) => {
          const st = statusConfig[vendor.status] || statusConfig.PENDING;
          const StIcon = st.icon;
          return (
            <div
              key={vendor.id}
              className={`glass-card p-5 space-y-4 animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/5 ${idx < 3 ? `stagger-${idx + 1}` : ''}`}
            >
              {/* Top: Company + Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-100 truncate">{vendor.company}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`badge ${categoryColors[vendor.category] || 'badge-neutral'}`}>
                      {vendor.category}
                    </span>
                    <span className={`badge ${st.badge}`}>
                      <StIcon size={10} />
                      {st.label}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-surface-400" />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <Hash size={12} className="text-surface-300 shrink-0" />
                  <span className="font-mono text-surface-500 truncate">{vendor.gst}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <Phone size={12} className="text-surface-300 shrink-0" />
                  <span className="font-mono">{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <Mail size={12} className="text-surface-300 shrink-0" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <MapPin size={12} className="text-surface-300 shrink-0" />
                  <span>{vendor.city}, {vendor.state}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="pt-2 border-t border-surface-200/30">
                <div className="flex items-center justify-between">
                  <StarRating rating={vendor.rating} />
                  <span className="text-[10px] font-mono text-surface-500 uppercase tracking-widest">Performance</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {isAdmin && vendor.status !== 'ACTIVE' && (
                  <button
                    onClick={() => handleVerify(vendor.id, vendor.company)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
                  >
                    <BadgeCheck size={14} />
                    Verify
                  </button>
                )}
                {vendor.status !== 'SUSPENDED' && (
                  <button
                    onClick={() => handleSuspend(vendor.id, vendor.company)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
                  >
                    <Ban size={14} />
                    Suspend
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <ShieldAlert size={28} className="text-surface-400" />
          </div>
          <p className="text-lg font-semibold text-slate-300">No vendors found</p>
          <p className="text-sm text-surface-400 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Modal */}
      {showModal && <VendorModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
