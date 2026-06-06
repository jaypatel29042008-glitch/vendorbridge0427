import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../store';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  ShieldCheck,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Send,
  MessageSquare,
  ArrowRight,
  CalendarDays,
  Activity,
  Package,
  CircleDot,
  CheckCircle2,
  AlertCircle,
  Layers,
  BarChart3,
  GitCompareArrows,
  Upload,
  Sparkles,
  Rocket,
  Eye,
  FileCheck2,
  CreditCard,
  Hexagon,
  Zap,
} from 'lucide-react';

// Monthly spend mock data
const SPEND_DATA = [
  { month: 'Jan', spend: 12400 },
  { month: 'Feb', spend: 18200 },
  { month: 'Mar', spend: 15800 },
  { month: 'Apr', spend: 24600 },
  { month: 'May', spend: 22500 },
  { month: 'Jun', spend: 29100 },
];

const STATUS_MAP = {
  PUBLISHED: { label: 'Published', cls: 'badge-info' },
  DRAFT: { label: 'Draft', cls: 'badge-neutral' },
  CLOSED: { label: 'Closed', cls: 'badge-danger' },
  AWARDED: { label: 'Awarded', cls: 'badge-success' },
};

const GUIDE_STEPS = [
  {
    step: 1,
    icon: FileText,
    title: 'Create RFQ',
    desc: 'Procurement officer publishes a Request for Quotation to invite vendor bids.',
    color: 'from-brand-500 to-brand-700',
    link: '/rfqs',
  },
  {
    step: 2,
    icon: GitCompareArrows,
    title: 'Compare Bids',
    desc: 'Side-by-side comparison of vendor quotes on price, delivery, and compliance.',
    color: 'from-emerald-500 to-emerald-700',
    link: '/quotations',
  },
  {
    step: 3,
    icon: FileCheck2,
    title: 'Approve PO',
    desc: 'Manager reviews and approves the Purchase Order based on compliance rules.',
    color: 'from-amber-500 to-amber-700',
    link: '/purchase-orders',
  },
  {
    step: 4,
    icon: CreditCard,
    title: 'GRN & Invoice',
    desc: 'Receive goods, verify quantities, and process the vendor invoice for payment.',
    color: 'from-rose-500 to-rose-700',
    link: '/invoices',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 !rounded-lg">
        <p className="text-xs text-surface-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-brand-300 font-mono">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const currentUser = useStore((s) => s.currentUser);
  const rfqs = useStore((s) => s.rfqs);
  const vendors = useStore((s) => s.vendors);
  const purchaseOrders = useStore((s) => s.purchaseOrders);
  const chatMessages = useStore((s) => s.chatMessages);
  const sendMessage = useStore((s) => s.sendMessage);

  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const rfqMessages = useMemo(
    () => chatMessages.filter((m) => m.rfqId === 1),
    [chatMessages]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rfqMessages.length]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(1, chatInput.trim());
    setChatInput('');
  };

  // KPI calculations
  const activeRfqs = rfqs.filter((r) => r.status === 'PUBLISHED').length;
  const approvedVendors = vendors.filter((v) => v.status === 'ACTIVE').length;
  const pendingApprovals = purchaseOrders.filter(
    (po) => po.status === 'PENDING_APPROVAL'
  ).length;
  const totalSpend = purchaseOrders
    .filter((po) => po.status === 'APPROVED')
    .reduce((sum, po) => sum + po.total, 0);

  const kpiCards = [
    {
      label: 'Active RFQs',
      value: activeRfqs,
      icon: FileText,
      trend: '+2 this week',
      trendUp: true,
      color: 'from-brand-500 to-brand-700',
      bg: 'bg-brand-500/10',
      ring: 'ring-brand-500/20',
    },
    {
      label: 'Approved Vendors',
      value: approvedVendors,
      icon: ShieldCheck,
      trend: '+1 new',
      trendUp: true,
      color: 'from-emerald-500 to-emerald-700',
      bg: 'bg-emerald-500/10',
      ring: 'ring-emerald-500/20',
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovals,
      icon: Clock,
      trend: pendingApprovals > 0 ? 'Action needed' : 'All clear',
      trendUp: pendingApprovals === 0,
      color: 'from-amber-500 to-amber-700',
      bg: 'bg-amber-500/10',
      ring: 'ring-amber-500/20',
    },
    {
      label: 'Total Spend',
      value: `$${totalSpend.toLocaleString()}`,
      icon: DollarSign,
      trend: '+12.5% MoM',
      trendUp: true,
      color: 'from-rose-500 to-rose-700',
      bg: 'bg-rose-500/10',
      ring: 'ring-rose-500/20',
    },
  ];

  const isVendor = currentUser?.role === 'VENDOR';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (ds) => {
    return new Date(ds).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ──────────────────── Top Section ──────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">
            Welcome back,{' '}
            <span className="gradient-text">
              {currentUser?.name?.split(' ')[0] || 'User'}
            </span>
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-surface-400" />
            <span className="text-sm text-surface-400">{today}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live System
          </span>
          <span className="badge badge-info">
            {currentUser?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* ──────────────────── KPI Cards ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass-card p-5 animate-fade-in stagger-${idx + 1} group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    card.trendUp ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {card.trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.trend}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-100 font-mono">
                  {card.value}
                </div>
                <div className="text-xs text-surface-400 font-medium mt-0.5">
                  {card.label}
                </div>
              </div>
              {/* Subtle progress bar */}
              <div className="mt-3 h-1 rounded-full bg-surface-100/50 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-1000`}
                  style={{
                    width: `${Math.min(
                      ((typeof card.value === 'number' ? card.value : 75) /
                        10) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ──────────────────── Spend Chart + Quick Stats ──────────────────── */}
      <div className="glass-card p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Monthly Spend Trend
            </h2>
          </div>
          <span className="badge badge-info text-[10px]">Last 6 Months</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SPEND_DATA}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(71,85,105,0.15)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#818cf8"
                strokeWidth={2.5}
                fill="url(#spendGrad)"
                dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#a5b4fc', r: 5, strokeWidth: 2, stroke: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ──────────────────── Middle: RFQ Table + Chat ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFQ Table — 2/3 */}
        <div className="lg:col-span-2 glass-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Recent RFQs
              </h2>
            </div>
            <NavLink
              to="/rfqs"
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors group"
            >
              View All
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </NavLink>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200/20">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">
                    Deadline
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">
                    Qty
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq, idx) => {
                  const st = STATUS_MAP[rfq.status] || STATUS_MAP.DRAFT;
                  return (
                    <tr
                      key={rfq.id}
                      className="border-b border-surface-200/10 hover:bg-surface-50/40 transition-colors group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5 text-brand-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-200 truncate max-w-[200px] lg:max-w-[280px]">
                              {rfq.title}
                            </div>
                            <div className="text-[11px] text-surface-400 font-mono">
                              RFQ-{rfq.id} · {rfq.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="py-3 px-3 text-surface-300 text-xs font-mono hidden md:table-cell">
                        {formatDate(rfq.deadline)}
                      </td>
                      <td className="py-3 px-3 text-right text-surface-300 font-mono text-xs hidden md:table-cell">
                        {rfq.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isVendor ? (
                          <NavLink
                            to="/quotations"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                          >
                            <Upload className="w-3 h-3" />
                            Submit Quote
                          </NavLink>
                        ) : (
                          <NavLink
                            to="/quotations"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-semibold hover:bg-brand-500/20 transition-colors border border-brand-500/20"
                          >
                            <Eye className="w-3 h-3" />
                            Compare Bids
                          </NavLink>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chat Panel — 1/3 */}
        <div className="glass-card flex flex-col animate-fade-in h-[420px]">
          {/* Chat header */}
          <div className="p-4 border-b border-surface-200/20 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  RFQ-1 Chat
                </h2>
              </div>
              <span className="badge badge-info text-[10px]">
                {rfqMessages.length} messages
              </span>
            </div>
            <p className="text-[11px] text-surface-400 mt-1 truncate">
              Titanium Rods — Procurement Discussion
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {rfqMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                      isMe
                        ? 'bg-brand-600/30 border border-brand-500/20 rounded-br-sm'
                        : 'bg-surface-100/60 border border-surface-200/20 rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isMe ? 'text-brand-300' : 'text-emerald-400'
                        }`}
                      >
                        {msg.senderName?.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-surface-400 font-mono">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-surface-200/20 shrink-0"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-200/30 text-sm text-slate-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ──────────────────── Hackathon Guide ──────────────────── */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-5">
          <Rocket className="w-4 h-4 text-brand-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            Hackathon Demo Guide
          </h2>
          <span className="badge badge-warning text-[10px] ml-2">
            <Sparkles className="w-3 h-3" />
            Follow these steps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUIDE_STEPS.map((gs, idx) => {
            const Icon = gs.icon;
            return (
              <NavLink
                key={gs.step}
                to={gs.link}
                className={`group relative p-4 rounded-xl bg-surface-50/30 border border-surface-200/20 hover:border-brand-500/30 hover:bg-surface-50/60 transition-all duration-300 animate-fade-in stagger-${idx + 1}`}
              >
                {/* Step number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface-0 border border-surface-200/30 flex items-center justify-center text-[10px] font-bold text-surface-400 font-mono">
                  {gs.step}
                </div>

                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gs.color} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  {gs.title}
                </h3>
                <p className="text-xs text-surface-400 leading-relaxed">
                  {gs.desc}
                </p>

                <div className="flex items-center gap-1 mt-3 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Go to step
                  <ArrowRight className="w-3 h-3" />
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Progress connector */}
        <div className="hidden lg:flex items-center justify-center mt-4 px-8">
          <div className="flex-1 flex items-center">
            {[1, 2, 3, 4].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                    i === 0
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-100 text-surface-400 border border-surface-200/30'
                  }`}
                >
                  {s}
                </div>
                {i < 3 && (
                  <div className="flex-1 h-px bg-surface-200/20 mx-2">
                    <div
                      className="h-full bg-brand-500/40"
                      style={{ width: i === 0 ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
