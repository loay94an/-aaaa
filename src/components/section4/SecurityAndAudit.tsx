import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Trash2, 
  Clock, 
  FileSearch, 
  CheckCircle2, 
  Lock,
  RefreshCw,
  Eye
} from 'lucide-react';
import { AuditLogEntry, FileNode } from '../../types';

interface SecurityAndAuditProps {
  nodes: FileNode[];
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (action: string, status: 'success' | 'warning' | 'blocked') => void;
}

export const SecurityAndAudit: React.FC<SecurityAndAuditProps> = ({
  nodes,
  auditLogs,
  onAddAuditLog
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [securityScanResults, setSecurityScanResults] = useState<{
    leakedKeysCount: number;
    suspiciousExecutables: string[];
    permissionWarnings: string[];
    lastScanned: string;
  }>({
    leakedKeysCount: 0,
    suspiciousExecutables: [],
    permissionWarnings: [],
    lastScanned: 'قبل قليل'
  });

  const handleRunSecurityScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Scan nodes content for mock leaks
      let leaks = 0;
      const suspicious: string[] = [];
      const warnings: string[] = [];

      nodes.forEach(n => {
        if (n.content) {
          if (n.content.includes('AIzaSy') || n.content.includes('sk-live-') || n.content.includes('password = "123')) {
            leaks++;
          }
          if (n.name.endsWith('.exe') || n.name.endsWith('.bat') || n.name.endsWith('.cmd')) {
            suspicious.push(n.path);
          }
        }
      });

      if (leaks > 0) {
        warnings.push(`تم اكتشاف ${leaks} مفتاح سري أو كلمة مرور مكشوفة داخل الملفات.`);
      }

      setSecurityScanResults({
        leakedKeysCount: leaks,
        suspiciousExecutables: suspicious,
        permissionWarnings: warnings,
        lastScanned: new Date().toLocaleTimeString('ar-SA')
      });

      setIsScanning(false);
      onAddAuditLog('SECURITY_SCAN_COMPLETED', leaks > 0 ? 'warning' : 'success');
    }, 450);
  };

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#334155]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#10b981]" />
          <h3 className="text-sm font-bold text-white">
            مركز الأمان، القيود، وسجلات التدقيق (Security & Audit Trail)
          </h3>
        </div>
        <button
          type="button"
          onClick={handleRunSecurityScan}
          disabled={isScanning}
          className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-[#38bdf8] rounded border border-[#38bdf8]/40 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'جاري الفحص...' : 'فحص أمان فوري للمشروع'}</span>
        </button>
      </div>

      {/* Security Policies Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Sandbox Isolation */}
        <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] space-y-1">
          <span className="text-[#94a3b8] flex items-center gap-1 text-[11px]">
            <Lock className="w-3 h-3 text-[#10b981]" />
            <span>عزل الحاوية (Container Sandbox):</span>
          </span>
          <p className="font-bold text-white font-mono">Kernel cgroups + seccomp</p>
          <span className="text-[10px] text-emerald-400">حماية من تجاوز الصلاحيات</span>
        </div>

        {/* Resource Quota Enforcement */}
        <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] space-y-1">
          <span className="text-[#94a3b8] flex items-center gap-1 text-[11px]">
            <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
            <span>إنفاذ قيود الموارد:</span>
          </span>
          <p className="font-bold text-white font-mono">1.0 vCPU | 1024 MB RAM</p>
          <span className="text-[10px] text-amber-300">إيقاف فوري للعمليات المخالفة</span>
        </div>

        {/* Auto Cleanup Policy */}
        <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] space-y-1">
          <span className="text-[#94a3b8] flex items-center gap-1 text-[11px]">
            <Clock className="w-3 h-3 text-[#38bdf8]" />
            <span>سياسة الحذف التلقائي:</span>
          </span>
          <p className="font-bold text-white font-mono">Garbage Collector: Active</p>
          <span className="text-[10px] text-slate-400">تنظيف الملفات المؤقتة بعد انتهاء الجلسة</span>
        </div>
      </div>

      {/* Security Scan Banner */}
      <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-[#38bdf8]" />
            <span>نتائج فحص الثغرات والمفاتيح السرية (Vulnerability & Secrets Scanner)</span>
          </span>
          <span className="text-[10px] text-[#94a3b8] font-mono">آخر فحص: {securityScanResults.lastScanned}</span>
        </div>

        {securityScanResults.leakedKeysCount === 0 && securityScanResults.suspiciousExecutables.length === 0 ? (
          <div className="p-2.5 bg-[#0b1120] rounded border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            <span>المشروع نظيف: لا توجد مفاتيح سرية مكشوفة أو ملفات تنفيذية مشبوهة.</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {securityScanResults.permissionWarnings.map((w, i) => (
              <div key={i} className="p-2 bg-rose-950/40 rounded border border-rose-800/40 text-rose-300 text-xs">
                ⚠️ {w}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Trail Logs Table (سجلات التدقيق) */}
      <div className="bg-[#080d1a] rounded-[6px] border border-[#334155] overflow-hidden">
        <div className="bg-[#0f172a] px-3.5 py-2 border-b border-[#334155] flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>سجل التدقيق الأمني المباشر (Immutable Audit Trail)</span>
          </span>
          <span className="text-[#94a3b8] font-mono text-[11px]">{auditLogs.length} سجلات موثقة</span>
        </div>

        <div className="overflow-x-auto max-h-44 overflow-y-auto">
          <table className="w-full text-xs text-right border-collapse" dir="ltr">
            <thead className="bg-[#0b1120] text-[#94a3b8] font-mono text-[11px] border-b border-[#334155]">
              <tr>
                <th className="p-2 border-r border-[#334155]">Timestamp</th>
                <th className="p-2 border-r border-[#334155]">Actor</th>
                <th className="p-2 border-r border-[#334155]">Action</th>
                <th className="p-2 border-r border-[#334155]">Resource</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155] font-mono text-slate-300">
              {auditLogs.slice().reverse().map(al => (
                <tr key={al.id} className="hover:bg-[#1e293b]/40">
                  <td className="p-2 border-r border-[#334155] text-[#94a3b8] text-[11px]">{al.timestamp}</td>
                  <td className="p-2 border-r border-[#334155] text-white font-bold">{al.actor}</td>
                  <td className="p-2 border-r border-[#334155] text-[#38bdf8]">{al.action}</td>
                  <td className="p-2 border-r border-[#334155] text-slate-400">{al.resource}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      al.status === 'success' ? 'bg-emerald-950 text-emerald-300' :
                      al.status === 'warning' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {al.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
