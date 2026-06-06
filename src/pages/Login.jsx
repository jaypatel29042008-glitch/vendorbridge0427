import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Users,
  UserCog,
  ClipboardList,
  Briefcase,
  ArrowRight,
  Hexagon,
} from 'lucide-react';

const QUICK_LOGINS = [
  {
    label: 'Procurement Officer',
    email: 'officer@aeroparts.com',
    icon: ClipboardList,
    color: 'from-brand-500 to-brand-700',
    ring: 'ring-brand-500/30',
    desc: 'Create RFQs & POs',
  },
  {
    label: 'Manager',
    email: 'manager@aeroparts.com',
    icon: Briefcase,
    color: 'from-emerald-500 to-emerald-700',
    ring: 'ring-emerald-500/30',
    desc: 'Approve & oversee',
  },
  {
    label: 'Vendor',
    email: 'vendor@titanium.com',
    icon: Users,
    color: 'from-amber-500 to-amber-700',
    ring: 'ring-amber-500/30',
    desc: 'Submit quotations',
  },
  {
    label: 'Admin',
    email: 'admin@aeroparts.com',
    icon: UserCog,
    color: 'from-rose-500 to-rose-700',
    ring: 'ring-rose-500/30',
    desc: 'Full system access',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const showToast = useStore((s) => s.showToast);

  const [email, setEmail] = useState('officer@aeroparts.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        showToast('Welcome to VendorBridge!', true);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Use a demo account below.');
        showToast('Login failed', false);
      }
      setLoading(false);
    }, 600);
  };

  const quickLogin = (ql) => {
    setEmail(ql.email);
    setPassword('password');
    setError('');
    setLoading(true);
    setTimeout(() => {
      const success = login(ql.email, 'password');
      if (success) {
        showToast(`Logged in as ${ql.label}`, true);
        navigate('/dashboard');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-0 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-40"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 50%, #e0e7ff 0deg, #c7d2fe 72deg, #f5f3ff 144deg, #a5b4fc 216deg, #e0e7ff 288deg, #c7d2fe 360deg)',
            animation: 'spin 25s linear infinite',
          }}
        />
        <div className="absolute inset-0 bg-surface-0/60 backdrop-blur-3xl" />
      </div>

      {/* Floating orbs */}
      <div
        className="absolute top-20 left-[15%] w-72 h-72 rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #6366f1, transparent)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #818cf8, transparent)',
          animation: 'pulse 8s ease-in-out infinite alternate',
        }}
      />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-5xl mx-4 animate-scale-in">
        <div className="glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
          {/* Left branding panel */}
          <div className="lg:col-span-2 relative flex flex-col items-center justify-center p-8 lg:p-10 overflow-hidden border-b lg:border-b-0 lg:border-r border-surface-200/50">
            {/* Panel gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-indigo-50/50 to-white" />

            {/* Grid lines */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            <div className="relative z-10 text-center space-y-6">
              {/* Logo */}
              <div className="flex items-center justify-center gap-3 animate-fade-in">
                <div className="relative">
                  <Hexagon className="w-14 h-14 text-brand-600" strokeWidth={1.5} />
                  <Zap className="w-7 h-7 text-brand-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="animate-fade-in stagger-1">
                <h1 className="text-3xl lg:text-4xl font-bold gradient-text tracking-tight">
                  VendorBridge
                </h1>
                <p className="mt-2 text-surface-600 text-sm font-semibold tracking-widest uppercase">
                  Smart Procurement ERP
                </p>
              </div>

              <div className="w-16 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent mx-auto animate-fade-in stagger-2" />

              <p className="text-surface-600 text-sm leading-relaxed max-w-[240px] mx-auto animate-fade-in stagger-3">
                End-to-end procurement lifecycle — from RFQ to invoice reconciliation, all in one platform.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in stagger-4">
                {['Multi-Tenant', 'Role-Based', 'AI-Ready'].map((f) => (
                  <span
                    key={f}
                    className="badge badge-info text-[10px] px-2.5 py-1"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-surface-600 text-xs animate-fade-in stagger-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SOC 2 Compliant · AES-256</span>
              </div>
            </div>
          </div>

          {/* Right login form */}
          <div className="lg:col-span-3 flex flex-col justify-center p-8 lg:p-12">
            <div className="max-w-sm mx-auto w-full space-y-8">
              {/* Header */}
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-100">
                  Welcome back
                </h2>
                <p className="mt-1 text-surface-400 text-sm">
                  Sign in to your procurement workspace
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5 animate-fade-in stagger-1">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-brand-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-surface-50/80 border border-surface-200/50 text-slate-200 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all font-mono"
                      placeholder="officer@aeroparts.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-brand-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 rounded-lg bg-surface-50/80 border border-surface-200/50 text-slate-200 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all font-mono"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 animate-fade-in stagger-2">
                <div className="flex-1 h-px bg-surface-200/30" />
                <span className="text-xs text-surface-400 font-medium uppercase tracking-wider">
                  Quick Demo Login
                </span>
                <div className="flex-1 h-px bg-surface-200/30" />
              </div>

              {/* Quick login buttons */}
              <div className="grid grid-cols-2 gap-3 animate-fade-in stagger-3">
                {QUICK_LOGINS.map((ql) => {
                  const Icon = ql.icon;
                  return (
                    <button
                      key={ql.email}
                      onClick={() => quickLogin(ql)}
                      disabled={loading}
                      className={`group relative flex items-center gap-3 p-3 rounded-lg bg-surface-50/50 border border-surface-200/30 hover:border-surface-200/60 text-left transition-all duration-300 hover:bg-surface-50/80 focus:outline-none focus:ring-2 ${ql.ring} disabled:opacity-50`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${ql.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {ql.label}
                        </div>
                        <div className="text-[10px] text-surface-400 truncate">
                          {ql.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-6 text-surface-400 text-xs animate-fade-in stagger-4">
          <span className="font-mono">HACKATHON DEMO</span>
          <span className="mx-2 text-surface-300">·</span>
          <span>All accounts use password: <code className="font-mono text-brand-400">password</code></span>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.25; transform: scale(1.1); } }
      `}</style>
    </div>
  );
}
