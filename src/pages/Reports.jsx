import React, { useMemo } from 'react';
import { useStore } from '../store';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, BarChart3, PieChart as PieChartIcon, GitBranch,
  Download, FileDown, Star, Award, Truck, DollarSign,
  ArrowRight, ChevronRight, Sparkles, Activity, Package,
  FileText, CreditCard, CheckCircle2
} from 'lucide-react';

// ===================== MOCK DATA =====================

const MONTHLY_SPEND = [
  { month: 'Jan', spend: 42500, budget: 55000 },
  { month: 'Feb', spend: 38200, budget: 55000 },
  { month: 'Mar', spend: 61800, budget: 60000 },
  { month: 'Apr', spend: 54300, budget: 60000 },
  { month: 'May', spend: 48900, budget: 65000 },
  { month: 'Jun', spend: 72400, budget: 65000 },
];

const PIPELINE_STEPS = [
  { label: 'RFQs Created', icon: FileText, color: '#818cf8' },
  { label: 'Quotes Received', icon: Package, color: '#38bdf8' },
  { label: 'POs Generated', icon: CheckCircle2, color: '#34d399' },
  { label: 'Invoices Paid', icon: CreditCard, color: '#fbbf24' },
];

const PIE_COLORS = ['#34d399', '#fbbf24', '#64748b'];

// ===================== CUSTOM TOOLTIP =====================

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-surface-50 border border-surface-200/50 rounded-lg px-4 py-3 shadow-2xl shadow-black/50">
      <p className="text-xs text-slate-400 font-mono mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="font-mono font-bold text-slate-100">
            {typeof entry.value === 'number'
              ? entry.name === 'rating'
                ? entry.value.toFixed(1)
                : `$${entry.value.toLocaleString()}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className="bg-surface-50 border border-surface-200/50 rounded-lg px-4 py-3 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.payload.fill }} />
        <span className="text-slate-300 font-medium">{d.name}</span>
        <span className="font-mono font-bold text-slate-100">{d.value}</span>
      </div>
    </div>
  );
}

// ===================== COMPONENT =====================

export default function Reports() {
  const vendors = useStore(s => s.vendors);
  const rfqs = useStore(s => s.rfqs);
  const quotations = useStore(s => s.quotations);
  const purchaseOrders = useStore(s => s.purchaseOrders);
  const invoices = useStore(s => s.invoices);
  const showToast = useStore(s => s.showToast);

  // Vendor Performance data
  const vendorPerformance = useMemo(() => {
    return vendors.map(v => ({
      name: v.company.length > 18 ? v.company.substring(0, 16) + '…' : v.company,
      fullName: v.company,
      rating: v.rating,
    }));
  }, [vendors]);

  // RFQ Status distribution
  const rfqDistribution = useMemo(() => {
    const counts = {};
    rfqs.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rfqs]);

  // Pipeline counts
  const pipelineCounts = useMemo(() => [
    rfqs.length,
    quotations.length,
    purchaseOrders.length,
    invoices.filter(i => i.status === 'PAID').length,
  ], [rfqs, quotations, purchaseOrders, invoices]);

  // Top vendors table
  const topVendors = useMemo(() => {
    return vendors
      .filter(v => v.status === 'ACTIVE')
      .map(v => {
        const vendorPOs = purchaseOrders.filter(po => po.vendorId === v.id);
        const totalPOValue = vendorPOs.reduce((sum, po) => sum + po.total, 0);
        return {
          id: v.id,
          name: v.company,
          category: v.category,
          rating: v.rating,
          totalPOValue,
          deliveryScore: Math.min(100, Math.round(v.rating * 20 + Math.random() * 5)),
          poCount: vendorPOs.length,
        };
      })
      .sort((a, b) => b.rating - a.rating);
  }, [vendors, purchaseOrders]);

  const maxPipelineCount = Math.max(...pipelineCounts, 1);

  return (
    <div className="min-h-screen bg-surface-0 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
                Reports <span className="gradient-text">&amp; Consolidated Analytics</span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">Comprehensive insights across your procurement lifecycle</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('CSV Export initiated', true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-100 border border-surface-200/50 rounded-lg text-sm text-slate-300 hover:border-brand-500/40 hover:text-slate-100 transition-all group"
            >
              <FileDown size={16} className="text-slate-400 group-hover:text-brand-400 transition-colors" />
              Export CSV
            </button>
            <button
              onClick={() => showToast('PDF Export initiated', true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 rounded-lg text-sm text-white font-medium hover:from-brand-500 hover:to-brand-400 transition-all shadow-lg shadow-brand-500/20 group"
            >
              <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* 1. Monthly Spend Trends */}
        <div className="glass-card p-5 animate-fade-in stagger-1">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <TrendingUp size={16} className="text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Monthly Spend Trends</h3>
                <p className="text-xs text-slate-500">Jan – Jun 2026</p>
              </div>
            </div>
            <span className="badge badge-info">
              <Sparkles size={10} /> 6 months
            </span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={MONTHLY_SPEND} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" dataKey="budget" stroke="#38bdf8" fill="url(#budgetGradient)" strokeWidth={2} strokeDasharray="5 5" name="budget" />
                <Area type="monotone" dataKey="spend" stroke="#818cf8" fill="url(#spendGradient)" strokeWidth={2.5} name="spend" dot={{ fill: '#818cf8', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#a5b4fc', stroke: '#818cf8', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Vendor Performance */}
        <div className="glass-card p-5 animate-fade-in stagger-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Award size={16} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Vendor Performance</h3>
                <p className="text-xs text-slate-500">Ratings out of 5.0</p>
              </div>
            </div>
            <span className="badge badge-success">
              <Star size={10} /> {vendors.length} vendors
            </span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={vendorPerformance} margin={{ top: 5, right: 20, left: 0, bottom: 20 }} barSize={36}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} tickLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rating" name="rating" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
                  {vendorPerformance.map((entry, i) => (
                    <Cell key={i} fill={entry.rating >= 4.5 ? '#34d399' : entry.rating >= 4.0 ? '#38bdf8' : '#fbbf24'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. RFQ Status Distribution */}
        <div className="glass-card p-5 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <PieChartIcon size={16} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">RFQ Status Distribution</h3>
                <p className="text-xs text-slate-500">Current period breakdown</p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div style={{ width: '60%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={rfqDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {rfqDistribution.map((entry, i) => {
                      const colorMap = { PUBLISHED: '#34d399', DRAFT: '#fbbf24', CLOSED: '#64748b' };
                      return <Cell key={i} fill={colorMap[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] space-y-3 pl-2">
              {rfqDistribution.map((entry, i) => {
                const colorMap = { PUBLISHED: '#34d399', DRAFT: '#fbbf24', CLOSED: '#64748b' };
                const color = colorMap[entry.name] || PIE_COLORS[i % PIE_COLORS.length];
                const total = rfqDistribution.reduce((s, e) => s + e.value, 0);
                const pct = total ? Math.round((entry.value / total) * 100) : 0;
                return (
                  <div key={entry.name} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300 font-medium">{entry.name}</span>
                        <span className="text-sm font-mono font-bold text-slate-100">{entry.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-200/30 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Procurement Pipeline */}
        <div className="glass-card p-5 animate-fade-in stagger-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <GitBranch size={16} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Procurement Pipeline</h3>
                <p className="text-xs text-slate-500">End-to-end funnel overview</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            {PIPELINE_STEPS.map((step, idx) => {
              const count = pipelineCounts[idx];
              const pct = Math.max(15, (count / maxPipelineCount) * 100);
              const IconComp = step.icon;
              return (
                <div key={idx}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${step.color}20` }}>
                      <IconComp size={16} style={{ color: step.color }} />
                    </div>
                    <span className="text-sm text-slate-300 font-medium flex-1">{step.label}</span>
                    <span className="text-lg font-bold font-mono text-slate-100">{count}</span>
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <ChevronRight size={14} className="text-slate-600" />
                    )}
                  </div>
                  <div className="ml-11 h-3 bg-surface-200/15 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${step.color}cc, ${step.color})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 2s infinite' }} />
                    </div>
                  </div>
                  {idx < PIPELINE_STEPS.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowRight size={14} className="text-slate-600 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Conversion Rate */}
            <div className="mt-4 pt-4 border-t border-surface-200/20 flex items-center justify-between">
              <span className="text-xs text-slate-500">Overall Conversion Rate</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {pipelineCounts[0] > 0
                  ? `${Math.round((pipelineCounts[3] / pipelineCounts[0]) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Vendors Table */}
      <div className="glass-card animate-fade-in">
        <div className="px-6 py-5 border-b border-surface-200/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
              <Award size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Top Performing Vendors</h3>
              <p className="text-xs text-slate-500">Ranked by rating and delivery performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('CSV Export initiated', true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 border border-surface-200/50 rounded-lg text-xs text-slate-400 hover:border-brand-500/40 hover:text-slate-300 transition-all"
            >
              <FileDown size={12} /> CSV
            </button>
            <button
              onClick={() => showToast('PDF Export initiated', true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 border border-surface-200/50 rounded-lg text-xs text-slate-400 hover:border-brand-500/40 hover:text-slate-300 transition-all"
            >
              <Download size={12} /> PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200/20">
                <th className="text-left px-6 py-3.5 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">#</th>
                <th className="text-left px-6 py-3.5 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Vendor Name</th>
                <th className="text-left px-6 py-3.5 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Category</th>
                <th className="text-center px-6 py-3.5 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Rating</th>
                <th className="text-right px-6 py-3.5 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Total PO Value</th>
                <th className="text-center px-6 py-3.5 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Delivery Score</th>
                <th className="text-center px-6 py-3.5 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">POs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/10">
              {topVendors.map((vendor, idx) => (
                <tr key={vendor.id} className="hover:bg-surface-100/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                      idx === 1 ? 'bg-slate-400/15 text-slate-300' :
                      idx === 2 ? 'bg-orange-500/15 text-orange-400' :
                      'bg-surface-200/20 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center border border-brand-500/10">
                        <span className="text-sm font-bold text-brand-400">{vendor.name[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-neutral">{vendor.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <Star size={14} className={vendor.rating >= 4.5 ? 'text-amber-400 fill-amber-400' : 'text-amber-400'} />
                      <span className="font-mono font-bold text-slate-100">{vendor.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-bold text-slate-100">
                      ${vendor.totalPOValue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-200/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${vendor.deliveryScore}%`,
                            background: vendor.deliveryScore >= 90 ? '#34d399' : vendor.deliveryScore >= 75 ? '#fbbf24' : '#f87171',
                          }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-bold ${
                        vendor.deliveryScore >= 90 ? 'text-emerald-400' :
                        vendor.deliveryScore >= 75 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {vendor.deliveryScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-bold text-slate-300">{vendor.poCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-surface-200/20 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing <span className="text-slate-300 font-mono">{topVendors.length}</span> active vendors
          </span>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> ≥ 90% delivery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> ≥ 75% delivery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" /> &lt; 75% delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
