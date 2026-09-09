import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCw, 
  Hammer, 
  ExternalLink, 
  Sliders, 
  Cpu, 
  HardDrive, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Layers, 
  Server, 
  Database, 
  Monitor, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { PreflightConfig, ResourceUsage, ServiceInfo, ServiceStatus, TimelineEvent } from '../../types';

interface UnifiedRunDashboardProps {
  services: ServiceInfo[];
  onStartService: (id: string) => void;
  onStopService: (id: string) => void;
  onRestartService: (id: string) => void;
  onRunFullStack: () => void;
  onStopAll: () => void;
  onRebuildAll: () => void;
  onOpenPreview: () => void;
  onOpenPreflight: () => void;
  resourceUsage: ResourceUsage;
  timelineEvents: TimelineEvent[];
  sessionTimeLeftSec: number;
  onExtendSession: () => void;
  preflightConfig: PreflightConfig;
}

export const UnifiedRunDashboard: React.FC<UnifiedRunDashboardProps> = ({
  services,
  onStartService,
  onStopService,
  onRestartService,
  onRunFullStack,
  onStopAll,
  onRebuildAll,
  onOpenPreview,
  onOpenPreflight,
  resourceUsage,
  timelineEvents,
  sessionTimeLeftSec,
  onExtendSession,
  preflightConfig
}) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(true);

  // Format countdown minutes:seconds
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const allRunning = services.every(s => s.status === 'running');
  const anyRunning = services.some(s => s.status === 'running' || s.status === 'starting');

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] p-4 sm:p-5 space-y-4">
      {/* Top Bar: Master Action Buttons & Session Timer */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#334155]">
        {/* Run Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Run Full Stack */}
          <button
            type="button"
            onClick={onRunFullStack}
            className="px-4 py-2 rounded-[5px] bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm cursor-pointer active:scale-95"
            title="تشغيل الواجهة الأمامية والخلفية وقاعدة البيانات معاً بنقرة واحدة"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>تشغيل بيئة كاملة (Run Full Stack)</span>
          </button>

          {/* Stop All */}
          <button
            type="button"
            disabled={!anyRunning}
            onClick={onStopAll}
            className="px-3 py-2 rounded-[5px] bg-[#0f172a] hover:bg-rose-950/60 text-[#94a3b8] hover:text-rose-300 border border-[#334155] hover:border-rose-700/50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>إيقاف الكل</span>
          </button>

          {/* Restart All */}
          <button
            type="button"
            onClick={onRestartService ? () => services.forEach(s => onRestartService(s.id)) : undefined}
            className="px-3 py-2 rounded-[5px] bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] hover:text-white border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="إعادة تشغيل جميع الخدمات"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>إعادة تشغيل</span>
          </button>

          {/* Rebuild Containers */}
          <button
            type="button"
            onClick={onRebuildAll}
            className="px-3 py-2 rounded-[5px] bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] hover:text-amber-300 border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="إعادة بناء صور الحاويات والحزم"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>إعادة بناء (Rebuild)</span>
          </button>

          {/* Open Preview */}
          <button
            type="button"
            onClick={onOpenPreview}
            className="px-3 py-2 rounded-[5px] bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح المعاينة</span>
          </button>

          {/* Pre-flight Config */}
          <button
            type="button"
            onClick={onOpenPreflight}
            className="px-3 py-2 rounded-[5px] bg-[#0f172a] hover:bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/30 hover:border-[#38bdf8]/60 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="خيارات التكوين قبل التشغيل (Runtime, Env Vars, Network Sandbox)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خيارات التكوين</span>
          </button>
        </div>

        {/* Session Countdown Timer & Security Limits */}
        <div className="flex items-center gap-2.5 bg-[#080d1a] px-3 py-1.5 rounded-[6px] border border-[#334155] text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className={`w-4 h-4 ${sessionTimeLeftSec < 120 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-[#94a3b8]">مهلة الجلسة:</span>
            <span className={`font-mono font-bold ${sessionTimeLeftSec < 120 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(sessionTimeLeftSec)}
            </span>
          </div>

          <button
            type="button"
            onClick={onExtendSession}
            className="text-[11px] bg-[#1e293b] hover:bg-[#334155] text-[#38bdf8] px-2 py-0.5 rounded border border-[#334155] cursor-pointer transition flex items-center gap-1"
            title="تمديد الجلسة بـ 5 دقائق إضافية"
          >
            <Plus className="w-3 h-3" />
            <span>+5 دقائق</span>
          </button>

          <span className="text-[10px] text-[#10b981] hidden sm:flex items-center gap-1 border-r border-[#334155] pr-2">
            <ShieldCheck className="w-3 h-3" />
            <span>عزل آمن</span>
          </span>
        </div>
      </div>

      {/* Middle Grid: Services Status List + Live Resource Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Services List (7 Cols) */}
        <div className="lg:col-span-7 bg-[#080d1a] p-3.5 rounded-[6px] border border-[#334155] space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#38bdf8]" />
              <span>قائمة خدمات المشروع (Active Services)</span>
            </span>
            <span className="text-[11px] font-mono text-[#94a3b8]">
              {services.filter(s => s.status === 'running').length} / {services.length} تعمل
            </span>
          </div>

          <div className="space-y-2">
            {services.map(srv => {
              const isRunning = srv.status === 'running';
              const isStarting = srv.status === 'starting';
              const isError = srv.status === 'error';

              return (
                <div 
                  key={srv.id}
                  className="bg-[#0b1120] p-2.5 rounded-[6px] border border-[#334155] flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Status Dot */}
                    <div className="relative">
                      <span className={`w-2.5 h-2.5 rounded-full block ${
                        isRunning ? 'bg-[#10b981] shadow-xs shadow-emerald-500' :
                        isStarting ? 'bg-amber-400 animate-ping' :
                        isError ? 'bg-rose-500' : 'bg-slate-600'
                      }`}></span>
                    </div>

                    {/* Service Icon & Name */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        {srv.type === 'frontend' && <Monitor className="w-3.5 h-3.5 text-[#38bdf8]" />}
                        {srv.type === 'backend' && <Server className="w-3.5 h-3.5 text-[#10b981]" />}
                        {srv.type === 'database' && <Database className="w-3.5 h-3.5 text-[#f59e0b]" />}
                        <span className="font-bold text-white">{srv.name}</span>
                        <span className="text-[10px] text-[#94a3b8] font-mono">({srv.containerImage})</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#94a3b8] mt-0.5 flex items-center gap-2">
                        <span>المنفذ: <strong className="text-[#38bdf8]">:{srv.port}</strong></span>
                        {isRunning && (
                          <>
                            <span>•</span>
                            <span>الذاكرة: {srv.memoryMb} MB</span>
                            <span>•</span>
                            <span>CPU: {srv.cpuPercent}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this service */}
                  <div className="flex items-center gap-1.5">
                    {isRunning ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onRestartService(srv.id)}
                          className="p-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] hover:text-white transition cursor-pointer"
                          title="إعادة تشغيل الخدمة"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onStopService(srv.id)}
                          className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>إيقاف</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartService(srv.id)}
                        disabled={isStarting}
                        className="px-2.5 py-1 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        {isStarting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />}
                        <span>{isStarting ? 'جاري البدء...' : 'تشغيل'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource Meter (5 Cols) */}
        <div className="lg:col-span-5 bg-[#080d1a] p-3.5 rounded-[6px] border border-[#334155] space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#10b981]" />
              <span>مقياس الموارد الحي (Resource Meter)</span>
            </span>
            <span className="text-[10px] text-[#10b981] font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>مباشر</span>
            </span>
          </div>

          <div className="space-y-3">
            {/* CPU Meter */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#94a3b8] flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#38bdf8]" />
                  <span>معالج الجلسة (CPU Cores):</span>
                </span>
                <span className="font-mono text-white font-bold">{resourceUsage.cpuPercent}% / {preflightConfig.cpuQuota} Core</span>
              </div>
              <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#334155]/60">
                <div 
                  className={`h-full transition-all duration-500 ${
                    resourceUsage.cpuPercent > 80 ? 'bg-rose-500' :
                    resourceUsage.cpuPercent > 50 ? 'bg-amber-400' : 'bg-[#38bdf8]'
                  }`}
                  style={{ width: `${Math.min(100, resourceUsage.cpuPercent)}%` }}
                />
              </div>
            </div>

            {/* RAM Meter */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#94a3b8] flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-[#10b981]" />
                  <span>ذاكرة الوصول العشوائي (RAM):</span>
                </span>
                <span className="font-mono text-white font-bold">{resourceUsage.ramUsedMb} MB / {preflightConfig.ramQuotaMb} MB</span>
              </div>
              <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#334155]/60">
                <div 
                  className={`h-full transition-all duration-500 ${
                    (resourceUsage.ramUsedMb / preflightConfig.ramQuotaMb) > 0.85 ? 'bg-rose-500' : 'bg-[#10b981]'
                  }`}
                  style={{ width: `${Math.min(100, (resourceUsage.ramUsedMb / preflightConfig.ramQuotaMb) * 100)}%` }}
                />
              </div>
            </div>

            {/* Disk Meter */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#94a3b8] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#f59e0b]" />
                  <span>المساحة التخزينية (Disk Quota):</span>
                </span>
                <span className="font-mono text-white font-bold">{resourceUsage.diskUsedMb} MB / {resourceUsage.diskTotalMb} MB</span>
              </div>
              <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#334155]/60">
                <div 
                  className="h-full bg-[#f59e0b] transition-all duration-500"
                  style={{ width: `${Math.min(100, (resourceUsage.diskUsedMb / resourceUsage.diskTotalMb) * 100)}%` }}
                />
              </div>
            </div>

            {/* Network Traffic */}
            <div className="bg-[#0b1120] p-2 rounded border border-[#334155] flex justify-between text-[10px] font-mono text-[#94a3b8]">
              <span>▲ Net Out: <strong className="text-slate-200">{resourceUsage.networkOutKb} KB/s</strong></span>
              <span>▼ Net In: <strong className="text-slate-200">{resourceUsage.networkInKb} KB/s</strong></span>
              <span>Policy: <strong className="text-[#38bdf8]">{preflightConfig.networkPolicy}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Collapsible: Interactive Timeline (سجل الأحداث المترابط) */}
      <div className="bg-[#080d1a] rounded-[6px] border border-[#334155] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsTimelineExpanded(prev => !prev)}
          className="w-full px-3 py-2 bg-[#0f172a] hover:bg-[#1e293b] flex items-center justify-between text-xs font-medium text-[#94a3b8] hover:text-white transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-white font-bold">سجل أحداث دورة التشغيل (Execution Lifecycle Timeline)</span>
            <span className="text-[10px] bg-[#334155] px-1.5 py-0.2 rounded text-slate-300 font-mono">
              {timelineEvents.length} حدث
            </span>
          </div>
          {isTimelineExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isTimelineExpanded && (
          <div className="p-3 max-h-36 overflow-y-auto space-y-2 text-xs font-mono">
            {timelineEvents.length === 0 ? (
              <div className="text-[#94a3b8]/50 text-center py-2 text-xs font-sans">
                لم يتم تسجيل أحداث تشغيل حتى الآن. اضغط على تشغيل بيئة كاملة لبدء التسجيل.
              </div>
            ) : (
              timelineEvents.slice().reverse().map(ev => (
                <div key={ev.id} className="flex items-start gap-2">
                  <span className="text-[10px] text-[#94a3b8] shrink-0">[{ev.timestamp}]</span>
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    ev.type === 'success' ? 'bg-[#10b981]' :
                    ev.type === 'error' ? 'bg-rose-500' :
                    ev.type === 'warn' ? 'bg-[#f59e0b]' : 'bg-[#3b82f6]'
                  }`}></span>
                  <span className={`font-sans ${
                    ev.type === 'error' ? 'text-rose-300' :
                    ev.type === 'warn' ? 'text-amber-200' :
                    ev.type === 'success' ? 'text-emerald-300' : 'text-slate-300'
                  }`}>
                    {ev.title} {ev.detail && <span className="text-[#94a3b8] text-[11px]">({ev.detail})</span>}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
