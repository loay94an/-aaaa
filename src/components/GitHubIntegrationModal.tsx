import React, { useEffect, useState } from 'react';
import { 
  Github, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Key, 
  FolderGit2, 
  GitBranch, 
  Plus, 
  Lock, 
  Globe, 
  Check, 
  Copy, 
  Info,
  X
} from 'lucide-react';
import { FileNode } from '../types';
import { 
  getStoredGitHubToken, 
  storeGitHubToken, 
  getStoredGitHubRepoDefaults, 
  storeGitHubRepoDefaults,
  verifyGitHubToken, 
  fetchUserRepositories, 
  createGitHubRepository, 
  pushProjectToGitHub, 
  GitHubUserInfo, 
  GitHubRepoInfo, 
  GitHubPushProgress, 
  GitHubPushResult 
} from '../utils/githubService';

interface GitHubIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: FileNode[];
  onAddLog: (category: 'build' | 'runtime' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export const GitHubIntegrationModal: React.FC<GitHubIntegrationModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onAddLog
}) => {
  // Token state
  const [token, setToken] = useState<string>('');
  const [userInfo, setUserInfo] = useState<GitHubUserInfo | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Repositories state
  const [repos, setRepos] = useState<GitHubRepoInfo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
  
  // Custom repo mode: 'select' | 'new'
  const [repoMode, setRepoMode] = useState<'select' | 'new'>('new');
  const [newRepoName, setNewRepoName] = useState<string>('my-ai-studio-project');
  const [newRepoDescription, setNewRepoDescription] = useState<string>('مشروع برمجيات تفاعلي تم بناؤه ورفعه بواسطة استوديو التطوير السحابي');
  const [isPrivateRepo, setIsPrivateRepo] = useState<boolean>(false);

  // Commit & Branch details
  const [targetBranch, setTargetBranch] = useState<string>('main');
  const [commitMessage, setCommitMessage] = useState<string>('تحديث ملفات المشروع عبر استوديو التطوير السحابي');
  const [excludeNodeModules, setExcludeNodeModules] = useState<boolean>(true);
  const [excludeGit, setExcludeGit] = useState<boolean>(true);

  // Push status
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushProgress, setPushProgress] = useState<GitHubPushProgress | null>(null);
  const [pushResult, setPushResult] = useState<GitHubPushResult | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Load stored token & defaults
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredGitHubToken();
      if (stored) {
        setToken(stored);
        handleAutoVerify(stored);
      }
      const defaults = getStoredGitHubRepoDefaults();
      if (defaults.owner && defaults.repo) {
        setSelectedRepoFullName(`${defaults.owner}/${defaults.repo}`);
      }
    }
  }, [isOpen]);

  // Auto-verify if token is present
  const handleAutoVerify = async (pat: string) => {
    setIsVerifyingToken(true);
    setTokenError(null);
    try {
      const user = await verifyGitHubToken(pat);
      setUserInfo(user);
      loadUserRepos(pat);
    } catch (err: any) {
      setUserInfo(null);
      setTokenError(err?.message || 'رمز الوصول غير صالح');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleVerifyClick = async () => {
    if (!token.trim()) {
      setTokenError('يرجى إدخال رمز الوصول الشخصي أولاً');
      return;
    }
    setIsVerifyingToken(true);
    setTokenError(null);
    setPushResult(null);
    setPushError(null);
    try {
      const user = await verifyGitHubToken(token);
      setUserInfo(user);
      storeGitHubToken(token);
      onAddLog('build', 'success', `تم الاتصال بحساب GitHub بنجاح: @${user.login}`);
      await loadUserRepos(token);
    } catch (err: any) {
      setUserInfo(null);
      setTokenError(err?.message || 'فشل التحقق من رمز الوصول');
      onAddLog('build', 'error', `فشل الاتصال بـ GitHub: ${err?.message}`);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const loadUserRepos = async (pat: string) => {
    setIsLoadingRepos(true);
    try {
      const list = await fetchUserRepositories(pat);
      setRepos(list);
      if (list.length > 0 && !selectedRepoFullName) {
        setSelectedRepoFullName(list[0].full_name);
      }
    } catch (err) {
      console.warn('Could not load user repos:', err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleDisconnect = () => {
    storeGitHubToken('');
    setToken('');
    setUserInfo(null);
    setRepos([]);
    setTokenError(null);
    setPushResult(null);
  };

  // Perform project push
  const handlePushProject = async () => {
    if (!token.trim() || !userInfo) {
      setTokenError('يرجى تسجيل الدخول إلى GitHub أولاً');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushResult(null);
    setPushProgress({ stage: 'verifying', percent: 5, message: 'بدء عملية النقل إلى GitHub...' });

    try {
      let targetOwner = userInfo.login;
      let targetRepoName = '';

      if (repoMode === 'new') {
        if (!newRepoName.trim()) {
          throw new Error('يرجى تحديد اسم المستودع الجديد');
        }
        setPushProgress({ stage: 'preparing_repo', percent: 15, message: `إنشاء المستودع الجديد "${newRepoName}" على GitHub...` });
        
        try {
          const createdRepo = await createGitHubRepository(token, newRepoName, {
            description: newRepoDescription,
            isPrivate: isPrivateRepo,
            autoInit: true
          });
          targetRepoName = createdRepo.name;
          targetOwner = createdRepo.full_name.split('/')[0] || userInfo.login;
          onAddLog('build', 'success', `تم إنشاء مستودع جديد على GitHub: ${createdRepo.html_url}`);
        } catch (createErr: any) {
          // If repo already exists, check if user wants to push to it
          if (createErr.message?.includes('already exists') || createErr.message?.includes('name already exists')) {
            targetRepoName = newRepoName.trim();
          } else {
            throw createErr;
          }
        }
      } else {
        if (!selectedRepoFullName) {
          throw new Error('يرجى اختيار المستودع المستهدف من القائمة');
        }
        const [owner, name] = selectedRepoFullName.split('/');
        targetOwner = owner;
        targetRepoName = name;
      }

      // Execute push
      const result = await pushProjectToGitHub(
        token,
        targetOwner,
        targetRepoName,
        nodes,
        {
          branch: targetBranch,
          commitMessage,
          excludeNodeModules,
          excludeGit,
          onProgress: (prog) => setPushProgress(prog)
        }
      );

      setPushResult(result);
      onAddLog('build', 'success', `🚀 [GitHub Integration]: ${result.message}`);
      // Refresh repos list
      loadUserRepos(token);

    } catch (err: any) {
      console.error('[GitHub Push Error]:', err);
      const msg = err?.message || 'حدث خطأ أثناء رفع المشروع إلى GitHub';
      setPushError(msg);
      onAddLog('build', 'error', `فشل رفع المشروع إلى GitHub: ${msg}`);
    } finally {
      setIsPushing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-[#334155] rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#334155] bg-[#1e293b]/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-inner">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  التكامل المباشر مع GitHub
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                  Git Trees API
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                رفع وتحديث مشروعك الحالي إلى مستودع خارجي على GitHub وحفظ التغييرات
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300 custom-scrollbar">
          
          {/* STEP 1: Authentication */}
          <div className="p-4 bg-[#080d1a] border border-[#334155] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Key className="w-4 h-4 text-amber-400" />
                <span>1. المصادقة وربط الحساب</span>
              </div>
              
              {userInfo && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متصل باسم @{userInfo.login}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    (قطع الاتصال)
                  </button>
                </div>
              )}
            </div>

            {!userInfo ? (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  أدخل <strong>Personal Access Token (classic)</strong> بصلاحية <code>repo</code> ليتمكن الاستوديو من إنشاء المستودعات وتحديث ملفاتك مباشرة.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-[#0b1120] text-white p-2.5 rounded-lg border border-slate-700 focus:border-blue-500 font-mono text-xs outline-none"
                      dir="ltr"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isVerifyingToken || !token.trim()}
                    onClick={handleVerifyClick}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                  >
                    {isVerifyingToken ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>تحقق وربط</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=AI%20Studio%20Code%20Deployer"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                  >
                    <span>إنشاء رمز جديد على GitHub الآن (صلاحية repo)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>يتم حفظ الرمز في متصفحك محلياً فقط 🔒</span>
                </div>

                {tokenError && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{tokenError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-[#0b1120] rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={userInfo.avatar_url}
                    alt={userInfo.login}
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      {userInfo.name || userInfo.login}
                    </div>
                    <a
                      href={userInfo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:underline font-mono"
                      dir="ltr"
                    >
                      @{userInfo.login}
                    </a>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <span>تم التوثيق بصلاحية كاملة</span>
                  <div className="text-emerald-400 font-mono text-[10px]">Active & Verified</div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Target Repository Setup */}
          {userInfo && (
            <div className="p-4 bg-[#080d1a] border border-[#334155] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <FolderGit2 className="w-4 h-4 text-blue-400" />
                  <span>2. اختيار أو إنشاء المستودع (Repository)</span>
                </div>

                {/* Tabs: New vs Existing */}
                <div className="flex items-center bg-[#0f172a] p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRepoMode('new')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      repoMode === 'new'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>مستودع جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepoMode('select')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      repoMode === 'select'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FolderGit2 className="w-3 h-3" />
                    <span>مستودع حالي</span>
                  </button>
                </div>
              </div>

              {repoMode === 'new' ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      اسم المستودع الجديد (Repository Name):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono text-xs bg-[#0b1120] px-2.5 py-2 rounded-lg border border-slate-800 select-none">
                        {userInfo.login} /
                      </span>
                      <input
                        type="text"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder="my-cool-project"
                        className="flex-1 bg-[#0b1120] text-white p-2 rounded-lg border border-slate-700 focus:border-blue-500 font-mono text-xs outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      الوصف (Description):
                    </label>
                    <input
                      type="text"
                      value={newRepoDescription}
                      onChange={(e) => setNewRepoDescription(e.target.value)}
                      placeholder="وصف مختصر للمشروع"
                      className="w-full bg-[#0b1120] text-white p-2 rounded-lg border border-slate-700 focus:border-blue-500 text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="repoPrivacy"
                        checked={!isPrivateRepo}
                        onChange={() => setIsPrivateRepo(false)}
                        className="accent-blue-500"
                      />
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>عام (Public - يمكن للجميع رؤيته)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="repoPrivacy"
                        checked={isPrivateRepo}
                        onChange={() => setIsPrivateRepo(true)}
                        className="accent-blue-500"
                      />
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>خاص (Private - أنت فقط ومشاريعك)</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                      <span>اختر المستودع لتحديث ملفاته:</span>
                      <button
                        type="button"
                        onClick={() => loadUserRepos(token)}
                        className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingRepos ? 'animate-spin' : ''}`} />
                        <span>تحديث القائمة</span>
                      </button>
                    </label>

                    {repos.length > 0 ? (
                      <select
                        value={selectedRepoFullName}
                        onChange={(e) => setSelectedRepoFullName(e.target.value)}
                        className="w-full bg-[#0b1120] text-white p-2 rounded-lg border border-slate-700 focus:border-blue-500 text-xs outline-none font-mono"
                        dir="ltr"
                      >
                        {repos.map(r => (
                          <option key={r.id} value={r.full_name}>
                            {r.full_name} {r.private ? '🔒 (خاص)' : '🌐 (عام)'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-[#0b1120] border border-slate-800 rounded-lg text-slate-400 text-center">
                        {isLoadingRepos ? 'جاري تحميل المستودعات...' : 'لا توجد مستودعات متاحة، يمكنك إنشاء مستودع جديد بالأعلى.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Commit & Push Settings */}
          {userInfo && (
            <div className="p-4 bg-[#080d1a] border border-[#334155] rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>3. تفاصيل الـ Commit والتفرع</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    الفرع المستهدف (Branch):
                  </label>
                  <input
                    type="text"
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-[#0b1120] text-white p-2 rounded-lg border border-slate-700 focus:border-blue-500 font-mono text-xs outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    رسالة الـ Commit:
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="تحديث ملفات المشروع"
                    className="w-full bg-[#0b1120] text-white p-2 rounded-lg border border-slate-700 focus:border-blue-500 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Exclusion filters */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
                  <input
                    type="checkbox"
                    checked={excludeNodeModules}
                    onChange={(e) => setExcludeNodeModules(e.target.checked)}
                    className="accent-blue-500 rounded"
                  />
                  <span>استبعاد مجلدات <code>node_modules</code></span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
                  <input
                    type="checkbox"
                    checked={excludeGit}
                    onChange={(e) => setExcludeGit(e.target.checked)}
                    className="accent-blue-500 rounded"
                  />
                  <span>استبعاد مجلدات <code>.git</code></span>
                </label>
              </div>
            </div>
          )}

          {/* Progress Bar during Push */}
          {isPushing && pushProgress && (
            <div className="p-4 bg-blue-950/40 border border-blue-800 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{pushProgress.message}</span>
                </span>
                <span className="font-mono">{pushProgress.percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${pushProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Push Error Notification */}
          {pushError && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <div className="font-bold text-xs">تعذر استكمال الرفع إلى GitHub</div>
                <p className="text-[11px] text-rose-300 mt-0.5 leading-relaxed">{pushError}</p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {pushResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-700 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>تم الرفع والتحديث إلى GitHub بنجاح! 🚀</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {pushResult.message}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {pushResult.repoUrl && (
                  <a
                    href={pushResult.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>فتح المستودع على GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {pushResult.commitUrl && (
                  <a
                    href={pushResult.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition font-mono"
                  >
                    <span>عرض الـ Commit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {pushResult.repoUrl && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(pushResult.repoUrl || '')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ' : 'نسخ رابط المستودع'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#334155] bg-[#1e293b]/50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>يتم رفع ملفات المشروع الحالية عبر Git Blobs و Commits بدون فقدان أي بيانات</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs"
            >
              إغلاق
            </button>

            <button
              type="button"
              disabled={isPushing || !userInfo}
              onClick={handlePushProject}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              {isPushing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الرفع...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-white" />
                  <span>رفع وتحديث المشروع على GitHub 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
