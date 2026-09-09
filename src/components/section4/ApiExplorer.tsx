import React, { useState } from 'react';
import { 
  Activity, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  Code, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers,
  Server
} from 'lucide-react';
import { FileNode } from '../../types';

interface ApiExplorerProps {
  nodes: FileNode[];
  onAddLog: (category: 'runtime' | 'build' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
  backendPort: number;
}

interface HeaderItem {
  key: string;
  value: string;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({ nodes, onAddLog, backendPort }) => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('POST');
  const [endpoint, setEndpoint] = useState<string>('/api/analyze');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer demo_token_779' }
  ]);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify({ preset: 'react', includeTests: true }, null, 2)
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  const handleAddHeader = () => {
    setHeaders(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (idx: number) => {
    setHeaders(prev => prev.filter((_, i) => i !== idx));
  };

  const handleHeaderChange = (idx: number, field: 'key' | 'value', val: string) => {
    setHeaders(prev => {
      const copy = [...prev];
      copy[idx][field] = val;
      return copy;
    });
  };

  const handleSelectPreset = (m: 'GET' | 'POST' | 'PUT' | 'DELETE', ep: string, body: any) => {
    setMethod(m);
    setEndpoint(ep);
    if (body !== null && body !== undefined) {
      setRequestBody(JSON.stringify(body, null, 2));
    } else {
      setRequestBody('');
    }
  };

  const handleSendRequest = () => {
    setIsLoading(true);
    const start = performance.now();

    setTimeout(() => {
      const end = performance.now();
      const latency = Math.round(end - start) + Math.floor(Math.random() * 25) + 12;
      setResponseLatency(latency);

      let status = 200;
      let resp: any = {};

      if (endpoint === '/api/health') {
        resp = {
          status: 'healthy',
          uptimeSeconds: 1420,
          services: { frontend: 'ready', backend: 'listening', db: 'connected' },
          timestamp: new Date().toISOString()
        };
      } else if (endpoint === '/api/analyze') {
        resp = {
          success: true,
          totalFiles: nodes.length,
          preset: 'react',
          readinessScore: 95,
          timestamp: new Date().toISOString()
        };
      } else if (endpoint.startsWith('/api/files')) {
        resp = {
          count: nodes.length,
          files: nodes.slice(0, 8).map(n => ({ id: n.id, name: n.name, path: n.path, type: n.type }))
        };
      } else if (endpoint === '/api/database/tables') {
        resp = {
          schema: 'public',
          tables: ['users', 'sessions', 'audit_logs', 'products'],
          rowCount: 42
        };
      } else {
        resp = {
          success: true,
          method,
          endpoint,
          receivedBody: requestBody ? JSON.parse(requestBody || '{}') : null,
          message: 'تمت معالجة الطلب بنجاح عبر محاكي REST API'
        };
      }

      setResponseStatus(status);
      setResponseBody(JSON.stringify(resp, null, 2));
      setIsLoading(false);
      onAddLog('runtime', 'success', `[REST API] ${method} ${endpoint} -> ${status} OK (${latency}ms)`);
    }, 280);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseBody);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#334155]">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#10b981]" />
          <h3 className="text-sm font-bold text-white">مستكشف ومختبر الـ API (Interactive REST Explorer)</h3>
        </div>
        <div className="text-xs font-mono text-[#94a3b8]">
          المنفذ النشط: <strong className="text-[#38bdf8]">http://localhost:{backendPort}</strong>
        </div>
      </div>

      {/* Quick Route Presets */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-[#94a3b8]">مسارات شائعة:</span>
        <button
          type="button"
          onClick={() => handleSelectPreset('GET', '/api/health', null)}
          className="px-2 py-0.5 bg-[#0f172a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer"
        >
          GET /api/health
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset('POST', '/api/analyze', { preset: 'react', includeTests: true })}
          className="px-2 py-0.5 bg-[#0f172a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer"
        >
          POST /api/analyze
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset('GET', '/api/files', null)}
          className="px-2 py-0.5 bg-[#0f172a] hover:bg-[#1e293b] text-[#f59e0b] rounded border border-[#334155] font-mono cursor-pointer"
        >
          GET /api/files
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset('GET', '/api/database/tables', null)}
          className="px-2 py-0.5 bg-[#0f172a] hover:bg-[#1e293b] text-[#a855f7] rounded border border-[#334155] font-mono cursor-pointer"
        >
          GET /api/database/tables
        </button>
      </div>

      {/* Request Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          className="bg-[#0f172a] text-xs font-bold font-mono px-3 py-2 rounded-[5px] border border-[#334155] text-[#38bdf8] outline-none cursor-pointer"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="/api/v1/resource..."
          className="flex-1 min-w-[200px] bg-[#0f172a] text-white text-xs font-mono px-3 py-2 rounded-[5px] border border-[#334155] outline-none"
          dir="ltr"
        />

        <button
          type="button"
          onClick={handleSendRequest}
          disabled={isLoading}
          className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-[5px] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isLoading ? 'جاري الإرسال...' : 'إرسال الطلب (Send)'}</span>
        </button>
      </div>

      {/* Request & Response Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Left: Headers & Body */}
        <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#334155]">
            <span className="font-bold text-white">ترويسات الطلب (Headers)</span>
            <button
              type="button"
              onClick={handleAddHeader}
              className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة Header</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {headers.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5" dir="ltr">
                <input
                  type="text"
                  value={h.key}
                  onChange={(e) => handleHeaderChange(i, 'key', e.target.value)}
                  placeholder="Key"
                  className="flex-1 bg-[#0b1120] text-slate-200 text-xs px-2 py-1 rounded border border-[#334155] font-mono outline-none"
                />
                <input
                  type="text"
                  value={h.value}
                  onChange={(e) => handleHeaderChange(i, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-[#0b1120] text-slate-200 text-xs px-2 py-1 rounded border border-[#334155] font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(i)}
                  className="p-1 text-[#94a3b8] hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#334155]">
            <div className="flex items-center justify-between pb-1 text-[#94a3b8] text-[11px]">
              <span>محتوى الطلب (JSON Body):</span>
              <button
                type="button"
                onClick={() => {
                  try {
                    setRequestBody(JSON.stringify(JSON.parse(requestBody), null, 2));
                  } catch {}
                }}
                className="text-[#38bdf8] hover:underline cursor-pointer"
              >
                تنسيق JSON
              </button>
            </div>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={5}
              placeholder='{ "key": "value" }'
              className="w-full bg-[#0b1120] text-emerald-300 font-mono text-xs p-2 rounded border border-[#334155] outline-none"
              dir="ltr"
            />
          </div>
        </div>

        {/* Right: Response Inspector */}
        <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#334155]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">الاستجابة (Response):</span>
              {responseStatus !== null && (
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  responseStatus < 300 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {responseStatus} OK
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {responseLatency !== null && (
                <span className="text-[#94a3b8] font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {responseLatency} ms
                </span>
              )}
              {responseBody && (
                <button
                  type="button"
                  onClick={handleCopyResponse}
                  className="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-[#1e293b] cursor-pointer"
                  title="نسخ النتيجة"
                >
                  {copiedResponse ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#0b1120] p-2.5 rounded border border-[#334155] overflow-y-auto max-h-[220px] font-mono text-xs text-[#38bdf8]" dir="ltr">
            {responseBody ? (
              <pre className="whitespace-pre-wrap">{responseBody}</pre>
            ) : (
              <div className="text-[#94a3b8]/40 text-center py-10 font-sans">
                أرسل طلباً لعرض استجابة الخادم هنا...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
