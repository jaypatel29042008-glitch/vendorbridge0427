import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  LayoutDashboard, Users, FilePlus, GitCompare, ShieldCheck,
  FileText, Activity, BarChart3, ScanSearch, Code2, Bell,
  ChevronDown, LogOut, Menu, X, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Core ERP Modules', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vendors', icon: Users, label: 'Vendor Registry' },
    { to: '/rfq/create', icon: FilePlus, label: 'Publish RFQ' },
    { to: '/quotes/compare', icon: GitCompare, label: 'Compare Quotes' },
    { to: '/approvals', icon: ShieldCheck, label: 'Approval Workflow' },
    { to: '/invoices', icon: FileText, label: 'PO & Invoices' },
    { to: '/activity', icon: Activity, label: 'Activity Logs' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ]},
  { label: 'Innovation Sandboxes', items: [
    { to: '/ai-match', icon: ScanSearch, label: 'AI 3-Way Match' },
    { to: '/compliance', icon: Code2, label: 'Compliance as Code' },
  ]},
];

const ROLE_COLORS = {
  PROCUREMENT_OFFICER: 'text-blue-700 bg-blue-50 border-blue-200/50',
  MANAGER_APPROVER: 'text-amber-700 bg-amber-50 border-amber-200/50',
  VENDOR: 'text-emerald-700 bg-emerald-50 border-emerald-200/50',
  ADMIN: 'text-purple-700 bg-purple-50 border-purple-200/50',
};

export default function Layout({ children }) {
  const { currentUser, switchUser, users, activeTenant, tenants, switchTenant, notifications, markNotificationRead, toast, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  return (
    <div className="min-h-screen bg-surface-0 text-slate-100 flex flex-col font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in max-w-md ${toast.success ? 'bg-emerald-950/90 border border-emerald-700/50 text-emerald-100' : 'bg-red-950/90 border border-red-700/50 text-red-100'}`}>
          <span className="text-lg shrink-0">{toast.success ? '✓' : '⚠'}</span>
          <p className="text-sm font-medium leading-snug">{toast.text}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-surface-0/80 backdrop-blur-xl border-b border-slate-800/60 px-4 md:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl text-white font-black text-base tracking-tight shadow-lg shadow-brand-600/20">
              VB
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white tracking-wide leading-none">VendorBridge</h1>
              <p className="text-[10px] text-brand-400 font-mono mt-0.5">Smart Procurement ERP</p>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/70 border border-slate-700/50 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Role:</span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              {users.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name} ({u.role.replace('_', ' ')})</option>)}
            </select>
          </div>

          <div className="hidden xl:flex items-center gap-2 bg-slate-900/70 border border-slate-700/50 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Org:</span>
            <select
              value={activeTenant?.id || ''}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              {tenants.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
            </select>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <span className="badge badge-info">{unreadCount} new</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.filter(n => n.userId === currentUser?.id).map(n => (
                    <button
                      key={n.id}
                      onClick={() => { markNotificationRead(n.id); setNotifOpen(false); }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-800/60 transition-colors ${!n.read ? 'bg-brand-50' : ''}`}
                    >
                      <p className={`text-xs font-semibold ${!n.read ? 'text-slate-100' : 'text-slate-400'}`}>{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 w-64 h-[calc(100vh-57px)] bg-surface-0 border-r border-slate-800/60 flex flex-col transition-transform duration-300`}>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {NAV_ITEMS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase px-3 mb-2">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-600/15 text-brand-400 border-l-2 border-brand-500 shadow-sm shadow-brand-500/5'
                            : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200 border-l-2 border-transparent'
                        }`
                      }
                    >
                      <item.icon size={16} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Card */}
          <div className="px-3 pb-4">
            <div className="glass-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser?.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser?.email}</p>
                </div>
              </div>
              <div className={`badge text-[9px] ${ROLE_COLORS[currentUser?.role] || 'badge-neutral'}`}>
                {currentUser?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
