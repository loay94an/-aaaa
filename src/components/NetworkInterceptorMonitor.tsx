import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  Clock, 
  Send, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Code2, 
  Copy, 
  Check, 
  Trash2, 
  Zap,
  Globe
} from 'lucide-react';
import { InterceptedRequestLog } from '../utils/networkInterceptor';
import { LogCategory, LogLevel } from '../types';

interface NetworkInterceptorMonitorProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  previewKey: number;
  onAddLog?: (category: LogCategory, level: LogLevel, message: string) => void;
}

export const NetworkInterceptorMonitor: React.FC<NetworkInterceptorMonitorProps> = ({
  iframeRef,
  previewKey,
  onAddLog
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [requests, setRequests] = useState<InterceptedRequestLog[]>([]);
  const [selectedReq, setSelectedReq] = useState<InterceptedRequestLog | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual test simulation state
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/health');
  const [testMethod, setTestMethod] = useState<string>('GET');
  const [testPayload, setTestPayload] = useState<string>('{\n  "message": "اختبار معترض الشبكة"\n}');
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const onAddLogRef = useRef(onAddLog);
  onAddLogRef.current = onAddLog;

  // Listen for message events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'preview-network-intercept' && event.data.log) {
        const log: InterceptedRequestLog = event.data.log;
        setRequests(prev => [log, ...prev.slice(0, 49)]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Clear requests on preview re-render if needed or provide button
  const handleClearRequests = () => {
    setRequests([]);
    setSelectedReq(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch(e) {}
  };

  // Trigger test fetch inside preview iframe
  const handleDispatchTestFetch = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      if (onAddLogRef.current) {
        onAddLogRef.current('runtime', 'warn', '[معترض الشبكة]: نافذة المعاينة غير متاحة لتشغيل طلب الاختبار.');
      }
      return;
    }

    setIsTesting(true);
    try {
      const win = iframeRef.current.contentWindow as any;
      let bodyData: any = undefined;
      if (testMethod !== 'GET' && testPayload.trim()) {
        try {
          bodyData = testPayload.trim();
        } catch(e) {}
      }

      const fetchOptions: any = {
        method: testMethod,
        headers: { 'Content-Type': 'application/json' }
      };
      if (bodyData) fetchOptions.body = bodyData;

      win.fetch(testEndpoint, fetchOptions)
        .then(async (res: any) => {
          const json = await res.json();
          setIsTesting(false);
          if (onAddLogRef.current) {
            onAddLogRef.current('runtime', 'success', `[معترض الشبكة] تم التقاط الطلب بنجاح: ${testMethod} ${testEndpoint} => 200 OK`);
          }
        })
        .catch((err: any) => {
          setIsTesting(false);
          if (onAddLogRef.current) {
            onAddLogRef.current('runtime', 'error', `[معترض الشبكة] خطأ في تشغيل الطلب: ${err?.message || err}`);
          }
        });
    } catch(err: any) {
      setIsTesting(false);
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterMethod === 'ALL') return true;
    return r.method === filterMethod;
  });

  return (
    <div className="bg-[#0b1329] border border-cyan-900/60 rounded-[8px] overflow-hidden text-slate-200 text-xs shadow-md">
      {/* Header bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-gradient-to-r from-slate-900 via-[#0b192e] to-[#0f172a] flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="font-bold text-slate-100 text-xs sm:text-sm">
            معترض طلبات الشبكة (Network Interceptor)
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
            محاكي /api نشط
          </span>
          {requests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              {requests.length} طلب ملتقط
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            منع أخطاء 404 والاستجابة لطلبات Full-Stack
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Accordion body */}
      {isOpen && (
        <div className="p-3 space-y-3 border-t border-cyan-900/40 bg-slate-950/70">
          {/* Controls and Test bar */}
          <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>اختبار اعتراض طلب API فوري داخل المعاينة:</span>
              </span>

              {/* Filter and Clear */}
              <div className="flex items-center gap-1.5">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-300 text-[11px] px-2 py-1 rounded cursor-pointer"
                >
                  <option value="ALL">كل الطرق (Methods)</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <button
                  type="button"
                  onClick={handleClearRequests}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 cursor-pointer transition"
                  title="مسح سجل الطلبات الملتقطة"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>مسح السجل</span>
                </button>
              </div>
            </div>

            {/* Test form */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-cyan-300 font-mono font-bold text-xs px-2.5 py-1.5 rounded"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  placeholder="/api/health أو /api/users أو /api/chat"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs px-3 py-1.5 rounded focus:border-cyan-500 focus:outline-none"
                  dir="ltr"
                />
              </div>

              <button
                type="button"
                onClick={handleDispatchTestFetch}
                disabled={isTesting}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{isTesting ? 'جاري الإرسال...' : 'إرسال واعتراض'}</span>
              </button>
            </div>

            {/* Preset quick endpoints */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 self-center">مسارات سريعة:</span>
              {[
                { label: 'الفحص /api/health', url: '/api/health', method: 'GET' },
                { label: 'المستخدم /api/user', url: '/api/user', method: 'GET' },
                { label: 'تسجيل /api/auth/login', url: '/api/auth/login', method: 'POST' },
                { label: 'الذكاء /api/chat', url: '/api/chat', method: 'POST' },
                { label: 'الموظفين /api/employees', url: '/api/employees', method: 'GET' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTestEndpoint(p.url);
                    setTestMethod(p.method);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-950/80 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-700/60 font-mono cursor-pointer transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intercepted requests feed & details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Request list */}
            <div className="bg-slate-900/70 p-2 rounded border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pb-1 border-b border-slate-800">
                <span>سجل الطلبات الملتقطة ({filteredRequests.length})</span>
                <span className="text-[10px] text-slate-400">انقر لعرض الاستجابة</span>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredRequests.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    لم يتم التقاط أي طلبات شبكة بعد. قم بتشغيل التطبيق أو استخدم زر "إرسال واعتراض" أعلاه.
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedReq(req)}
                      className={`p-1.5 rounded cursor-pointer border transition flex items-center justify-between text-[11px] ${
                        selectedReq?.id === req.id 
                          ? 'bg-cyan-950/60 border-cyan-600/70 text-cyan-200' 
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className={`px-1 py-0.2 rounded font-mono text-[9px] font-bold ${
                          req.method === 'GET' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          req.method === 'POST' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          req.method === 'DELETE' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {req.method}
                        </span>
                        <span className="font-mono text-xs text-slate-200 truncate" dir="ltr">
                          {req.url}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1 py-0.2 text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded">
                          {req.status} OK
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {req.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Request & Response details view */}
            <div className="bg-slate-900/70 p-2 rounded border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>تفاصيل الاستجابة المحاكاة (200 OK)</span>
                </span>
                {selectedReq && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(selectedReq.responseBody, null, 2), selectedReq.id)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                  >
                    {copiedId === selectedReq.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === selectedReq.id ? 'تم النسخ' : 'نسخ JSON'}</span>
                  </button>
                )}
              </div>

              {selectedReq ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>المسار: <strong className="text-cyan-300">{selectedReq.url}</strong></span>
                    <span>النوع: {selectedReq.contentType}</span>
                  </div>

                  <div className="max-h-44 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-[10px] text-emerald-300 custom-scrollbar" dir="ltr">
                    <pre>{JSON.stringify(selectedReq.responseBody, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500 text-xs">
                  اختر أي طلب من القائمة لمعاينة كائن JSON والبيانات التي تم الرد بها افتراضياً.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
