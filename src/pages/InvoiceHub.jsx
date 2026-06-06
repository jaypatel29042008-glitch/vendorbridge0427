import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  FileText,
  Receipt,
  Package,
  ChevronDown,
  ChevronUp,
  Printer,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  DollarSign,
  Calculator,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Layers,
  Truck,
} from 'lucide-react';

const PO_STATUS = {
  APPROVED: { badge: 'badge-success', label: 'Approved' },
  PENDING_APPROVAL: { badge: 'badge-warning', label: 'Pending' },
  REJECTED: { badge: 'badge-danger', label: 'Rejected' },
};

const INV_STATUS = {
  PAID: { badge: 'badge-success', label: 'Paid', icon: CheckCircle2 },
  UNPAID: { badge: 'badge-warning', label: 'Unpaid', icon: Clock },
  OVERDUE: { badge: 'badge-danger', label: 'Overdue', icon: Clock },
};

export default function InvoiceHub() {
  const purchaseOrders = useStore((s) => s.purchaseOrders);
  const invoices = useStore((s) => s.invoices);
  const vendors = useStore((s) => s.vendors);
  const rfqs = useStore((s) => s.rfqs);
  const quotations = useStore((s) => s.quotations);
  const grns = useStore((s) => s.grns);
  const updateInvoiceStatus = useStore((s) => s.updateInvoiceStatus);
  const showToast = useStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState('po');
  const [expandedPO, setExpandedPO] = useState(null);

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const taxSummary = useMemo(() => {
    const totalNet = invoices.reduce((s, i) => s + i.netAmount, 0);
    const totalTax = invoices.reduce((s, i) => s + i.taxAmount, 0);
    const totalGrand = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const paidTotal = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.totalAmount, 0);
    const unpaidTotal = invoices.filter((i) => i.status !== 'PAID').reduce((s, i) => s + i.totalAmount, 0);
    return { totalNet, totalTax, totalGrand, paidTotal, unpaidTotal };
  }, [invoices]);

  const handleMarkPaid = (invId) => {
    updateInvoiceStatus(invId, 'PAID');
    showToast('Invoice marked as paid successfully!', true);
  };

  const tabs = [
    { id: 'po', label: 'Purchase Orders', icon: Package, count: purchaseOrders.length },
    { id: 'invoice', label: 'Invoices', icon: Receipt, count: invoices.length },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Purchase Order & Invoice Compilation Hub
            </h1>
            <p className="text-surface-400 text-sm mt-0.5">
              Unified view of procurement orders, invoices, and financial summaries
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                  : 'bg-surface-100/50 text-surface-400 hover:bg-surface-100 hover:text-white border border-surface-200/30'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span
                className={`font-mono text-xs px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-200/50 text-surface-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* PO Tab */}
      {activeTab === 'po' && (
        <div className="glass-card p-1 mb-6 animate-fade-in">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2">
            <Package size={18} className="text-brand-400" />
            <h2 className="text-lg font-bold text-white">All Purchase Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200/50">
                  {['', 'PO Number', 'Vendor', 'Total', 'Status', 'Date'].map((h) => (
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
                {purchaseOrders.map((po) => {
                  const vendor = vendors.find((v) => v.id === po.vendorId);
                  const cfg = PO_STATUS[po.status] || PO_STATUS.PENDING_APPROVAL;
                  const isExpanded = expandedPO === po.id;
                  const quote = quotations.find((q) => q.id === po.quotationId);
                  const rfq = rfqs.find((r) => r.id === po.rfqId);
                  const poGrns = grns.filter((g) => g.poId === po.id);

                  return (
                    <React.Fragment key={po.id}>
                      <tr
                        key={po.id}
                        className="border-b border-surface-200/20 transition-all duration-200 hover:bg-brand-600/5 cursor-pointer group"
                        onClick={() => setExpandedPO(isExpanded ? null : po.id)}
                      >
                        <td className="px-4 py-4 w-8">
                          <button className="text-surface-400 group-hover:text-brand-400 transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-brand-300 font-semibold">
                            {po.poNumber}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-white text-sm">
                            {vendor?.company || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-white font-semibold">{fmt(po.total)}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-surface-400 text-xs font-mono">
                            {new Date(po.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${po.id}-detail`}>
                          <td colSpan={6} className="p-0">
                            <div className="bg-surface-50/50 border-y border-surface-200/20 px-6 py-5 animate-scale-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Linked Quotation */}
                                <div>
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Layers size={13} />
                                    Linked Quotation
                                  </h4>
                                  {quote ? (
                                    <div className="bg-surface-100/60 rounded-lg p-4 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-xs text-surface-400">
                                          RFQ
                                        </span>
                                        <span className="text-xs text-white font-medium">
                                          {rfq?.title || `RFQ-${po.rfqId}`}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-xs text-surface-400">
                                          Unit Price
                                        </span>
                                        <span className="text-xs font-mono text-white">
                                          {fmt(quote.unitPrice)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-xs text-surface-400">
                                          Subtotal
                                        </span>
                                        <span className="text-xs font-mono text-white">
                                          {fmt(quote.total)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-xs text-surface-400">
                                          Tax
                                        </span>
                                        <span className="text-xs font-mono text-surface-400">
                                          {fmt(quote.tax)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-t border-surface-200/30 pt-2">
                                        <span className="text-xs text-surface-400 font-semibold">
                                          Grand Total
                                        </span>
                                        <span className="text-sm font-mono text-white font-bold">
                                          {fmt(quote.total + quote.tax)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-xs text-surface-400">
                                          Delivery
                                        </span>
                                        <span className="text-xs font-mono text-blue-300">
                                          {quote.deliveryDays} days
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-surface-400 italic">
                                      No linked quotation found
                                    </p>
                                  )}
                                </div>
                                {/* GRN Info */}
                                <div>
                                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Truck size={13} />
                                    Goods Receipt Notes
                                  </h4>
                                  {poGrns.length > 0 ? (
                                    <div className="space-y-2">
                                      {poGrns.map((grn) => (
                                        <div
                                          key={grn.id}
                                          className="bg-surface-100/60 rounded-lg p-4 space-y-2"
                                        >
                                          <div className="flex justify-between">
                                            <span className="text-xs text-surface-400">
                                              Challan Ref
                                            </span>
                                            <span className="text-xs font-mono text-brand-300">
                                              {grn.challanRef}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-xs text-surface-400">
                                              Received Qty
                                            </span>
                                            <span className="text-xs font-mono text-white">
                                              {grn.receivedQty.toLocaleString()} units
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-xs text-surface-400">
                                              Inspector
                                            </span>
                                            <span className="text-xs text-white">
                                              {grn.inspector}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-xs text-surface-400">
                                              Status
                                            </span>
                                            <span className="badge badge-success text-[10px]">
                                              {grn.status}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-xs text-surface-400">
                                              Date
                                            </span>
                                            <span className="text-xs font-mono text-surface-400">
                                              {new Date(grn.receivedDate).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="bg-surface-100/60 rounded-lg p-4 text-center">
                                      <Truck
                                        size={24}
                                        className="mx-auto text-surface-300 mb-2"
                                      />
                                      <p className="text-xs text-surface-400">
                                        No GRN recorded for this PO yet
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {po.remarks && (
                                <div className="mt-4 bg-surface-100/40 rounded-lg px-4 py-2.5">
                                  <span className="text-xs text-surface-400">Remarks: </span>
                                  <span className="text-xs text-white italic">"{po.remarks}"</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Tab */}
      {activeTab === 'invoice' && (
        <div className="glass-card p-1 mb-6 animate-fade-in">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2">
            <Receipt size={18} className="text-brand-400" />
            <h2 className="text-lg font-bold text-white">All Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200/50">
                  {[
                    'Invoice #',
                    'PO #',
                    'Vendor',
                    'Net Amount',
                    'Tax',
                    'Grand Total',
                    'Status',
                    'Due Date',
                    'Actions',
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
                {invoices.map((inv) => {
                  const po = purchaseOrders.find((p) => p.id === inv.poId);
                  const vendor = vendors.find((v) => v.id === inv.vendorId);
                  const invCfg = INV_STATUS[inv.status] || INV_STATUS.UNPAID;
                  const StatusIcon = invCfg.icon;
                  const isUnpaid = inv.status !== 'PAID';

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-surface-200/20 transition-all duration-200 hover:bg-brand-600/5"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-brand-300 font-semibold">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-surface-300 text-xs">
                          {po?.poNumber || `PO-${inv.poId}`}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-white text-sm">
                          {vendor?.company || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-white">{fmt(inv.netAmount)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-surface-400">{fmt(inv.taxAmount)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-white font-bold text-base">
                          {fmt(inv.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`badge ${invCfg.badge}`}>
                          <StatusIcon size={11} />
                          {invCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-surface-400 text-xs font-mono">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => showToast('Printing invoice…', true)}
                            className="p-2 rounded-lg bg-surface-100/60 text-surface-400 hover:text-white hover:bg-surface-200/60 transition-all"
                            title="Print"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={() => showToast('Downloading PDF…', true)}
                            className="p-2 rounded-lg bg-surface-100/60 text-surface-400 hover:text-white hover:bg-surface-200/60 transition-all"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => showToast('Invoice emailed to vendor!', true)}
                            className="p-2 rounded-lg bg-surface-100/60 text-surface-400 hover:text-white hover:bg-surface-200/60 transition-all"
                            title="Email"
                          >
                            <Mail size={14} />
                          </button>
                          {isUnpaid && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95 ml-1"
                            >
                              <CreditCard size={12} />
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Receipt size={40} className="mx-auto text-surface-300 mb-3" />
                      <p className="text-surface-400 text-sm">No invoices found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tax Calculation Summary */}
      <div className="glass-card p-6 animate-fade-in stagger-4">
        <div className="flex items-center gap-2 mb-5">
          <Calculator size={18} className="text-brand-400" />
          <h2 className="text-lg font-bold text-white">Financial Summary</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: 'Total Net Amount',
              value: taxSummary.totalNet,
              icon: DollarSign,
              color: 'text-white',
              iconBg: 'bg-surface-200/30',
              iconColor: 'text-surface-400',
            },
            {
              label: 'Total Tax (GST)',
              value: taxSummary.totalTax,
              icon: TrendingUp,
              color: 'text-amber-300',
              iconBg: 'bg-amber-500/10',
              iconColor: 'text-amber-400',
            },
            {
              label: 'Grand Total',
              value: taxSummary.totalGrand,
              icon: ArrowUpRight,
              color: 'text-brand-300',
              iconBg: 'bg-brand-500/10',
              iconColor: 'text-brand-400',
            },
            {
              label: 'Paid',
              value: taxSummary.paidTotal,
              icon: CheckCircle2,
              color: 'text-emerald-300',
              iconBg: 'bg-emerald-500/10',
              iconColor: 'text-emerald-400',
            },
            {
              label: 'Outstanding',
              value: taxSummary.unpaidTotal,
              icon: Clock,
              color: taxSummary.unpaidTotal > 0 ? 'text-rose-300' : 'text-emerald-300',
              iconBg: taxSummary.unpaidTotal > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
              iconColor: taxSummary.unpaidTotal > 0 ? 'text-rose-400' : 'text-emerald-400',
            },
          ].map(({ label, value, icon: Icon, color, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-surface-50/60 border border-surface-200/20 rounded-xl p-4 hover:border-brand-500/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${iconBg}`}>
                  <Icon size={14} className={iconColor} />
                </div>
                <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <span
                className={`font-mono text-xl md:text-2xl font-bold ${color} group-hover:scale-[1.02] transition-transform inline-block`}
              >
                {fmt(value)}
              </span>
            </div>
          ))}
        </div>

        {/* Tax Breakdown Bar */}
        {taxSummary.totalGrand > 0 && (
          <div className="mt-5 bg-surface-50/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-surface-400">Payment Progress</span>
              <span className="text-xs font-mono text-surface-400">
                {((taxSummary.paidTotal / taxSummary.totalGrand) * 100).toFixed(1)}% collected
              </span>
            </div>
            <div className="w-full h-3 bg-surface-200/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(
                    (taxSummary.paidTotal / taxSummary.totalGrand) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-mono text-emerald-400">
                {fmt(taxSummary.paidTotal)} paid
              </span>
              <span className="text-[10px] font-mono text-surface-400">
                {fmt(taxSummary.totalGrand)} total
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
