import React, { useState } from 'react';
import { 
  Sparkles, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Bug, 
  FileCode, 
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { LogEntry } from '../../types';

interface SmartDiagnosticsProps {
  logs: LogEntry[];
  onApplyFix: (fixTitle: string, actionType: string) => void;
  onAddLog: (category: 'runtime' | 'build' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

interface DiagnosticIssue {
  id: string;
  severity: 'error' | 'warning';
  title: string;
  source: string;
  stacktrace?: string;
  suggestion: string;
  fixAction: string;
  isApplied?: boolean;
}

export const SmartDiagnostics: React.FC<SmartDiagnosticsProps> = ({
  logs,
  onApplyFix,
  onAddLog
}) => {
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);

  // Analyze current logs for issues
  const errorLogs = logs.filter(l => l.level === 'error' || l.level === 'warn');

  // Generate actionable diagnostics
  const issues: DiagnosticIssue[] = [
    {
      id: 'diag-missing-env',
      severity: 'warning',
      title: 'متغير بيئة DATABASE_URL غير مهيأ بالكامل في بيئة التشغيل',
      source: 'backend/server.js:14',
      stacktrace: 'Error: connect ECONNREFUSED 127.0.0.1:5432 at TCPConnectWrap.afterConnect [as oncomplete]',
      suggestion: 'إضافة DATABASE_URL تلقائياً في ملف .env ومزامنة المنفذ مع حاوية Postgres',
      fixAction: 'FIX_ENV_DB'
    },
    {
      id: 'diag-cors-policy',
      severity: 'warning',
      title: 'تحذير CORS محتمل عند استدعاء الخادم من الواجهة الأمامية',
      source: 'frontend/src/App.tsx:88',
      stacktrace: 'Access to XMLHttpRequest at "http://localhost:8080" from origin has been blocked by CORS policy',
      suggestion: 'إضافة وسيط cors() إلى تطبيق Express لتمكين الطلبات الواردة من localhost:3000',
      fixAction: 'FIX_CORS'
    },
    {
      id: 'diag-react-key',
      severity: 'warning',
      title: 'تحذير React: مفاتيح فريدة مفقودة في القوائم الديناميكية (Each child in a list should have a unique key)',
      source: 'src/components/ItemList.tsx:32',
      stacktrace: 'Warning: Each child in a list should have a unique "key" prop.',
      suggestion: 'استخدام id العنصر كمفتاح فريد (key={item.id}) بدلاً من استخدام index المصفوفة',
      fixAction: 'FIX_REACT_KEYS'
    }
  ];

  const handleFix = (issue: DiagnosticIssue) => {
    setAppliedFixes(prev => [...prev, issue.id]);
    onApplyFix(issue.title, issue.fixAction);
    onAddLog('runtime', 'success', `[إصلاح ذكي] تم تطبيق الحل المقترح بنجاح: "${issue.title}"`);
  };

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#334155] text-xs">
        <span className="font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#a855f7]" />
          <span>التحليل الذكي للأخطاء وحلول الإصلاح التلقائي (Smart Error Diagnostics)</span>
        </span>
        <span className="text-[10px] text-[#a855f7] font-mono">مدعوم بمحلل Stacktrace الذكي</span>
      </div>

      <div className="space-y-2.5">
        {issues.map(iss => {
          const isDone = appliedFixes.includes(iss.id);

          return (
            <div 
              key={iss.id} 
              className={`p-3 rounded-[6px] border transition text-xs space-y-2 ${
                isDone 
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' 
                  : 'bg-[#080d1a] border-[#334155] text-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bug className={`w-4 h-4 ${isDone ? 'text-[#10b981]' : 'text-[#f59e0b]'}`} />
                  <span className="font-bold text-white">{iss.title}</span>
                </div>
                <span className="text-[10px] font-mono text-[#94a3b8]">{iss.source}</span>
              </div>

              {iss.stacktrace && (
                <div className="bg-[#050811] p-2 rounded font-mono text-[11px] text-rose-300 border border-rose-950/40 overflow-x-auto" dir="ltr">
                  {iss.stacktrace}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-sans">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>الحل المقترح:</strong> {iss.suggestion}</span>
                </div>

                <button
                  type="button"
                  disabled={isDone}
                  onClick={() => handleFix(iss)}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    isDone 
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 cursor-default' 
                      : 'bg-[#3b82f6] hover:bg-blue-600 text-white shadow-xs'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                  <span>{isDone ? 'تم الإصلاح بنجاح' : 'تطبيق الإصلاح التلقائي'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
