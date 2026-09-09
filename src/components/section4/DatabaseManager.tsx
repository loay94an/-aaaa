import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Terminal, 
  Play, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Search, 
  Server,
  Layers,
  Key
} from 'lucide-react';

interface DatabaseManagerProps {
  onAddLog: (category: 'runtime' | 'build' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

interface TableRow {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onAddLog }) => {
  const [activeDbType, setActiveDbType] = useState<'postgres' | 'redis' | 'mongodb'>('postgres');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM users ORDER BY id ASC LIMIT 10;');
  const [queryDuration, setQueryDuration] = useState<number | null>(4);

  // Sample Postgres rows
  const [rows, setRows] = useState<TableRow[]>([
    { id: 1, name: 'أحمد الإدريسي', email: 'ahmed@example.com', role: 'admin', created_at: '2026-03-01' },
    { id: 2, name: 'سارة المنصوري', email: 'sara@example.com', role: 'developer', created_at: '2026-03-02' },
    { id: 3, name: 'كريم التازي', email: 'karim@example.com', role: 'tester', created_at: '2026-03-03' },
    { id: 4, name: 'مريم الزهراء', email: 'maryam@example.com', role: 'designer', created_at: '2026-03-04' }
  ]);

  // Sample Redis Keys
  const [redisKeys, setRedisKeys] = useState<{ key: string; val: string; ttl: number }[]>([
    { key: 'session:user:101', val: '{"userId": 1, "active": true}', ttl: 3600 },
    { key: 'cache:stats:daily', val: '{"views": 1420, "shares": 89}', ttl: 7200 },
    { key: 'rate_limit:ip:127.0.0.1', val: '12', ttl: 60 }
  ]);
  const [newRedisKey, setNewRedisKey] = useState('');
  const [newRedisVal, setNewRedisVal] = useState('');

  // Sample Mongo Docs
  const [mongoDocs, setMongoDocs] = useState([
    { _id: '65e31a89b', collection: 'audit_logs', action: 'DEPLOY_START', user: 'admin', status: 'SUCCESS' },
    { _id: '65e31b01c', collection: 'audit_logs', action: 'CONFIG_UPDATE', user: 'dev', status: 'SUCCESS' },
    { _id: '65e31c44e', collection: 'audit_logs', action: 'REBUILD_CONTAINER', user: 'system', status: 'SUCCESS' }
  ]);

  const handleExecuteSql = () => {
    const start = performance.now();
    setTimeout(() => {
      const duration = Math.round(performance.now() - start) + 3;
      setQueryDuration(duration);
      onAddLog('runtime', 'success', `[PostgreSQL 16] تم تنفيذ الاستعلام (${rows.length} صفوف في ${duration}ms): ${sqlQuery}`);
    }, 120);
  };

  const handleAddSeedRow = () => {
    const nextId = rows.length + 1;
    const newRow: TableRow = {
      id: nextId,
      name: `مستخدم جديد ${nextId}`,
      email: `user${nextId}@test.local`,
      role: 'user',
      created_at: new Date().toISOString().split('T')[0]
    };
    setRows(prev => [...prev, newRow]);
    onAddLog('runtime', 'info', `[PostgreSQL] إدراج سجل بذور جديد: user${nextId}@test.local`);
  };

  const handleAddRedisKey = () => {
    if (!newRedisKey) return;
    setRedisKeys(prev => [...prev, { key: newRedisKey, val: newRedisVal || 'true', ttl: 1800 }]);
    setNewRedisKey('');
    setNewRedisVal('');
    onAddLog('runtime', 'success', `[Redis] SET ${newRedisKey} EX 1800`);
  };

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] p-4 space-y-4">
      {/* DB Engine Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#334155] text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveDbType('postgres')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeDbType === 'postgres' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL (pgAdmin-Lite)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDbType('redis')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeDbType === 'redis' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Redis Cache</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDbType('mongodb')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeDbType === 'mongodb' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>MongoDB Docs</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#10b981] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>الحالة: متصل ومنتظر الاتصالات (:5432)</span>
        </div>
      </div>

      {/* POSTGRESQL VIEW */}
      {activeDbType === 'postgres' && (
        <div className="space-y-3">
          {/* SQL Editor Bar */}
          <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#94a3b8] flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>محرر استعلامات SQL:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSeedRow}
                  className="text-[11px] bg-[#1e293b] hover:bg-[#334155] text-[#38bdf8] px-2 py-0.5 rounded border border-[#334155] cursor-pointer"
                >
                  + إدراج سجل تجريبي
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSql}
                  className="px-3 py-1 bg-[#10b981] hover:bg-emerald-600 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>تنفيذ (Execute)</span>
                </button>
              </div>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={2}
              className="w-full bg-[#0b1120] text-emerald-300 font-mono text-xs p-2 rounded border border-[#334155] outline-none"
              dir="ltr"
            />
          </div>

          {/* Results Table */}
          <div className="bg-[#080d1a] rounded-[6px] border border-[#334155] overflow-hidden">
            <div className="bg-[#0f172a] px-3 py-2 border-b border-[#334155] flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>الجدول: public.users</span>
              </span>
              <span className="text-[#94a3b8] font-mono text-[11px]">
                {rows.length} صفوف ({queryDuration} ms)
              </span>
            </div>

            <div className="overflow-x-auto max-h-52 overflow-y-auto">
              <table className="w-full text-xs text-right border-collapse" dir="ltr">
                <thead className="bg-[#0b1120] text-[#94a3b8] font-mono text-[11px] border-b border-[#334155]">
                  <tr>
                    <th className="p-2 border-r border-[#334155]">id</th>
                    <th className="p-2 border-r border-[#334155]">name</th>
                    <th className="p-2 border-r border-[#334155]">email</th>
                    <th className="p-2 border-r border-[#334155]">role</th>
                    <th className="p-2">created_at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155] font-mono text-slate-300">
                  {rows.map(r => (
                    <tr key={r.id} className="hover:bg-[#1e293b]/40 transition">
                      <td className="p-2 border-r border-[#334155] text-[#38bdf8] font-bold">{r.id}</td>
                      <td className="p-2 border-r border-[#334155] text-white font-sans">{r.name}</td>
                      <td className="p-2 border-r border-[#334155] text-emerald-400">{r.email}</td>
                      <td className="p-2 border-r border-[#334155]">
                        <span className="bg-[#1e293b] px-1.5 py-0.5 rounded text-[10px] text-amber-300">{r.role}</span>
                      </td>
                      <td className="p-2 text-[#94a3b8] text-[11px]">{r.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REDIS VIEW */}
      {activeDbType === 'redis' && (
        <div className="space-y-3">
          {/* Add Key Bar */}
          <div className="bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] flex flex-wrap items-center gap-2 text-xs" dir="ltr">
            <span className="font-mono text-white font-bold">SET</span>
            <input
              type="text"
              value={newRedisKey}
              onChange={(e) => setNewRedisKey(e.target.value)}
              placeholder="key_name (e.g. app:config)"
              className="flex-1 bg-[#0b1120] text-white px-2 py-1.5 rounded border border-[#334155] font-mono outline-none"
            />
            <input
              type="text"
              value={newRedisVal}
              onChange={(e) => setNewRedisVal(e.target.value)}
              placeholder="value (e.g. true, json, token)"
              className="flex-1 bg-[#0b1120] text-white px-2 py-1.5 rounded border border-[#334155] font-mono outline-none"
            />
            <button
              type="button"
              onClick={handleAddRedisKey}
              className="px-3 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded font-mono cursor-pointer"
            >
              + إضافة مفتاح
            </button>
          </div>

          <div className="bg-[#080d1a] rounded-[6px] border border-[#334155] divide-y divide-[#334155] text-xs font-mono" dir="ltr">
            {redisKeys.map((rk, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-[#1e293b]/40">
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span className="text-[#38bdf8] font-bold">{rk.key}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-emerald-300">{rk.val}</span>
                </div>
                <div className="flex items-center gap-3 text-[#94a3b8] text-[11px]">
                  <span>TTL: {rk.ttl}s</span>
                  <button
                    type="button"
                    onClick={() => setRedisKeys(prev => prev.filter((_, i) => i !== idx))}
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONGODB VIEW */}
      {activeDbType === 'mongodb' && (
        <div className="bg-[#080d1a] p-3.5 rounded-[6px] border border-[#334155] space-y-2 text-xs font-mono" dir="ltr">
          <div className="text-[#94a3b8] text-[11px] pb-1 border-b border-[#334155]">
            db.audit_logs.find().limit(5)
          </div>
          {mongoDocs.map((doc, idx) => (
            <div key={idx} className="bg-[#0b1120] p-2 rounded border border-[#334155] text-slate-300">
              <span className="text-amber-400 font-bold">_id:</span> &quot;{doc._id}&quot; |{' '}
              <span className="text-[#38bdf8]">action:</span> &quot;{doc.action}&quot; |{' '}
              <span className="text-[#10b981]">user:</span> &quot;{doc.user}&quot; |{' '}
              <span className="text-emerald-300">status:</span> &quot;{doc.status}&quot;
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
