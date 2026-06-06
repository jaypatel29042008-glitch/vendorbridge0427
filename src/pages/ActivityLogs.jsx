import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  Search, Filter, Clock, Shield, Bell, Activity,
  CheckCircle2, XCircle, FileText, Truck, CreditCard,
  User, Globe, ChevronDown, Zap, TrendingUp, Eye,
  AlertTriangle, Package, Send, UserCheck, Hash
} from 'lucide-react';

const ACTION_TYPES = [
  'VENDOR_VERIFIED', 'VENDOR_REGISTERED', 'VENDOR_SUSPENDED',
  'RFQ_PUBLISHED', 'PO_APPROVED', 'PO_REJECTED', 'PO_CREATED',
  'QUOTE_SUBMITTED', 'GRN_COMPLETED', 'INVOICE_PAID',
];

const ENTITY_TYPES = ['Vendor', 'RFQ', 'PurchaseOrder', 'Quotation', 'GRN', 'Invoice'];

const actionConfig = {
  VENDOR_VERIFIED:   { color: 'purple', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', text: '#c4b5fd', icon: UserCheck, label: 'Verified' },
  VENDOR_REGISTERED: { color: 'blue',   bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', icon: User,      label: 'Registered' },
  VENDOR_SUSPENDED:  { color: 'red',    bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#fca5a5', icon: AlertTriangle, label: 'Suspended' },
  RFQ_PUBLISHED:     { color: 'blue',   bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', icon: Send,      label: 'Published' },
  PO_APPROVED:       { color: 'green',  bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', icon: CheckCircle2, label: 'Approved' },
  PO_REJECTED:       { color: 'red',    bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#fca5a5', icon: XCircle,   label: 'Rejected' },
  PO_CREATED:        { color: 'blue',   bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', icon: FileText,  label: 'Created' },
  QUOTE_SUBMITTED:   { color: 'blue',   bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', icon: FileText,  label: 'Submitted' },
  GRN_COMPLETED:     { color: 'green',  bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', icon: Package,   label: 'Completed' },
  INVOICE_PAID:      { color: 'green',  bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', icon: CreditCard, label: 'Paid' },
};

const defaultConfig = { color: 'slate', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94a3b8', icon: Activity, label: 'Action' };

function getActionStyle(action) {
  return actionConfig[action] || defaultConfig;
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function relativeTime(ts) {
  const now = new Date();
  const d = new Date(ts);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityLogs() {
  const auditLogs = useStore(s => s.auditLogs);
  const users = useStore(s => s.users);
  const notifications = useStore(s => s.notifications);
  const currentUser = useStore(s => s.currentUser);
  const markNotificationRead = useStore(s => s.markNotificationRead);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);

  const userMap = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.id] = u; });
    return map;
  }, [users]);

  const sortedLogs = useMemo(() => {
    return [...auditLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return sortedLogs.filter(log => {
      if (actionFilter && log.action !== actionFilter) return false;
      if (entityFilter && log.entity !== entityFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        const userName = userMap[log.userId]?.name || '';
        const haystack = `${log.action} ${log.entity} ${log.details} ${userName} ${log.ip}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [sortedLogs, actionFilter, entityFilter, search, userMap]);

  const today = new Date().toDateString();
  const actionsToday = useMemo(() =>
    auditLogs.filter(l => new Date(l.createdAt).toDateString() === today).length
  , [auditLogs, today]);

  const mostActiveUser = useMemo(() => {
    const counts = {};
    auditLogs.forEach(l => { counts[l.userId] = (counts[l.userId] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? { name: userMap[top[0]]?.name || 'Unknown', count: top[1] } : { name: 'N/A', count: 0 };
  }, [auditLogs, userMap]);

  const userNotifications = useMemo(() => {
    if (!currentUser) return notifications;
    return notifications.filter(n => n.userId === currentUser.id);
  }, [notifications, currentUser]);

  const notifTypeIcon = (type) => {
    switch (type) {
      case 'approval': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'quote': return <FileText size={14} className="text-blue-400" />;
      default: return <Bell size={14} className="text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
              Activity Logs <span className="gradient-text">&amp; Audit Timeline</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Track every action across your procurement pipeline</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in stagger-1">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600/30 to-brand-500/10 flex items-center justify-center border border-brand-500/20">
            <Activity size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Actions</p>
            <p className="text-2xl font-bold text-slate-100">{auditLogs.length}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Actions Today</p>
            <p className="text-2xl font-bold text-slate-100">{actionsToday}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <TrendingUp size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Most Active User</p>
            <p className="text-lg font-bold text-slate-100 truncate">{mostActiveUser.name}</p>
            <p className="text-xs text-slate-500 font-mono">{mostActiveUser.count} actions</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Timeline */}
        <div className="flex-1 min-w-0">
          {/* Filter Bar */}
          <div className="glass-card p-4 mb-6 animate-fade-in stagger-2">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs by user, action, details..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-0/50 border border-surface-200/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>

              {/* Action Type Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowActionDropdown(!showActionDropdown); setShowEntityDropdown(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface-0/50 border border-surface-200/50 rounded-lg text-sm text-slate-300 hover:border-brand-500/40 transition-all min-w-[180px]"
                >
                  <Filter size={14} className="text-slate-400" />
                  <span className="truncate">{actionFilter || 'All Actions'}</span>
                  <ChevronDown size={14} className="text-slate-400 ml-auto" />
                </button>
                {showActionDropdown && (
                  <div className="absolute top-full mt-1 left-0 w-64 bg-surface-50 border border-surface-200/50 rounded-lg shadow-2xl shadow-black/40 z-50 max-h-64 overflow-y-auto animate-scale-in">
                    <button
                      onClick={() => { setActionFilter(''); setShowActionDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-100/50 transition-colors"
                    >
                      All Actions
                    </button>
                    {ACTION_TYPES.map(type => {
                      const cfg = getActionStyle(type);
                      return (
                        <button
                          key={type}
                          onClick={() => { setActionFilter(type); setShowActionDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-100/50 transition-colors flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ background: cfg.text }} />
                          <span className="font-mono text-xs">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Entity Type Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowEntityDropdown(!showEntityDropdown); setShowActionDropdown(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface-0/50 border border-surface-200/50 rounded-lg text-sm text-slate-300 hover:border-brand-500/40 transition-all min-w-[160px]"
                >
                  <Hash size={14} className="text-slate-400" />
                  <span className="truncate">{entityFilter || 'All Entities'}</span>
                  <ChevronDown size={14} className="text-slate-400 ml-auto" />
                </button>
                {showEntityDropdown && (
                  <div className="absolute top-full mt-1 left-0 w-52 bg-surface-50 border border-surface-200/50 rounded-lg shadow-2xl shadow-black/40 z-50 animate-scale-in">
                    <button
                      onClick={() => { setEntityFilter(''); setShowEntityDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-100/50 transition-colors"
                    >
                      All Entities
                    </button>
                    {ENTITY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => { setEntityFilter(type); setShowEntityDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-100/50 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active filters */}
            {(actionFilter || entityFilter || search) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-200/20">
                <span className="text-xs text-slate-500">Active filters:</span>
                {search && (
                  <span className="badge badge-info cursor-pointer" onClick={() => setSearch('')}>
                    "{search}" ×
                  </span>
                )}
                {actionFilter && (
                  <span className="badge badge-info cursor-pointer" onClick={() => setActionFilter('')}>
                    {actionFilter} ×
                  </span>
                )}
                {entityFilter && (
                  <span className="badge badge-neutral cursor-pointer" onClick={() => setEntityFilter('')}>
                    {entityFilter} ×
                  </span>
                )}
                <button
                  onClick={() => { setSearch(''); setActionFilter(''); setEntityFilter(''); }}
                  className="text-xs text-brand-400 hover:text-brand-300 ml-2 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/40 via-surface-200/30 to-transparent" />

            {filteredLogs.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <Eye size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No activity logs found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}

            {filteredLogs.map((log, idx) => {
              const cfg = getActionStyle(log.action);
              const IconComp = cfg.icon;
              const user = userMap[log.userId];
              const staggerClass = idx < 8 ? `stagger-${Math.min(idx + 1, 4)}` : '';

              return (
                <div
                  key={log.id}
                  className={`relative pl-14 pb-8 animate-fade-in ${staggerClass} group`}
                >
                  {/* Timeline Dot */}
                  <div
                    className="absolute left-3 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-125 z-10"
                    style={{
                      background: cfg.bg,
                      borderColor: cfg.border,
                      boxShadow: `0 0 12px ${cfg.border}`,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.text }} />
                  </div>

                  {/* Card */}
                  <div className="glass-card p-4 hover:border-opacity-60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-500/5">
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono uppercase tracking-wider"
                        style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
                      >
                        <IconComp size={12} />
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="badge badge-neutral">
                        {log.entity} #{log.entityId}
                      </span>
                      <span className="ml-auto text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Clock size={11} />
                        {formatTimestamp(log.createdAt)}
                      </span>
                    </div>

                    {/* Details */}
                    <p className="text-sm text-slate-300 mb-3 leading-relaxed">{log.details}</p>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        <span className="text-slate-300 font-medium">{user?.name || 'System'}</span>
                        {user?.role && (
                          <span className="text-slate-600 font-mono">({user.role.replace(/_/g, ' ')})</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe size={12} className="text-slate-400" />
                        <span className="font-mono">{log.ip}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Log count */}
          {filteredLogs.length > 0 && (
            <div className="text-center py-6 text-sm text-slate-500 animate-fade-in">
              Showing <span className="text-slate-300 font-mono font-bold">{filteredLogs.length}</span> of{' '}
              <span className="text-slate-300 font-mono font-bold">{auditLogs.length}</span> log entries
            </div>
          )}
        </div>

        {/* Right Side – Live Notifications */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="glass-card sticky top-6 animate-fade-in stagger-3">
            <div className="px-5 py-4 border-b border-surface-200/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-200">Live Notifications</h3>
              </div>
              <span className="badge badge-info font-mono">
                {userNotifications.filter(n => !n.read).length} new
              </span>
            </div>

            <div className="max-h-[calc(100vh-340px)] overflow-y-auto divide-y divide-surface-200/10">
              {userNotifications.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Bell size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No notifications yet</p>
                </div>
              )}

              {userNotifications.map((notif, idx) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead && markNotificationRead(notif.id)}
                  className={`px-5 py-4 transition-all cursor-pointer hover:bg-surface-100/30 ${
                    !notif.read ? 'bg-brand-500/5 border-l-2 border-l-brand-500' : 'border-l-2 border-l-transparent'
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {notifTypeIcon(notif.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${!notif.read ? 'text-slate-100' : 'text-slate-300'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-slate-600 mt-1.5 font-mono">{relativeTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-surface-200/20 text-center">
              <span className="text-xs text-slate-500">
                Showing notifications for <span className="text-brand-400 font-medium">{currentUser?.name || 'all users'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showActionDropdown || showEntityDropdown) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowActionDropdown(false); setShowEntityDropdown(false); }} />
      )}
    </div>
  );
}
