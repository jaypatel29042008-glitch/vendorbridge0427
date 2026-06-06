import { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  ChevronDown,
  Star,
  Zap,
  Award,
  ShoppingCart,
  BarChart3,
  FileText,
  TrendingDown,
  Truck,
  CircleDollarSign,
  Layers,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const RADAR_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#f472b6', '#38bdf8'];

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && half
              ? 'fill-amber-400/50 text-amber-400'
              : 'text-surface-300'
          }
        />
      ))}
      <span className="ml-1 text-xs font-mono text-surface-400">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function QuoteCompare() {
  const rfqs = useStore((s) => s.rfqs);
  const quotations = useStore((s) => s.quotations);
  const vendors = useStore((s) => s.vendors);
  const createPO = useStore((s) => s.createPO);
  const showToast = useStore((s) => s.showToast);

  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedRfq = useMemo(
    () => rfqs.find((r) => r.id === Number(selectedRfqId)),
    [rfqs, selectedRfqId]
  );

  const rfqQuotations = useMemo(
    () => quotations.filter((q) => q.rfqId === Number(selectedRfqId)),
    [quotations, selectedRfqId]
  );

  // Find best price and fastest delivery
  const bestPriceId = useMemo(() => {
    if (!rfqQuotations.length) return null;
    return rfqQuotations.reduce((best, q) =>
      q.total + q.tax < best.total + best.tax ? q : best
    ).id;
  }, [rfqQuotations]);

  const fastestId = useMemo(() => {
    if (!rfqQuotations.length) return null;
    return rfqQuotations.reduce((best, q) =>
      q.deliveryDays < best.deliveryDays ? q : best
    ).id;
  }, [rfqQuotations]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!rfqQuotations.length) return [];
    const maxPrice = Math.max(...rfqQuotations.map((q) => q.total + q.tax));
    const maxDays = Math.max(...rfqQuotations.map((q) => q.deliveryDays));

    const metrics = ['Price Score', 'Delivery Speed', 'Vendor Rating', 'Total Value'];
    return metrics.map((metric) => {
      const point = { metric };
      rfqQuotations.forEach((q) => {
        const vendor = vendors.find((v) => v.id === q.vendorId);
        const name = vendor?.company?.split(' ').slice(0, 2).join(' ') || `Vendor ${q.vendorId}`;
        switch (metric) {
          case 'Price Score':
            point[name] = Math.round(((maxPrice - (q.total + q.tax)) / maxPrice) * 100 + 20);
            break;
          case 'Delivery Speed':
            point[name] = Math.round(((maxDays - q.deliveryDays) / maxDays) * 100 + 20);
            break;
          case 'Vendor Rating':
            point[name] = Math.round((vendor?.rating || 3) * 20);
            break;
          case 'Total Value':
            // composite score
            point[name] = Math.round(
              (((maxPrice - (q.total + q.tax)) / maxPrice) * 40 +
                ((maxDays - q.deliveryDays) / maxDays) * 30 +
                ((vendor?.rating || 3) / 5) * 30) +
                20
            );
            break;
        }
      });
      return point;
    });
  }, [rfqQuotations, vendors]);

  const radarVendorNames = useMemo(() => {
    return rfqQuotations.map((q) => {
      const vendor = vendors.find((v) => v.id === q.vendorId);
      return vendor?.company?.split(' ').slice(0, 2).join(' ') || `Vendor ${q.vendorId}`;
    });
  }, [rfqQuotations, vendors]);

  const handleCreatePO = (quotationId) => {
    createPO(quotationId);
    showToast('Purchase Order created successfully! Routing to approval workflow.', true);
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Quotation Comparison Engine
            </h1>
            <p className="text-surface-400 text-sm mt-0.5">
              Analyze, compare, and select the optimal vendor quotation
            </p>
          </div>
        </div>
      </div>

      {/* RFQ Selector */}
      <div className="glass-card p-5 mb-6 animate-fade-in stagger-1">
        <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
          Select Request for Quotation
        </label>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-surface-50 border border-surface-200 rounded-lg px-4 py-3 text-left text-white hover:border-brand-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <span className={selectedRfq ? 'text-white' : 'text-surface-400'}>
              {selectedRfq
                ? `RFQ-${selectedRfq.id} — ${selectedRfq.title}`
                : 'Choose an RFQ to compare quotations…'}
            </span>
            <ChevronDown
              size={18}
              className={`text-surface-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute z-30 mt-2 w-full bg-surface-50 border border-surface-200 rounded-lg shadow-2xl overflow-hidden animate-scale-in">
              {rfqs.map((rfq) => {
                const quoteCount = quotations.filter((q) => q.rfqId === rfq.id).length;
                return (
                  <button
                    key={rfq.id}
                    onClick={() => {
                      setSelectedRfqId(String(rfq.id));
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-brand-600/10 transition-colors border-b border-surface-100 last:border-b-0 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-brand-400 text-xs mr-2">
                          RFQ-{rfq.id}
                        </span>
                        <span className="text-white text-sm group-hover:text-brand-300 transition-colors">
                          {rfq.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${rfq.status === 'PUBLISHED' ? 'badge-success' : 'badge-neutral'}`}>
                          {rfq.status}
                        </span>
                        <span className="badge badge-info">{quoteCount} quotes</span>
                      </div>
                    </div>
                    <p className="text-xs text-surface-400 mt-1 truncate">{rfq.description}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RFQ Detail Card */}
      {selectedRfq && (
        <div className="glass-card p-5 mb-6 animate-fade-in stagger-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-brand-400" />
              <div>
                <h3 className="text-white font-semibold">{selectedRfq.title}</h3>
                <p className="text-surface-400 text-xs mt-0.5">{selectedRfq.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5">
                <Layers size={14} className="text-surface-400" />
                <span className="text-xs text-surface-400">Qty:</span>
                <span className="font-mono text-white text-sm">{selectedRfq.quantity.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5">
                <span className="text-xs text-surface-400">SKU:</span>
                <span className="font-mono text-brand-300 text-sm">{selectedRfq.sku}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5">
                <span className="text-xs text-surface-400">Deadline:</span>
                <span className="font-mono text-amber-300 text-sm">
                  {new Date(selectedRfq.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Quotations */}
      {selectedRfqId && rfqQuotations.length === 0 && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <CircleDollarSign size={48} className="mx-auto text-surface-300 mb-4" />
          <h3 className="text-lg text-white mb-2">No Quotations Received</h3>
          <p className="text-surface-400 text-sm">
            No vendors have submitted quotations for this RFQ yet.
          </p>
        </div>
      )}

      {/* Comparison Table */}
      {rfqQuotations.length > 0 && (
        <div className="glass-card p-1 mb-6 animate-fade-in stagger-3">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2">
            <Award size={18} className="text-brand-400" />
            <h2 className="text-lg font-bold text-white">Vendor Comparison Matrix</h2>
            <span className="badge badge-info ml-auto">{rfqQuotations.length} Quotations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200/50">
                  {[
                    'Vendor',
                    'Unit Price',
                    'Subtotal',
                    'Tax (18%)',
                    'Grand Total',
                    'Delivery',
                    'Notes',
                    'Status',
                    'Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rfqQuotations.map((q) => {
                  const vendor = vendors.find((v) => v.id === q.vendorId);
                  const grand = q.total + q.tax;
                  const isBest = q.id === bestPriceId;
                  const isFastest = q.id === fastestId;
                  return (
                    <tr
                      key={q.id}
                      className={`border-b border-surface-200/20 transition-all duration-200 hover:bg-brand-600/5 ${
                        isBest ? 'bg-emerald-500/5 border-l-2 border-l-emerald-400' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-white font-medium text-sm">
                            {vendor?.company || 'Unknown'}
                          </span>
                          <StarRating rating={vendor?.rating || 0} />
                          <div className="flex gap-1 mt-0.5">
                            {isBest && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Star size={10} className="fill-emerald-300" /> Best Price
                              </span>
                            )}
                            {isFastest && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                <Zap size={10} className="fill-blue-300" /> Fastest
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-white whitespace-nowrap">
                        {fmt(q.unitPrice)}
                      </td>
                      <td className="px-4 py-4 font-mono text-white whitespace-nowrap">
                        {fmt(q.total)}
                      </td>
                      <td className="px-4 py-4 font-mono text-surface-400 whitespace-nowrap">
                        {fmt(q.tax)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-base ${
                            isBest ? 'text-emerald-300' : 'text-white'
                          }`}
                        >
                          {fmt(grand)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Truck size={14} className={isFastest ? 'text-blue-400' : 'text-surface-400'} />
                          <span
                            className={`font-mono font-semibold ${
                              isFastest ? 'text-blue-300' : 'text-white'
                            }`}
                          >
                            {q.deliveryDays}d
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <p className="text-surface-400 text-xs leading-relaxed line-clamp-2">
                          {q.notes}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="badge badge-success">{q.status}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleCreatePO(q.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/25 active:scale-95"
                        >
                          <ShoppingCart size={13} />
                          Select & Create PO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Radar Chart */}
      {rfqQuotations.length > 0 && (
        <div className="glass-card p-6 animate-fade-in stagger-4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown size={18} className="text-brand-400" />
            <h2 className="text-lg font-bold text-white">Multi-Dimensional Vendor Analysis</h2>
          </div>
          <div className="h-[380px] md:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="rgba(71,85,105,0.3)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 120]}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  axisLine={false}
                />
                {radarVendorNames.map((name, i) => (
                  <Radar
                    key={name}
                    name={name}
                    dataKey={name}
                    stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                    fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{
                    paddingTop: '12px',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    color: '#94a3b8',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(71,85,105,0.4)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                    color: '#e2e8f0',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Price Score',
                desc: 'Lower price = higher score',
                icon: CircleDollarSign,
                color: 'text-emerald-400',
              },
              {
                label: 'Delivery Speed',
                desc: 'Fewer days = higher score',
                icon: Truck,
                color: 'text-blue-400',
              },
              {
                label: 'Vendor Rating',
                desc: 'Based on historical performance',
                icon: Star,
                color: 'text-amber-400',
              },
              {
                label: 'Total Value',
                desc: 'Composite weighted score',
                icon: Award,
                color: 'text-brand-400',
              },
            ].map(({ label, desc, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-surface-50/50 rounded-lg p-3 flex items-start gap-2"
              >
                <Icon size={16} className={`${color} mt-0.5 shrink-0`} />
                <div>
                  <span className="text-xs font-semibold text-white block">{label}</span>
                  <span className="text-[10px] text-surface-400">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedRfqId && (
        <div className="glass-card p-16 text-center animate-fade-in stagger-2">
          <BarChart3 size={56} className="mx-auto text-surface-300 mb-5" />
          <h3 className="text-xl text-white font-semibold mb-2">Select an RFQ to Begin</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            Choose a Request for Quotation from the dropdown above to view and compare
            all submitted vendor quotations side by side.
          </p>
        </div>
      )}
    </div>
  );
}
