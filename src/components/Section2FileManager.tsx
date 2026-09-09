import React, { useState, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  Scissors, 
  Clipboard, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  FolderPlus, 
  FilePlus, 
  Search, 
  Maximize2, 
  Minimize2, 
  MoreVertical, 
  Layers, 
  ArrowRight,
  Move,
  Check
} from 'lucide-react';
import { ClipboardState, FileNode } from '../types';
import { 
  addNode, 
  countUnsavedFiles, 
  findNodeById, 
  getAllFolders, 
  moveNode, 
  removeNode, 
  renameNode, 
  setAllFoldersOpen, 
  toggleFolderOpen 
} from '../utils/treeParser';

interface Section2Props {
  nodes: FileNode[];
  setNodes: React.Dispatch<React.SetStateAction<FileNode[]>>;
  selectedFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  onOpenEditorForFile?: (file: FileNode) => void;
  onAddLog: (category: 'build' | 'runtime' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export const Section2FileManager: React.FC<Section2Props> = ({
  nodes,
  setNodes,
  selectedFileId,
  onSelectFile,
  onOpenEditorForFile,
  onAddLog
}) => {
  // Tree state
  const [selectedTargetFolderId, setSelectedTargetFolderId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  // File click handler: selects file, sets parent as target path, and scrolls to editor/paste box
  const handleFileClick = (file: FileNode) => {
    onSelectFile(file);
    if (file.parentId) {
      setSelectedTargetFolderId(file.parentId);
    }
    if (onOpenEditorForFile) {
      onOpenEditorForFile(file);
    } else {
      const el = document.getElementById('section-codeeditor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Modals & prompts state
  const [showCreateModal, setShowCreateModal] = useState<'file' | 'folder' | null>(null);
  const [createNameInput, setCreateNameInput] = useState('');
  const [createTargetParentId, setCreateTargetParentId] = useState<string | null>(null);

  const [renameTargetNode, setRenameTargetNode] = useState<FileNode | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const [propertiesNode, setPropertiesNode] = useState<FileNode | null>(null);

  // Move node modal state (touch/mobile friendly alternative to drag and drop)
  const [moveTargetNode, setMoveTargetNode] = useState<FileNode | null>(null);
  const [targetFolderDestination, setTargetFolderDestination] = useState<string>('root');

  // Mobile collapse state
  const [isMobileTreeCollapsed, setIsMobileTreeCollapsed] = useState<boolean>(false);

  // Drag & drop state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Active Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode;
  } | null>(null);

  // Touch long-press detection
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent, node: FileNode) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setContextMenu({
        x: touchStartPosRef.current.x,
        y: touchStartPosRef.current.y,
        node
      });
    }, 500); // 500ms long-press
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    if (dx > 10 || dy > 10) {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  const allFolders = getAllFolders(nodes);
  const unsavedCount = countUnsavedFiles(nodes);

  // Toggle open
  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(prev => toggleFolderOpen(prev, id));
  };

  const handleExpandAll = () => {
    setNodes(prev => setAllFoldersOpen(prev, true));
  };

  const handleCollapseAll = () => {
    setNodes(prev => setAllFoldersOpen(prev, false));
  };

  // Open Create Modal
  const openCreateDialog = (type: 'file' | 'folder', defaultParentId: string | null = selectedTargetFolderId) => {
    setShowCreateModal(type);
    setCreateTargetParentId(defaultParentId);
    setCreateNameInput(type === 'file' ? 'new-file.ts' : 'new-folder');
  };

  const confirmCreate = () => {
    if (!createNameInput.trim()) return;

    const isDir = showCreateModal === 'folder';
    const newNode: FileNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: createNameInput.trim(),
      type: isDir ? 'folder' : 'file',
      path: createNameInput.trim(),
      isOpen: true,
      isSaved: true,
      lastModified: Date.now(),
      size: 0,
      content: isDir ? undefined : `// ${createNameInput}\n`,
      children: isDir ? [] : undefined
    };

    setNodes(prev => addNode(prev, createTargetParentId, newNode));
    onAddLog('build', 'success', `تم إنشاء ${isDir ? 'مجلد' : 'ملف'}: ${newNode.name}`);

    if (!isDir) {
      handleFileClick(newNode);
    }

    setShowCreateModal(null);
    setCreateNameInput('');
  };

  // Rename
  const handleStartRename = (node: FileNode) => {
    setRenameTargetNode(node);
    setRenameInput(node.name);
    setContextMenu(null);
  };

  const confirmRename = () => {
    if (!renameTargetNode || !renameInput.trim()) return;
    setNodes(prev => renameNode(prev, renameTargetNode.id, renameInput.trim()));
    onAddLog('build', 'info', `تمت إعادة تسمية "${renameTargetNode.name}" إلى "${renameInput.trim()}"`);
    setRenameTargetNode(null);
  };

  // Move Node to another folder (touch/mobile friendly)
  const confirmMoveNode = () => {
    if (!moveTargetNode) return;
    const destParentId = targetFolderDestination === 'root' ? null : targetFolderDestination;
    setNodes(prev => moveNode(prev, moveTargetNode.id, destParentId));
    onAddLog('build', 'success', `تم نقل "${moveTargetNode.name}"`);
    setMoveTargetNode(null);
  };

  // Delete
  const handleDeleteNode = (node: FileNode) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف "${node.name}"؟`)) {
      setNodes(prev => removeNode(prev, node.id));
      onAddLog('build', 'warn', `تم حذف: ${node.path}`);
      setContextMenu(null);
    }
  };

  // Cut & Copy
  const handleCut = (node: FileNode) => {
    setClipboard({ nodeId: node.id, operation: 'cut', sourcePath: node.path });
    onAddLog('build', 'info', `قص: ${node.name} في الحافظة`);
    setContextMenu(null);
  };

  const handleCopy = (node: FileNode) => {
    setClipboard({ nodeId: node.id, operation: 'copy', sourcePath: node.path });
    onAddLog('build', 'info', `نسخ: ${node.name} في الحافظة`);
    setContextMenu(null);
  };

  // Paste
  const handlePaste = (targetFolderId: string | null) => {
    if (!clipboard) return;

    const sourceNode = findNodeById(nodes, clipboard.nodeId);
    if (!sourceNode) return;

    if (clipboard.operation === 'cut') {
      setNodes(prev => moveNode(prev, clipboard.nodeId, targetFolderId));
      onAddLog('build', 'success', `تم نقل "${sourceNode.name}"`);
      setClipboard(null);
    } else {
      // Copy node deeply
      const cloneNode = (n: FileNode): FileNode => ({
        ...n,
        id: `clone_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: n.id === sourceNode.id ? `copy_${n.name}` : n.name,
        children: n.children ? n.children.map(cloneNode) : undefined
      });
      const duplicated = cloneNode(sourceNode);
      setNodes(prev => addNode(prev, targetFolderId, duplicated));
      onAddLog('build', 'success', `تم لصق نسخة من "${sourceNode.name}"`);
    }
    setContextMenu(null);
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedNodeId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedNodeId && draggedNodeId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = draggedNodeId || e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetFolderId) {
      setNodes(prev => moveNode(prev, sourceId, targetFolderId));
      onAddLog('build', 'info', `تم سحب ونقل العنصر`);
    }
    setDraggedNodeId(null);
    setDragOverFolderId(null);
  };

  // Context Menu trigger
  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  // Render file icon by extension
  const renderIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return node.isOpen ? (
        <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
      );
    }

    const name = node.name.toLowerCase();
    if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.jsx')) {
      return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (name.endsWith('.html') || name.endsWith('.htm')) {
      return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
    }
    if (name.endsWith('.css') || name.endsWith('.scss')) {
      return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    if (name.endsWith('.json')) {
      return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    }
    if (name.endsWith('.md') || name.endsWith('.txt')) {
      return <FileText className="w-4 h-4 text-slate-300 shrink-0" />;
    }
    return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: FileNode, level = 0) => {
    const isFolderNode = node.type === 'folder';
    const isSelected = !isFolderNode && node.id === selectedFileId;
    const isTargetSelectedFolder = isFolderNode && node.id === selectedTargetFolderId;
    const isDragOver = isFolderNode && dragOverFolderId === node.id;
    const isCut = clipboard?.nodeId === node.id && clipboard.operation === 'cut';

    // Search filter check
    const matchesSearch = !searchFilter || 
      node.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
      node.path.toLowerCase().includes(searchFilter.toLowerCase());

    return (
      <div 
        key={node.id} 
        className={`${isCut ? 'opacity-40' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, node.id)}
        onDragOver={(e) => isFolderNode ? handleDragOver(e, node.id) : undefined}
        onDragLeave={handleDragLeave}
        onDrop={(e) => isFolderNode ? handleDrop(e, node.id) : undefined}
      >
        <div
          onClick={(e) => {
            if (isFolderNode) {
              handleToggle(node.id, e);
              setSelectedTargetFolderId(node.id);
            } else {
              handleFileClick(node);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          onTouchStart={(e) => handleTouchStart(e, node)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ paddingRight: `${level * 18 + 10}px` }}
          className={`group flex items-center justify-between py-1.5 px-2 rounded-[4px] text-xs font-mono select-none cursor-pointer transition-colors ${
            isSelected
              ? 'bg-[#3b82f6]/15 text-white border-r-2 border-[#3b82f6] font-medium'
              : isTargetSelectedFolder
              ? 'bg-[#334155]/60 text-white'
              : isDragOver
              ? 'bg-[#3b82f6]/20 border border-dashed border-[#3b82f6]'
              : 'hover:bg-[#334155]/40 text-[#f8fafc]'
          } ${!matchesSearch && searchFilter ? 'opacity-25' : ''}`}
          title={`${node.path} (انقر بالزر الأيمن لمزيد من الخيارات)`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Toggle arrow for folders */}
            {isFolderNode ? (
              <span 
                onClick={(e) => handleToggle(node.id, e)}
                className="w-4 h-4 flex items-center justify-center text-[#94a3b8] hover:text-white transition"
              >
                {node.isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                )}
              </span>
            ) : (
              <span className="w-4 h-4" />
            )}

            {/* Icon */}
            {renderIcon(node)}

            {/* Name */}
            <span className="truncate font-sans text-slate-200 group-hover:text-white">
              {node.name}
            </span>
          </div>

          {/* Badges & Action Buttons */}
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
            {/* Save indicator: checkmark (إشارة صح) for saved files */}
            {!isFolderNode && (
              node.isSaved !== false ? (
                <span 
                  title="تم حفظ الكود بنجاح ✓" 
                  className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[10px] font-mono"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">محفوظ</span>
                </span>
              ) : (
                <span 
                  title="تعديلات غير محفوظة" 
                  className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded text-[10px] font-mono animate-pulse"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>تعديل</span>
                </span>
              )
            )}

            {/* Folder count badge */}
            {isFolderNode && node.children && (
              <span className="text-[10px] text-[#94a3b8] px-1.5 py-0.2 rounded bg-[#0f172a] font-mono">
                {node.children.length}
              </span>
            )}

            {/* Hover Actions Menu Trigger */}
            <button
              type="button"
              onClick={(e) => handleContextMenu(e, node)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#334155] text-[#94a3b8] hover:text-white transition"
              title="خيارات إضافية"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children list */}
        {isFolderNode && node.isOpen && node.children && node.children.length > 0 && (
          <div className="flex flex-col">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section 
      id="section-filemanager" 
      className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 sm:p-6 shadow-sm transition-all scroll-mt-6"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-[4px] bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 flex items-center justify-center font-mono font-bold text-xs">
            2
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3b82f6]" />
              <span>مدير الملفات الشجري</span>
            </h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              استعراض تفاعلي للشجرة، سحب وإفلات لنقل الملفات، إنشاء مجلدات وملفات، ومتابعة علامات الحفظ
            </p>
          </div>
        </div>

        {/* Target Location Breadcrumb indicator */}
        <div className="flex flex-wrap items-center gap-2 text-xs bg-[#0f172a] px-2.5 py-1 rounded-[4px] border border-[#334155] text-[#94a3b8]">
          <span className="text-[#94a3b8]">مسار الإنشاء:</span>
          <span className="font-mono text-[#3b82f6] truncate max-w-[200px]">
            {selectedTargetFolderId 
              ? findNodeById(nodes, selectedTargetFolderId)?.path || 'الجذر /'
              : 'الجذر (المجلد الرئيسي)'}
          </span>
          {selectedTargetFolderId && (
            <button
              onClick={() => setSelectedTargetFolderId(null)}
              className="text-[#94a3b8] hover:text-white px-1 text-[10px] bg-[#1e293b] rounded cursor-pointer"
              title="إعادة التعيين إلى الجذر"
            >
              إلغاء
            </button>
          )}
          {/* Mobile Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileTreeCollapsed(prev => !prev)}
            className="sm:hidden mr-auto text-[11px] text-[#38bdf8] hover:text-white px-2 py-0.5 rounded bg-[#1e293b] border border-[#334155] cursor-pointer"
          >
            {isMobileTreeCollapsed ? 'عرض الشجرة' : 'طي الشجرة'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 bg-[#080d1a] p-2.5 rounded-[6px] border border-[#334155]">
        {/* Left / Creation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New File */}
          <button
            id="btn-new-file"
            type="button"
            onClick={() => openCreateDialog('file')}
            className="px-3 py-1.5 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>ملف جديد</span>
          </button>

          {/* New Folder */}
          <button
            id="btn-new-folder"
            type="button"
            onClick={() => openCreateDialog('folder')}
            className="px-3 py-1.5 rounded-[4px] bg-transparent hover:bg-[#334155]/60 text-[#94a3b8] hover:text-white border border-[#334155] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#10b981]" />
            <span>مجلد جديد</span>
          </button>

          {/* Expand / Collapse All */}
          <div className="flex items-center bg-[#0f172a] rounded-[4px] border border-[#334155] p-0.5">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-2 py-1 text-[#94a3b8] hover:text-white text-xs rounded transition flex items-center gap-1 cursor-pointer"
              title="فتح جميع المجلدات"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">توسيع الكل</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="px-2 py-1 text-[#94a3b8] hover:text-white text-xs rounded transition flex items-center gap-1 cursor-pointer"
              title="طوي جميع المجلدات"
            >
              <Minimize2 className="w-3 h-3" />
              <span className="hidden sm:inline">طوي الكل</span>
            </button>
          </div>

          {/* Clipboard indicator */}
          {clipboard && (
            <div className="badge-warn flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs">
              <Clipboard className="w-3 h-3" />
              <span className="text-[11px]">في الحافظة ({clipboard.operation === 'cut' ? 'قص' : 'نسخ'})</span>
              <button
                type="button"
                onClick={() => handlePaste(selectedTargetFolderId)}
                className="underline font-bold text-amber-200 hover:text-white mr-1 cursor-pointer"
              >
                لصق هنا
              </button>
            </div>
          )}
        </div>

        {/* Right / Search in tree filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="تصفية شجرة الملفات..."
            className="w-full bg-[#0b1120] text-[#f8fafc] text-xs pr-8 pl-3 py-1.5 rounded-[4px] border border-[#334155] focus:border-[#3b82f6] outline-none"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute left-2.5 top-2 text-[#94a3b8] hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tree View Container */}
      {isMobileTreeCollapsed ? (
        <div className="sm:hidden mt-3 p-3 bg-[#0b1120] border border-[#334155] rounded-[6px] text-xs text-[#94a3b8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>الشجرة مطوية على الهاتف ({nodes.length} عنصر رئيسي)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileTreeCollapsed(false)}
            className="text-[#3b82f6] font-medium hover:underline text-xs"
          >
            توسيع الشجرة
          </button>
        </div>
      ) : (
        <div 
          className="mt-3 bg-[#0b1120] border border-[#334155] rounded-[6px] p-2.5 min-h-[260px] max-h-[460px] overflow-y-auto"
          onDragOver={(e) => handleDragOver(e, null)}
          onDrop={(e) => handleDrop(e, null)}
        >
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#94a3b8] text-sm">
              <Folder className="w-10 h-10 text-[#334155] mb-2 stroke-[1.5]" />
              <p>لا يوجد هيكل معروض حتى الآن</p>
              <p className="text-xs text-[#94a3b8] mt-1">
                قم بلصق الهيكل في القسم الأول بالأعلى ثم اضغط على <strong>بناء الهيكل</strong>، أو انقر على <strong>ملف جديد</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {nodes.map(node => renderTreeNode(node, 0))}
            </div>
          )}
        </div>
      )}

      {/* Active Selected File Status Bar */}
      {selectedFileId && (
        <div className="mt-3 bg-[#080d1a] border border-[#334155] px-3.5 py-2 rounded-[6px] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">الملف النشط المحدد:</span>
            <span className="font-mono text-white font-bold flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-[#3b82f6]" />
              {findNodeById(nodes, selectedFileId)?.name}
            </span>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline" dir="ltr">
              (/{findNodeById(nodes, selectedFileId)?.path})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const f = findNodeById(nodes, selectedFileId);
                if (f) handleFileClick(f);
              }}
              className="px-3 py-1 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="فتح هذا الملف في محرر الأكواد ومربع اللصق"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>محرر ولصق الكود ↗</span>
            </button>
          </div>
        </div>
      )}

      {/* Tree footer stats */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#94a3b8] px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>كود محفوظ بنجاح</span>
            </span>
          </span>
          {unsavedCount > 0 && (
            <span className="badge-warn flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
              {unsavedCount} ملفات بها تعديلات غير محفوظة
            </span>
          )}
        </div>
        <div className="text-[#94a3b8] text-[11px]">
          اسحب وأفلت أي عنصر لنقله بين المجلدات | انقر على أي ملف لفتح محرر الكود ومربع اللصق
        </div>
      </div>

      {/* CREATE FILE/FOLDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1.5">
              {showCreateModal === 'file' ? (
                <>
                  <FilePlus className="w-4 h-4 text-[#3b82f6]" />
                  <span>إنشاء ملف جديد</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 text-[#10b981]" />
                  <span>إنشاء مجلد جديد</span>
                </>
              )}
            </h3>
            <p className="text-xs text-[#94a3b8] mb-4">
              أدخل الاسم واختر مسار الوجهة في شجرة المشروع.
            </p>

            {/* Target Folder Selector */}
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                موضع الإنشاء:
              </label>
              <select
                value={createTargetParentId || ''}
                onChange={(e) => setCreateTargetParentId(e.target.value || null)}
                className="w-full bg-[#0b1120] text-[#f8fafc] text-xs p-2 rounded-[4px] border border-[#334155] focus:border-[#3b82f6] outline-none"
              >
                <option value="">الجذر الرئيسي /</option>
                {allFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    📁 {folder.path}
                  </option>
                ))}
              </select>
            </div>

            {/* Name input */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                {showCreateModal === 'file' ? 'اسم الملف (مع الامتداد):' : 'اسم المجلد:'}
              </label>
              <input
                type="text"
                autoFocus
                value={createNameInput}
                onChange={(e) => setCreateNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmCreate(); }}
                placeholder={showCreateModal === 'file' ? 'مثال: utils.ts' : 'مثال: components'}
                className="w-full bg-[#0b1120] text-[#f8fafc] font-mono text-xs p-2 rounded-[4px] border border-[#334155] focus:border-[#3b82f6] outline-none"
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(null)}
                className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#334155]/60 text-[#94a3b8] hover:text-white border border-[#334155] text-xs font-medium transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmCreate}
                className="px-4 py-1.5 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-medium transition cursor-pointer"
              >
                تأكيد الإنشاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameTargetNode && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Edit2 className="w-4 h-4 text-[#3b82f6]" />
              <span>إعادة تسمية: {renameTargetNode.name}</span>
            </h3>
            <input
              type="text"
              autoFocus
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); }}
              className="w-full bg-[#0b1120] text-[#f8fafc] font-mono text-xs p-2 rounded-[4px] border border-[#334155] focus:border-[#3b82f6] outline-none mb-4"
              dir="ltr"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameTargetNode(null)}
                className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#334155]/60 text-[#94a3b8] hover:text-white border border-[#334155] text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmRename}
                className="px-4 py-1.5 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-medium cursor-pointer"
              >
                حفظ الاسم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPERTIES MODAL */}
      {propertiesNode && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#3b82f6]" />
                <span>خصائص العنصر: {propertiesNode.name}</span>
              </h3>
              <button
                onClick={() => setPropertiesNode(null)}
                className="text-[#94a3b8] hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#334155]">
                <span className="text-[#94a3b8]">النوع:</span>
                <span className="font-semibold text-white">
                  {propertiesNode.type === 'folder' ? 'مجلد دليل (Directory)' : 'ملف برمجي (File)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#334155]">
                <span className="text-[#94a3b8]">المسار الكامل:</span>
                <span className="font-mono text-[#3b82f6]" dir="ltr">/{propertiesNode.path}</span>
              </div>
              {propertiesNode.type === 'file' && (
                <>
                  <div className="flex justify-between py-1 border-b border-[#334155]">
                    <span className="text-[#94a3b8]">الحجم التقديري:</span>
                    <span className="text-white font-mono">
                      {propertiesNode.size ? `${propertiesNode.size} بايت (${(propertiesNode.size / 1024).toFixed(1)} KB)` : '0 بايت'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#334155]">
                    <span className="text-[#94a3b8]">عدد الأسطر:</span>
                    <span className="text-white font-mono">
                      {propertiesNode.content ? propertiesNode.content.split('\n').length : 0} سطر
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#334155]">
                    <span className="text-[#94a3b8]">حالة الحفظ:</span>
                    <span className={propertiesNode.isSaved !== false ? 'text-[#10b981]' : 'text-[#f59e0b]'}>
                      {propertiesNode.isSaved !== false ? 'محفوظ بالكامل ✓' : 'توجد تعديلات غير محفوظة'}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1">
                <span className="text-[#94a3b8]">تاريخ آخر تعديل:</span>
                <span className="text-white font-mono text-[11px]" dir="ltr">
                  {propertiesNode.lastModified ? new Date(propertiesNode.lastModified).toLocaleString('ar-EG') : 'الآن'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPropertiesNode(null)}
                className="px-4 py-1.5 bg-transparent hover:bg-[#334155]/60 border border-[#334155] text-white rounded-[4px] text-xs font-medium cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVE NODE MODAL (Touch & Mobile friendly destination selector) */}
      {moveTargetNode && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-[8px] p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155] mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Move className="w-4 h-4 text-[#f59e0b]" />
                <span>نقل "{moveTargetNode.name}"</span>
              </h3>
              <button
                onClick={() => setMoveTargetNode(null)}
                className="text-[#94a3b8] hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#94a3b8] mb-3">
              اختر المجلد الوجهة لنقل هذا العنصر إليه:
            </p>

            <select
              value={targetFolderDestination}
              onChange={(e) => setTargetFolderDestination(e.target.value)}
              className="w-full bg-[#0b1120] text-[#f8fafc] text-xs p-2 rounded-[4px] border border-[#334155] focus:border-[#3b82f6] outline-none mb-4 font-mono"
            >
              <option value="root">📁 الجذر / (المجلد الرئيسي)</option>
              {allFolders
                .filter(f => f.id !== moveTargetNode.id)
                .map(f => (
                  <option key={f.id} value={f.id}>
                    📁 /{f.path}
                  </option>
                ))}
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMoveTargetNode(null)}
                className="px-3.5 py-1.5 rounded-[4px] bg-transparent hover:bg-[#334155]/60 text-[#94a3b8] hover:text-white border border-[#334155] text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmMoveNode}
                className="px-4 py-1.5 rounded-[4px] bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Move className="w-3 h-3" />
                <span>تأكيد النقل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[#1e293b] border border-[#334155] rounded-[6px] shadow-2xl py-1 w-48 text-xs text-[#f8fafc]"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 240), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* If Folder: Create File / Create Folder */}
          {contextMenu.node.type === 'folder' && (
            <>
              <button
                type="button"
                onClick={() => {
                  openCreateDialog('file', contextMenu.node.id);
                  setContextMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>ملف جديد هنا</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openCreateDialog('folder', contextMenu.node.id);
                  setContextMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-[#10b981]" />
                <span>مجلد جديد هنا</span>
              </button>
              <div className="my-1 border-t border-[#334155]"></div>
            </>
          )}

          {/* If File: Open editor & paste box */}
          {contextMenu.node.type === 'file' && (
            <button
              type="button"
              onClick={() => {
                handleFileClick(contextMenu.node);
                setContextMenu(null);
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>فتح في محرر الكود ومربع اللصق</span>
            </button>
          )}

          {/* Rename */}
          <button
            type="button"
            onClick={() => handleStartRename(contextMenu.node)}
            className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>إعادة تسمية</span>
          </button>

          {/* Cut */}
          <button
            type="button"
            onClick={() => handleCut(contextMenu.node)}
            className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>قص</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={() => handleCopy(contextMenu.node)}
            className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ</span>
          </button>

          {/* Move to another folder (touch & mobile friendly) */}
          <button
            type="button"
            onClick={() => {
              setMoveTargetNode(contextMenu.node);
              setTargetFolderDestination(contextMenu.node.parentId || 'root');
              setContextMenu(null);
            }}
            className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer text-amber-300"
          >
            <Move className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>نقل إلى مجلد آخر...</span>
          </button>

          {/* Paste (if folder) */}
          {contextMenu.node.type === 'folder' && clipboard && (
            <button
              type="button"
              onClick={() => handlePaste(contextMenu.node.id)}
              className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 text-amber-300 font-semibold cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>لصق داخل هذا المجلد</span>
            </button>
          )}

          {/* Properties */}
          <button
            type="button"
            onClick={() => {
              setPropertiesNode(contextMenu.node);
              setContextMenu(null);
            }}
            className="w-full text-right px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>خصائص ومعلومات</span>
          </button>

          <div className="my-1 border-t border-[#334155]"></div>

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDeleteNode(contextMenu.node)}
            className="w-full text-right px-3 py-1.5 hover:bg-rose-600 hover:text-white flex items-center gap-2 text-rose-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>
        </div>
      )}

      {/* Backdrop listener to close context menu */}
      {contextMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setContextMenu(null)} 
          onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
        />
      )}
    </section>
  );
};
