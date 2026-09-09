import { FileNode } from '../types';

export interface SavedProjectRecord {
  id: string;
  name: string;
  updatedAt: number;
  nodeCount: number;
  fileCount: number;
  nodes: FileNode[];
}

const DB_NAME = 'ProjectStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('فشل فتح قاعدة بيانات IndexedDB'));
    };
  });
}

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === 'file') count++;
    if (n.children && n.children.length > 0) count += countFiles(n.children);
  }
  return count;
}

function countAllNodes(nodes: FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    count++;
    if (n.children && n.children.length > 0) count += countAllNodes(n.children);
  }
  return count;
}

/**
 * Save project nodes into IndexedDB
 */
export async function saveProjectToIndexedDB(
  name: string,
  nodes: FileNode[],
  projectId: string = 'current-project'
): Promise<SavedProjectRecord> {
  const db = await openDatabase();

  const record: SavedProjectRecord = {
    id: projectId,
    name: name.trim() || 'مشروعي البرمجي',
    updatedAt: Date.now(),
    nodeCount: countAllNodes(nodes),
    fileCount: countFiles(nodes),
    nodes: JSON.parse(JSON.stringify(nodes))
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error || new Error('فشل حفظ المشروع'));
  });
}

/**
 * Load project by ID from IndexedDB
 */
export async function loadProjectFromIndexedDB(
  projectId: string = 'current-project'
): Promise<SavedProjectRecord | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(projectId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => reject(request.error || new Error('فشل استرجاع المشروع'));
  });
}

/**
 * List all saved project snapshots from IndexedDB
 */
export async function listSavedProjects(): Promise<SavedProjectRecord[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results: SavedProjectRecord[] = request.result || [];
      results.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(results);
    };
    request.onerror = () => reject(request.error || new Error('فشل جلب قائمة المشاريع'));
  });
}

/**
 * Delete a saved project snapshot
 */
export async function deleteProjectFromIndexedDB(projectId: string): Promise<boolean> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(projectId);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error('فشل حذف المشروع'));
  });
}
