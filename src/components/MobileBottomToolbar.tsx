import React, { useState } from 'react';
import { 
  Hammer, 
  FolderTree, 
  Code2, 
  Save, 
  Monitor, 
  Download, 
  Check 
} from 'lucide-react';
import { FileNode } from '../types';
import { saveProjectToIndexedDB } from '../utils/indexedDBStorage';

interface MobileBottomToolbarProps {
  nodes: FileNode[];
  activeFile: FileNode | null;
  onSaveCurrentFile?: () => void;
  onAddLog: (category: 'build' | 'runtime' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
  onToggleFullscreenEditor?: () => void;
  isEditorFullscreen?: boolean;
}

export const MobileBottomToolbar: React.FC<MobileBottomToolbarProps> = ({
  nodes,
  onSaveCurrentFile,
  onAddLog,
}) => {
  const [justSaved, setJustSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('section-structure');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleQuickSave = async () => {
    if (onSaveCurrentFile) {
      onSaveCurrentFile();
    }

    try {
      await saveProjectToIndexedDB('مشروع الأكواد المحفوظ', nodes);
      onAddLog('build', 'success', 'تم حفظ التعديلات في ذاكرة المتصفح (IndexedDB)');
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (e: any) {
      onAddLog('build', 'error', `فشل الحفظ: ${e?.message}`);
    }
  };

  return (
    <nav 
      id="bottom-navigation-toolbar"
      aria-label="أزرار التنقل السريع"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1e293b]/95 backdrop-blur-md border-t border-[#334155] px-2 py-1.5 shadow-2xl safe-area-bottom select-none"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around gap-1">
        {/* 1. بناء الهيكل */}
        <button
          type="button"
          onClick={() => scrollToSection('section-structure')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded transition cursor-pointer ${
            activeSection === 'section-structure' 
              ? 'text-[#3b82f6] bg-[#3b82f6]/10' 
              : 'text-[#94a3b8] hover:text-white hover:bg-[#334155]/40'
          }`}
          title="الانتقال إلى مدخل الهيكل"
        >
          <Hammer className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-[10px] mt-0.5 font-medium">الهيكل</span>
        </button>

        {/* 2. مدير الملفات */}
        <button
          type="button"
          onClick={() => scrollToSection('section-filemanager')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded transition cursor-pointer ${
            activeSection === 'section-filemanager' 
              ? 'text-[#f59e0b] bg-[#f59e0b]/10' 
              : 'text-[#94a3b8] hover:text-white hover:bg-[#334155]/40'
          }`}
          title="الانتقال إلى مدير الملفات الشجري"
        >
          <FolderTree className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-[10px] mt-0.5 font-medium">الملفات</span>
        </button>

        {/* 3. محرر الأكواد */}
        <button
          type="button"
          onClick={() => scrollToSection('section-editor')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded transition cursor-pointer ${
            activeSection === 'section-editor' 
              ? 'text-[#38bdf8] bg-[#38bdf8]/10' 
              : 'text-[#94a3b8] hover:text-white hover:bg-[#334155]/40'
          }`}
          title="الانتقال إلى محرر الأكواد"
        >
          <Code2 className="w-4 h-4 text-[#38bdf8]" />
          <span className="text-[10px] mt-0.5 font-medium">المحرر</span>
        </button>

        {/* 4. المعاينة */}
        <button
          type="button"
          onClick={() => scrollToSection('section-preview')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded transition cursor-pointer ${
            activeSection === 'section-preview' 
              ? 'text-[#10b981] bg-[#10b981]/10' 
              : 'text-[#94a3b8] hover:text-white hover:bg-[#334155]/40'
          }`}
          title="الانتقال إلى إطار المعاينة"
        >
          <Monitor className="w-4 h-4 text-[#10b981]" />
          <span className="text-[10px] mt-0.5 font-medium">المعاينة</span>
        </button>

        {/* 5. التصدير و PWA */}
        <button
          type="button"
          onClick={() => scrollToSection('section-export')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded transition cursor-pointer ${
            activeSection === 'section-export' 
              ? 'text-[#a855f7] bg-[#a855f7]/10' 
              : 'text-[#94a3b8] hover:text-white hover:bg-[#334155]/40'
          }`}
          title="الانتقال إلى تصدير ZIP و PWA"
        >
          <Download className="w-4 h-4 text-[#a855f7]" />
          <span className="text-[10px] mt-0.5 font-medium">تصدير</span>
        </button>

        {/* 6. حفظ سريع */}
        <button
          type="button"
          onClick={handleQuickSave}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded transition cursor-pointer ${
            justSaved 
              ? 'bg-[#10b981]/20 text-[#10b981]' 
              : 'text-[#94a3b8] hover:text-white hover:bg-[#334155]/40'
          }`}
          title="حفظ التعديلات في ذاكرة المتصفح"
        >
          {justSaved ? (
            <Check className="w-4 h-4 text-[#10b981]" />
          ) : (
            <Save className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-[10px] mt-0.5 font-medium">
            {justSaved ? 'تم!' : 'حفظ'}
          </span>
        </button>
      </div>
    </nav>
  );
};
