import JSZip from 'jszip';
import { ExportOptions, FileNode } from '../types';
import { generateUniqueId, getAllFiles, isFolder, updatePaths } from './treeParser';

/**
 * Creates a downloadable ZIP archive from the current project tree
 */
export async function exportProjectToZip(
  nodes: FileNode[],
  options: ExportOptions
): Promise<void> {
  const zip = new JSZip();
  const allFiles = getAllFiles(nodes);

  for (const file of allFiles) {
    // Check exclusion filters
    if (options.excludeNodeModules && (file.path.startsWith('node_modules/') || file.path.includes('/node_modules/'))) {
      continue;
    }
    if (options.excludeGit && (file.path.startsWith('.git/') || file.path.includes('/.git/'))) {
      continue;
    }

    zip.file(file.path, file.content || '');
  }

  // Generate blob with compression option
  const compression = options.compressionLevel > 0 ? 'DEFLATE' : 'STORE';
  const blob = await zip.generateAsync({
    type: 'blob',
    compression,
    compressionOptions: {
      level: options.compressionLevel || 6
    }
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const downloadName = options.fileName.endsWith('.zip') ? options.fileName : `${options.fileName}.zip`;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a ZIP file and converts its contents into FileNode[] hierarchy
 */
export async function importZipFile(file: File): Promise<FileNode[]> {
  const zip = await JSZip.loadAsync(file);
  const rootNodes: FileNode[] = [];
  const pathToNodeMap = new Map<string, FileNode>();

  const entries: { path: string; isDir: boolean; contentPromise?: Promise<string> }[] = [];

  zip.forEach((relativePath, zipEntry) => {
    // Normalize path, strip leading & trailing slashes, replace backslashes
    const cleanPath = relativePath.replace(/^[\\/]+/, '').replace(/[\\/]+$/, '').replace(/\\/g, '/');
    if (!cleanPath) return;

    if (zipEntry.dir) {
      entries.push({ path: cleanPath, isDir: true });
    } else {
      const lower = cleanPath.toLowerCase();
      const isBinaryImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.ico') || lower.endsWith('.gif');

      entries.push({
        path: cleanPath,
        isDir: false,
        contentPromise: isBinaryImage
          ? zipEntry.async('base64').then(b64 => {
              const mime = lower.endsWith('.png') ? 'image/png' 
                : lower.endsWith('.ico') ? 'image/x-icon' 
                : lower.endsWith('.webp') ? 'image/webp'
                : lower.endsWith('.gif') ? 'image/gif' 
                : 'image/jpeg';
              return `data:${mime};base64,${b64}`;
            }).catch(() => '')
          : zipEntry.async('string').catch(() => '')
      });
    }
  });

  // Sort entries so parent directories come before child files
  entries.sort((a, b) => a.path.localeCompare(b.path));

  for (const entry of entries) {
    const parts = entry.path.split('/').filter(p => p.trim().length > 0);
    let currentPath = '';
    let parentNode: FileNode | null = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = i === parts.length - 1;
      const isDir = !isLeaf || entry.isDir;

      let existing = pathToNodeMap.get(currentPath);
      if (!existing) {
        let content: string | undefined = undefined;
        if (isLeaf && !isDir && entry.contentPromise) {
          try {
            content = await entry.contentPromise;
          } catch {
            content = '';
          }
        }

        const newNode: FileNode = {
          id: generateUniqueId(),
          name: part,
          type: isDir ? 'folder' : 'file',
          path: currentPath,
          isOpen: true,
          isSaved: true,
          lastModified: Date.now(),
          content: isDir ? undefined : (content ?? ''),
          size: content ? content.length : 0,
          children: isDir ? [] : undefined,
          parentId: parentNode ? parentNode.id : null
        };

        pathToNodeMap.set(currentPath, newNode);

        if (parentNode) {
          if (!parentNode.children) parentNode.children = [];
          parentNode.children.push(newNode);
        } else {
          rootNodes.push(newNode);
        }

        existing = newNode;
      }

      if (isDir) {
        parentNode = existing;
      }
    }
  }

  updatePaths(rootNodes);
  return rootNodes;
}

/**
 * Imports files from a folder upload (FileList with webkitRelativePath)
 */
export async function importFolderFiles(files: FileList): Promise<FileNode[]> {
  const rootNodes: FileNode[] = [];
  const pathToNodeMap = new Map<string, FileNode>();

  const fileArray = Array.from(files);
  // Sort paths
  fileArray.sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name));

  for (const file of fileArray) {
    const rawPath = file.webkitRelativePath || file.name;
    const cleanPath = rawPath.replace(/^[\\/]+/, '').replace(/[\\/]+$/, '').replace(/\\/g, '/');
    const parts = cleanPath.split('/').filter(p => p.trim().length > 0);
    let currentPath = '';
    let parentNode: FileNode | null = null;

    const fileContent = await readFileContent(file);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = i === parts.length - 1;
      const isDir = !isLeaf;

      let existing = pathToNodeMap.get(currentPath);
      if (!existing) {
        const newNode: FileNode = {
          id: generateUniqueId(),
          name: part,
          type: isDir ? 'folder' : 'file',
          path: currentPath,
          isOpen: true,
          isSaved: true,
          lastModified: file.lastModified || Date.now(),
          content: isDir ? undefined : fileContent,
          size: isDir ? 0 : file.size,
          children: isDir ? [] : undefined,
          parentId: parentNode ? parentNode.id : null
        };

        pathToNodeMap.set(currentPath, newNode);

        if (parentNode) {
          if (!parentNode.children) parentNode.children = [];
          parentNode.children.push(newNode);
        } else {
          rootNodes.push(newNode);
        }

        existing = newNode;
      }

      if (isDir) {
        parentNode = existing;
      }
    }
  }

  updatePaths(rootNodes);
  return rootNodes;
}

function readFileContent(file: File): Promise<string> {
  return new Promise((resolve) => {
    const lower = file.name.toLowerCase();
    const isBinaryImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.ico') || lower.endsWith('.gif');

    const reader = new FileReader();
    if (isBinaryImage) {
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    }
  });
}
