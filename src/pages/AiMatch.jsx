import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import {
  ScanSearch, Upload, FileCheck2, CheckCircle2, XCircle, ArrowDown,
  ShieldCheck, Loader2, Sparkles, FileText, Package, Truck, Hash,
  Info, Zap, ArrowRightLeft, Lock, Eye, ChevronRight, AlertTriangle
} from 'lucide-react';

const FAKE_HASH = 'a7f3b8c91d2e4f056a78b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0';

export default function AiMatch() {
  const purchaseOrders = useStore(s => s.purchaseOrders);
  const grns = useStore(s => s.grns);
  const rfqs = useStore(s => s.rfqs);
  const quotations = useStore(s => s.quotations);

  const [fileName, setFileName] = useState('');
  const [simQty, setSimQty] = useState(500);
  const [simPrice, setSimPrice] = useState(45.00);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const po = purchaseOrders[0];
  const grn = grns[0];
  const quotation = quotations.find(q => q.id === po?.quotationId);
  const rfq = rfqs.find(r => r.id === po?.rfqId);

  const poQty = rfq?.quantity || 500;
  const poUnitPrice = quotation?.unitPrice || 45.00;
  const poTotal = poQty * poUnitPrice;

  const grnQty = grn?.receivedQty || 500;

  const invoiceTotal = simQty * simPrice;

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    setFileName('INV-TITAN-4451-scan.pdf');
  }, []);

  const handleFileSelect = useCallback(() => {
    setFileName('INV-TITAN-4451-scan.pdf');
  }, []);

  const runOCR = useCallback(() => {
    setIsProcessing(true);
    setOcrDone(false);
    setProcessingStep('Initializing AI-OCR engine...');
    setTimeout(() => setProcessingStep('Scanning document layout...'), 400);
    setTimeout(() => setProcessingStep('Extracting text fields...'), 800);
    setTimeout(() => setProcessingStep('Parsing line items & amounts...'), 1200);
    setTimeout(() => setProcessingStep('Cross-referencing with PO database...'), 1600);
    setTimeout(() => {
      setIsProcessing(false);
      setOcrDone(true);
      setProcessingStep('');
    }, 2000);
  }, []);

  const qtyMatchPO = simQty === poQty;
  const priceMatchPO = simPrice === poUnitPrice;
  const qtyMatchGRN = simQty === grnQty;

  const overallStatus = useMemo(() => {
    if (qtyMatchPO && priceMatchPO && qtyMatchGRN) return 'FULL_MATCH';
    if (qtyMatchPO || priceMatchPO || qtyMatchGRN) return 'PARTIAL_MATCH';
    return 'MISMATCH';
  }, [qtyMatchPO, priceMatchPO, qtyMatchGRN]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <ScanSearch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              AI-Powered 3-Way Invoice Matching & OCR
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Automated document verification with intelligent variance detection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-info flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Engine v3.2
          </span>
          <span className="badge badge-neutral flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> SHA-256 Verified
          </span>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="glass-card p-5 border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-violet-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">How 3-Way Matching Works</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The AI engine performs an automated three-way comparison between the <span className="text-violet-300 font-medium">Purchase Order (PO)</span>,{' '}
              <span className="text-emerald-300 font-medium">Goods Receipt Note (GRN)</span>, and{' '}
              <span className="text-amber-300 font-medium">Vendor Invoice</span>. Each document's quantities, unit prices, and totals are cross-verified.
              Any variance beyond configurable thresholds triggers an automatic flag for manual review, preventing overpayment and fraud.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400"></div>
                <span className="text-slate-300">Purchase Order</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-slate-300">Goods Receipt</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <span className="text-slate-300">Vendor Invoice</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                <span className="text-slate-300 font-medium">Auto-Verified ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Invoice Upload Simulator */}
        <div className="space-y-5">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-slate-100">Invoice Upload Simulator</h2>
            </div>

            {/* Drag-and-Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
                  : fileName
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-600 bg-surface-50/50 hover:border-slate-500 hover:bg-surface-50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={handleFileSelect}
            >
              {fileName ? (
                <div className="space-y-2 animate-scale-in">
                  <FileCheck2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-medium text-emerald-300">{fileName}</p>
                  <p className="text-xs text-slate-500">File ready for OCR processing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-sm text-slate-400">
                    <span className="text-violet-400 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-600">PDF, PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Variance Sliders */}
            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Simulated Quantity</label>
                  <span className="font-mono text-sm text-violet-300 bg-violet-500/10 px-2.5 py-0.5 rounded-md">
                    {simQty} units
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={10}
                  value={simQty}
                  onChange={(e) => { setSimQty(Number(e.target.value)); setOcrDone(false); }}
                  className="w-full h-2 bg-surface-100 rounded-full appearance-none cursor-pointer accent-violet-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-400
                    [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/30
                    [&::-webkit-slider-thumb]:hover:bg-violet-300 [&::-webkit-slider-thumb]:transition-colors"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>100</span>
                  <span className="text-slate-500">PO: {poQty}</span>
                  <span>1000</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Simulated Unit Price</label>
                  <span className="font-mono text-sm text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
                    ${simPrice.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={0.5}
                  value={simPrice}
                  onChange={(e) => { setSimPrice(Number(e.target.value)); setOcrDone(false); }}
                  className="w-full h-2 bg-surface-100 rounded-full appearance-none cursor-pointer accent-amber-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400
                    [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-500/30
                    [&::-webkit-slider-thumb]:hover:bg-amber-300 [&::-webkit-slider-thumb]:transition-colors"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>$10.00</span>
                  <span className="text-slate-500">PO: ${poUnitPrice.toFixed(2)}</span>
                  <span>$100.00</span>
                </div>
              </div>
            </div>

            {/* Run OCR Button */}
            <button
              onClick={runOCR}
              disabled={!fileName || isProcessing}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                !fileName
                  ? 'bg-surface-100 text-slate-600 cursor-not-allowed'
                  : isProcessing
                  ? 'bg-violet-600/50 text-violet-200 cursor-wait'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {processingStep}
                </>
              ) : (
                <>
                  <ScanSearch className="w-4 h-4" />
                  Run AI-OCR Extraction
                </>
              )}
            </button>

            {/* Processing Steps Animation */}
            {isProcessing && (
              <div className="mt-4 space-y-2 animate-fade-in">
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-pulse" style={{ width: '75%', transition: 'width 2s ease' }}></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  Neural OCR engine analyzing document structure...
                </div>
              </div>
            )}
          </div>

          {/* Simulated Invoice Preview */}
          {ocrDone && (
            <div className="glass-card p-5 animate-slide-in stagger-2 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">OCR Extraction Preview</h3>
                <span className="badge badge-success text-[10px] ml-auto">98.7% Confidence</span>
              </div>
              <div className="bg-surface-0 rounded-lg p-4 border border-slate-700/50 font-mono text-xs space-y-1.5 text-slate-400">
                <div className="flex justify-between"><span className="text-slate-500">vendor_name:</span><span className="text-slate-200">Hindustan Titanium & Alloys</span></div>
                <div className="flex justify-between"><span className="text-slate-500">invoice_no:</span><span className="text-amber-300">INV-TITAN-4451</span></div>
                <div className="flex justify-between"><span className="text-slate-500">date:</span><span className="text-slate-200">2026-06-05</span></div>
                <div className="flex justify-between"><span className="text-slate-500">quantity:</span><span className="text-violet-300">{simQty}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">unit_price:</span><span className="text-violet-300">${simPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">subtotal:</span><span className="text-emerald-300">${invoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">tax_18%:</span><span className="text-slate-200">${(invoiceTotal * 0.18).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between border-t border-slate-700 pt-1.5"><span className="text-slate-500">grand_total:</span><span className="text-white font-bold">${(invoiceTotal * 1.18).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: 3-Way Match Results */}
        <div className="space-y-4">
          {!ocrDone ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-20 h-20 rounded-2xl bg-surface-50 flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-400">3-Way Match Results</h3>
              <p className="text-sm text-slate-600 mt-2 max-w-xs">
                Upload a document and run the AI-OCR extraction to see match verification results
              </p>
            </div>
          ) : (
            <>
              {/* Match Status Banner */}
              <div className={`glass-card p-4 border animate-scale-in ${
                overallStatus === 'FULL_MATCH'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : overallStatus === 'PARTIAL_MATCH'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}>
                <div className="flex items-center gap-3">
                  {overallStatus === 'FULL_MATCH' ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  ) : overallStatus === 'PARTIAL_MATCH' ? (
                    <AlertTriangle className="w-7 h-7 text-amber-400" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-400" />
                  )}
                  <div>
                    <h3 className={`text-sm font-bold ${
                      overallStatus === 'FULL_MATCH' ? 'text-emerald-300' : overallStatus === 'PARTIAL_MATCH' ? 'text-amber-300' : 'text-red-300'
                    }`}>
                      {overallStatus === 'FULL_MATCH' ? 'FULL 3-WAY MATCH — Auto-Approved' : overallStatus === 'PARTIAL_MATCH' ? 'PARTIAL MATCH — Review Required' : 'MISMATCH — Flagged for Investigation'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {overallStatus === 'FULL_MATCH'
                        ? 'All document values align perfectly. Invoice cleared for payment.'
                        : 'Variance detected between documents. Manual review recommended.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Order Card */}
              <div className="glass-card p-4 border border-violet-500/20 animate-slide-in stagger-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Purchase Order Data</h4>
                    <p className="text-xs text-slate-500 font-mono">{po?.poNumber || 'PO-2026-0001'}</p>
                  </div>
                  <span className="badge badge-info ml-auto text-[10px]">SOURCE</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity</p>
                    <p className="text-lg font-bold font-mono text-violet-300">{poQty}</p>
                  </div>
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Unit Price</p>
                    <p className="text-lg font-bold font-mono text-violet-300">${poUnitPrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
                    <p className="text-lg font-bold font-mono text-violet-300">${poTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* PO ↔ GRN Match Indicator */}
              <MatchIndicator
                label="PO ↔ GRN Quantity"
                match={poQty === grnQty}
                expected={poQty}
                actual={grnQty}
                unit="units"
              />

              {/* GRN Card */}
              <div className="glass-card p-4 border border-emerald-500/20 animate-slide-in stagger-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Goods Receipt Data</h4>
                    <p className="text-xs text-slate-500 font-mono">{grn?.challanRef || 'DC-TITAN-889'}</p>
                  </div>
                  <span className="badge badge-success ml-auto text-[10px]">RECEIVED</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Received Qty</p>
                    <p className="text-lg font-bold font-mono text-emerald-300">{grnQty}</p>
                  </div>
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Unit Price</p>
                    <p className="text-lg font-bold font-mono text-emerald-300">${poUnitPrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
                    <p className="text-lg font-bold font-mono text-emerald-300">${(grnQty * poUnitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* GRN ↔ Invoice Match Indicators */}
              <MatchIndicator
                label="GRN ↔ Invoice Quantity"
                match={qtyMatchGRN}
                expected={grnQty}
                actual={simQty}
                unit="units"
              />

              {/* Invoice Card */}
              <div className="glass-card p-4 border border-amber-500/20 animate-slide-in stagger-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Extracted Invoice Data</h4>
                    <p className="text-xs text-slate-500 font-mono">INV-TITAN-4451</p>
                  </div>
                  <span className="badge badge-warning ml-auto text-[10px]">EXTRACTED</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity</p>
                    <p className={`text-lg font-bold font-mono ${qtyMatchPO ? 'text-amber-300' : 'text-red-400'}`}>{simQty}</p>
                  </div>
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Unit Price</p>
                    <p className={`text-lg font-bold font-mono ${priceMatchPO ? 'text-amber-300' : 'text-red-400'}`}>${simPrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-surface-0 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
                    <p className={`text-lg font-bold font-mono ${(qtyMatchPO && priceMatchPO) ? 'text-amber-300' : 'text-red-400'}`}>
                      ${invoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* PO ↔ Invoice Match Indicators */}
              <div className="glass-card p-3 animate-slide-in stagger-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">PO ↔ Invoice Detailed Comparison</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <MatchBadge label="Quantity" match={qtyMatchPO} diff={qtyMatchPO ? 0 : simQty - poQty} unit="units" />
                  <MatchBadge label="Unit Price" match={priceMatchPO} diff={priceMatchPO ? 0 : simPrice - poUnitPrice} unit="$" isPrice />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom: Document Hash */}
      {ocrDone && (
        <div className="glass-card p-5 border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Blockchain Document Integrity</h3>
                <p className="text-xs text-slate-500">SHA-256 document fingerprint for tamper-proof audit trail</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 bg-surface-0 rounded-lg px-4 py-2.5 border border-slate-700/50">
                <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
                <code className="text-xs font-mono text-cyan-300 truncate">{FAKE_HASH}</code>
              </div>
            </div>
            <span className="badge badge-success flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────── */

function MatchIndicator({ label, match, expected, actual, unit }) {
  const variance = actual - expected;
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 h-px bg-slate-700/50"></div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        match
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          : 'bg-red-500/15 text-red-300 border border-red-500/30'
      }`}>
        {match ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{label}: MATCH</span>
          </>
        ) : (
          <>
            <XCircle className="w-3.5 h-3.5" />
            <span>{label}: MISMATCH</span>
            <span className="font-mono text-red-400">
              ({variance > 0 ? '+' : ''}{variance} {unit})
            </span>
          </>
        )}
      </div>
      <div className="flex-1 h-px bg-slate-700/50"></div>
    </div>
  );
}

function MatchBadge({ label, match, diff, unit, isPrice }) {
  const displayDiff = isPrice ? `${diff > 0 ? '+' : ''}$${diff.toFixed(2)}` : `${diff > 0 ? '+' : ''}${diff} ${unit}`;
  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg ${
      match ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
    }`}>
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        {match ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">MATCH</span>
          </>
        ) : (
          <>
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-300">MISMATCH</span>
            <span className="text-xs font-mono text-red-400">{displayDiff}</span>
          </>
        )}
      </div>
    </div>
  );
}
