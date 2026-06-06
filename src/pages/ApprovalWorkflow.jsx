import { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Lock,
  UserCheck,
  CrownIcon,
  DollarSign,
  FileCheck,
  MessageSquare,
  Truck,
  Sparkles,
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING_APPROVAL: { badge: 'badge-warning', label: 'Pending', icon: Clock },
  APPROVED: { badge: 'badge-success', label: 'Approved', icon: CheckCircle2 },
  REJECTED: { badge: 'badge-danger', label: 'Rejected', icon: XCircle },
};

const ROLE_ICONS = {
  PROCUREMENT_OFFICER: UserCheck,
  MANAGER_APPROVER: Shield,
  ADMIN: CrownIcon,
};

const STEP_COLORS = [
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', glow: 'shadow-emerald-500/10' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', glow: 'shadow-amber-500/10' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-300', glow: 'shadow-rose-500/10' },
];

export default function ApprovalWorkflow() {
  const approvalRules = useStore((s) => s.approvalRules);
  const purchaseOrders = useStore((s) => s.purchaseOrders);
  const rfqs = useStore((s) => s.rfqs);
  const vendors = useStore((s) => s.vendors);
  const currentUser = useStore((s) => s.currentUser);
  const approvePO = useStore((s) => s.approvePO);
  const rejectPO = useStore((s) => s.rejectPO);
  const showToast = useStore((s) => s.showToast);

  const [remarksMap, setRemarksMap] = useState({});
  const [showRemarksFor, setShowRemarksFor] = useState({});

  const canApprove =
    currentUser?.role === 'MANAGER_APPROVER' || currentUser?.role === 'ADMIN';

  const handleApprove = (poId) => {
    const remarks = remarksMap[poId] || 'Approved';
    approvePO(poId, remarks);
    showToast(`PO approved successfully! GRN creation notification sent.`, true);
    setShowRemarksFor((p) => ({ ...p, [poId]: false }));
    setRemarksMap((p) => ({ ...p, [poId]: '' }));
  };

  const handleReject = (poId) => {
    const remarks = remarksMap[poId] || 'Rejected';
    rejectPO(poId, remarks);
    showToast(`PO has been rejected.`, false);
    setShowRemarksFor((p) => ({ ...p, [poId]: false }));
    setRemarksMap((p) => ({ ...p, [poId]: '' }));
  };

  const toggleRemarks = (poId, action) => {
    setShowRemarksFor((p) => ({
      ...p,
      [poId]: p[poId] === action ? false : action,
    }));
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const sortedPOs = useMemo(() => {
    return [...purchaseOrders].sort((a, b) => {
      const order = { PENDING_APPROVAL: 0, APPROVED: 1, REJECTED: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });
  }, [purchaseOrders]);

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Gated Approval Workflow Console
            </h1>
            <p className="text-surface-400 text-sm mt-0.5">
              Multi-tier approval pipeline with role-based authorization gates
            </p>
          </div>
        </div>
      </div>

      {/* Approval Pipeline Visualization */}
      <div className="glass-card p-6 mb-6 animate-fade-in stagger-1">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} className="text-brand-400" />
          <h2 className="text-base font-bold text-white">Approval Pipeline</h2>
        </div>
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {approvalRules.map((rule, idx) => {
            const colors = STEP_COLORS[idx % STEP_COLORS.length];
            const RoleIcon = ROLE_ICONS[rule.role] || Shield;
            const isLast = idx === approvalRules.length - 1;
            return (
              <div key={rule.id} className="flex-1 flex items-stretch">
                <div
                  className={`flex-1 ${colors.bg} border ${colors.border} rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${colors.glow} group`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                      <RoleIcon size={18} />
                    </div>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      Step {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-base mb-1">{rule.step}</h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <DollarSign size={13} className="text-surface-400" />
                    <span className="text-xs font-mono text-surface-400">
                      {fmt(rule.minAmount)} — {fmt(rule.maxAmount)}
                    </span>
                  </div>
                  <span className="badge badge-neutral text-[10px]">{rule.role.replace(/_/g, ' ')}</span>
                </div>
                {!isLast && (
                  <div className="hidden md:flex items-center px-2">
                    <ChevronRight size={20} className="text-surface-300" />
                  </div>
                )}
                {!isLast && (
                  <div className="flex md:hidden justify-center py-2">
                    <ArrowRight size={18} className="text-surface-300 rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* State Machine Visualization */}
      <div className="glass-card p-6 mb-6 animate-fade-in stagger-2">
        <div className="flex items-center gap-2 mb-5">
          <FileCheck size={16} className="text-brand-400" />
          <h2 className="text-base font-bold text-white">State Machine</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {/* Created */}
          <div className="flex items-center gap-2 bg-surface-100/60 border border-surface-200/50 rounded-xl px-5 py-3">
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/30"></div>
            <span className="text-sm font-semibold text-blue-300">Created</span>
          </div>
          <ArrowRight size={18} className="text-surface-300 rotate-90 md:rotate-0" />
          {/* Pending */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 animate-pulse-glow">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/30"></div>
            <span className="text-sm font-semibold text-amber-300">Pending Approval</span>
          </div>
          {/* Fork */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <ArrowRight size={18} className="text-surface-300 rotate-90 md:rotate-0" />
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30"></div>
                <span className="text-sm font-semibold text-emerald-300">Approved</span>
              </div>
              <ArrowRight size={18} className="text-surface-300 rotate-90 md:rotate-0" />
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl px-5 py-3">
                <Truck size={14} className="text-blue-300" />
                <span className="text-sm font-semibold text-blue-300">GRN</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ArrowRight size={18} className="text-surface-300 rotate-90 md:rotate-0" />
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-5 py-3">
                <div className="w-3 h-3 rounded-full bg-rose-400 shadow-lg shadow-rose-400/30"></div>
                <span className="text-sm font-semibold text-rose-300">Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="glass-card p-1 animate-fade-in stagger-3">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-brand-400" />
            <h2 className="text-lg font-bold text-white">Purchase Orders</h2>
          </div>
          <div className="flex gap-2">
            {!canApprove && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1">
                <Lock size={12} />
                View-only — requires MANAGER or ADMIN role
              </span>
            )}
          </div>
        </div>

        {sortedPOs.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck size={48} className="mx-auto text-surface-300 mb-4" />
            <p className="text-surface-400">No purchase orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200/50">
                  {['PO Number', 'RFQ', 'Vendor', 'Total', 'Status', 'Created', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedPOs.map((po) => {
                  const rfq = rfqs.find((r) => r.id === po.rfqId);
                  const vendor = vendors.find((v) => v.id === po.vendorId);
                  const cfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.PENDING_APPROVAL;
                  const StatusIcon = cfg.icon;
                  const isPending = po.status === 'PENDING_APPROVAL';
                  const remarksAction = showRemarksFor[po.id];

                  return (
                    <tr
                      key={po.id}
                      className={`border-b border-surface-200/20 transition-all duration-200 hover:bg-brand-600/5 ${
                        isPending ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-brand-300 font-semibold">{po.poNumber}</span>
                      </td>
                      <td className="px-4 py-4 max-w-[220px]">
                        <span className="text-white text-sm line-clamp-1">
                          {rfq?.title || `RFQ-${po.rfqId}`}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-surface-300 text-sm">
                          {vendor?.company || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-white font-semibold">{fmt(po.total)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`badge ${cfg.badge}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-surface-400 text-xs font-mono">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {isPending && canApprove ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRemarks(po.id, 'approve')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                                  remarksAction === 'approve'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                                }`}
                              >
                                <CheckCircle2 size={13} />
                                Approve
                              </button>
                              <button
                                onClick={() => toggleRemarks(po.id, 'reject')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                                  remarksAction === 'reject'
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                                    : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                                }`}
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </div>
                            {remarksAction && (
                              <div className="animate-scale-in flex flex-col gap-2">
                                <div className="flex items-start gap-2">
                                  <MessageSquare size={14} className="text-surface-400 mt-1.5 shrink-0" />
                                  <textarea
                                    value={remarksMap[po.id] || ''}
                                    onChange={(e) =>
                                      setRemarksMap((p) => ({ ...p, [po.id]: e.target.value }))
                                    }
                                    placeholder={`Remarks for ${remarksAction}…`}
                                    className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-xs text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
                                    rows={2}
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    remarksAction === 'approve'
                                      ? handleApprove(po.id)
                                      : handleReject(po.id)
                                  }
                                  className={`self-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-200 active:scale-95 ${
                                    remarksAction === 'approve'
                                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25'
                                      : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25'
                                  }`}
                                >
                                  {remarksAction === 'approve' ? (
                                    <>
                                      <CheckCircle2 size={13} /> Confirm Approval
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={13} /> Confirm Rejection
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : isPending && !canApprove ? (
                          <span className="inline-flex items-center gap-1 text-xs text-surface-400">
                            <Lock size={12} />
                            Awaiting approval
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {po.remarks && (
                              <span className="text-xs text-surface-400 italic">
                                "{po.remarks}"
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Info Footer */}
      <div className="mt-6 flex flex-wrap gap-3 animate-fade-in stagger-4">
        <div className="flex items-center gap-2 bg-surface-50/50 rounded-lg px-3 py-2 border border-surface-200/30">
          <div className="w-2 h-2 rounded-full bg-brand-400"></div>
          <span className="text-xs text-surface-400">
            Logged in as:{' '}
            <span className="text-white font-semibold">{currentUser?.name || 'Guest'}</span>
          </span>
          <span className="badge badge-info text-[10px]">
            {currentUser?.role?.replace(/_/g, ' ') || 'N/A'}
          </span>
        </div>
        {canApprove && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <CheckCircle2 size={13} />
            You have approval permissions
          </div>
        )}
      </div>
    </div>
  );
}
