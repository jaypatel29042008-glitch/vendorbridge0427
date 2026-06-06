import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './components/Layout';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy-load all pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VendorRegistry = lazy(() => import('./pages/VendorRegistry'));
const RfqCreate = lazy(() => import('./pages/RfqCreate'));
const QuoteSubmit = lazy(() => import('./pages/QuoteSubmit'));
const QuoteCompare = lazy(() => import('./pages/QuoteCompare'));
const ApprovalWorkflow = lazy(() => import('./pages/ApprovalWorkflow'));
const InvoiceHub = lazy(() => import('./pages/InvoiceHub'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Reports = lazy(() => import('./pages/Reports'));
const AiMatch = lazy(() => import('./pages/AiMatch'));
const ComplianceEngine = lazy(() => import('./pages/ComplianceEngine'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-brand-500" />
        <p className="text-sm text-slate-500 font-mono">Loading module...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><VendorRegistry /></ProtectedRoute>} />
          <Route path="/rfq/create" element={<ProtectedRoute><RfqCreate /></ProtectedRoute>} />
          <Route path="/rfq/bid" element={<ProtectedRoute><QuoteSubmit /></ProtectedRoute>} />
          <Route path="/quotes/compare" element={<ProtectedRoute><QuoteCompare /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceHub /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/ai-match" element={<ProtectedRoute><AiMatch /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><ComplianceEngine /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
