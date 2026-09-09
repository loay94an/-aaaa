import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ExternalLink, 
  RefreshCw, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Cpu, 
  Layers, 
  Copy, 
  Check, 
  Play, 
  Server
} from 'lucide-react';
import { FileNode, LogCategory, LogLevel } from '../types';
import { getAllFiles } from '../utils/treeParser';
import { DEFAULT_HTML_APP_TEMPLATE } from '../utils/defaultHtmlTemplate';
import { buildProjectPreviewHtml } from '../utils/virtualBundler';
import { 
  analyzeProjectArchitecture, 
  applyAiDeveloperFix, 
  generateAiConsultationPrompt, 
  RepairResult 
} from '../utils/projectAutoRepair';
import { NodeEnvironmentSimulator } from './NodeEnvironmentSimulator';
import { NetworkInterceptorMonitor } from './NetworkInterceptorMonitor';

interface Section4AnalysisAndPreviewProps {
  nodes: FileNode[];
  setNodes?: React.Dispatch<React.SetStateAction<FileNode[]>>;
  activeFile?: FileNode | null;
  selectedFileId?: string | null;
  onSelectFile?: (file: FileNode) => void;
  logs?: any[];
  onAddLog: (category: LogCategory, level: LogLevel, message: string) => void;
  onClearLogs?: (category?: LogCategory) => void;
  setSelectedFileId?: (id: string | null) => void;
}

export const Section4AnalysisAndPreview: React.FC<Section4AnalysisAndPreviewProps> = ({
  nodes,
  setNodes,
  activeFile,
  onAddLog
}) => {
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>('');
  const [previewKey, setPreviewKey] = useState<number>(1);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [repairReport, setRepairReport] = useState<RepairResult | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // نافذة مطور الذكاء الاصطناعي وخبير أنظمة التشغيل
  const [isExpertModalOpen, setIsExpertModalOpen] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<'diagnosis' | 'strategy' | 'resources' | 'prompt'>('diagnosis');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const onAddLogRef = useRef(onAddLog);
  onAddLogRef.current = onAddLog;

  // تحليل المشروع معمارياً عبر خبير الأنظمة والذكاء الاصطناعي
  const analysis = useMemo(() => analyzeProjectArchitecture(nodes), [nodes]);

  // مزامنة الاستراتيجية والموارد الموصى بها عند تغيير المشروع
  useEffect(() => {
    setSelectedStrategy(analysis.recommendedStrategyId);
    setSelectedResources(prev => {
      const next = analysis.missingResources.filter(r => r.isRecommended).map(r => r.id);
      if (prev.length === next.length && prev.every((id, idx) => id === next[idx])) {
        return prev;
      }
      return next;
    });
  }, [analysis.recommendedStrategyId, analysis.missingResources]);

  // استماع للرسائل المنبثقة من إطار المعاينة لتسجيل أحداث التشغيل
  useEffect(() => {
    const handlePreviewMsg = (event: MessageEvent) => {
      if (event.data && event.data.type === 'preview-runtime-log') {
        if (onAddLogRef.current) {
          onAddLogRef.current('runtime', event.data.level || 'info', `[معاينة التطبيق]: ${event.data.message}`);
        }
      }
    };
    window.addEventListener('message', handlePreviewMsg);
    return () => window.removeEventListener('message', handlePreviewMsg);
  }, []);

  // تجميع ومعالجة كود المعاينة لتشغيل أي مشروع أو ملف مرفوع
  const handleLaunchPreview = useCallback(() => {
    try {
      const files = getAllFiles(nodes);
      const result = buildProjectPreviewHtml(files, {
        activeFile: activeFile || null,
        selectedFileId: activeFile?.id || null
      });

      setPreviewSrcDoc(result.html);
      setPreviewKey(prev => prev + 1);
      if (onAddLogRef.current) {
        onAddLogRef.current(
          'build', 
          'success', 
          `تم تحديث ومعاينة المشروع بنجاح ⚡ (${result.entryName} • ${files.length} ملف)`
        );
      }
    } catch (err: any) {
      console.error('[Preview Runner Error]:', err);
      if (onAddLogRef.current) {
        onAddLogRef.current('build', 'error', `فشل في تشغيل المعاينة: ${err?.message || err}. انقر على أيقونة المفك 🔧 لاستشارة خبير الأنظمة وإصلاح المعاينة.`);
      }
      setPreviewSrcDoc(DEFAULT_HTML_APP_TEMPLATE);
      setPreviewKey(prev => prev + 1);
    }
  }, [nodes, activeFile]);

  // تطبيق إصلاحات خبير الأنظمة ومطور الذكاء الاصطناعي فورياً
  const handleApplyExpertRepair = (strategyToUse?: string) => {
    setIsRepairing(true);
    try {
      const strat = strategyToUse || selectedStrategy || analysis.recommendedStrategyId;
      const result = applyAiDeveloperFix(nodes, strat, selectedResources);
      
      // تحديث شجرة الملفات بالنسخة المصححة والمجهزة
      if (setNodes && result.repairedNodes) {
        setNodes(result.repairedNodes);
      }

      setRepairReport(result);
      setIsExpertModalOpen(false);

      // تشغيل المعاينة بالكود المصلح فورياً
      const files = getAllFiles(result.repairedNodes);
      const previewRes = buildProjectPreviewHtml(files, {
        activeFile: null,
        selectedFileId: null
      });

      setPreviewSrcDoc(previewRes.html);
      setPreviewKey(prev => prev + 1);

      onAddLog('build', 'success', `[إصلاح خبير الأنظمة والمفك 🔧]: ${result.summary}`);
    } catch (err: any) {
      console.error('[Repair Error]:', err);
      onAddLog('build', 'error', `حدث خطأ أثناء إصلاح المشروع: ${err?.message || err}`);
    } finally {
      setIsRepairing(false);
    }
  };

  // نسخ تقرير المشروع واستشارة مطور الذكاء الاصطناعي
  const handleCopyAiPrompt = () => {
    try {
      const promptText = generateAiConsultationPrompt(nodes, analysis);
      navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
      onAddLog('system', 'success', 'تم نسخ تقرير تحليل المشروع بنجاح 📋 يمكنك الآن إرساله لمطور الذكاء الاصطناعي في المحادثة.');
    } catch (err: any) {
      onAddLog('system', 'error', `تعذر النسخ للحافظة: ${err?.message || err}`);
    }
  };

  // تبديل اختيار مورد إضافي
  const toggleResource = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) ? prev.filter(id => id !== resourceId) : [...prev, resourceId]
    );
  };

  // فتح المعاينة في نافذة أو تبويب متصفح مستقل
  const handleOpenInNewTab = () => {
    try {
      const htmlContent = previewSrcDoc || DEFAULT_HTML_APP_TEMPLATE;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      onAddLog('runtime', 'success', 'تم فتح تشغيل المشروع في متصفح مستقل 🌐');
    } catch (err: any) {
      onAddLog('runtime', 'error', `تعذر فتح المعاينة في المتصفح: ${err?.message || err}`);
    }
  };

  // تحديث المعاينة تلقائياً عند رفع مشروع أو تعديل أي ملف في المشروع
  useEffect(() => {
    handleLaunchPreview();
  }, [handleLaunchPreview]);

  return (
    <section id="section-preview" className="space-y-3 scroll-mt-6">
      {/* شريط رأس القسم: العنوان وأزرار التحكم */}
      <div className="flex items-center justify-between gap-3 bg-[#0b1120] px-4 py-3 rounded-[8px] border border-[#334155]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-white">
            القسم 4: نافذة معاينة وتشغيل المشاريع
          </h2>
          <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
            {analysis.archetypeTitle}
          </span>
        </div>

        {/* أزرار التحكم: المتصفح، التحديث، وزر المفك الذكي */}
        <div className="flex items-center gap-2">
          {/* زر المفك الذكي (أيقونة فقط ومصغر) */}
          <button
            type="button"
            onClick={() => setIsExpertModalOpen(true)}
            className="p-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-[4px] flex items-center justify-center cursor-pointer transition shadow-md border border-amber-400/40 hover:scale-105 active:scale-95"
            title="إصلاح وتشغيل المشروع: استشارة مطور الذكاء الاصطناعي وتغيير طريقة المعاينة وحقن الموارد"
            aria-label="المفك الذكي لإصلاح وتشغيل المشروع"
          >
            <Wrench className="w-4 h-4 text-amber-100" />
          </button>

          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-[4px] font-bold flex items-center gap-1.5 cursor-pointer transition text-xs shadow-xs"
            title="فتح نافذة المعاينة وتشغيل التطبيق في نافذة أو تبويب متصفح مستقل"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>متصفح</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchPreview}
            className="px-3 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-[4px] font-medium flex items-center gap-1.5 cursor-pointer transition text-xs shadow-xs"
            title="معاينة وتحديث الملفات والمشاريع المرفوعة"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* نافذة مطور الذكاء الاصطناعي وخبير أنظمة التشغيل (Modal) */}
      {isExpertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-right">
            {/* رأس النافذة */}
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-lg">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>مطور الذكاء الاصطناعي وخبير أنظمة التشغيل</span>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded-full font-mono">
                      AI OS Expert
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تشخيص أسباب عدم عمل المعاينة، تغيير طريقة التشغيل، وحقن الموارد الناقصة فورياً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpertModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* بطاقة ملخص بنية المشروع */}
            <div className="bg-slate-950/60 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">البنية المعمارية:</span>
                <span className="font-bold text-blue-400">{analysis.archetypeTitle}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{analysis.totalFiles} ملف</span>
              </div>
              {analysis.detectedDependencies.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>الحزم:</span>
                  <div className="flex flex-wrap gap-1">
                    {analysis.detectedDependencies.slice(0, 4).map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">
                        {d}
                      </span>
                    ))}
                    {analysis.detectedDependencies.length > 4 && (
                      <span className="text-slate-500">+{analysis.detectedDependencies.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ألسنة التبويب داخل النافذة */}
            <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveModalTab('diagnosis')}
                className={`py-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeModalTab === 'diagnosis'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>التشخيص وأسباب الخلل ({analysis.diagnostics.length})</span>
              </button>

              <button
                onClick={() => setActiveModalTab('strategy')}
                className={`py-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeModalTab === 'strategy'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>تغيير طريقة المعاينة والتشغيل</span>
              </button>

              <button
                onClick={() => setActiveModalTab('resources')}
                className={`py-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeModalTab === 'resources'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>إضافة موارد جديدة ({selectedResources.length})</span>
              </button>

              <button
                onClick={() => setActiveModalTab('prompt')}
                className={`py-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeModalTab === 'prompt'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>استشارة المطور الذكي في المحادثة</span>
              </button>
            </div>

            {/* محتوى التبويبات */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {/* تبويب 1: التشخيص وأسباب الخلل */}
              {activeModalTab === 'diagnosis' && (
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <div className="font-bold text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>أسباب عدم عمل المعاينة التي رصدها خبير الأنظمة:</span>
                    </div>
                    {analysis.diagnostics.length === 0 ? (
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        لم يتم رصد مشاكل برمجية حرجة في هيكل الملفات. يمكنك النقر على «إصلاح فوري وتشغيل» لإعادة مزامنة الملفات وتحديث نافذة العرض.
                      </p>
                    ) : (
                      <ul className="space-y-2 pr-4 list-disc text-slate-300 text-[11px]">
                        {analysis.diagnostics.map((diag, i) => (
                          <li key={i} className="leading-relaxed font-mono">{diag}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-blue-200 text-[11px] leading-relaxed flex items-start gap-2.5">
                    <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">توصية مطور الذكاء الاصطناعي:</span>
                      يوصي النظام بتطبيق استراتيجية <strong className="text-amber-300">«{analysis.availableStrategies.find(s => s.id === analysis.recommendedStrategyId)?.name}»</strong> مع حقن الموارد المناسبة لتشغيل هذا النوع من المشاريع فورياً.
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب 2: تغيير طريقة المعاينة والتشغيل */}
              {activeModalTab === 'strategy' && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[11px]">
                    اختر بيئة ومحرك التشغيل الملائم لبنية ملفات مشروعك:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {analysis.availableStrategies.map(strat => {
                      const isSelected = selectedStrategy === strat.id;
                      return (
                        <div
                          key={strat.id}
                          onClick={() => setSelectedStrategy(strat.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{strat.name}</span>
                              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-300 rounded">
                                {strat.badge}
                              </span>
                              {strat.isRecommended && (
                                <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 rounded font-bold">
                                  موصى به ⭐
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {strat.description}
                            </p>
                          </div>
                          <div className="pt-0.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* تبويب 3: إضافة موارد وحزم جديدة */}
              {activeModalTab === 'resources' && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-[11px]">
                    حدد الموارد والمكتبات التي ترغب في حقنها وتضمينها لتشغيل هذا النوع من المشاريع:
                  </p>
                  <div className="space-y-2">
                    {analysis.missingResources.map(res => {
                      const isChecked = selectedResources.includes(res.id);
                      return (
                        <label
                          key={res.id}
                          onClick={() => toggleResource(res.id)}
                          className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition ${
                            isChecked
                              ? 'bg-blue-500/10 border-blue-500/50'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 rounded accent-blue-500 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{res.name}</span>
                              <span className="px-1.5 py-0.2 text-[9px] bg-slate-800 text-slate-400 rounded font-mono">
                                {res.category}
                              </span>
                              {res.isRecommended && (
                                <span className="text-[9px] text-amber-400 font-bold">ضروري</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {res.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* تبويب 4: استشارة المطور الذكي في المحادثة */}
              {activeModalTab === 'prompt' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        تقرير استشارة مطور الذكاء الاصطناعي وخبير أنظمة التشغيل:
                      </span>
                      <button
                        onClick={handleCopyAiPrompt}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPrompt ? 'تم النسخ!' : 'نسخ التقرير'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      يمكنك نسخ هذا التقرير ولصقه في المحادثة معي هنا مباشرة، ليقوم المطور الذكي بفحص الكود وإصلاح الخلل أو إعادة كتابته حسب رغبتك.
                    </p>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-300 max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                      {generateAiConsultationPrompt(nodes, analysis)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* شريط الإجراءات في أسفل النافذة */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAiPrompt}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition border border-slate-700"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'تم نسخ التقرير بنجاح ✅' : 'نسخ تقرير المشروع 📋'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpertModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white rounded text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyExpertRepair()}
                  disabled={isRepairing}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />
                  <span>تطبيق الإصلاح وتشغيل المعاينة فورياً ⚡</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* بطاقة تقرير الفحص والإصلاح تظهر عند النقر على أيقونة المفك */}
      {repairReport && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-[8px] p-3 text-xs shadow-lg space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-500/20 text-amber-400 rounded">
                <Wrench className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-white">تقرير فحص وتشخيص المشروع وإصلاح المعاينة:</span>
            </div>
            <button
              onClick={() => setRepairReport(null)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="إغلاق التقرير"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {/* المشاكل التي تم تشخيصها */}
            <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>أسباب عدم عمل المعاينة (التشخيص):</span>
              </div>
              <ul className="space-y-1 text-slate-300 pr-3 list-disc">
                {repairReport.issuesFound.map((issue, idx) => (
                  <li key={idx} className="leading-relaxed">{issue}</li>
                ))}
              </ul>
            </div>

            {/* الإصلاحات التي تم تنفيذها */}
            <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80 space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>الإصلاحات البرمجية التي تم تطبيقها:</span>
              </div>
              <ul className="space-y-1 text-slate-300 pr-3 list-disc">
                {repairReport.fixesApplied.map((fix, idx) => (
                  <li key={idx} className="leading-relaxed">{fix}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 p-2 rounded text-[11px] text-emerald-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {repairReport.summary}
            </span>
            <button
              onClick={() => setRepairReport(null)}
              className="px-2 py-0.5 bg-emerald-700/40 hover:bg-emerald-700 text-white rounded text-[10px] cursor-pointer transition"
            >
              تم الفهم
            </button>
          </div>
        </div>
      )}

      {/* محاكي بيئة Node.js لحقن كائنات process و Buffer فور تحميل المشروع */}
      <NodeEnvironmentSimulator
        iframeRef={iframeRef}
        nodes={nodes}
        previewKey={previewKey}
        onAddLog={onAddLog}
      />

      {/* معترض طلبات الشبكة (Network Interceptor) للرد على طلبات /api ومحاكاة الخوادم */}
      <NetworkInterceptorMonitor
        iframeRef={iframeRef}
        previewKey={previewKey}
        onAddLog={onAddLog}
      />

      {/* نافذة عرض وتشغيل التطبيقات والمشاريع مباشرة (IFrame) */}
      <div className="w-full bg-[#050914] p-1.5 sm:p-2 rounded-[8px] border border-[#334155] overflow-hidden">
        <iframe
          ref={iframeRef}
          key={previewKey}
          srcDoc={previewSrcDoc}
          title="نافذة تشغيل ومعاينة المشروع"
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups allow-downloads"
          className="w-full min-h-[580px] h-[680px] sm:h-[740px] border-0 bg-white rounded-[4px]"
        />
      </div>
    </section>
  );
};

