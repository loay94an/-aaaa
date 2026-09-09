import React, { useEffect, useMemo, useState } from 'react';
import { 
  Smartphone, 
  CheckCircle, 
  FileArchive, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Download,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  Layers,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Play,
  Github,
  UploadCloud
} from 'lucide-react';
import { GitHubIntegrationModal } from './GitHubIntegrationModal';
import { ExportOptions, FileNode, PWAConfig } from '../types';
import { 
  convertProjectToPWA, 
  inferProjectIconsAndMeta, 
  checkPWACompliance, 
  generateSvgIcon,
  InferredProjectMeta,
  PWAComplianceReport 
} from '../utils/pwaGenerator';
import { exportProjectToZip } from '../utils/zipUtils';
import { findNodeByPath } from '../utils/treeParser';

interface Section5Props {
  nodes: FileNode[];
  setNodes: React.Dispatch<React.SetStateAction<FileNode[]>>;
  activeFile?: FileNode | null;
  onSelectFile?: (file: FileNode) => void;
  onAddLog: (category: 'build' | 'runtime' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export const Section5ExportAndPWA: React.FC<Section5Props> = ({
  nodes,
  setNodes,
  activeFile,
  onSelectFile,
  onAddLog
}) => {
  // Export configuration
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    fileName: 'my-project-bundle',
    excludeNodeModules: true,
    excludeGit: true,
    compressionLevel: 6
  });

  // PWA configuration
  const [pwaConfig, setPwaConfig] = useState<PWAConfig>({
    name: 'تطبيقي التفاعلي PWA',
    shortName: 'تطبيقي',
    description: 'تطبيق ويب تقدمي قابل للتثبيت ويعمل دون اتصال بالإنترنت',
    themeColor: '#3b82f6',
    backgroundColor: '#0f172a',
    display: 'standalone',
    startUrl: '/',
    scope: '/'
  });

  // Inferred metadata state
  const [inferredMeta, setInferredMeta] = useState<InferredProjectMeta | null>(null);
  const [selectedIconSymbol, setSelectedIconSymbol] = useState<string>('⚡');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isApplyingPWA, setIsApplyingPWA] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  // Live PWA compliance check on current project nodes
  const complianceReport: PWAComplianceReport = useMemo(() => {
    return checkPWACompliance(nodes);
  }, [nodes]);

  // Infer icons and metadata automatically whenever nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      const meta = inferProjectIconsAndMeta(nodes);
      setInferredMeta(meta);

      // Auto-populate PWA form fields from inferred metadata if default
      setPwaConfig(prev => ({
        ...prev,
        name: meta.inferredName || prev.name,
        shortName: meta.inferredShortName || prev.shortName,
        description: meta.inferredDescription || prev.description,
        themeColor: meta.inferredThemeColor || prev.themeColor
      }));

      setExportOptions(prev => ({
        ...prev,
        fileName: (meta.inferredShortName || 'my-project').toLowerCase().replace(/\s+/g, '-')
      }));
    }
  }, [nodes]);

  // Current SVG icon preview
  const currentIconSvg = useMemo(() => {
    if (inferredMeta?.iconFound && inferredMeta.iconType === 'svg' && inferredMeta.iconPreviewContent) {
      return inferredMeta.iconPreviewContent;
    }
    return generateSvgIcon(pwaConfig.name, pwaConfig.themeColor, 192, selectedIconSymbol);
  }, [inferredMeta, pwaConfig.name, pwaConfig.themeColor, selectedIconSymbol]);

  // Standard ZIP Export
  const handleExportZip = async () => {
    if (nodes.length === 0) {
      alert('لا توجد ملفات في المشروع لتصديرها!');
      return;
    }

    try {
      setIsExporting(true);
      onAddLog('build', 'info', `بدء حزم وتصدير المشروع كملف ZIP (${exportOptions.fileName}.zip)...`);
      await exportProjectToZip(nodes, exportOptions);
      onAddLog('build', 'success', `تم تنزيل أرشيف المشروع بنجاح: ${exportOptions.fileName}.zip`);
      setSuccessFeedback(`تم تصدير ملف ZIP بنجاح!`);
      setTimeout(() => setSuccessFeedback(null), 4000);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل تصدير ZIP: ${err?.message || 'خطأ غير متوقع'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Convert and Modify the current loaded project directly in the Studio
  const handleApplyPWAToProject = () => {
    if (nodes.length === 0) {
      alert('يرجى إنشاء أو استيراد ملفات المشروع أولاً!');
      return;
    }

    try {
      setIsApplyingPWA(true);
      onAddLog('build', 'info', 'جاري تحويل المشروع الحالي إلى PWA وتعديل ملفات المشروع داخل الاستوديو...');

      const result = convertProjectToPWA(nodes, pwaConfig, currentIconSvg);
      setNodes(result.updatedNodes);

      onAddLog('build', 'success', `تم إنشاء ملفات PWA: ${result.createdFiles.join(', ')}`);
      if (result.updatedFiles.length > 0) {
        onAddLog('build', 'info', `تم تعديل وتحديث: ${result.updatedFiles.join(', ')}`);
      }
      onAddLog('build', 'success', 'أصبح المشروع الآن تطبيق ويب تقدمي (PWA) حقيقي جاهز للتثبيت والمعاينة!');

      // Select index.html or manifest.json in editor
      if (onSelectFile) {
        const manifest = findNodeByPath(result.updatedNodes, 'manifest.json');
        if (manifest) onSelectFile(manifest);
      }

      setSuccessFeedback('تم تحويل المشروع وتحديث ملفاته في الاستوديو بنجاح!');
      setTimeout(() => setSuccessFeedback(null), 5000);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل تحويل المشروع إلى PWA: ${err?.message}`);
    } finally {
      setIsApplyingPWA(false);
    }
  };

  // Convert to PWA and Export as ZIP immediately
  const handleConvertAndExportPWA = async () => {
    handleApplyPWAToProject();

    try {
      setIsExporting(true);
      const pwaZipOptions: ExportOptions = {
        ...exportOptions,
        fileName: `${pwaConfig.shortName || 'pwa-app'}-pwa-ready`
      };
      await exportProjectToZip(nodes, pwaZipOptions);
      onAddLog('build', 'success', 'تم تنزيل حزمة PWA الكاملة كأرشيف ZIP.');
    } catch (err: any) {
      onAddLog('build', 'error', `فشل تصدير حزمة PWA: ${err?.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section 
      id="section-export" 
      className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 sm:p-6 shadow-sm transition-all scroll-mt-6"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-[4px] bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 flex items-center justify-center font-mono font-bold text-xs">
            5
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#3b82f6]" />
              <span>التصدير وهُوِيّة PWA للمشروع</span>
            </h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              استنتاج أيقونة وهوية المشروع المحمّل تلقائياً، تعديل المشروع ليصبح PWA حقيقي، وتصدير الحزم كأرشيف ZIP
            </p>
          </div>
        </div>

        {successFeedback && (
          <div className="badge-green flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" />
            <span>{successFeedback}</span>
          </div>
        )}
      </div>

      {/* شريط الارتباط المباشر والتنقل بين أقسام المشروع */}
      <div className="mt-3 py-2 px-3 bg-[#0b1120] border border-[#334155] rounded-[6px] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>ترابط قسم PWA مع باقي أقسام الاستوديو:</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => document.getElementById('section-structure')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-[11px]"
            title="الانتقال إلى القسم 1"
          >
            1. مدخل الهيكل والمشاريع
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('section-filemanager')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-[11px]"
            title="الانتقال إلى القسم 2"
          >
            2. شجرة الملفات
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('section-codeeditor')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-[11px]"
            title="الانتقال إلى القسم 3"
          >
            3. محرر الكود
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('section-preview')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 transition cursor-pointer font-bold text-[11px] flex items-center gap-1"
            title="الانتقال إلى القسم 4"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>4. المعاينة والتشغيل المباشر</span>
          </button>
        </div>
      </div>

      {/* PWA COMPLIANCE AUDIT STATUS BAR */}
      <div className="mt-4 p-4 bg-[#0f172a] border border-[#334155] rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              جاهزية المشروع لمعايير PWA العالمية:
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
              complianceReport.score >= 90 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : complianceReport.score >= 40
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {complianceReport.score}% مكتمل
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyPWAToProject}
              disabled={isApplyingPWA}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              {isApplyingPWA ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              <span>تحويل وتطبيق PWA على المشروع الآن ⚡</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('section-preview');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer"
              title="معاينة التطبيق في القسم 4"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة PWA</span>
            </button>
          </div>
        </div>

        {/* Audit Checklist Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
          <div className={`p-2 rounded border flex items-center gap-1.5 ${complianceReport.hasManifest ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 ${complianceReport.hasManifest ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>ملف manifest.json</span>
          </div>

          <div className={`p-2 rounded border flex items-center gap-1.5 ${complianceReport.hasServiceWorker ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 ${complianceReport.hasServiceWorker ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Service Worker (sw.js)</span>
          </div>

          <div className={`p-2 rounded border flex items-center gap-1.5 ${complianceReport.hasIcons192 && complianceReport.hasIcons512 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 ${complianceReport.hasIcons192 && complianceReport.hasIcons512 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>أيقونات 192 و 512</span>
          </div>

          <div className={`p-2 rounded border flex items-center gap-1.5 ${complianceReport.hasMetaThemeColor ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 ${complianceReport.hasMetaThemeColor ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>وسم theme-color</span>
          </div>

          <div className={`p-2 rounded border flex items-center gap-1.5 ${complianceReport.hasAppleTouchIcon ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 ${complianceReport.hasAppleTouchIcon ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>أيقونة Apple Touch</span>
          </div>

          <div className={`p-2 rounded border flex items-center gap-1.5 ${complianceReport.hasSwRegistration ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 ${complianceReport.hasSwRegistration ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>زر تثبيت تفاعلي بالصفحة</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Icon Inference & Settings vs Export Suite */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Icon Inference & Identity Engine (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-[#334155] rounded-[6px] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="font-bold text-sm sm:text-base text-white">استنتاج أيقونة وهوية المشروع</h3>
              </div>
              {inferredMeta?.iconFound ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  تم استنتاجها من الملفات
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  مولدة تلقائياً
                </span>
              )}
            </div>

            {/* Inferred Icon Visual Stage */}
            <div className="p-4 bg-[#080d1a] border border-[#334155] rounded-xl flex items-center gap-4 mb-4">
              <div 
                className="w-20 h-20 rounded-2xl shadow-lg border border-white/20 shrink-0 overflow-hidden flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: currentIconSvg }}
              />
              <div className="text-xs space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>أيقونة PWA المستنتجة</span>
                  <span className="text-[10px] text-emerald-400 font-mono">192x192 & 512x512</span>
                </div>
                <p className="text-[#94a3b8] text-[11px] leading-relaxed">
                  {inferredMeta?.iconSource 
                    ? `مستنتجة من: ${inferredMeta.iconSource}` 
                    : `تم توليدها تلقائياً لمشروع "${pwaConfig.name}" مع حواف مدورة ومعايير maskable.`}
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                  <span>اللون: <code className="text-blue-400">{pwaConfig.themeColor}</code></span>
                  <span>•</span>
                  <span>الخلفية: <code className="text-slate-300">{pwaConfig.backgroundColor}</code></span>
                </div>
              </div>
            </div>

            {/* Custom Symbol Selector (if generated) */}
            <div className="space-y-2 mb-4">
              <label className="block text-xs text-[#94a3b8] font-medium">
                رمز الأيقونة السريع (أيقونات PWA تفاعلية):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['⚡', '📱', '🚀', '🛍️', '📊', '📋', '🎮', '💼', '🔒', '💡'].map(symbol => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => setSelectedIconSymbol(symbol)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition cursor-pointer border ${
                      selectedIconSymbol === symbol
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/50 scale-105'
                        : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme & Background Colors */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">
                  لون السمة (Theme):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={pwaConfig.themeColor}
                    onChange={(e) => setPwaConfig(p => ({ ...p, themeColor: e.target.value }))}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={pwaConfig.themeColor}
                    onChange={(e) => setPwaConfig(p => ({ ...p, themeColor: e.target.value }))}
                    className="w-full bg-[#0b1120] text-white font-mono text-[11px] p-1.5 rounded border border-slate-700 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">
                  لون البداية (Splash):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={pwaConfig.backgroundColor}
                    onChange={(e) => setPwaConfig(p => ({ ...p, backgroundColor: e.target.value }))}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={pwaConfig.backgroundColor}
                    onChange={(e) => setPwaConfig(p => ({ ...p, backgroundColor: e.target.value }))}
                    className="w-full bg-[#0b1120] text-white font-mono text-[11px] p-1.5 rounded border border-slate-700 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#334155]">
            <button
              type="button"
              onClick={handleApplyPWAToProject}
              disabled={isApplyingPWA}
              className="w-full py-2.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow cursor-pointer"
            >
              {isApplyingPWA ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              <span>تحديث ملفات المشروع لتصبح PWA حقيقي ⚡</span>
            </button>
          </div>
        </div>

        {/* Right Column: PWA Config & ZIP Export Suite (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-[#334155] rounded-[6px] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="font-bold text-sm sm:text-base text-white">بيانات Manifest وخيارات التصدير</h3>
              </div>
              <span className="badge-green text-[11px] px-2 py-0.5 rounded-[4px] font-medium">
                PWA + ZIP
              </span>
            </div>

            {/* PWA Manifest Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">
                  اسم التطبيق الكامل:
                </label>
                <input
                  type="text"
                  value={pwaConfig.name}
                  onChange={(e) => setPwaConfig(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[#0b1120] text-[#f8fafc] text-xs p-2 rounded border border-[#334155] focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">
                  الاسم المختصر (تحت الأيقونة بالهاتف):
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={pwaConfig.shortName}
                  onChange={(e) => setPwaConfig(p => ({ ...p, shortName: e.target.value }))}
                  className="w-full bg-[#0b1120] text-[#f8fafc] text-xs p-2 rounded border border-[#334155] focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#94a3b8] font-medium mb-1">
                  الوصف التعريفي للتطبيق:
                </label>
                <input
                  type="text"
                  value={pwaConfig.description}
                  onChange={(e) => setPwaConfig(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#0b1120] text-[#f8fafc] text-xs p-2 rounded border border-[#334155] focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">
                  اسم ملف الأرشيف (.zip):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={exportOptions.fileName}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, fileName: e.target.value }))}
                    className="flex-1 bg-[#0b1120] text-white font-mono text-xs p-2 rounded border border-[#334155] focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                  <span className="text-slate-400 font-mono text-xs">.zip</span>
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">
                  نمط العرض (Display Mode):
                </label>
                <select
                  value={pwaConfig.display}
                  onChange={(e) => setPwaConfig(p => ({ ...p, display: e.target.value as any }))}
                  className="w-full bg-[#0b1120] text-[#f8fafc] text-xs p-2 rounded border border-[#334155] focus:border-blue-500 outline-none"
                >
                  <option value="standalone">مستقل كامل بدون أشرطة متصفح (Standalone)</option>
                  <option value="fullscreen">شاشة كاملة (Fullscreen)</option>
                  <option value="minimal-ui">واجهة بسيطة (Minimal UI)</option>
                </select>
              </div>
            </div>

            {/* ZIP Options Checkboxes */}
            <div className="p-3 bg-[#080d1a] border border-[#334155] rounded-lg text-xs flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[#94a3b8] hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exportOptions.excludeNodeModules}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, excludeNodeModules: e.target.checked }))}
                  className="accent-blue-500 rounded cursor-pointer w-3.5 h-3.5"
                />
                <span>استبعاد مجلدات <code>node_modules</code></span>
              </label>

              <label className="flex items-center gap-2 text-[#94a3b8] hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exportOptions.excludeGit}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, excludeGit: e.target.checked }))}
                  className="accent-blue-500 rounded cursor-pointer w-3.5 h-3.5"
                />
                <span>استبعاد مجلدات <code>.git</code></span>
              </label>
            </div>
          </div>

          {/* Action Buttons: ZIP Export, Convert+Export, and GitHub Push */}
          <div className="mt-4 pt-3.5 border-t border-[#334155] flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="btn-export-zip"
              type="button"
              disabled={isExporting}
              onClick={handleExportZip}
              className="w-full sm:flex-1 py-2.5 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>تصدير ZIP عادي</span>
            </button>

            <button
              id="btn-convert-export-pwa"
              type="button"
              disabled={isExporting || isApplyingPWA}
              onClick={handleConvertAndExportPWA}
              className="w-full sm:flex-1 py-2.5 rounded-[4px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow cursor-pointer"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              <span>تصدير حزمة PWA كاملة (ZIP) 🚀</span>
            </button>

            <button
              id="btn-push-github"
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="w-full sm:flex-1 py-2.5 rounded-[4px] bg-[#1e293b] hover:bg-[#334155] text-white border border-[#475569] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow cursor-pointer"
            >
              <Github className="w-4 h-4 text-white" />
              <span>رفع إلى GitHub 🚀</span>
            </button>
          </div>
        </div>

      </div>

      {/* GitHub Integration Modal */}
      <GitHubIntegrationModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        nodes={nodes}
        onAddLog={onAddLog}
      />
    </section>
  );
};
