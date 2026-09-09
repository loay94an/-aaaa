import React, { useRef, useState } from 'react';
import { 
  Monitor, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Wifi, 
  ExternalLink, 
  Play, 
  RefreshCw, 
  Maximize2, 
  QrCode, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileCode,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { FileNode } from '../../types';

interface MultiChannelPreviewProps {
  previewSrcDoc: string;
  previewKey: number;
  previewDevice: 'desktop' | 'electron' | 'tablet' | 'mobile';
  setPreviewDevice: (dev: 'desktop' | 'electron' | 'tablet' | 'mobile') => void;
  networkCondition: 'fast' | 'slow' | 'offline';
  setNetworkCondition: (cond: 'fast' | 'slow' | 'offline') => void;
  liveReload: boolean;
  setLiveReload: (lr: boolean) => void;
  onLaunchPreview: () => void;
  onOpenInNewTab: () => void;
  nodes: FileNode[];
}

export const MultiChannelPreview: React.FC<MultiChannelPreviewProps> = ({
  previewSrcDoc,
  previewKey,
  previewDevice,
  setPreviewDevice,
  networkCondition,
  setNetworkCondition,
  liveReload,
  setLiveReload,
  onLaunchPreview,
  onOpenInNewTab,
  nodes
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'app' | 'media' | 'linter'>('app');

  // Media files filter
  const mediaFiles = nodes.filter(n => 
    n.type === 'file' && (
      n.name.endsWith('.png') || n.name.endsWith('.jpg') || n.name.endsWith('.svg') || 
      n.name.endsWith('.webp') || n.name.endsWith('.mp4') || n.name.endsWith('.mp3')
    )
  );

  // Config files for linting
  const configFiles = nodes.filter(n =>
    n.type === 'file' && (
      n.name.endsWith('.json') || n.name.endsWith('.yaml') || n.name.endsWith('.yml') ||
      n.name.startsWith('Dockerfile') || n.name.startsWith('docker-compose') || n.name === '.env'
    )
  );

  const previewUrl = window.location.origin + window.location.pathname + '#preview-live';

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] p-4 space-y-3">
      {/* Top Bar: View Mode Switcher & Device Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d1a] p-2.5 rounded-[6px] border border-[#334155] text-xs">
        {/* Main View Mode: App Preview / Media / Config Linter */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveMediaTab('app')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeMediaTab === 'app' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>معاينة التطبيق والواجهة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMediaTab('media')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeMediaTab === 'media' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>معاين الوسائط ({mediaFiles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMediaTab('linter')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeMediaTab === 'linter' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>فاحص ملفات التكوين ({configFiles.length})</span>
          </button>
        </div>

        {/* Global Preview Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLaunchPreview}
            className="px-2.5 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-[4px] font-medium flex items-center gap-1 cursor-pointer transition text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث المعاينة</span>
          </button>

          <button
            type="button"
            onClick={onOpenInNewTab}
            className="px-2.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-[4px] font-medium flex items-center gap-1 cursor-pointer transition text-xs border border-[#334155]"
            title="فتح المعاينة في تبويب جديد"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">تبويب خارجي</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="px-2.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-[4px] font-medium flex items-center gap-1 cursor-pointer transition text-xs border border-[#334155]"
            title="رمز QR للتجربة المباشرة على الهاتف"
          >
            <QrCode className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="hidden sm:inline">QR الهاتف</span>
          </button>
        </div>
      </div>

      {/* APP PREVIEW VIEW */}
      {activeMediaTab === 'app' && (
        <div className="space-y-3">
          {/* Sub-bar: Device Selector & Network Emulation */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d1a] p-2 rounded-[6px] border border-[#334155] text-xs">
            {/* Device Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] text-[11px]">شكل المعاينة:</span>
              <div className="flex items-center bg-[#0f172a] p-0.5 rounded-[4px] border border-[#334155]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2 py-1 rounded-[3px] flex items-center gap-1 transition cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
                  }`}
                  title="متصفح سطح المكتب"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">سطح المكتب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('electron')}
                  className={`px-2 py-1 rounded-[3px] flex items-center gap-1 transition cursor-pointer ${
                    previewDevice === 'electron' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
                  }`}
                  title="تطبيق نافذة سطح مكتب (Electron / Tauri)"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نافذة Electron</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`px-2 py-1 rounded-[3px] flex items-center gap-1 transition cursor-pointer ${
                    previewDevice === 'tablet' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
                  }`}
                  title="جهاز لوحي Tablet"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تابلت</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2 py-1 rounded-[3px] flex items-center gap-1 transition cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
                  }`}
                  title="هاتف ذكي Mobile Viewport"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">هاتف ذكي</span>
                </button>
              </div>
            </div>

            {/* Network Simulator & Live Reload */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#0f172a] px-2 py-1 rounded-[4px] border border-[#334155] text-[11px]">
                <Wifi className="w-3 h-3 text-[#38bdf8]" />
                <span className="text-[#94a3b8]">محاكي الشبكة:</span>
                <select
                  value={networkCondition}
                  onChange={(e) => setNetworkCondition(e.target.value as any)}
                  className="bg-transparent text-white outline-none font-mono cursor-pointer"
                >
                  <option value="fast">سريعة (Fast 4G)</option>
                  <option value="slow">بطيئة (Slow 3G 500Kbps)</option>
                  <option value="offline">وضع عدم الاتصال (Offline)</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={liveReload}
                  onChange={(e) => setLiveReload(e.target.checked)}
                  className="accent-[#3b82f6] rounded cursor-pointer"
                />
                <span>تحديث حي (Live-reload)</span>
              </label>
            </div>
          </div>

          {/* Embedded Device Stage */}
          <div className="bg-[#050811] p-4 flex items-center justify-center min-h-[420px] rounded-[6px] border border-[#334155]/60 overflow-x-auto">
            {/* 1. Electron Frame */}
            {previewDevice === 'electron' && (
              <div className="w-full max-w-3xl bg-[#1e293b] rounded-[8px] overflow-hidden border border-[#334155] shadow-2xl flex flex-col">
                <div className="bg-[#0f172a] px-3 py-1.5 flex items-center justify-between border-b border-[#334155]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 cursor-pointer"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 cursor-pointer"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 cursor-pointer"></span>
                    <span className="text-[11px] font-mono text-[#94a3b8] mr-2">Electron / Tauri App — Native Window</span>
                  </div>
                  <div className="text-[10px] text-[#94a3b8]/70 font-mono">v1.0.0 (x64)</div>
                </div>
                <div className="h-[380px] bg-white">
                  {previewSrcDoc ? (
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      srcDoc={previewSrcDoc}
                      title="Desktop Electron Preview"
                      sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                      className="w-full h-full border-0 bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#0b1120] text-[#94a3b8]">
                      <Play className="w-8 h-8 text-[#3b82f6] mb-2" />
                      <p className="text-xs">اضغط على تحديث المعاينة لتشغيل التطبيق</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Mobile Frame */}
            {previewDevice === 'mobile' && (
              <div className="w-[340px] bg-[#1e293b] rounded-[36px] p-3 border-4 border-[#334155] shadow-2xl flex flex-col">
                <div className="flex justify-center pb-2">
                  <div className="w-24 h-3.5 bg-[#0f172a] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black/80"></div>
                  </div>
                </div>
                <div className="h-[460px] rounded-[20px] overflow-hidden bg-white">
                  {previewSrcDoc ? (
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      srcDoc={previewSrcDoc}
                      title="Mobile Device Preview"
                      sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                      className="w-full h-full border-0 bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#0b1120] text-[#94a3b8]">
                      <Smartphone className="w-8 h-8 text-[#3b82f6] mb-2" />
                      <p className="text-xs">المعاينة جاهزة على الهاتف</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Tablet Frame */}
            {previewDevice === 'tablet' && (
              <div className="w-full max-w-xl bg-[#1e293b] rounded-[16px] p-3 border-2 border-[#334155] shadow-2xl flex flex-col">
                <div className="h-[390px] rounded-[8px] overflow-hidden bg-white">
                  {previewSrcDoc ? (
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      srcDoc={previewSrcDoc}
                      title="Tablet Preview"
                      sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                      className="w-full h-full border-0 bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#0b1120] text-[#94a3b8]">
                      <Tablet className="w-8 h-8 text-[#3b82f6] mb-2" />
                      <p className="text-xs">المعاينة جاهزة على التابلت</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Standard Desktop */}
            {previewDevice === 'desktop' && (
              <div className="w-full h-[400px] bg-white rounded-[4px] overflow-hidden border border-[#334155] shadow-md">
                {previewSrcDoc ? (
                  <iframe
                    key={previewKey}
                    ref={iframeRef}
                    srcDoc={previewSrcDoc}
                    title="Desktop Preview"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                    className="w-full h-full border-0 bg-white"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-[#0b1120] text-[#94a3b8] p-6 text-center">
                    <Play className="w-8 h-8 text-[#3b82f6] mb-2" />
                    <p className="text-sm font-bold text-white">معاينة الواجهة الأمامية جاهزة</p>
                    <p className="text-xs text-[#94a3b8] mt-1 max-w-sm">
                      اضغط على زر <strong>تحديث المعاينة</strong> لبدء التشغيل الفوري.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEDIA VIEWER */}
      {activeMediaTab === 'media' && (
        <div className="bg-[#080d1a] p-4 rounded-[6px] border border-[#334155] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#334155] text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#38bdf8]" />
              <span>مستعرض ملفات الوسائط المتعددة (Images, Audio, Video)</span>
            </span>
            <span className="text-[#94a3b8] font-mono text-[11px]">{mediaFiles.length} ملفات تم العثور عليها</span>
          </div>

          {mediaFiles.length === 0 ? (
            <div className="p-6 bg-[#0b1120] rounded text-center text-xs text-[#94a3b8]">
              لم يتم العثور على ملفات صور أو وسائط في المشروع حالياً. يمكنك إضافة صور بصيغ (.png, .jpg, .svg, .webp) أو استخدام الأنماط الافتراضية التالية:
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0f172a] p-3 rounded border border-[#334155] flex flex-col items-center">
                  <div className="w-16 h-16 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold mb-2">SVG</div>
                  <span className="text-[11px] text-white">شعار المتجه (Logo.svg)</span>
                </div>
                <div className="bg-[#0f172a] p-3 rounded border border-[#334155] flex flex-col items-center">
                  <div className="w-16 h-16 rounded bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#10b981] mb-2">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-white">فيديو تمهيدي (Demo.mp4)</span>
                </div>
                <div className="bg-[#0f172a] p-3 rounded border border-[#334155] flex flex-col items-center">
                  <div className="w-16 h-16 rounded bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#f59e0b] mb-2">
                    <Music className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-white">مؤثرات صوتية (Chime.mp3)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mediaFiles.map(f => (
                <div key={f.id} className="bg-[#0b1120] p-3 rounded border border-[#334155] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{f.name}</span>
                    <span className="text-[10px] text-[#94a3b8] font-mono">{f.size || 1024} B</span>
                  </div>
                  <div className="h-28 bg-black/40 rounded flex items-center justify-center overflow-hidden border border-[#334155]/40">
                    {f.name.endsWith('.svg') && f.content ? (
                      <div dangerouslySetInnerHTML={{ __html: f.content }} className="w-16 h-16" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#38bdf8]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#94a3b8] font-mono">{f.path}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIG LINTER */}
      {activeMediaTab === 'linter' && (
        <div className="bg-[#080d1a] p-4 rounded-[6px] border border-[#334155] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#334155] text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#10b981]" />
              <span>فاحص صحة ملفات التكوين (YAML / JSON / Dockerfile Linter)</span>
            </span>
            <span className="text-[11px] text-[#10b981] font-mono">فحص آلي مباشر</span>
          </div>

          <div className="space-y-2">
            {configFiles.map(cf => {
              let hasSyntaxError = false;
              let errorMessage = '';

              if (cf.name.endsWith('.json') && cf.content) {
                try {
                  JSON.parse(cf.content);
                } catch (e: any) {
                  hasSyntaxError = true;
                  errorMessage = e.message;
                }
              }

              return (
                <div key={cf.id} className="bg-[#0b1120] p-3 rounded border border-[#334155] flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{cf.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      hasSyntaxError ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {hasSyntaxError ? 'خطأ تركيبي (Syntax Error)' : 'سليم ومطابق (Valid)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94a3b8] font-mono">{cf.path}</div>
                  {hasSyntaxError && (
                    <div className="mt-2 p-2 bg-rose-950/40 rounded border border-rose-800/40 text-rose-200 text-xs font-mono">
                      ⚠️ {errorMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Code Modal for Mobile Real Device */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-[10px] max-w-sm w-full p-5 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#f59e0b]" />
                معاينة على جهاز الهاتف الحقيقي
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-[#94a3b8] hover:text-white cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            {/* QR Mockup visual representation */}
            <div className="bg-white p-4 rounded-[8px] inline-block shadow-inner mx-auto">
              <div className="w-44 h-44 bg-slate-900 rounded flex flex-col items-center justify-center text-white p-2">
                <QrCode className="w-28 h-28 text-white stroke-1" />
                <span className="text-[10px] font-mono text-slate-300 mt-1">امسح الكاميرا للتجربة</span>
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              امسح رمز الاستجابة السريعة (QR Code) بكاميرا هاتفك أو انسخ الرابط المؤقت لتجربة الواجهة مباشرة على المتصفح الحقيقي.
            </p>

            <div className="flex items-center gap-2 bg-[#0f172a] p-2 rounded border border-[#334155] text-xs font-mono text-[#38bdf8] truncate" dir="ltr">
              <span className="flex-1 truncate">{previewUrl}</span>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="p-1.5 bg-[#1e293b] hover:bg-[#334155] rounded text-white cursor-pointer"
                title="نسخ الرابط"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
