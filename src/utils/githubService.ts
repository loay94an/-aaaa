import { FileNode } from '../types';
import { getAllFiles } from './treeParser';

export interface GitHubRepoInfo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  private: boolean;
  description: string | null;
}

export interface GitHubUserInfo {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubPushResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  repoUrl?: string;
  message: string;
  filesCount?: number;
  isNewRepo?: boolean;
}

export interface GitHubPushProgress {
  stage: 'idle' | 'verifying' | 'preparing_repo' | 'reading_files' | 'creating_blobs' | 'creating_tree' | 'creating_commit' | 'updating_ref' | 'completed' | 'error';
  percent: number;
  message: string;
}

const GITHUB_TOKEN_KEY = 'ai_studio_github_pat';
const GITHUB_OWNER_KEY = 'ai_studio_github_owner';
const GITHUB_REPO_KEY = 'ai_studio_github_repo';

/**
 * جلب رمز الوصول الشخصي (Personal Access Token) المحفوظ محلياً
 */
export function getStoredGitHubToken(): string {
  try {
    return localStorage.getItem(GITHUB_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * حفظ رمز الوصول الشخصي محلياً
 */
export function storeGitHubToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(GITHUB_TOKEN_KEY);
    }
  } catch {}
}

/**
 * جلب آخر مستودع ومالك تم استخدامه
 */
export function getStoredGitHubRepoDefaults(): { owner: string; repo: string } {
  try {
    return {
      owner: localStorage.getItem(GITHUB_OWNER_KEY) || '',
      repo: localStorage.getItem(GITHUB_REPO_KEY) || ''
    };
  } catch {
    return { owner: '', repo: '' };
  }
}

/**
 * حفظ آخر مستودع تم استخدامه
 */
export function storeGitHubRepoDefaults(owner: string, repo: string): void {
  try {
    if (owner) localStorage.setItem(GITHUB_OWNER_KEY, owner.trim());
    if (repo) localStorage.setItem(GITHUB_REPO_KEY, repo.trim());
  } catch {}
}

/**
 * التحقق من صلاحية التوكن وجلب معلومات المستخدم
 */
export async function verifyGitHubToken(token: string): Promise<GitHubUserInfo> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('يرجى إدخال رمز الوصول الشخصي لـ GitHub (Personal Access Token)');
  }

  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Studio-Cloud-App'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('رمز الوصول (Token) غير صالح أو منتهي الصلاحية');
    }
    if (response.status === 403) {
      throw new Error('تم تجاوز حد طلبات GitHub API أو الرمز يفتقر إلى الصلاحيات المطلوبة (repo)');
    }
    throw new Error(`خطأ في التحقق من GitHub (${response.status}): ${response.statusText}`);
  }

  return await response.json();
}

/**
 * جلب قائمة مستودعات المستخدم
 */
export async function fetchUserRepositories(token: string): Promise<GitHubRepoInfo[]> {
  const cleanToken = token.trim();
  const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&type=all', {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Studio-Cloud-App'
    }
  });

  if (!response.ok) {
    throw new Error(`تعذر جلب المستودعات (${response.status})`);
  }

  return await response.json();
}

/**
 * إنشاء مستودع جديد على GitHub
 */
export async function createGitHubRepository(
  token: string,
  repoName: string,
  options: {
    description?: string;
    isPrivate?: boolean;
    autoInit?: boolean;
  } = {}
): Promise<GitHubRepoInfo> {
  const cleanToken = token.trim();
  const cleanRepoName = repoName.trim().replace(/[^a-zA-Z0-9._-]/g, '-');

  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Studio-Cloud-App'
    },
    body: JSON.stringify({
      name: cleanRepoName,
      description: options.description || 'تم إنشاؤه ورفعه بواسطة بيئة استوديو التطوير السحابية',
      private: options.isPrivate ?? false,
      auto_init: options.autoInit ?? true
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `تعذر إنشاء المستودع الجديد (${response.status})`);
  }

  return await response.json();
}

/**
 * تحويل السلسلة النصية إلى Base64 آمن يدعم المحارف العربية والـ UTF-8
 */
function utf8ToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    // حل بديل في حال وجود محارف غير مدعومة
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * استبعاد ملفات node_modules و .git من الرفع
 */
function filterFilesForPush(
  files: FileNode[],
  excludeNodeModules = true,
  excludeGit = true
): FileNode[] {
  return files.filter(f => {
    const p = f.path.replace(/\\/g, '/');
    if (excludeNodeModules && (p.startsWith('node_modules/') || p.includes('/node_modules/'))) {
      return false;
    }
    if (excludeGit && (p.startsWith('.git/') || p.includes('/.git/'))) {
      return false;
    }
    return true;
  });
}

/**
 * رفع وتحديث المشروع بالكامل إلى مستودع GitHub باستخدام Git Trees & Commits API
 * مما يتيح رفع مئات الملفات في Commit موحد واحد وبسرعة فائقة.
 */
export async function pushProjectToGitHub(
  token: string,
  owner: string,
  repo: string,
  nodes: FileNode[],
  options: {
    branch?: string;
    commitMessage?: string;
    excludeNodeModules?: boolean;
    excludeGit?: boolean;
    onProgress?: (prog: GitHubPushProgress) => void;
  } = {}
): Promise<GitHubPushResult> {
  const cleanToken = token.trim();
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const branchName = options.branch?.trim() || 'main';
  const commitMsg = options.commitMessage?.trim() || 'تحديث ملفات المشروع عبر استوديو التطوير';
  const onProgress = options.onProgress || (() => {});

  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'AI-Studio-Cloud-App'
  };

  try {
    onProgress({ stage: 'verifying', percent: 10, message: 'جاري التحقق من المستودع والفرع المستهدف...' });

    // 1. جلب معلومات المستودع
    const repoRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        throw new Error(`المستودع ${cleanOwner}/${cleanRepo} غير موجود أو لا تملك إذن الوصول إليه.`);
      }
      throw new Error(`فشل التحقق من المستودع (${repoRes.status}): ${repoRes.statusText}`);
    }

    // 2. محاولة جلب مرجع الفرع (Branch Ref)
    let baseTreeSha: string | null = null;
    let parentCommitSha: string | null = null;
    let refExists = false;

    const refRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${branchName}`, { headers });
    if (refRes.ok) {
      refExists = true;
      const refData = await refRes.json();
      parentCommitSha = refData.object.sha;

      // جلب Commit الأخير لمعرفة Tree الأصلي
      const commitRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits/${parentCommitSha}`, { headers });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    } else if (refRes.status === 404) {
      // قد يكون المستودع جديداً بدون فروع، أو الفرع غير منشأ
      // نتحقق مما إذا كان هناك أي فرع افتراضي آخر
      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch || 'main';
      if (defaultBranch !== branchName) {
        const defaultRefRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${defaultBranch}`, { headers });
        if (defaultRefRes.ok) {
          const defaultRefData = await defaultRefRes.json();
          parentCommitSha = defaultRefData.object.sha;
          const commitRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits/${parentCommitSha}`, { headers });
          if (commitRes.ok) {
            const commitData = await commitRes.json();
            baseTreeSha = commitData.tree.sha;
          }
        }
      }
    }

    // 3. تصفية وتجهيز الملفات
    onProgress({ stage: 'reading_files', percent: 25, message: 'تجهيز وضغط ملفات المشروع للرفع...' });
    const allFiles = getAllFiles(nodes);
    const validFiles = filterFilesForPush(allFiles, options.excludeNodeModules ?? true, options.excludeGit ?? true);

    if (validFiles.length === 0) {
      throw new Error('لا توجد أي ملفات صالحة في المشروع لرفعها إلى المستودع.');
    }

    // 4. إنشاء كائنات الـ Blobs لكل ملف عبر GitHub Git Blobs API
    onProgress({ stage: 'creating_blobs', percent: 40, message: `جاري رفع كائنات الملفات (${validFiles.length} ملف)...` });
    const treeItems: Array<{ path: string; mode: string; type: 'blob'; sha: string }> = [];

    let processedCount = 0;
    for (const file of validFiles) {
      const cleanPath = file.path.replace(/^\/+/, '').replace(/\\/g, '/');
      const contentBase64 = utf8ToBase64(file.content || '');

      const blobRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: contentBase64,
          encoding: 'base64'
        })
      });

      if (!blobRes.ok) {
        const blobErr = await blobRes.json().catch(() => ({}));
        throw new Error(`فشل رفع الملف ${cleanPath}: ${blobErr.message || blobRes.statusText}`);
      }

      const blobData = await blobRes.json();
      treeItems.push({
        path: cleanPath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha
      });

      processedCount++;
      const currentPercent = 40 + Math.round((processedCount / validFiles.length) * 30);
      onProgress({
        stage: 'creating_blobs',
        percent: currentPercent,
        message: `تم تحضير ${processedCount} من أصل ${validFiles.length} ملف...`
      });
    }

    // 5. إنشاء Tree جديد على GitHub
    onProgress({ stage: 'creating_tree', percent: 75, message: 'إنشاء شجرة الملفات (Git Tree)...' });
    const treeBody: any = { tree: treeItems };
    if (baseTreeSha) {
      treeBody.base_tree = baseTreeSha;
    }

    const newTreeRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(treeBody)
    });

    if (!newTreeRes.ok) {
      const treeErr = await newTreeRes.json().catch(() => ({}));
      throw new Error(`فشل بناء Git Tree: ${treeErr.message || newTreeRes.statusText}`);
    }
    const newTreeData = await newTreeRes.json();

    // 6. إنشاء Commit جديد
    onProgress({ stage: 'creating_commit', percent: 85, message: 'تسجيل التغييرات في Commit جديد...' });
    const commitPayload: any = {
      message: commitMsg,
      tree: newTreeData.sha,
      parents: parentCommitSha ? [parentCommitSha] : []
    };

    const newCommitRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commitPayload)
    });

    if (!newCommitRes.ok) {
      const commitErr = await newCommitRes.json().catch(() => ({}));
      throw new Error(`فشل إنشاء الـ Commit: ${commitErr.message || newCommitRes.statusText}`);
    }
    const newCommitData = await newCommitRes.json();

    // 7. تحديث أو إنشاء المرجع (Git Ref) ليشير إلى الـ Commit الجديد
    onProgress({ stage: 'updating_ref', percent: 95, message: `تحديث فرع ${branchName}...` });
    if (refExists) {
      const updateRefRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${branchName}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: newCommitData.sha,
          force: true
        })
      });

      if (!updateRefRes.ok) {
        const refErr = await updateRefRes.json().catch(() => ({}));
        throw new Error(`فشل تحديث الفرع: ${refErr.message || updateRefRes.statusText}`);
      }
    } else {
      const createRefRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: newCommitData.sha
        })
      });

      if (!createRefRes.ok) {
        const refErr = await createRefRes.json().catch(() => ({}));
        throw new Error(`فشل إنشاء الفرع ${branchName}: ${refErr.message || createRefRes.statusText}`);
      }
    }

    onProgress({ stage: 'completed', percent: 100, message: 'اكتمل رفع المشروع بنجاح!' });

    // حفظ المالك والمستودع للاستخدام التالي
    storeGitHubRepoDefaults(cleanOwner, cleanRepo);

    return {
      success: true,
      commitSha: newCommitData.sha,
      commitUrl: `https://github.com/${cleanOwner}/${cleanRepo}/commit/${newCommitData.sha}`,
      repoUrl: `https://github.com/${cleanOwner}/${cleanRepo}`,
      filesCount: validFiles.length,
      message: `تم رفع وتحديث ${validFiles.length} ملف في مستودع GitHub بنجاح عبر الـ Commit: ${newCommitData.sha.substring(0, 7)}`
    };

  } catch (error: any) {
    onProgress({ stage: 'error', percent: 0, message: error?.message || 'حدث خطأ أثناء الاتصال بـ GitHub' });
    throw error;
  }
}
