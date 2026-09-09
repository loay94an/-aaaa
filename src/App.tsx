import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Section1StructureInput } from './components/Section1StructureInput';
import { Section2FileManager } from './components/Section2FileManager';
import { Section3CodeEditor } from './components/Section3CodeEditor';
import { Section4AnalysisAndPreview } from './components/Section4AnalysisAndPreview';
import { Section5ExportAndPWA } from './components/Section5ExportAndPWA';
import { MobileBottomToolbar } from './components/MobileBottomToolbar';
import { FileNode, LogCategory, LogEntry, LogLevel } from './types';
import { COMPLETE_PRESETS, getPresetById, buildNodesFromPreset } from './utils/sampleProjects';
import { findNodeById, getAllFiles, parseTreeFromText } from './utils/treeParser';
import { loadProjectFromIndexedDB, saveProjectToIndexedDB } from './utils/indexedDBStorage';

export default function App() {
  // 1. Initial State from the first starter preset (Analytics Suite)
  const defaultPreset = COMPLETE_PRESETS[0];
  const [treeInputText, setTreeInputText] = useState<string>(defaultPreset.treeText);
  
  // Project tree nodes initialized with real complete preset
  const [nodes, setNodes] = useState<FileNode[]>(() => {
    return buildNodesFromPreset(defaultPreset);
  });

  // Active selected file for editor
  const [selectedFileId, setSelectedFileId] = useState<string | null>(() => {
    const initialFiles = getAllFiles(buildNodesFromPreset(defaultPreset));
    const mainFile = initialFiles.find(f => f.name.toLowerCase() === 'index.html' || f.name.toLowerCase() === 'app.tsx');
    return mainFile ? mainFile.id : (initialFiles[0]?.id || null);
  });

  // Open tabs list
  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    const initialFiles = getAllFiles(buildNodesFromPreset(defaultPreset));
    return initialFiles.slice(0, 4).map(f => f.id);
  });

  // Output logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-log-1',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category: 'build',
      level: 'success',
      message: `تم تهيئة مشروع "${defaultPreset.name}" الحقيقي بنجاح (${defaultPreset.files.length} ملفات جاهزة للمعاينة الفورية).`
    },
    {
      id: 'init-log-2',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category: 'runtime',
      level: 'info',
      message: 'خادم المعاينة المباشرة متصل بالهيكل والمحرر — أي تعديل في الكود ينعكس فورياً.'
    }
  ]);

  // Log Appender Helper
  const addLog = useCallback((category: LogCategory, level: LogLevel, message: string) => {
    const newEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category,
      level,
      message
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 100)]);
  }, []);

  const clearLogs = useCallback((category?: LogCategory) => {
    if (category) {
      setLogs(prev => prev.filter(l => l.category !== category));
    } else {
      setLogs([]);
    }
  }, []);

  // Load complete real working preset
  const handleLoadCompletePreset = (presetId: string, scrollToPreview = false) => {
    const preset = getPresetById(presetId);
    if (!preset) return;

    const newNodes = buildNodesFromPreset(preset);
    setNodes(newNodes);
    setTreeInputText(preset.treeText);

    const files = getAllFiles(newNodes);
    if (files.length > 0) {
      const bestEntry = files.find(f => 
        f.name.toLowerCase() === 'index.html' || 
        f.path.toLowerCase().endsWith('/index.html') ||
        f.name.toLowerCase() === 'app.tsx' ||
        f.name.toLowerCase() === 'main.js'
      ) || files[0];

      setSelectedFileId(bestEntry.id);
      const topIds = files.slice(0, 4).map(f => f.id);
      if (!topIds.includes(bestEntry.id)) {
        topIds.unshift(bestEntry.id);
      }
      setOpenFileIds(topIds);
    } else {
      setSelectedFileId(null);
      setOpenFileIds([]);
    }

    addLog('build', 'success', `تم تحميل وبناء مشروع "${preset.name}" بالكامل (${preset.files.length} ملفات برمجية حقيقية).`);
    addLog('runtime', 'info', `المعاينة التفاعلية نشطة الآن في قسم المعاينة، يمكنك تجربة واختبار كافة أزرار ووظائف المشروع.`);

    if (scrollToPreview) {
      setTimeout(() => {
        const previewSection = document.getElementById('section-preview');
        if (previewSection) {
          previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  };

  // Build tree from raw text
  const handleBuildTree = (text: string) => {
    const newNodes = parseTreeFromText(text, true);
    setNodes(newNodes);

    const files = getAllFiles(newNodes);
    if (files.length > 0) {
      const bestDefault = files.find(f => f.name === 'App.tsx' || f.name === 'index.html' || f.name === 'index.js') || files[0];
      setSelectedFileId(bestDefault.id);
      setOpenFileIds([bestDefault.id]);
    } else {
      setSelectedFileId(null);
      setOpenFileIds([]);
    }

    addLog('build', 'success', `تم بناء الهيكل الشجري بنجاح (${newNodes.length} عقد رئيسية، ${files.length} ملف برمجي).`);
  };

  // Create empty project
  const handleCreateEmptyProject = () => {
    const emptyNodes: FileNode[] = [
      {
        id: `node_${Date.now()}`,
        name: 'root',
        type: 'folder',
        path: 'root',
        isOpen: true,
        children: [],
        parentId: null
      }
    ];
    setNodes(emptyNodes);
    setSelectedFileId(null);
    setOpenFileIds([]);
    setTreeInputText('root/\n');
    addLog('build', 'info', 'تم إنشاء مشروع فارغ جديد وجاهز للإضافة.');
  };

  // Import nodes from ZIP or Folder
  const handleImportNodes = (importedNodes: FileNode[], sourceName: string) => {
    setNodes(importedNodes);
    const files = getAllFiles(importedNodes);
    if (files.length > 0) {
      const bestDefault = files.find(f => f.name === 'App.tsx' || f.name === 'index.html' || f.name === 'main.js') || files[0];
      setSelectedFileId(bestDefault.id);
      setOpenFileIds(files.slice(0, 3).map(f => f.id));
    } else {
      setSelectedFileId(null);
      setOpenFileIds([]);
    }

    addLog('build', 'success', `تم رفع واستيراد "${sourceName}" (${files.length} ملف) وجاري معاينته وتشغيله فورياً ⚡`);

    // التمرير التلقائي إلى نافذة المعاينة لرؤية المشروع المرفوع فوراً
    setTimeout(() => {
      const previewSection = document.getElementById('section-preview');
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Active File Reference
  const activeFile = useMemo(() => {
    if (!selectedFileId) return null;
    return findNodeById(nodes, selectedFileId);
  }, [nodes, selectedFileId]);

  // Select File to view/edit
  const handleSelectFile = (file: FileNode) => {
    setSelectedFileId(file.id);
    if (!openFileIds.includes(file.id)) {
      setOpenFileIds(prev => [...prev, file.id]);
    }
  };

  // Reset Project to default preset
  const handleResetProject = () => {
    if (confirm('هل ترغب في إعادة ضبط المشروع على القالب الافتراضي؟')) {
      handleLoadCompletePreset(COMPLETE_PRESETS[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col antialiased selection:bg-blue-500 selection:text-white font-['Inter','Cairo',sans-serif]" dir="rtl">
      {/* Main Single-Page Sequential Stack Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* SECTION 1: مدخل الهيكل وإنشاء الملفات */}
        <Section1StructureInput
          nodes={nodes}
          treeInputText={treeInputText}
          setTreeInputText={setTreeInputText}
          onBuildTree={handleBuildTree}
          onCreateEmptyProject={handleCreateEmptyProject}
          onImportNodes={handleImportNodes}
          onLoadPreset={handleLoadCompletePreset}
          onAddLog={addLog}
        />

        {/* SECTION 2: مدير الملفات الشجري */}
        <Section2FileManager
          nodes={nodes}
          setNodes={setNodes}
          selectedFileId={selectedFileId}
          onSelectFile={handleSelectFile}
          onOpenEditorForFile={(file) => {
            handleSelectFile(file);
            setTimeout(() => {
              const el = document.getElementById('section-codeeditor');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }}
          onAddLog={addLog}
        />

        {/* SECTION 3: محرر الأكواد */}
        <Section3CodeEditor
          nodes={nodes}
          setNodes={setNodes}
          activeFile={activeFile}
          onSelectFile={handleSelectFile}
          openFileIds={openFileIds}
          setOpenFileIds={setOpenFileIds}
          onAddLog={addLog}
        />

        {/* SECTION 4: المعاينة والتشغيل */}
        <Section4AnalysisAndPreview
          nodes={nodes}
          setNodes={setNodes}
          activeFile={activeFile}
          selectedFileId={selectedFileId}
          onSelectFile={handleSelectFile}
          logs={logs}
          onAddLog={addLog}
          onClearLogs={clearLogs}
        />

        {/* SECTION 5: التصدير وPWA */}
        <Section5ExportAndPWA
          nodes={nodes}
          setNodes={setNodes}
          onAddLog={addLog}
        />
      </main>

      {/* Mobile Fixed Bottom Quick Action Toolbar */}
      <MobileBottomToolbar
        nodes={nodes}
        activeFile={activeFile}
        onSaveCurrentFile={() => {
          if (selectedFileId) {
            setNodes(prev => prev.map(n => n.id === selectedFileId ? { ...n, isSaved: true } : n));
            addLog('build', 'success', `تم حفظ تعديلات الملف الحالي بنجاح.`);
          }
        }}
        onAddLog={addLog}
      />

      {/* Footer */}
      <footer className="border-t border-[#334155] bg-[#1e293b] py-4 text-center text-xs text-[#94a3b8] mb-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>استوديو بناء المشاريع والأكواد — بيئة تطوير وتصدير متكاملة</span>
          </p>
          <div className="flex items-center gap-4 text-[#94a3b8] font-mono text-[11px]">
            <span>AR-DEV STUDIO</span>
            <span>•</span>
            <span>PWA & ZIP READY</span>
            <span>•</span>
            <span>SANDBOX V1.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
