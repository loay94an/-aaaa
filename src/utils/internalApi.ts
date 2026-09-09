import { AnalysisReport, FileNode, PWAConfig, ProjectPreset, ExportOptions } from '../types';
import { analyzeProject } from './analyzer';
import { convertProjectToPWA } from './pwaGenerator';
import { addNode, findNodeById, findNodeByPath, parseTreeFromText, updateNodeContent } from './treeParser';
import { exportProjectToZip } from './zipUtils';

export interface ApiResponse<T = any> {
  status: number;
  ok: boolean;
  data?: T;
  error?: string;
  durationMs: number;
}

/**
 * In-app Internal API Dispatcher
 * Implements the requested REST endpoints:
 * - POST /api/parse-tree
 * - POST /api/create-node
 * - PUT /api/file
 * - GET /api/file
 * - POST /api/export-zip
 * - POST /api/convert-pwa
 * - POST /api/analyze
 */
export async function dispatchInternalApi(
  method: string,
  path: string,
  body: any,
  context: {
    nodes: FileNode[];
    setNodes: (nodes: FileNode[]) => void;
  }
): Promise<ApiResponse> {
  const startTime = performance.now();
  const cleanPath = path.split('?')[0];

  try {
    // 1. POST /api/parse-tree
    if (cleanPath === '/api/parse-tree' && method.toUpperCase() === 'POST') {
      const treeText = body?.text || '';
      const parsed = parseTreeFromText(treeText, true);
      const durationMs = Math.round(performance.now() - startTime);
      return {
        status: 200,
        ok: true,
        data: {
          nodeCount: parsed.length,
          tree: parsed
        },
        durationMs
      };
    }

    // 2. POST /api/create-node
    if (cleanPath === '/api/create-node' && method.toUpperCase() === 'POST') {
      const { parentId, name, type } = body || {};
      if (!name) throw new Error('حقل الاسم مطلوب');

      const newNode: FileNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        type: type === 'folder' ? 'folder' : 'file',
        path: name,
        isOpen: true,
        isSaved: true,
        lastModified: Date.now(),
        size: 0,
        content: type === 'folder' ? undefined : `// ${name}\n`,
        children: type === 'folder' ? [] : undefined
      };

      const updated = addNode(context.nodes, parentId || null, newNode);
      context.setNodes(updated);

      return {
        status: 201,
        ok: true,
        data: { createdNode: newNode, totalNodes: updated.length },
        durationMs: Math.round(performance.now() - startTime)
      };
    }

    // 3. PUT /api/file
    if (cleanPath === '/api/file' && method.toUpperCase() === 'PUT') {
      const { id, path: filePath, content } = body || {};
      let targetNode: FileNode | null = null;
      if (id) {
        targetNode = findNodeById(context.nodes, id);
      } else if (filePath) {
        targetNode = findNodeByPath(context.nodes, filePath);
      }

      if (!targetNode) throw new Error('الملف المطلوب غير موجود');

      const updated = updateNodeContent(context.nodes, targetNode.id, content ?? '', true);
      context.setNodes(updated);

      return {
        status: 200,
        ok: true,
        data: {
          id: targetNode.id,
          path: targetNode.path,
          size: (content || '').length,
          saved: true
        },
        durationMs: Math.round(performance.now() - startTime)
      };
    }

    // 4. GET /api/file
    if (cleanPath === '/api/file' && method.toUpperCase() === 'GET') {
      const { id, path: filePath } = body || {};
      let targetNode: FileNode | null = null;
      if (id) {
        targetNode = findNodeById(context.nodes, id);
      } else if (filePath) {
        targetNode = findNodeByPath(context.nodes, filePath);
      }

      if (!targetNode) throw new Error('الملف المطلوب غير موجود');

      return {
        status: 200,
        ok: true,
        data: {
          id: targetNode.id,
          name: targetNode.name,
          path: targetNode.path,
          type: targetNode.type,
          content: targetNode.content || '',
          isSaved: targetNode.isSaved ?? true
        },
        durationMs: Math.round(performance.now() - startTime)
      };
    }

    // 5. POST /api/export-zip
    if (cleanPath === '/api/export-zip' && method.toUpperCase() === 'POST') {
      const options: ExportOptions = {
        fileName: body?.fileName || 'project-export',
        excludeNodeModules: body?.excludeNodeModules !== false,
        excludeGit: body?.excludeGit !== false,
        compressionLevel: body?.compressionLevel || 6
      };

      await exportProjectToZip(context.nodes, options);

      return {
        status: 200,
        ok: true,
        data: {
          downloadStarted: true,
          fileName: `${options.fileName}.zip`
        },
        durationMs: Math.round(performance.now() - startTime)
      };
    }

    // 6. POST /api/convert-pwa
    if (cleanPath === '/api/convert-pwa' && method.toUpperCase() === 'POST') {
      const config: PWAConfig = {
        name: body?.name || 'My PWA App',
        shortName: body?.shortName || 'PWA',
        description: body?.description || 'Installable PWA Application',
        themeColor: body?.themeColor || '#3b82f6',
        backgroundColor: body?.backgroundColor || '#0f172a',
        display: body?.display || 'standalone',
        startUrl: '/',
        scope: '/'
      };

      const result = convertProjectToPWA(context.nodes, config);
      context.setNodes(result.updatedNodes);

      return {
        status: 200,
        ok: true,
        data: {
          createdFiles: result.createdFiles,
          updatedFiles: result.updatedFiles
        },
        durationMs: Math.round(performance.now() - startTime)
      };
    }

    // 7. POST /api/analyze
    if (cleanPath === '/api/analyze' && method.toUpperCase() === 'POST') {
      const preset: ProjectPreset = body?.preset || 'react';
      const report: AnalysisReport = analyzeProject(context.nodes, preset);

      return {
        status: 200,
        ok: true,
        data: report,
        durationMs: Math.round(performance.now() - startTime)
      };
    }

    // Default 404
    return {
      status: 404,
      ok: false,
      error: `المسار ${method} ${path} غير معرف`,
      durationMs: Math.round(performance.now() - startTime)
    };
  } catch (err: any) {
    return {
      status: 500,
      ok: false,
      error: err?.message || 'خطأ داخلي',
      durationMs: Math.round(performance.now() - startTime)
    };
  }
}
