import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import {
  Scale, Code2, Cpu, Play, CheckCircle2, XOctagon, AlertTriangle,
  Sparkles, BookOpen, FlaskConical, ArrowRight, Shield, Zap,
  RefreshCw, ChevronRight, Terminal, CircleDot, DollarSign, Star
} from 'lucide-react';

// ─── Rule Parser ────────────────────────────────────────────────

function parseRule(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return null;

  // Pattern: IF spend IS OVER X THEN ROUTE TO ROLE
  const overMatch = trimmed.match(/OVER\s+([\d,.]+)/i);
  const routeMatch = trimmed.match(/ROUTE\s+TO\s+(\w+)/i);
  if (overMatch && routeMatch) {
    const amount = parseFloat(overMatch[1].replace(/,/g, ''));
    const role = routeMatch[1];
    return {
      type: 'SPEND_THRESHOLD',
      condition: `Spend > $${amount.toLocaleString()}`,
      action: `Escalate to ${role.replace(/_/g, ' ')}`,
      amount,
      role,
      icon: 'dollar',
      color: 'violet',
    };
  }

  // Pattern: IF vendor_rating IS UNDER X THEN REQUIRE ACTION
  const underMatch = trimmed.match(/UNDER\s+([\d.]+)/i);
  const requireMatch = trimmed.match(/REQUIRE\s+(\w+)/i);
  if (underMatch && requireMatch) {
    const rating = parseFloat(underMatch[1]);
    const action = requireMatch[1];
    return {
      type: 'RATING_CHECK',
      condition: `Rating < ${rating}`,
      action: `Require ${action.replace(/_/g, ' ')}`,
      rating,
      requiredAction: action,
      icon: 'star',
      color: 'amber',
    };
  }

  // Pattern: contains OVER and REQUIRE (combo rules like category + spend)
  const overMatch2 = trimmed.match(/OVER\s+([\d,.]+)/i);
  const requireMatch2 = trimmed.match(/REQUIRE\s+(\w+)/i);
  if (overMatch2 && requireMatch2) {
    const amount = parseFloat(overMatch2[1].replace(/,/g, ''));
    const action = requireMatch2[1];
    return {
      type: 'COMPOUND',
      condition: `Spend > $${amount.toLocaleString()}`,
      action: `Require ${action.replace(/_/g, ' ')}`,
      amount,
      requiredAction: action,
      icon: 'shield',
      color: 'cyan',
    };
  }

  // Fallback — custom directive
  return {
    type: 'CUSTOM',
    condition: trimmed.replace(/;$/, ''),
    action: 'Needs manual review',
    icon: 'alert',
    color: 'slate',
  };
}

function evaluateRule(parsed, testAmount, testRating) {
  if (!parsed) return null;
  if (parsed.type === 'SPEND_THRESHOLD') {
    return testAmount > parsed.amount
      ? { triggered: true, reason: `$${testAmount.toLocaleString()} exceeds $${parsed.amount.toLocaleString()} threshold → ${parsed.action}` }
      : { triggered: false, reason: `$${testAmount.toLocaleString()} is within $${parsed.amount.toLocaleString()} limit` };
  }
  if (parsed.type === 'RATING_CHECK') {
    return testRating < parsed.rating
      ? { triggered: true, reason: `Rating ${testRating} is below ${parsed.rating} → ${parsed.action}` }
      : { triggered: false, reason: `Rating ${testRating} meets minimum ${parsed.rating} requirement` };
  }
  if (parsed.type === 'COMPOUND') {
    const amountTriggered = testAmount > parsed.amount;
    return amountTriggered
      ? { triggered: true, reason: `$${testAmount.toLocaleString()} exceeds $${parsed.amount.toLocaleString()} → ${parsed.action}` }
      : { triggered: false, reason: `$${testAmount.toLocaleString()} is within $${parsed.amount.toLocaleString()} limit` };
  }
  return { triggered: false, reason: 'Custom rule — manual evaluation required' };
}

// ─── Main Component ─────────────────────────────────────────────

export default function ComplianceEngine() {
  const complianceRules = useStore(s => s.complianceRules);
  const setComplianceRules = useStore(s => s.setComplianceRules);

  const [testAmount, setTestAmount] = useState(12000);
  const [testRating, setTestRating] = useState(3.5);
  const [testRan, setTestRan] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  const lines = useMemo(() => complianceRules.split('\n'), [complianceRules]);

  const parsedRules = useMemo(() => {
    return lines.map((line, idx) => ({
      lineNum: idx + 1,
      raw: line,
      parsed: parseRule(line),
    })).filter(r => r.parsed !== null);
  }, [lines]);

  const testResults = useMemo(() => {
    if (!testRan) return [];
    return parsedRules.map(r => ({
      ...r,
      result: evaluateRule(r.parsed, testAmount, testRating),
    }));
  }, [testRan, parsedRules, testAmount, testRating]);

  const handleRunTest = useCallback(() => {
    setIsCompiling(true);
    setTestRan(false);
    setTimeout(() => {
      setIsCompiling(false);
      setTestRan(true);
    }, 800);
  }, []);

  const triggeredCount = testResults.filter(r => r.result?.triggered).length;
  const passedCount = testResults.filter(r => r.result && !r.result.triggered).length;

  const iconMap = {
    dollar: DollarSign,
    star: Star,
    shield: Shield,
    alert: AlertTriangle,
  };

  const colorMap = {
    violet: { bg: 'bg-violet-500/15', border: 'border-violet-500/25', text: 'text-violet-300', icon: 'text-violet-400' },
    amber: { bg: 'bg-amber-500/15', border: 'border-amber-500/25', text: 'text-amber-300', icon: 'text-amber-400' },
    cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/25', text: 'text-cyan-300', icon: 'text-cyan-400' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/25', text: 'text-slate-400', icon: 'text-slate-500' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              English-as-Code Compliance Rule Compiler
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Write procurement rules in plain English — the engine compiles them into executable directives
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-info flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Compiler v2.1
          </span>
          <span className="badge badge-success flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> {parsedRules.length} Rules Active
          </span>
        </div>
      </div>

      {/* Editor + Compiled Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Code Editor (3/5 = 60%) */}
        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-surface-0/50">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-slate-200">compliance_rules.vcl</span>
                <span className="text-[10px] text-slate-600 ml-1">VendorBridge Compliance Language</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex bg-surface-50">
              {/* Line Numbers */}
              <div className="select-none px-3 py-4 text-right border-r border-slate-700/30 bg-surface-0/30 min-w-[3rem]">
                {lines.map((_, idx) => (
                  <div key={idx} className="text-xs font-mono text-slate-600 leading-6 h-6">
                    {idx + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={complianceRules}
                onChange={(e) => {
                  setComplianceRules(e.target.value);
                  setTestRan(false);
                }}
                className="flex-1 bg-transparent text-sm font-mono text-slate-200 p-4 resize-none outline-none
                  leading-6 min-h-[280px] placeholder-slate-600 caret-cyan-400
                  selection:bg-cyan-500/20"
                spellCheck={false}
                placeholder="Write compliance rules in English..."
              />
            </div>

            {/* Editor Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/50 bg-surface-0/50">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  {lines.length} lines
                </span>
                <span>•</span>
                <span>{parsedRules.length} parsed rules</span>
                <span>•</span>
                <span className="text-cyan-400/60">UTF-8</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <BookOpen className="w-3 h-3" />
                <span>VCL Syntax</span>
              </div>
            </div>
          </div>

          {/* Syntax Guide */}
          <div className="glass-card p-4 mt-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Syntax Reference</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-surface-0 rounded-lg p-2.5 border border-slate-700/30">
                <code className="text-[11px] font-mono text-violet-300">IF spend IS OVER &lt;amount&gt; THEN ROUTE TO &lt;role&gt;</code>
                <p className="text-[10px] text-slate-500 mt-1">Spend threshold routing</p>
              </div>
              <div className="bg-surface-0 rounded-lg p-2.5 border border-slate-700/30">
                <code className="text-[11px] font-mono text-amber-300">IF vendor_rating IS UNDER &lt;value&gt; THEN REQUIRE &lt;action&gt;</code>
                <p className="text-[10px] text-slate-500 mt-1">Rating-based compliance check</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Compiled Directives (2/5 = 40%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-slate-100">Compiled Directives</h2>
              <span className="text-xs text-slate-500 ml-auto">{parsedRules.length} rules</span>
            </div>

            <div className="space-y-3">
              {parsedRules.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <Code2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No parseable rules found
                </div>
              ) : (
                parsedRules.map((rule, idx) => {
                  const colors = colorMap[rule.parsed.color] || colorMap.slate;
                  const IconComp = iconMap[rule.parsed.icon] || AlertTriangle;
                  return (
                    <div
                      key={idx}
                      className={`glass-card p-3.5 border ${colors.border} ${colors.bg} transition-all duration-300 hover:scale-[1.01] animate-slide-in`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                          <IconComp className={`w-4 h-4 ${colors.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-slate-500">RULE {rule.lineNum}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
                              {rule.parsed.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 uppercase w-16 shrink-0">Condition</span>
                              <ChevronRight className="w-3 h-3 text-slate-600" />
                              <span className={`text-xs font-medium ${colors.text}`}>{rule.parsed.condition}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 uppercase w-16 shrink-0">Action</span>
                              <ArrowRight className="w-3 h-3 text-slate-600" />
                              <span className="text-xs font-medium text-slate-300">{rule.parsed.action}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Live Rule Testing Sandbox */}
      <div className="glass-card p-5 border border-cyan-500/15">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Live Rule Testing Sandbox</h2>
            <p className="text-xs text-slate-500">Evaluate compliance rules against simulated procurement scenarios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Test Inputs */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Test Amount ($)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={e => { setTestAmount(Number(e.target.value)); setTestRan(false); }}
                className="w-full bg-surface-0 border border-slate-700/50 rounded-xl px-4 py-3 text-sm font-mono text-slate-200
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all
                  placeholder-slate-600"
                placeholder="Enter amount..."
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Test Vendor Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={testRating}
                onChange={e => { setTestRating(Number(e.target.value)); setTestRan(false); }}
                className="w-full bg-surface-0 border border-slate-700/50 rounded-xl px-4 py-3 text-sm font-mono text-slate-200
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all
                  placeholder-slate-600"
                placeholder="0.0 - 5.0"
              />
            </div>
            <button
              onClick={handleRunTest}
              disabled={isCompiling}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                isCompiling
                  ? 'bg-cyan-600/50 text-cyan-200 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Compiling & Evaluating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Compliance Check
                </>
              )}
            </button>
          </div>

          {/* Test Results */}
          <div className="lg:col-span-2">
            {!testRan ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-50 flex items-center justify-center mb-3">
                  <FlaskConical className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">Configure test parameters and run the compliance check</p>
                <p className="text-xs text-slate-600 mt-1">Results will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {/* Summary Bar */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">{passedCount} Passed</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                    <XOctagon className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-semibold text-red-300">{triggeredCount} Triggered</span>
                  </div>
                  {triggeredCount > 0 && (
                    <span className="text-xs text-amber-400 ml-auto flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Approvals required before proceeding
                    </span>
                  )}
                </div>

                {testResults.map((r, idx) => {
                  const triggered = r.result?.triggered;
                  const colors = colorMap[r.parsed.color] || colorMap.slate;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 animate-slide-in ${
                        triggered
                          ? 'bg-red-500/5 border-red-500/25'
                          : 'bg-emerald-500/5 border-emerald-500/25'
                      }`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        triggered ? 'bg-red-500/15' : 'bg-emerald-500/15'
                      }`}>
                        {triggered ? (
                          <XOctagon className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-500">RULE {r.lineNum}</span>
                          <span className={`text-[10px] font-semibold ${triggered ? 'badge badge-danger' : 'badge badge-success'}`}>
                            {triggered ? 'TRIGGERED' : 'PASSED'}
                          </span>
                        </div>
                        <p className={`text-xs ${triggered ? 'text-red-300' : 'text-emerald-300'}`}>
                          {r.result?.reason}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1 font-mono truncate">{r.raw.trim()}</p>
                      </div>
                      {triggered && (
                        <span className="badge badge-danger text-[10px] shrink-0">
                          ACTION REQUIRED
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Final verdict */}
                {testRan && (
                  <div className={`p-4 rounded-xl border mt-2 ${
                    triggeredCount === 0
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-amber-500/30 bg-amber-500/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      {triggeredCount === 0 ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-300">All Compliance Checks Passed</p>
                            <p className="text-xs text-slate-500">Transaction of ${testAmount.toLocaleString()} with vendor rating {testRating} is cleared for processing.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                          <div>
                            <p className="text-sm font-semibold text-amber-300">{triggeredCount} Rule{triggeredCount > 1 ? 's' : ''} Triggered — Additional Approval Required</p>
                            <p className="text-xs text-slate-500">
                              Transaction requires escalation. {triggeredCount === 1 ? 'One compliance rule was' : `${triggeredCount} compliance rules were`} triggered for amount ${testAmount.toLocaleString()} / rating {testRating}.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
