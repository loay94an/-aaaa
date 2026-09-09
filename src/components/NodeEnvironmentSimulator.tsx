import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Server, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Play, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Check, 
  Copy,
  Layers
} from 'lucide-react';
import { FileNode, LogCategory, LogLevel } from '../types';
import { getAllFiles } from '../utils/treeParser';

/**
 * دالة توليد كود محاكي Node.js Process
 */
export function generateNodeProcessCode(envVars: Record<string, string>): string {
  const safeEnvJson = JSON.stringify(envVars);
  return `
    (function() {
      // 1. Process Polyfill
      const initialEnv = ${safeEnvJson};
      
      const processObj = {
        env: Object.assign({
          NODE_ENV: 'development',
          PORT: '3000',
          HOST: '0.0.0.0',
          PWD: '/',
          HOME: '/home/node',
          PLATFORM: 'linux'
        }, initialEnv),
        
        cwd: function() { return '/'; },
        nextTick: function(fn, ...args) {
          if (typeof queueMicrotask === 'function') {
            queueMicrotask(() => fn(...args));
          } else {
            setTimeout(() => fn(...args), 0);
          }
        },
        platform: 'linux',
        arch: 'x64',
        version: 'v20.11.0',
        versions: {
          node: '20.11.0',
          v8: '11.3.244.8-node.17',
          uv: '1.44.2',
          zlib: '1.2.13',
          brotli: '1.0.9',
          ares: '1.20.1',
          modules: '115',
          nghttp2: '1.58.0',
          napi: '9',
          llhttp: '8.1.1',
          openssl: '3.0.13+quic'
        },
        argv: ['/usr/local/bin/node', '/app/index.js'],
        pid: 1042,
        uptime: function() { return Math.floor(performance.now() / 1000); },
        memoryUsage: function() {
          return {
            rss: 104857600,
            heapTotal: 52428800,
            heapUsed: 31457280,
            external: 1048576,
            arrayBuffers: 524288
          };
        },
        stdout: {
          write: function(msg) { console.log(msg); return true; },
          isTTY: true
        },
        stderr: {
          write: function(msg) { console.error(msg); return true; },
          isTTY: true
        },
        stdin: {
          isTTY: false,
          on: function() { return this; },
          once: function() { return this; }
        },
        on: function(event, handler) { return this; },
        once: function(event, handler) { return this; },
        off: function(event, handler) { return this; },
        addListener: function(event, handler) { return this; },
        removeListener: function(event, handler) { return this; },
        emit: function(event, ...args) { return true; },
        exit: function(code) {
          console.warn('[Node.js Simulator] تم استدعاء process.exit بكود:', code);
        }
      };

      window.process = processObj;
      window.global = window.global || window;
      window.global.process = processObj;
      window.globalThis.process = processObj;

      // Timers polyfills
      if (typeof window.setImmediate === 'undefined') {
        window.setImmediate = function(fn, ...args) {
          return setTimeout(() => fn(...args), 0);
        };
      }
      if (typeof window.clearImmediate === 'undefined') {
        window.clearImmediate = function(id) {
          clearTimeout(id);
        };
      }
    })();
  `;
}

/**
 * دالة توليد كود محاكي Buffer
 */
export function generateNodeBufferCode(): string {
  return `
    (function() {
      // 2. Buffer Polyfill
      function createBufferFromBytes(arr) {
        const u8 = new Uint8Array(arr);
        u8._isBuffer = true;
        
        u8.toString = function(encoding) {
          encoding = (encoding || 'utf8').toLowerCase();
          if (encoding === 'hex') {
            let hex = '';
            for (let i = 0; i < u8.length; i++) {
              hex += u8[i].toString(16).padStart(2, '0');
            }
            return hex;
          }
          if (encoding === 'base64') {
            let binary = '';
            for (let i = 0; i < u8.length; i++) {
              binary += String.fromCharCode(u8[i]);
            }
            try { return btoa(binary); } catch(e) { return ''; }
          }
          if (encoding === 'ascii' || encoding === 'binary') {
            let res = '';
            for (let i = 0; i < u8.length; i++) res += String.fromCharCode(u8[i] & 0x7f);
            return res;
          }
          // Default UTF-8 decoder
          try {
            return new TextDecoder('utf-8').decode(u8);
          } catch(e) {
            let str = '';
            for (let i = 0; i < u8.length; i++) str += String.fromCharCode(u8[i]);
            return str;
          }
        };

        u8.slice = function(start, end) {
          const sub = Uint8Array.prototype.subarray.call(u8, start, end);
          return createBufferFromBytes(sub);
        };

        return u8;
      }

      const Buffer = {
        isBuffer: function(obj) {
          return Boolean(obj && (obj._isBuffer || obj instanceof Uint8Array));
        },
        from: function(data, encoding) {
          if (typeof data === 'string') {
            encoding = (encoding || 'utf8').toLowerCase();
            if (encoding === 'base64') {
              try {
                const bin = atob(data);
                const arr = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
                return createBufferFromBytes(arr);
              } catch(e) {
                return createBufferFromBytes([]);
              }
            }
            if (encoding === 'hex') {
              const clean = data.replace(/[^0-9a-fA-F]/g, '');
              const arr = new Uint8Array(Math.floor(clean.length / 2));
              for (let i = 0; i < arr.length; i++) {
                arr[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
              }
              return createBufferFromBytes(arr);
            }
            // UTF-8 string encoding
            try {
              return createBufferFromBytes(new TextEncoder().encode(data));
            } catch(e) {
              const arr = new Uint8Array(data.length);
              for (let i = 0; i < data.length; i++) arr[i] = data.charCodeAt(i) & 0xff;
              return createBufferFromBytes(arr);
            }
          }
          if (Array.isArray(data) || (data && data.buffer instanceof ArrayBuffer)) {
            return createBufferFromBytes(data);
          }
          if (data && typeof data.length === 'number') {
            return createBufferFromBytes(Array.from(data));
          }
          return createBufferFromBytes([]);
        },
        alloc: function(size, fill) {
          const s = Math.max(0, parseInt(size, 10) || 0);
          const arr = new Uint8Array(s);
          if (typeof fill === 'number') {
            arr.fill(fill);
          } else if (typeof fill === 'string' && fill.length > 0) {
            arr.fill(fill.charCodeAt(0));
          }
          return createBufferFromBytes(arr);
        },
        allocUnsafe: function(size) {
          return Buffer.alloc(size);
        },
        byteLength: function(str, encoding) {
          if (typeof str !== 'string') return (str && str.length) || 0;
          try {
            return new TextEncoder().encode(str).length;
          } catch(e) {
            return str.length;
          }
        },
        concat: function(list, totalLength) {
          if (!Array.isArray(list) || list.length === 0) return createBufferFromBytes([]);
          if (totalLength === undefined) {
            totalLength = list.reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
          }
          const res = new Uint8Array(totalLength);
          let offset = 0;
          for (const item of list) {
            if (!item) continue;
            res.set(item, offset);
            offset += item.length;
          }
          return createBufferFromBytes(res);
        },
        compare: function(buf1, buf2) {
          if (buf1 === buf2) return 0;
          const len = Math.min(buf1.length, buf2.length);
          for (let i = 0; i < len; i++) {
            if (buf1[i] !== buf2[i]) return buf1[i] < buf2[i] ? -1 : 1;
          }
          return buf1.length < buf2.length ? -1 : (buf1.length > buf2.length ? 1 : 0);
        }
      };

      window.Buffer = Buffer;
      window.global = window.global || window;
      window.global.Buffer = Buffer;
      window.globalThis.Buffer = Buffer;
    })();
  `;
}

/**
 * دالة استخراج متغيرات البيئة من ملفات المشروع (مثل .env و .env.example)
 */
export function extractEnvFromProjectFiles(nodes: FileNode[]): Record<string, string> {
  const envVars: Record<string, string> = {};
  const allFiles = getAllFiles(nodes);
  
  // البحث عن ملفات .env و .env.example و .env.local
  const envFiles = allFiles.filter(f => 
    (f.name === '.env' || f.name.startsWith('.env.') || f.name === 'dotenv') && f.content
  );

  for (const file of envFiles) {
    if (!file.content) continue;
    const lines = file.content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (key && !envVars[key]) {
          envVars[key] = val;
        }
      }
    }
  }

  return envVars;
}

/**
 * حقن كائنات process و Buffer مباشرة في نافذة الـ iframe
 */
export function injectNodeEnvironmentToIframe(
  iframe: HTMLIFrameElement | null, 
  customEnv: Record<string, string> = {}
): boolean {
  if (!iframe) return false;
  
  try {
    const win = iframe.contentWindow as any;
    if (!win) return false;

    // تشغيل كود محاكي Process
    const processScript = generateNodeProcessCode(customEnv);
    win.eval(processScript);

    // تشغيل كود محاكي Buffer
    const bufferScript = generateNodeBufferCode();
    win.eval(bufferScript);

    console.info('[NodeEnvironmentSimulator] تم حقن process و Buffer بنجاح في contentWindow للـ iframe.');
    return true;
  } catch (err) {
    // في حالة تعذر الـ eval المباشر بسبب حماية معينة، نقوم بإنشاء عنصر script داخل الـ DOM
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        const scriptEl = doc.createElement('script');
        scriptEl.id = 'node-env-simulator-injected-script';
        scriptEl.textContent = `
          ${generateNodeProcessCode(customEnv)}
          ${generateNodeBufferCode()}
        `;
        doc.head ? doc.head.appendChild(scriptEl) : doc.body.appendChild(scriptEl);
        return true;
      }
    } catch (innerErr) {
      console.warn('[NodeEnvironmentSimulator] تعذر الحقن المباشر في iframe (ربما بسبب القيود الأمنية):', innerErr);
    }
  }
  return false;
}

export interface NodeEnvironmentSimulatorProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  nodes: FileNode[];
  previewKey?: number;
  onAddLog?: (category: LogCategory, level: LogLevel, message: string) => void;
  className?: string;
}

/**
 * مكون محاكي بيئة Node.js (process & Buffer) التفاعلي
 */
export const NodeEnvironmentSimulator: React.FC<NodeEnvironmentSimulatorProps> = ({
  iframeRef,
  nodes,
  previewKey = 1,
  onAddLog,
  className = ''
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isInjected, setIsInjected] = useState<boolean>(false);
  const [customEnvVars, setCustomEnvVars] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState<string>('');
  const [newVal, setNewVal] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const onAddLogRef = useRef(onAddLog);
  onAddLogRef.current = onAddLog;

  // المتغيرات الافتراضية الأساسية
  const defaultEnv: Record<string, string> = useMemo(() => ({
    NODE_ENV: 'development',
    PORT: '3000',
    HOST: '0.0.0.0',
    PWD: '/',
    HOME: '/home/node',
    PLATFORM: 'linux',
    VITE_APP_TITLE: 'Live Preview',
    GEMINI_API_KEY: 'mock-gemini-key'
  }), []);

  // استخراج المتغيرات من ملفات المشروع بشكل حسابي دون الحاجة لـ setState داخل useEffect
  const projectEnvs = useMemo(() => extractEnvFromProjectFiles(nodes), [nodes]);

  // دمج المتغيرات الافتراضية مع ملفات المشروع والمتغيرات المخصصة
  const envVars: Record<string, string> = useMemo(() => ({
    ...defaultEnv,
    ...projectEnvs,
    ...customEnvVars
  }), [defaultEnv, projectEnvs, customEnvVars]);

  const envVarsRef = useRef(envVars);
  envVarsRef.current = envVars;

  // تنفيذ عملية الحقن في iframe بدقة وبدون التسبب في إعادة تقديم لا نهائية
  const performInjection = useCallback((notifyUser: boolean = false) => {
    if (!iframeRef.current) return false;
    
    const currentEnvs = envVarsRef.current;
    const success = injectNodeEnvironmentToIframe(iframeRef.current, currentEnvs);
    if (success) {
      setIsInjected(prev => (prev ? prev : true));
      if (notifyUser && onAddLogRef.current) {
        onAddLogRef.current(
          'runtime', 
          'success', 
          `[محاكي Node.js]: تم حقن كائنات process و Buffer بنجاح (${Object.keys(currentEnvs).length} متغيرات بيئية مجهزة)`
        );
      }
    }
    return success;
  }, [iframeRef]);

  // ربط المحاكي بالمعاينة فور تحميل أو تغيير المشروع أو تحديث الـ previewKey
  useEffect(() => {
    // محاولة فورية
    performInjection(false);

    // تأكيد إضافي بعد وقت قصير لضمان اكتمال تحميل كود الـ iframe الداخلي
    const timer1 = setTimeout(() => {
      performInjection(false);
    }, 250);

    const timer2 = setTimeout(() => {
      performInjection(false);
    }, 750);

    // استماع لحدث اكتمال تحميل الـ iframe إذا كان متاحاً
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        performInjection(false);
      };
      iframe.addEventListener('load', handleLoad);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        iframe.removeEventListener('load', handleLoad);
      };
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [previewKey, performInjection, iframeRef]);

  // إعادة الحقن عند تحديث المتغيرات البيئية
  useEffect(() => {
    performInjection(false);
  }, [envVars, performInjection]);

  // اختبار عمل محاكي process و Buffer داخل الـ iframe الحقيقي
  const handleTestSimulator = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) {
        setTestResult('⚠️ نافذة المعاينة غير متاحة حالياً.');
        return;
      }

      const win = iframe.contentWindow as any;
      const hasProcess = Boolean(win.process && win.process.env);
      const hasBuffer = Boolean(win.Buffer && typeof win.Buffer.from === 'function');

      if (hasProcess && hasBuffer) {
        const testBuf = win.Buffer.from('NodeSim').toString('hex');
        const nodeEnv = win.process.env.NODE_ENV || 'undefined';
        const port = win.process.env.PORT || 'undefined';
        const successMsg = `✅ المحاكي نشط: process.env.NODE_ENV='${nodeEnv}' • PORT='${port}' • Buffer.from('NodeSim').hex='${testBuf}'`;
        setTestResult(successMsg);
        if (onAddLogRef.current) onAddLogRef.current('runtime', 'success', `[اختبار المحاكي]: ${successMsg}`);
      } else {
        // إعادة الحقن فوراً
        performInjection(true);
        setTestResult('🔄 جاري إعادة الحقن والتأكد من تفعيل الكائنات...');
      }
    } catch (err: any) {
      setTestResult(`⚠️ تعذر الاختبار المباشر: ${err?.message || err}`);
    }

    setTimeout(() => setTestResult(null), 5000);
  };

  // إضافة متغير بيئة جديد
  const handleAddEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    const cleanKey = newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const updatedCustom = { ...customEnvVars, [cleanKey]: newVal.trim() };
    setCustomEnvVars(updatedCustom);
    setNewKey('');
    setNewVal('');
    
    // حقن المتغيرات المحدثة فوراً في الـ iframe
    if (iframeRef.current) {
      const updated = { ...defaultEnv, ...projectEnvs, ...updatedCustom };
      injectNodeEnvironmentToIframe(iframeRef.current, updated);
      if (onAddLogRef.current) {
        onAddLogRef.current('runtime', 'info', `[محاكي Node.js]: تم تحديث وحقن المتغير ${cleanKey}=${newVal.trim()}`);
      }
    }
  };

  // حذف متغير بيئة
  const handleDeleteEnv = (keyToDelete: string) => {
    const updatedCustom = { ...customEnvVars };
    delete updatedCustom[keyToDelete];
    setCustomEnvVars(updatedCustom);
    if (iframeRef.current) {
      const updated = { ...defaultEnv, ...projectEnvs, ...updatedCustom };
      injectNodeEnvironmentToIframe(iframeRef.current, updated);
    }
  };

  // نسخ المتغير للحافظة
  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(`${key}=${val}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envCount = Object.keys(envVars).length;

  return (
    <div className={`bg-slate-900/90 border border-slate-700/80 rounded-[6px] overflow-hidden text-right shadow-xs ${className}`}>
      {/* شريط حالة المحاكي السريع */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <span>محاكي بيئة Node.js</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              process & Buffer مفعّلان
            </span>
          </div>
          <span className="text-slate-500 text-xs hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {envCount} متغيرات بيئة جاهزة
          </span>
        </div>

        {/* أزرار الإجراءات السريعة */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={handleTestSimulator}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
            title="فحص واختبار توفر كائنات process و Buffer داخل نافذة المعاينة"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>اختبار الحقن</span>
          </button>

          <button
            type="button"
            onClick={performInjection}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
            title="إعادة حقن process و Buffer والمتغيرات في المعاينة فوراً"
          >
            <RefreshCw className="w-3 h-3 text-sky-400" />
            <span>إعادة الحقن</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition cursor-pointer border ${
              isPanelOpen 
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>إدارة المتغيرات ({envCount})</span>
            {isPanelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* تنبيه نتيجة الاختبار */}
      {testResult && (
        <div className="px-3 py-1.5 text-[11px] bg-slate-950 border-b border-slate-800 text-emerald-300 flex items-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono">{testResult}</span>
        </div>
      )}

      {/* لوحة إدارة وتعديل متغيرات البيئة process.env */}
      {isPanelOpen && (
        <div className="p-3 bg-slate-900/95 border-b border-slate-800 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              يمكنك تخصيص أو إضافة أي متغيرات بيئية يحتاجها تطبيقك (مثل <code className="text-amber-300 font-mono">PORT</code>، <code className="text-amber-300 font-mono">NODE_ENV</code>، مفاتيح الـ API)، وسيتم حقنها فورياً في كائن <code className="text-blue-300 font-mono">process.env</code>:
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              window.process.env
            </span>
          </div>

          {/* نموذج إضافة متغير بيئة جديد */}
          <form onSubmit={handleAddEnv} className="flex flex-wrap items-center gap-2 bg-slate-950/70 p-2 rounded border border-slate-800">
            <div className="flex-1 min-w-[120px]">
              <input
                type="text"
                placeholder="اسم المتغير (مثال: API_URL)"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <input
                type="text"
                placeholder="القيمة (مثال: https://api.example.com)"
                value={newVal}
                onChange={e => setNewVal(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة وحقن</span>
            </button>
          </form>

          {/* شبكة المتغيرات الحالية */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(Object.entries(envVars) as [string, string][]).map(([key, val]) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between gap-1.5 p-1.5 bg-slate-950/80 border border-slate-800 rounded hover:border-slate-700 transition group"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden text-right">
                    <span className="text-[10px] font-mono font-bold text-blue-400 shrink-0">
                      {key}:
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 truncate" title={val}>
                      "{val}"
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => handleCopy(key, val)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
                      title="نسخ المتغير"
                    >
                      {copiedKey === key ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEnv(key)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="حذف المتغير"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
