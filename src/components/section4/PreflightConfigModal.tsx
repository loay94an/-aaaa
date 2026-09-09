import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  Check, 
  Cpu, 
  HardDrive, 
  Wifi, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Plus, 
  Trash2,
  Clock
} from 'lucide-react';
import { PreflightConfig } from '../../types';

interface PreflightConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PreflightConfig;
  onSaveConfig: (updated: PreflightConfig) => void;
}

const RUNTIME_IMAGES = [
  { id: 'node:20-alpine', label: 'Node.js 20 LTS (Alpine)', category: 'JavaScript / TypeScript' },
  { id: 'python:3.11-slim', label: 'Python 3.11 Slim', category: 'Python / FastAPI / Django' },
  { id: 'golang:1.22-alpine', label: 'Go 1.22 Alpine', category: 'Golang Microservices' },
  { id: 'rust:1.77-slim', label: 'Rust 1.77 Cargo', category: 'Rust Systems / WebAssembly' },
  { id: 'openjdk:21-slim', label: 'OpenJDK 21 (Maven/Gradle)', category: 'Java / Kotlin / Spring' },
  { id: 'mcr.microsoft.com/dotnet/sdk:8.0', label: '.NET 8.0 SDK', category: 'C# / ASP.NET Core' },
  { id: 'docker-compose:latest', label: 'Multi-Container Compose Stack', category: 'Full Stack Docker' },
];

export const PreflightConfigModal: React.FC<PreflightConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [formData, setFormData] = useState<PreflightConfig>({ ...config });
  const [newExclude, setNewExclude] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddExclude = () => {
    if (!newExclude.trim()) return;
    setFormData(prev => ({
      ...prev,
      excludePatterns: [...prev.excludePatterns, newExclude.trim()]
    }));
    setNewExclude('');
  };

  const handleRemoveExclude = (pattern: string) => {
    setFormData(prev => ({
      ...prev,
      excludePatterns: prev.excludePatterns.filter(p => p !== pattern)
    }));
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    setFormData(prev => ({
      ...prev,
      whitelistDomains: [...prev.whitelistDomains, newDomain.trim()]
    }));
    setNewDomain('');
  };

  const handleRemoveDomain = (dom: string) => {
    setFormData(prev => ({
      ...prev,
      whitelistDomains: prev.whitelistDomains.filter(d => d !== dom)
    }));
  };

  const handleSave = () => {
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-[#334155] rounded-[10px] max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              خيارات التكوين قبل التشغيل (Pre-flight Container & Runtime Config)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-[#334155] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Runtime Image Selection */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-200 block">
            صورة الحاوية أو بيئة التشغيل الأساسية (Container Image / Runtime):
          </label>
          <select
            value={formData.runtimeImage}
            onChange={(e) => setFormData(prev => ({ ...prev, runtimeImage: e.target.value }))}
            className="w-full bg-[#0b1120] text-white p-2.5 rounded-[5px] border border-[#334155] outline-none font-mono cursor-pointer"
          >
            {RUNTIME_IMAGES.map(img => (
              <option key={img.id} value={img.id}>
                {img.label} — [{img.category}]
              </option>
            ))}
          </select>
        </div>

        {/* 2. Resource Quotas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0b1120] p-3 rounded-[6px] border border-[#334155]">
          <div>
            <label className="text-[#94a3b8] flex items-center gap-1 mb-1 font-bold">
              <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>حد المعالج (CPU Quota):</span>
            </label>
            <select
              value={formData.cpuQuota}
              onChange={(e) => setFormData(prev => ({ ...prev, cpuQuota: Number(e.target.value) }))}
              className="w-full bg-[#080d1a] text-white p-2 rounded border border-[#334155] outline-none font-mono cursor-pointer"
            >
              <option value={0.5}>0.5 vCPU (اقتصادي)</option>
              <option value={1.0}>1.0 vCPU (قياسي)</option>
              <option value={2.0}>2.0 vCPU (أداء عالي)</option>
              <option value={4.0}>4.0 vCPU (تطوير مكثف)</option>
            </select>
          </div>

          <div>
            <label className="text-[#94a3b8] flex items-center gap-1 mb-1 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-[#10b981]" />
              <span>سقف الذاكرة (RAM Limit):</span>
            </label>
            <select
              value={formData.ramQuotaMb}
              onChange={(e) => setFormData(prev => ({ ...prev, ramQuotaMb: Number(e.target.value) }))}
              className="w-full bg-[#080d1a] text-white p-2 rounded border border-[#334155] outline-none font-mono cursor-pointer"
            >
              <option value={512}>512 MB</option>
              <option value={1024}>1024 MB (1 GB - الموصى به)</option>
              <option value={2048}>2048 MB (2 GB)</option>
              <option value={4096}>4096 MB (4 GB)</option>
            </select>
          </div>

          <div>
            <label className="text-[#94a3b8] flex items-center gap-1 mb-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>مهلة الجلسة (Session Timeout):</span>
            </label>
            <select
              value={formData.sessionTimeoutMinutes}
              onChange={(e) => setFormData(prev => ({ ...prev, sessionTimeoutMinutes: Number(e.target.value) }))}
              className="w-full bg-[#080d1a] text-white p-2 rounded border border-[#334155] outline-none font-mono cursor-pointer"
            >
              <option value={2}>2 دقائق (اختبار سريع)</option>
              <option value={5}>5 دقائق</option>
              <option value={10}>10 دقائق (افتراضي)</option>
              <option value={30}>30 دقيقة (جلسة مطولة)</option>
            </select>
          </div>

          <div>
            <label className="text-[#94a3b8] flex items-center gap-1 mb-1 font-bold">
              <Wifi className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>سياسة الشبكة والعزل:</span>
            </label>
            <select
              value={formData.networkPolicy}
              onChange={(e) => setFormData(prev => ({ ...prev, networkPolicy: e.target.value as any }))}
              className="w-full bg-[#080d1a] text-white p-2 rounded border border-[#334155] outline-none font-mono cursor-pointer"
            >
              <option value="isolated">عزل تام (Isolated Sandbox - لا إنترنت)</option>
              <option value="whitelist">قائمة بيضاء محددة (Whitelist Only)</option>
              <option value="full">وصول شبكي كامل (Full Access)</option>
            </select>
          </div>
        </div>

        {/* 3. Whitelist Domains (If applicable) */}
        {formData.networkPolicy === 'whitelist' && (
          <div className="bg-[#0b1120] p-3 rounded-[6px] border border-[#334155] space-y-2 text-xs">
            <label className="font-bold text-white block">النطاقات المسموح بها (Whitelist Domains):</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. api.github.com, registry.npmjs.org"
                className="flex-1 bg-[#080d1a] text-white px-2 py-1.5 rounded border border-[#334155] font-mono outline-none"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleAddDomain}
                className="px-3 py-1.5 bg-[#3b82f6] text-white rounded font-mono cursor-pointer"
              >
                + إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.whitelistDomains.map(d => (
                <span key={d} className="bg-[#0f172a] text-[#38bdf8] px-2 py-0.5 rounded border border-[#334155] flex items-center gap-1 font-mono text-[11px]">
                  {d}
                  <button type="button" onClick={() => handleRemoveDomain(d)} className="text-[#94a3b8] hover:text-rose-400">✕</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. Files to Exclude */}
        <div className="bg-[#0b1120] p-3 rounded-[6px] border border-[#334155] space-y-2 text-xs">
          <label className="font-bold text-white block">الملفات والمجلدات المستبعدة من الحاوية (Exclude Patterns):</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newExclude}
              onChange={(e) => setNewExclude(e.target.value)}
              placeholder="e.g. node_modules, .git, target, dist, __pycache__"
              className="flex-1 bg-[#080d1a] text-white px-2 py-1.5 rounded border border-[#334155] font-mono outline-none"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleAddExclude}
              className="px-3 py-1.5 bg-[#3b82f6] text-white rounded font-mono cursor-pointer"
            >
              + إضافة
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {formData.excludePatterns.map(p => (
              <span key={p} className="bg-[#0f172a] text-slate-300 px-2 py-0.5 rounded border border-[#334155] flex items-center gap-1 font-mono text-[11px]">
                {p}
                <button type="button" onClick={() => handleRemoveExclude(p)} className="text-[#94a3b8] hover:text-rose-400">✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* 5. Custom Environment Variables */}
        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-200 block">
            متغيرات البيئة المخصصة للجلسة (Session Env Vars):
          </label>
          <textarea
            value={formData.customEnvVars}
            onChange={(e) => setFormData(prev => ({ ...prev, customEnvVars: e.target.value }))}
            rows={4}
            placeholder="PORT=3000&#10;NODE_ENV=development&#10;DATABASE_URL=postgres://user:pass@localhost:5432/db"
            className="w-full bg-[#0b1120] text-emerald-300 font-mono text-xs p-2.5 rounded border border-[#334155] outline-none"
            dir="ltr"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#334155]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#0f172a] hover:bg-[#334155] text-slate-300 rounded text-xs font-medium cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
            <span>{savedSuccess ? 'تم الحفظ!' : 'تطبيق وحفظ الإعدادات'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
