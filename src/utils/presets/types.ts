import { FileNode } from '../../types';

export interface PresetFile {
  path: string;
  content: string;
}

export interface CompletePreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge: string;
  description: string;
  treeText: string;
  files: PresetFile[];
  entryFilePath?: string;
}

/**
 * Builds a hierarchical FileNode tree from a list of files with relative paths.
 */
export function buildNodesFromPreset(preset: CompletePreset): FileNode[] {
  const rootId = `root_${preset.id}_${Date.now()}`;
  const folderMap = new Map<string, FileNode>();

  // Determine top folder name from tree text or preset ID
  const firstLine = preset.treeText.split('\n')[0].trim().replace(/\/$/, '');
  const rootName = firstLine.replace(/[├──└──│\s]/g, '') || preset.id;

  const rootNode: FileNode = {
    id: rootId,
    name: rootName,
    type: 'folder',
    path: rootName,
    isOpen: true,
    children: [],
    parentId: null
  };
  folderMap.set('', rootNode);
  folderMap.set(rootName, rootNode);

  for (const f of preset.files) {
    const rawPath = f.path.startsWith('/') ? f.path.slice(1) : f.path;
    const parts = rawPath.split('/').filter(Boolean);

    // If path doesn't start with rootName, prepend it
    const fullParts = parts[0] === rootName ? parts : [rootName, ...parts];
    const fileName = fullParts[fullParts.length - 1];
    const dirParts = fullParts.slice(0, -1);

    // Ensure all ancestor folders exist
    let currentPath = '';
    let parentFolder = rootNode;

    for (let i = 0; i < dirParts.length; i++) {
      const seg = dirParts[i];
      currentPath = currentPath ? `${currentPath}/${seg}` : seg;

      if (!folderMap.has(currentPath)) {
        const folderNode: FileNode = {
          id: `folder_${preset.id}_${currentPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: seg,
          type: 'folder',
          path: currentPath,
          isOpen: true,
          children: [],
          parentId: parentFolder.id
        };
        if (!parentFolder.children) parentFolder.children = [];
        parentFolder.children.push(folderNode);
        folderMap.set(currentPath, folderNode);
      }
      parentFolder = folderMap.get(currentPath)!;
    }

    const filePath = fullParts.join('/');
    const fileNode: FileNode = {
      id: `file_${preset.id}_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: fileName,
      type: 'file',
      path: filePath,
      content: f.content,
      isSaved: true,
      size: f.content.length,
      lastModified: Date.now(),
      parentId: parentFolder.id
    };

    if (!parentFolder.children) parentFolder.children = [];
    parentFolder.children.push(fileNode);
  }

  return [rootNode];
}
