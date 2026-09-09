import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Code2, 
  Save, 
  Search, 
  Replace, 
  Check, 
  AlertCircle, 
  Copy, 
  CheckCheck, 
  WrapText, 
  RotateCcw, 
  RotateCw, 
  Sparkles, 
  Keyboard, 
  FileCode, 
  X, 
  FolderTree,
  Sliders,
  Maximize2,
  Minimize2,
  Clipboard
} from 'lucide-react';
import { FileNode, SearchMatch } from '../types';
import { getAllFiles, markFileSaved, updateNodeContent } from '../utils/treeParser';

interface Section3Props {
  nodes: FileNode[];
  setNodes: React.Dispatch<React.SetStateAction<FileNode[]>>;
  activeFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  openFileIds: string[];
  setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>;
  onAddLog: (category: 'build' | 'runtime' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export const Section3CodeEditor: React.FC<Section3Props> = ({
  nodes,
  setNodes,
  activeFile,
  onSelectFile,
  openFileIds,
  setOpenFileIds,
  onAddLog
}) => {
  // Local code state for active file
  const [code, setCode] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(13);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Listen to Escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Search & Replace UI state
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replaceTerm, setReplaceTerm] = useState<string>('');
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [searchScope, setSearchScope] = useState<'current' | 'global'>('current');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(0);

  // Quick Code Paste Box state
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [pasteBoxText, setPasteBoxText] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick paste from clipboard
  const handleQuickPasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleCodeChange(text);
        onAddLog('build', 'info', `تم لصق الكود بنجاح في ملف ${activeFile?.name || ''}`);
      }
    } catch {
      setShowPasteBox(true);
    }
  };

  const handleApplyPasteBox = (mode: 'replace' | 'append') => {
    if (!pasteBoxText) return;
    if (mode === 'replace') {
      handleCodeChange(pasteBoxText);
    } else {
      handleCodeChange(code ? `${code}\n\n${pasteBoxText}` : pasteBoxText);
    }
    setPasteBoxText('');
    setShowPasteBox(false);
    onAddLog('build', 'info', `تم تطبيق ولصق الكود في ملف ${activeFile?.name || ''}`);
  };

  // Sync activeFile content into local editor state
  useEffect(() => {
    if (activeFile && activeFile.type === 'file') {
      const currentContent = activeFile.content ?? '';
      setCode(currentContent);
      setIsSaved(activeFile.isSaved !== false);
      setHistory([currentContent]);
      setHistoryIndex(0);
    } else {
      setCode('');
      setIsSaved(true);
    }
  }, [activeFile?.id]);

  // Keep open tabs in sync
  const allProjectFiles = useMemo(() => getAllFiles(nodes), [nodes]);
  const openFiles = useMemo(() => {
    return openFileIds
      .map(id => allProjectFiles.find(f => f.id === id))
      .filter((f): f is FileNode => f !== undefined);
  }, [openFileIds, allProjectFiles]);

  const closeTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(remaining);
    if (activeFile?.id === fileId) {
      if (remaining.length > 0) {
        const next = allProjectFiles.find(f => f.id === remaining[remaining.length - 1]);
        if (next) onSelectFile(next);
      } else {
        onSelectFile(allProjectFiles[0] || null);
      }
    }
  };

  // Text changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsSaved(false);

    // Push to undo history (debounced or capped)
    if (historyIndex < history.length - 1) {
      setHistory([...history.slice(0, historyIndex + 1), newCode]);
    } else {
      setHistory([...history.slice(-30), newCode]);
    }
    setHistoryIndex(prev => Math.min(prev + 1, 30));

    // Update in-memory project model with unsaved flag
    if (activeFile) {
      setNodes(prev => updateNodeContent(prev, activeFile.id, newCode, false));
    }

    // Auto-save logic
    if (autoSaveEnabled && activeFile) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(newCode);
      }, 1200);
    }
  };

  // Save explicitly
  const handleSave = (codeToSave = code) => {
    if (!activeFile) return;
    setNodes(prev => updateNodeContent(prev, activeFile.id, codeToSave, true));
    setIsSaved(true);
    onAddLog('build', 'success', `تم حفظ الملف: ${activeFile.path}`);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevCode = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCode(prevCode);
      if (activeFile) {
        setNodes(prev => updateNodeContent(prev, activeFile.id, prevCode, false));
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextCode = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCode(nextCode);
      if (activeFile) {
        setNodes(prev => updateNodeContent(prev, activeFile.id, nextCode, false));
      }
    }
  };

  // Keyboard Shortcuts Listener (Ctrl+S, Ctrl+F, Ctrl+H, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier not pressed
      if (!e.ctrlKey && !e.metaKey) return;

      // Ctrl + S (Save)
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl + F (Find)
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setShowSearchBox(true);
      }
      // Ctrl + H (Replace)
      else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowSearchBox(true);
      }
      // Ctrl + Z (Undo)
      else if ((e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        // Let textarea handle native undo if active, or trigger state undo
      }
      // Ctrl + Y or Ctrl + Shift + Z (Redo)
      else if (e.key === 'y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
        // Redo
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, activeFile, historyIndex, history]);

  // Execute Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const flags = matchCase ? 'g' : 'gi';
      const regex = useRegex ? new RegExp(searchTerm, flags) : new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);

      const matches: SearchMatch[] = [];

      const targetFiles = searchScope === 'current' && activeFile 
        ? [activeFile] 
        : allProjectFiles;

      for (const file of targetFiles) {
        const fileContent = file.id === activeFile?.id ? code : (file.content || '');
        const lines = fileContent.split('\n');

        lines.forEach((lineText, lineIdx) => {
          let match;
          // reset regex index
          regex.lastIndex = 0;
          while ((match = regex.exec(lineText)) !== null) {
            matches.push({
              fileId: file.id,
              filePath: file.path,
              line: lineIdx + 1,
              content: lineText.trim(),
              matchStart: match.index,
              matchLength: match[0].length
            });
            if (!regex.global) break;
          }
        });
      }

      setSearchResults(matches);
      setActiveSearchIndex(0);
    } catch {
      setSearchResults([]);
    }
  }, [searchTerm, useRegex, matchCase, searchScope, code, activeFile, allProjectFiles]);

  // Jump to match
  const jumpToMatch = (match: SearchMatch) => {
    const targetFile = allProjectFiles.find(f => f.id === match.fileId);
    if (targetFile && targetFile.id !== activeFile?.id) {
      onSelectFile(targetFile);
    }
    // Scroll textarea to line
    if (textareaRef.current) {
      const lines = (targetFile?.id === activeFile?.id ? code : (targetFile?.content || '')).split('\n');
      let charPos = 0;
      for (let i = 0; i < match.line - 1; i++) {
        charPos += lines[i].length + 1;
      }
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(charPos, charPos + match.matchLength);
    }
  };

  // Replace inside current file
  const handleReplaceCurrent = () => {
    if (!searchTerm || !activeFile) return;
    try {
      const flags = matchCase ? '' : 'i';
      const regex = useRegex ? new RegExp(searchTerm, flags) : new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newCode = code.replace(regex, replaceTerm);
      handleCodeChange(newCode);
      onAddLog('build', 'info', `تم استبدال مطابقة واحدة في ${activeFile.name}`);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل الاستبدال: ${err?.message}`);
    }
  };

  // Replace All in Current File
  const handleReplaceAllInFile = () => {
    if (!searchTerm || !activeFile) return;
    try {
      const flags = matchCase ? 'g' : 'gi';
      const regex = useRegex ? new RegExp(searchTerm, flags) : new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newCode = code.replace(regex, replaceTerm);
      handleCodeChange(newCode);
      onAddLog('build', 'success', `تم استبدال جميع المطابقات في ${activeFile.name}`);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل الاستبدال: ${err?.message}`);
    }
  };

  // Replace All Across Whole Project
  const handleReplaceAllAcrossProject = () => {
    if (!searchTerm) return;
    if (!confirm(`هل أنت متأكد من استبدال "${searchTerm}" بـ "${replaceTerm}" في جميع ملفات المشروع؟`)) {
      return;
    }

    try {
      const flags = matchCase ? 'g' : 'gi';
      const regex = useRegex ? new RegExp(searchTerm, flags) : new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);

      let replacedCount = 0;
      let updatedNodes = [...nodes];

      for (const file of allProjectFiles) {
        const fileContent = file.id === activeFile?.id ? code : (file.content || '');
        if (regex.test(fileContent)) {
          const replaced = fileContent.replace(regex, replaceTerm);
          updatedNodes = updateNodeContent(updatedNodes, file.id, replaced, true);
          replacedCount++;
          if (file.id === activeFile?.id) {
            setCode(replaced);
            setIsSaved(true);
          }
        }
      }

      setNodes(updatedNodes);
      onAddLog('build', 'success', `تم استبدال النص بنجاح في ${replacedCount} ملف عبر المشروع!`);
    } catch (err: any) {
      onAddLog('build', 'error', `فشل الاستبدال الشامل: ${err?.message}`);
    }
  };

  // Format Code (JSON or basic indent)
  const handleFormatCode = () => {
    if (!code || !activeFile) return;
    const lowerName = activeFile.name.toLowerCase();

    if (lowerName.endsWith('.json')) {
      try {
        const parsed = JSON.parse(code);
        const formatted = JSON.stringify(parsed, null, 2);
        handleCodeChange(formatted);
        onAddLog('build', 'info', `تم تنسيق ملف JSON بنجاح`);
      } catch (err: any) {
        onAddLog('build', 'warn', `لا يمكن تنسيق JSON: خطأ في البنية (${err.message})`);
      }
    } else {
      // Basic clean up: remove trailing spaces
      const formatted = code.split('\n').map(l => l.trimEnd()).join('\n');
      handleCodeChange(formatted);
      onAddLog('build', 'info', `تم تنظيف المسافات الزائدة في الكود`);
    }
  };

  // Copy code
  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Language badge detector
  const detectedLanguage = useMemo(() => {
    if (!activeFile) return 'Text';
    const ext = activeFile.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': return 'TypeScript';
      case 'tsx': return 'React TSX';
      case 'js': return 'JavaScript';
      case 'jsx': return 'React JSX';
      case 'html': return 'HTML5';
      case 'css': return 'CSS3';
      case 'json': return 'JSON';
      case 'py': return 'Python';
      case 'md': return 'Markdown';
      case 'yml':
      case 'yaml': return 'YAML';
      case 'sh': return 'Shell / Bash';
      default: return 'Plain Text';
    }
  }, [activeFile?.name]);

  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <section 
      id="section-codeeditor" 
      className={isFullscreen 
        ? "fixed inset-0 z-50 bg-[#0b1120] p-3 sm:p-5 flex flex-col h-screen w-screen overflow-hidden" 
        : "bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 sm:p-6 shadow-sm transition-all scroll-mt-6"
      }
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-[4px] bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 flex items-center justify-center font-mono font-bold text-xs">
            3
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#3b82f6]" />
              <span>محرر الأكواد</span>
              {isFullscreen && (
                <span className="text-xs font-normal text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">
                  ملء الشاشة (اضغط Esc للرجوع)
                </span>
              )}
            </h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              ترقيم الأسطر، تمييز اللغات، بحث واستبدال شامل، حفظ تلقائي، وضع ملء الشاشة، واختصارات لوحة المفاتيح
            </p>
          </div>
        </div>

        {/* Global Save & State Status */}
        <div className="flex items-center gap-2.5">
          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(prev => !prev)}
            className={`p-1.5 rounded-[4px] border border-[#334155] transition cursor-pointer flex items-center gap-1.5 text-xs ${
              isFullscreen 
                ? 'bg-[#3b82f6] text-white border-[#3b82f6]' 
                : 'bg-[#0f172a] text-[#94a3b8] hover:text-white'
            }`}
            title={isFullscreen ? 'تصغير الشاشة (Esc)' : 'ملء الشاشة بالكامل (Fullscreen)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تصغير</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ملء الشاشة</span>
              </>
            )}
          </button>

          {/* Save Status Badge */}
          <div className={isSaved 
            ? 'badge-green flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium'
            : 'badge-warn flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium animate-pulse'
          }>
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span>محفوظ (Saved)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>تعديلات غير محفوظة</span>
              </>
            )}
          </div>

          {/* Manual Save Button */}
          <button
            id="btn-save-code"
            type="button"
            onClick={() => handleSave()}
            disabled={isSaved || !activeFile}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              isSaved || !activeFile
                ? 'bg-transparent text-[#94a3b8]/40 border border-[#334155] cursor-not-allowed'
                : 'bg-[#3b82f6] hover:bg-blue-600 text-white'
            }`}
            title="حفظ التغييرات (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ الملف (Ctrl+S)</span>
          </button>
        </div>
      </div>

      {/* Open File Tabs Bar */}
      <div className="mt-4 flex items-center justify-between gap-2 overflow-x-auto border-b border-[#334155] pb-1 scrollbar-none">
        <div className="flex items-center gap-1">
          {openFiles.length === 0 ? (
            <div className="text-xs text-[#94a3b8] py-1.5 px-2">
              لا توجد ملفات مفتوحة حالياً (اختر ملفاً من مدير الملفات بالأعلى)
            </div>
          ) : (
            openFiles.map(f => {
              const isActive = f.id === activeFile?.id;
              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFile(f)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t-[4px] text-xs font-mono cursor-pointer border-t border-x transition select-none ${
                    isActive
                      ? 'bg-[#0b1120] text-[#3b82f6] border-[#334155] font-medium'
                      : 'bg-[#0f172a] text-[#94a3b8] hover:text-white border-transparent hover:bg-[#334155]/40'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span className="truncate max-w-[140px] font-sans">{f.name}</span>
                  {f.isSaved === false && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => closeTab(f.id, e)}
                    className="p-0.5 rounded hover:bg-[#334155] text-[#94a3b8] hover:text-white transition cursor-pointer"
                    title="إغلاق التبويب"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Shortcuts button */}
        <button
          type="button"
          onClick={() => setShowShortcutsModal(true)}
          className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-transparent hover:bg-[#334155]/60 border border-[#334155] shrink-0 transition cursor-pointer"
          title="دليل اختصارات لوحة المفاتيح"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">اختصارات المفاتيح</span>
        </button>
      </div>

      {/* Editor Controls Bar */}
      <div className="bg-[#080d1a] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5 border-x border-[#334155] text-xs text-[#94a3b8]">
        <div className="flex items-center gap-2.5">
          {/* Active File Path */}
          <span className="font-mono text-[#3b82f6] font-medium">
            {activeFile ? `/${activeFile.path}` : 'لم يتم تحديد ملف'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#0f172a] border border-[#334155] text-[#94a3b8] font-mono">
            {detectedLanguage}
          </span>
        </div>

        {/* Editor Utility Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Paste Box Toggle */}
          <button
            type="button"
            onClick={() => setShowPasteBox(prev => !prev)}
            className={`px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 transition border cursor-pointer ${
              showPasteBox 
                ? 'bg-[#10b981] text-white border-[#10b981]' 
                : 'bg-transparent hover:bg-[#334155]/60 text-emerald-400 hover:text-white border-emerald-500/40'
            }`}
            title="فتح مربع لصق الأكواد البرمجية مباشرة في هذا الملف"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>مربع لصق الكود</span>
          </button>

          {/* Quick 1-click clipboard paste */}
          <button
            type="button"
            onClick={handleQuickPasteFromClipboard}
            className="px-2 py-1 rounded-[4px] bg-[#0f172a] hover:bg-[#334155] text-slate-300 hover:text-white border border-[#334155] transition text-xs flex items-center gap-1 cursor-pointer"
            title="لصق الكود المنسوخ من الحافظة مباشرة"
          >
            <Clipboard className="w-3 h-3 text-[#38bdf8]" />
            <span className="hidden md:inline">لصق فوري</span>
          </button>

          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setShowSearchBox(prev => !prev)}
            className={`px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 transition border cursor-pointer ${
              showSearchBox 
                ? 'bg-[#3b82f6] text-white border-[#3b82f6]' 
                : 'bg-transparent hover:bg-[#334155]/60 text-[#94a3b8] hover:text-white border-[#334155]'
            }`}
            title="بحث واستبدال شامل (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>بحث / استبدال</span>
          </button>

          {/* Auto-save switch */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[#94a3b8] hover:text-white select-none">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="accent-[#3b82f6] rounded cursor-pointer"
            />
            <span>حفظ تلقائي</span>
          </label>

          {/* Word Wrap */}
          <button
            type="button"
            onClick={() => setWordWrap(prev => !prev)}
            className={`p-1.5 rounded-[4px] transition cursor-pointer ${wordWrap ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40' : 'text-[#94a3b8] hover:text-white'}`}
            title="التفاف الأسطر (Word Wrap)"
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Format Code */}
          <button
            type="button"
            onClick={handleFormatCode}
            className="p-1.5 rounded-[4px] text-[#94a3b8] hover:text-[#f59e0b] transition cursor-pointer"
            title="تنسيق الكود (Format / Beautify)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-[4px] text-[#94a3b8] hover:text-[#10b981] transition cursor-pointer"
            title="نسخ الكود بالكامل"
          >
            {copiedCode ? <CheckCheck className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-[4px] text-[#94a3b8] hover:text-white disabled:opacity-30 transition cursor-pointer"
            title="تراجع (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-[4px] text-[#94a3b8] hover:text-white disabled:opacity-30 transition cursor-pointer"
            title="إعادة (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Font Size */}
          <div className="flex items-center gap-1 bg-[#0f172a] px-1.5 py-0.5 rounded-[4px] border border-[#334155]">
            <button
              type="button"
              onClick={() => setFontSize(s => Math.max(10, s - 1))}
              className="text-[#94a3b8] hover:text-white px-1 cursor-pointer"
              title="تصغير الخط"
            >
              A-
            </button>
            <span className="text-[10px] text-[#94a3b8] w-4 text-center font-mono">{fontSize}</span>
            <button
              type="button"
              onClick={() => setFontSize(s => Math.min(20, s + 1))}
              className="text-[#94a3b8] hover:text-white px-1 cursor-pointer"
              title="تكبير الخط"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDABLE QUICK PASTE BOX PANEL */}
      {showPasteBox && (
        <div className="bg-[#080d1a] border-x border-b border-[#334155] p-3.5 space-y-2.5 text-xs text-[#f8fafc]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">مربع لصق الكود البرمجي للملف: {activeFile?.name || 'لم يتم تحديد ملف'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPasteBox(false)}
              className="text-[#94a3b8] hover:text-white text-xs cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#334155]"
            >
              ✕
            </button>
          </div>
          <p className="text-[#94a3b8] text-[11px]">
            الصق كود HTML أو CSS أو JS هنا مباشرة ليتم تطبيقه على هذا الملف فورياً وحفظه وتحديث المعاينة تلقائياً.
          </p>
          <textarea
            value={pasteBoxText}
            onChange={(e) => setPasteBoxText(e.target.value)}
            placeholder="الصق كود الملف هنا (Paste code here)..."
            rows={5}
            className="w-full bg-[#0b1120] text-[#f8fafc] p-2.5 rounded-[4px] border border-[#334155] focus:border-emerald-500 outline-none font-mono text-xs"
            dir="ltr"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400 font-mono">
              {pasteBoxText ? `${pasteBoxText.split('\n').length} أسطر جاهزة للتطبيق` : 'المربع فارغ (الصق كودك)'}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPasteBoxText('')}
                className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs cursor-pointer"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handleApplyPasteBox('append')}
                disabled={!pasteBoxText.trim() || !activeFile}
                className="px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-[#334155] text-xs disabled:opacity-40 cursor-pointer"
              >
                إلحاق بنهاية الكود
              </button>
              <button
                type="button"
                onClick={() => handleApplyPasteBox('replace')}
                disabled={!pasteBoxText.trim() || !activeFile}
                className="px-3.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs disabled:opacity-40 cursor-pointer shadow-sm"
              >
                استبدال كود الملف بالكامل ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDABLE SEARCH & REPLACE PANEL */}
      {showSearchBox && (
        <div className="bg-[#080d1a] border-x border-b border-[#334155] p-3.5 space-y-2.5 text-xs text-[#f8fafc]">
          {/* Search row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute right-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث عن نص أو Regex (Ctrl+F)..."
                className="w-full bg-[#0b1120] text-[#f8fafc] pr-8 pl-3 py-1.5 rounded-[4px] border border-[#334155] focus:border-[#3b82f6] outline-none font-mono text-xs"
                dir="ltr"
              />
            </div>

            {/* Scope Toggle: Current file vs Project */}
            <div className="flex items-center bg-[#0f172a] rounded-[4px] border border-[#334155] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setSearchScope('current')}
                className={`px-2 py-0.5 rounded-[3px] transition cursor-pointer ${searchScope === 'current' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8]'}`}
              >
                الملف الحالي
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('global')}
                className={`px-2 py-0.5 rounded-[3px] transition cursor-pointer ${searchScope === 'global' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8]'}`}
              >
                كامل المشروع
              </button>
            </div>

            {/* Options */}
            <label className="flex items-center gap-1 text-[#94a3b8] cursor-pointer">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="accent-[#3b82f6]"
              />
              <span>Regex</span>
            </label>
            <label className="flex items-center gap-1 text-[#94a3b8] cursor-pointer">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="accent-[#3b82f6]"
              />
              <span>مطابقة الأحرف</span>
            </label>

            {/* Results count */}
            <span className="text-[#94a3b8] font-mono text-[11px]">
              {searchResults.length} مطابقة
            </span>
          </div>

          {/* Replace row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Replace className="w-3.5 h-3.5 text-[#94a3b8] absolute right-2.5 top-2.5" />
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="نص الاستبدال البديل..."
                className="w-full bg-[#0b1120] text-[#f8fafc] pr-8 pl-3 py-1.5 rounded-[4px] border border-[#334155] focus:border-[#3b82f6] outline-none font-mono text-xs"
                dir="ltr"
              />
            </div>

            <button
              type="button"
              onClick={handleReplaceCurrent}
              disabled={!searchResults.length}
              className="px-3 py-1.5 rounded-[4px] bg-transparent hover:bg-[#334155]/60 text-white border border-[#334155] disabled:opacity-30 cursor-pointer"
            >
              استبدال الحالي
            </button>
            <button
              type="button"
              onClick={handleReplaceAllInFile}
              disabled={!searchResults.length}
              className="px-3 py-1.5 rounded-[4px] bg-transparent hover:bg-[#334155]/60 text-white border border-[#334155] disabled:opacity-30 cursor-pointer"
            >
              استبدال بالملف
            </button>
            <button
              type="button"
              onClick={handleReplaceAllAcrossProject}
              disabled={!searchResults.length}
              className="px-3 py-1.5 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white font-medium disabled:opacity-30 cursor-pointer"
            >
              استبدال بالمشروع كاملاً
            </button>
          </div>

          {/* Matches List Preview */}
          {searchResults.length > 0 && (
            <div className="max-h-28 overflow-y-auto bg-[#0b1120] rounded-[4px] p-2 border border-[#334155] space-y-1 font-mono text-[11px]">
              {searchResults.slice(0, 10).map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => jumpToMatch(m)}
                  className="flex items-center justify-between p-1 rounded hover:bg-[#334155]/60 cursor-pointer text-slate-300 hover:text-white"
                >
                  <span className="text-[#3b82f6] truncate max-w-[200px]" dir="ltr">
                    {m.filePath}:{m.line}
                  </span>
                  <span className="truncate max-w-[360px] text-[#94a3b8] font-sans" dir="ltr">
                    {m.content}
                  </span>
                </div>
              ))}
              {searchResults.length > 10 && (
                <div className="text-center text-[#94a3b8] text-[10px]">
                  + {searchResults.length - 10} نتائج إضافية
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Editor Body: Line numbers + Textarea */}
      <div className={`relative flex bg-[#0b1120] border border-[#334155] rounded-b-[6px] overflow-hidden ${
        isFullscreen ? 'flex-1 min-h-0' : 'min-h-[380px] max-h-[560px]'
      }`}>
        {/* Line Numbers Column */}
        <div 
          className="w-12 bg-[#080d1a] py-4 select-none font-mono text-[#94a3b8]/50 text-right pr-2 pl-1 border-l border-[#334155] shrink-0"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
        >
          {lines.map((_, i) => (
            <div key={i} className="hover:text-slate-400">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          id="code-editor-textarea"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={activeFile ? `اكتب الكود هنا لـ ${activeFile.name}...` : 'يرجى اختيار ملف من مدير الملفات بالأعلى لبدء التحرير'}
          disabled={!activeFile}
          wrap={wordWrap ? 'on' : 'off'}
          spellCheck={false}
          className="flex-1 bg-transparent text-[#f8fafc] font-mono p-4 outline-none resize-none overflow-y-auto leading-relaxed selection:bg-[#3b82f6]/40 selection:text-white"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          dir="ltr"
        />
      </div>

      {/* Editor Footer: Cursor info and stats */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-[#94a3b8] px-1">
        <div className="flex items-center gap-4 font-mono">
          <span>الأسطر: {lines.length}</span>
          <span>الأحرف: {code.length}</span>
          <span>الحجم: {new Blob([code]).size} بايت</span>
        </div>
        <div className="text-[#94a3b8]">
          استخدم <kbd className="px-1.5 py-0.5 rounded bg-[#0f172a] text-[#f8fafc] border border-[#334155] font-mono text-[10px]">Ctrl+S</kbd> للحفظ السريع، 
          و <kbd className="px-1.5 py-0.5 rounded bg-[#0f172a] text-[#f8fafc] border border-[#334155] font-mono text-[10px]">Ctrl+F</kbd> للبحث
        </div>
      </div>

      {/* SHORTCUTS CHEATSHEET MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#3b82f6]" />
                <span>اختصارات لوحة المفاتيح</span>
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-[#94a3b8] hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#0b1120] border border-[#334155]">
                <span className="text-slate-300">حفظ الملف الحالي</span>
                <kbd className="px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[#3b82f6] font-mono font-medium">Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#0b1120] border border-[#334155]">
                <span className="text-slate-300">فتح شريط البحث</span>
                <kbd className="px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[#3b82f6] font-mono font-medium">Ctrl + F</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#0b1120] border border-[#334155]">
                <span className="text-slate-300">فتح شريط الاستبدال</span>
                <kbd className="px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[#3b82f6] font-mono font-medium">Ctrl + H</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#0b1120] border border-[#334155]">
                <span className="text-slate-300">التراجع عن الكتابة (Undo)</span>
                <kbd className="px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[#3b82f6] font-mono font-medium">Ctrl + Z</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#0b1120] border border-[#334155]">
                <span className="text-slate-300">إعادة التراجع (Redo)</span>
                <kbd className="px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[#3b82f6] font-mono font-medium">Ctrl + Y</kbd>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-[4px] text-xs font-medium cursor-pointer"
              >
                فهمت ذلك
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
