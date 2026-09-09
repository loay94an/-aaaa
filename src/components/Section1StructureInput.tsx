import React, { useRef, useState } from 'react';
import { 
  FolderTree, 
  Upload, 
  FilePlus, 
  Play, 
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Archive,
  RefreshCw,
  Eye,
  ChevronDown,
  Search,
  X,
  ExternalLink,
  Code,
  Terminal,
  Activity,
  Github
} from 'lucide-react';
import { GitHubIntegrationModal } from './GitHubIntegrationModal';
import { COMPLETE_PRESETS, SAMPLE_PROJECTS } from '../utils/sampleProjects';
import { importFolderFiles, importZipFile } from '../utils/zipUtils';
import { FileNode } from '../types';
import { inspectAndAutoPrepareProject, ProjectInspectionReport } from '../utils/projectInspector';
import { serializeTreeToText } from '../utils/treeParser';

interface Section1Props {
  nodes?: FileNode[];
  treeInputText: string;
  setTreeInputText: (val: string) => void;
  onBuildTree: (text: string) => void;
  onCreateEmptyProject: () => void;
  onImportNodes: (nodes: FileNode[], sourceName: string) => void;
  onLoadPreset?: (presetId: string, scrollToPreview?: boolean) => void;
  onAddLog: (category: 'build' | 'runtime' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export const Section1StructureInput: React.FC<Section1Props> = ({
  nodes = [],
  treeInputText,
  setTreeInputText,
  onBuildTree,
  onCreateEmptyProject,
  onImportNodes,
  onLoadPreset,
  onAddLog
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('analytics-suite');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProjectsDropdown, setShowProjectsDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadReport, setUploadReport] = useState<ProjectInspectionReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const directFilesInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (presetId: string, autoBuild = false) => {
    const found = COMPLETE_PRESETS.find(p => p.id === presetId) || SAMPLE_PROJECTS.find(p => p.id === presetId);
    if (found) {
      setSelectedPreset(presetId);
      setTreeInputText(found.treeText);
      setStatusFeedback(`تم اختيار مشروع: ${found.name}`);
      setTimeout(() => setStatusFeedback(null), 3500);

      if (autoBuild && onLoadPreset) {
        onLoadPreset(found.id, true);
      } else if (autoBuild) {
        onBuildTree(found.treeText);
        onAddLog('build', 'success', `تم بناء قالب "${found.name}" بنجاح وجاهز للمعاينة الفورية.`);
      }
      setShowProjectsDropdown(false);
    }
  };

  // Upload structure text file (.txt, .json, .yaml)
  const handleStructureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setTreeInputText(content);
      onAddLog('build', 'info', `تم استيراد ملف الهيكل: ${file.name} (${file.size} بايت)`);
      setStatusFeedback(`تم تحميل محتوى ملف ${file.name}`);
      setTimeout(() => setStatusFeedback(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Upload direct code files (e.g. .html, .css, .js, etc.)
  const handleDirectFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFileList(Array.from(files));
    e.target.value = '';
  };

  // Process array of raw Files (from input or drag & drop)
  const processFileList = async (fileList: File[]) => {
    try {
      setIsProcessing(true);
      onAddLog('build', 'info', `جاري استيراد ومراقبة ${fileList.length} ملف برمجي...`);

      const rootFolderId = `folder_${Date.now()}`;
      const childrenNodes: FileNode[] = [];

      for (const f of fileList) {
        // If user uploaded a zip by mistake, delegate to zip handler
        if (f.name.endsWith('.zip')) {
          const zipNodes = await importZipFile(f);
          const { preparedNodes, report } = inspectAndAutoPrepareProject(zipNodes, f.name);
          onImportNodes(preparedNodes, f.name);
          setUploadReport(report);
          onAddLog('build', 'success', `[مراقب المشاريع]: ${report.summaryText}`);
          return;
        }

        const text = await f.text();
        childrenNodes.push({
          id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: f.name,
          type: 'file',
          path: `my-project/${f.name}`,
          content: text,
          isOpen: false,
          isSaved: true,
          parentId: rootFolderId
        });
      }

      const rootNode: FileNode = {
        id: rootFolderId,
        name: 'my-project',
        type: 'folder',
        path: 'my-project',
        isOpen: true,
        children: childrenNodes,
        parentId: null
      };

      // Auto-inspect and ensure runnable entry point
      const { preparedNodes, report } = inspectAndAutoPrepareProject([rootNode], fileList.length === 1 ? fileList[0].name : 'المشروع المرفوع');
      onImportNodes(preparedNodes, fileList.length === 1 ? fileList[0].name : 'المشروع المستورد');
      setUploadReport(report);

      // Update tree text
      const treeLines = ['my-project/'];
      childrenNodes.forEach((c, idx) => {
        const isLast = idx === childrenNodes.length - 1;
        treeLines.push(`${isLast ? '└── ' : '├── '}${c.name}`);
      });
      setTreeInputText(treeLines.join('\n'));

      setStatusFeedback(`تم رفع وفحص ${fileList.length} ملف بنجاح (جاهز للمعاينة الفورية 100%)`);
      onAddLog('build', 'success', `[مراقب المشاريع]: ${report.summaryText}`);
      if (report.wasAutoFixed && report.fixedMessage) {
        onAddLog('build', 'info', `[مراقب المشاريع]: ${report.fixedMessage}`);
      }
      setTimeout(() => setStatusFeedback(null), 4500);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل استيراد الملفات: ${err?.message || 'خطأ أثناء القراءة'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload ZIP project
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      onAddLog('build', 'info', `جاري استخراج وفحص ملف ZIP: ${file.name}...`);
      const extractedNodes = await importZipFile(file);
      const { preparedNodes, report } = inspectAndAutoPrepareProject(extractedNodes, file.name);
      onImportNodes(preparedNodes, file.name);
      setUploadReport(report);
      setTreeInputText(serializeTreeToText(preparedNodes));

      onAddLog('build', 'success', `[مراقب المشاريع]: تم استيراد وتحضير ${report.totalFiles} ملف من أرشيف ZIP بنجاح.`);
      if (report.wasAutoFixed && report.fixedMessage) {
        onAddLog('build', 'info', `[مراقب المشاريع]: ${report.fixedMessage}`);
      }
      setStatusFeedback(`تم استيراد وفحص مشروع ZIP بنجاح (${report.totalFiles} ملف جاهز للمعاينة الفورية)`);
      setTimeout(() => setStatusFeedback(null), 4500);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل استخراج ملف ZIP: ${err?.message || 'ملف غير صالح'}`);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Upload Folder (webkitdirectory)
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsProcessing(true);
      onAddLog('build', 'info', `جاري استيراد وفحص المجلد المحلي (${files.length} ملف)...`);
      const importedNodes = await importFolderFiles(files);
      const folderName = files[0].webkitRelativePath ? files[0].webkitRelativePath.split('/')[0] : 'المجلد المستورد';
      
      const { preparedNodes, report } = inspectAndAutoPrepareProject(importedNodes, folderName);
      onImportNodes(preparedNodes, folderName);
      setUploadReport(report);
      setTreeInputText(serializeTreeToText(preparedNodes));

      onAddLog('build', 'success', `[مراقب المشاريع]: ${report.summaryText}`);
      if (report.wasAutoFixed && report.fixedMessage) {
        onAddLog('build', 'info', `[مراقب المشاريع]: ${report.fixedMessage}`);
      }
      setStatusFeedback(`تم استيراد المجلد: ${folderName} وجاهز للمعاينة 100%`);
      setTimeout(() => setStatusFeedback(null), 4500);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل استيراد المجلد: ${err?.message || 'خطأ غير متوقع'}`);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFileList(Array.from(files));
    }
  };

  // Filtered Presets for Dropdown Popup
  const filteredPresets = COMPLETE_PRESETS.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'Dashboard') return p.category.includes('Dashboard') || p.category.includes('Data');
    if (selectedCategory === 'E-Commerce') return p.category.includes('E-Commerce');
    if (selectedCategory === 'Productivity') return p.category.includes('Productivity') || p.category.includes('Communication');
    if (selectedCategory === 'PWA') return p.category.includes('Gaming') || p.category.includes('PWA');
    if (selectedCategory === 'Frameworks') return p.category.includes('Frameworks') || p.category.includes('Backend') || p.category.includes('Python') || p.category.includes('DevOps');
    return true;
  });

  const lineCount = treeInputText ? treeInputText.split('\n').length : 0;

  return (
    <section 
      id="section-structure" 
      className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 sm:p-6 shadow-sm transition-all scroll-mt-6 relative"
    >
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleStructureFileUpload} 
        accept=".txt,.json,.yaml,.yml,.md" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={directFilesInputRef} 
        onChange={handleDirectFilesUpload} 
        multiple 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={zipInputRef} 
        onChange={handleZipUpload} 
        accept=".zip" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        onChange={handleFolderUpload} 
        // @ts-ignore
        webkitdirectory="true" 
        // @ts-ignore
        directory="true" 
        multiple 
        className="hidden" 
      />

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-[4px] bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 flex items-center justify-center font-mono font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#3b82f6]" />
              <span>مدخل الهيكل وإنشاء ورفع المشاريع</span>
            </h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              رفع ملفات أو أرشيف ZIP لأي مشروع، فحص وتجهيز نقطة الدخول، أو اختيار مشروع حقيقي جاهز للتشغيل من القائمة المنبثقة
            </p>
          </div>
        </div>

        {/* PRIMARY POPUP DROPDOWN TRIGGER BUTTON FOR READY-TO-RUN PROJECTS */}
        <div className="relative flex items-center gap-2">
          <button
            id="btn-presets-dropdown"
            type="button"
            onClick={() => setShowProjectsDropdown(prev => !prev)}
            className="px-4 py-2 rounded-[6px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-md shadow-blue-500/20 border border-blue-400/40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>المشاريع والهياكل الجاهزة القابلة للتشغيل</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-normal">
              {COMPLETE_PRESETS.length} مشاريع كاملة
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProjectsDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Active Feedback Badge */}
          {statusFeedback && (
            <div className="badge-green flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>{statusFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL / DROPDOWN FOR READY-TO-RUN PROJECTS */}
      {showProjectsDropdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-[#334155] rounded-xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#334155] bg-[#1e293b]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>مكتبة المشاريع والتطبيقات الجاهزة للتشغيل والاختبار</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      مشاريع حقيقية 100%
                    </span>
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    اختر أي مشروع لتحميل ملفاته الحقيقية كاملة واختباره فورياً داخل إطار المعاينة الحية
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectsDropdown(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls: Search & Category Tabs */}
            <div className="p-4 border-b border-[#334155] bg-[#0b1120] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في المشاريع الجاهزة (اسم المشروع، التقنية، الفئة)..."
                  className="w-full bg-[#1e293b] text-white pr-9 pl-4 py-2 rounded-lg border border-slate-700 text-xs focus:border-blue-500 outline-none"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    مسح
                  </button>
                )}
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'all', label: `كافة المشاريع (${COMPLETE_PRESETS.length})` },
                  { id: 'Dashboard', label: '📊 لوحات وتحليلات' },
                  { id: 'E-Commerce', label: '🛍️ متجر إلكتروني' },
                  { id: 'Productivity', label: '📋 كانبان ومحادثة' },
                  { id: 'PWA', label: '📱 PWA وألعاب' },
                  { id: 'Frameworks', label: '⚡ أطر عمل (React, Express, Python, Docker)' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white font-bold shadow'
                        : 'bg-[#1e293b] text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Cards Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              {filteredPresets.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm">لا توجد مشاريع تطابق البحث "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredPresets.map(preset => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#1e293b] border-blue-500 ring-1 ring-blue-500/50 shadow-lg'
                            : 'bg-[#131d31] border-[#2d3a4f] hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span>{preset.name}</span>
                            </h4>
                            {preset.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap font-medium">
                                {preset.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-2.5">
                            {preset.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {preset.files.length} ملفات حقيقية
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-blue-400 font-sans">{preset.category}</span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleApplyPreset(preset.id, false)}
                            className="px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                            title="تحميل كود الهيكل في مربع الإدخال"
                          >
                            تحميل الهيكل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPreset(preset.id, true)}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                            title="تحميل المشروع بالكامل وتشغيله فوراً في المعاينة"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>تشغيل واختبار المشروع ⚡</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#1e293b]/60 border-t border-[#334155] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>كافة المشاريع تتضمن أكواد كاملة ومربوطة بنظام المعاينة التفاعلي</span>
              </span>
              <button
                type="button"
                onClick={() => setShowProjectsDropdown(false)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD HEALTH MONITOR BANNER (Automatically inspects uploaded projects) */}
      {uploadReport && (
        <div className="mt-4 p-3.5 bg-[#080d1a] border border-emerald-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-white">مراقب صحة المشروع المرفوع: {uploadReport.projectName}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium font-mono">
                  جاهز للمعاينة 100%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                تم فحص {uploadReport.totalFiles} ملف • نقطة الدخول الرئيسية: <code className="text-emerald-300 font-mono font-bold">{uploadReport.entryPointPath}</code>
                {uploadReport.wasAutoFixed && <span className="text-amber-300 mr-2">({uploadReport.fixedMessage})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('section-preview');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>الانتقال للمعاينة والتشغيل ⚡</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadReport(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="إغلاق التقرير"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Upload Buttons Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => directFilesInputRef.current?.click()}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded-[4px] bg-[#0f172a] hover:bg-[#334155] text-white border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>رفع ملفات برمجية مباشرة (HTML, JS, CSS)</span>
        </button>

        <button
          type="button"
          onClick={() => zipInputRef.current?.click()}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded-[4px] bg-[#0f172a] hover:bg-[#334155] text-white border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>رفع أرشيف ZIP كامل</span>
        </button>

        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded-[4px] bg-[#0f172a] hover:bg-[#334155] text-white border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <FolderTree className="w-3.5 h-3.5 text-[#10b981]" />
          <span>رفع مجلد مشروع محلي</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-[4px] bg-[#0f172a] hover:bg-[#334155] text-white border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>استيراد نص الشجرة (.txt)</span>
        </button>

        <button
          type="button"
          onClick={() => setIsGitHubModalOpen(true)}
          className="px-3 py-1.5 rounded-[4px] bg-[#1e293b] hover:bg-[#334155] text-white border border-[#475569] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          title="تكامل مباشر مع مستودعات GitHub"
        >
          <Github className="w-3.5 h-3.5 text-white" />
          <span>التكامل مع GitHub 🚀</span>
        </button>

        <button
          type="button"
          onClick={onCreateEmptyProject}
          className="px-3 py-1.5 rounded-[4px] bg-[#0f172a] hover:bg-[#334155] text-[#94a3b8] hover:text-white border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer mr-auto"
        >
          <FilePlus className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>مشروع جديد فارغ</span>
        </button>
      </div>

      {/* Main Structure Textarea & Drag and Drop Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-4 relative rounded-[6px] border transition-all ${
          isDragOver 
            ? 'border-[#3b82f6] bg-[#3b82f6]/10 ring-2 ring-[#3b82f6]' 
            : 'border-[#334155] bg-[#0b1120]'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#334155] bg-[#0f172a] text-xs text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <span className="font-mono">مدخل الشجرة النصي:</span>
            <span className="font-mono text-[11px] text-slate-400">({lineCount} أسطر)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowProjectsDropdown(true)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>تغيير المشروع من المكتبة</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              يمكنك سحب وإفلات أي مجلد أو أرشيف ZIP هنا مباشرة
            </span>
          </div>
        </div>

        <textarea
          value={treeInputText}
          onChange={(e) => setTreeInputText(e.target.value)}
          placeholder={`my-project/\n├── index.html\n├── styles.css\n└── app.js`}
          rows={7}
          className="w-full bg-transparent text-[#f8fafc] font-mono text-xs sm:text-sm p-3.5 outline-none resize-y leading-relaxed"
          dir="ltr"
          spellCheck={false}
        />

        {isProcessing && (
          <div className="absolute inset-0 bg-[#0b1120]/80 backdrop-blur-xs flex items-center justify-center gap-2 text-xs text-white">
            <RefreshCw className="w-4 h-4 animate-spin text-[#3b82f6]" />
            <span>جاري استخراج وفحص ملفات المشروع...</span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            id="btn-build-tree"
            type="button"
            onClick={() => {
              onBuildTree(treeInputText);
              onAddLog('build', 'success', 'تم تحديث وبناء شجرة الملفات بنجاح.');
            }}
            className="px-4 py-2 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>بناء شجرة الملفات الحالية</span>
          </button>
        </div>

        {/* Selected Preset Quick Info */}
        <div className="text-xs text-[#94a3b8] flex items-center gap-2">
          <span>المشروع النشط:</span>
          <span className="font-bold text-white">
            {COMPLETE_PRESETS.find(p => p.id === selectedPreset)?.name || 'مخصص'}
          </span>
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
