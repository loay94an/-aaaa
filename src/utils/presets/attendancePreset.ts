import { CompletePreset } from './types';

export const ATTENDANCE_PRESET: CompletePreset = {
  id: 'preset-attendance-pwa',
  name: 'نظام إدارة حضور ورواتب الموظفين (PWA متكامل)',
  category: 'Productivity & PWA',
  icon: 'Clock',
  badge: 'PWA + React 18',
  description: 'تطبيق ويب تقدمي لإدارة دوام الموظفين، تسجيل الحضور والانصراف المباشر، حاسبة الرواتب والبدلات، وتصدير التقارير.',
  entryFilePath: 'index.html',
  treeText: `attendance-payroll-pwa/
├── index.html
├── package.json
├── metadata.json
├── manifest.json
├── public/
│   ├── icon.svg
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts
│   ├── services/
│   │   ├── db.ts
│   │   ├── excelExporter.ts
│   │   └── pdfGenerator.ts
│   ├── hooks/
│   │   └── usePWAInstall.ts
│   └── components/
│       ├── DashboardView.tsx
│       ├── AttendanceView.tsx
│       ├── EmployeesListView.tsx
│       ├── PaymentsView.tsx
│       ├── BackupSettingsView.tsx
│       ├── EmployeeModal.tsx
│       ├── AddPaymentModal.tsx
│       ├── ManualAttendanceModal.tsx
│       ├── LiveTimerModal.tsx
│       └── PWAInstallButton.tsx
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/public/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#4f46e5" />
    <meta name="description" content="نظام الحضور والانصراف والرواتب الشامل - يعمل بدون إنترنت مع إمكانية التثبيت كـ PWA" />
    <link rel="manifest" href="/manifest.json" />
    <title>نظام إدارة حضور ورواتب الموظفين</title>
  </head>
  <body class="bg-slate-900 text-slate-100 font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    {
      path: 'manifest.json',
      content: `{
  "name": "نظام إدارة الحضور والرواتب",
  "short_name": "الحضور والرواتب",
  "description": "تطبيق إدارة موظفين ومتابعة الدوام والرواتب PWA يعمل بدون اتصال",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#4f46e5",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/public/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/public/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}`
    },
    {
      path: 'package.json',
      content: `{
  "name": "attendance-payroll-pwa",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.4"
  }
}`
    },
    {
      path: 'src/types/index.ts',
      content: `export interface Employee {
  id: string;
  name: string;
  code: string;
  department: string;
  position: string;
  phone: string;
  baseSalary: number;
  hourlyRate: number;
  status: 'active' | 'on_leave' | 'terminated';
  joinedDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours: number;
  overtimeHours: number;
  status: 'present' | 'late' | 'absent' | 'early_leave';
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentType: 'salary' | 'advance' | 'bonus' | 'deduction';
  date: string;
  month: string;
  notes?: string;
}`
    },
    {
      path: 'src/services/db.ts',
      content: `import { Employee, AttendanceRecord, PaymentRecord } from '../types';

const EMPLOYEES_KEY = 'attendance_app_employees';
const ATTENDANCE_KEY = 'attendance_app_attendance';
const PAYMENTS_KEY = 'attendance_app_payments';

const initialEmployees: Employee[] = [
  { id: '1', name: 'أحمد محمود', code: 'EMP-101', department: 'تطوير البرمجيات', position: 'مهندس برمجيات أول', phone: '0501234567', baseSalary: 12000, hourlyRate: 75, status: 'active', joinedDate: '2023-01-15' },
  { id: '2', name: 'سارة العتيبي', code: 'EMP-102', department: 'الموارد البشرية', position: 'مديرة الموارد البشرية', phone: '0507654321', baseSalary: 14000, hourlyRate: 85, status: 'active', joinedDate: '2022-06-01' },
  { id: '3', name: 'خالد المنصوري', code: 'EMP-103', department: 'المبيعات والتسويق', position: 'مسؤول علاقات عملاء', phone: '0559876543', baseSalary: 9500, hourlyRate: 60, status: 'active', joinedDate: '2023-09-10' },
  { id: '4', name: 'نورة الدوسري', code: 'EMP-104', department: 'المالية', position: 'محاسبة عامة', phone: '0543216789', baseSalary: 11000, hourlyRate: 70, status: 'active', joinedDate: '2023-03-20' }
];

export const dbService = {
  getEmployees(): Employee[] {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    if (!data) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(initialEmployees));
      return initialEmployees;
    }
    try { return JSON.parse(data); } catch { return initialEmployees; }
  },
  saveEmployees(emps: Employee[]) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(emps));
  },
  getAttendance(): AttendanceRecord[] {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  saveAttendance(records: AttendanceRecord[]) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  },
  getPayments(): PaymentRecord[] {
    const data = localStorage.getItem(PAYMENTS_KEY);
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  savePayments(payments: PaymentRecord[]) {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  }
};`
    },
    {
      path: 'src/services/excelExporter.ts',
      content: `export function exportToExcel(records: any[], fileName: string) {
  const headers = Object.keys(records[0] || {}).join(',');
  const rows = records.map(r => Object.values(r).map(v => \`"\${v}"\`).join(','));
  const csvContent = '\\uFEFF' + [headers, ...rows].join('\\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', \`\${fileName}.csv\`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}`
    },
    {
      path: 'src/services/pdfGenerator.ts',
      content: `export function generatePdfSummary(title: string, data: Record<string, any>) {
  let content = \`تقرير \${title}\\n\\n\`;
  Object.entries(data).forEach(([key, val]) => {
    content += \`\${key}: \${val}\\n\`;
  });
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`\${title}.txt\`;
  a.click();
}`
    },
    {
      path: 'src/hooks/usePWAInstall.ts',
      content: `import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      alert('التطبيق جاهز للتثبيت كـ PWA مباشرة من شريط أدوات المتصفح!');
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return { isInstallable, isInstalled, triggerInstall };
}`
    },
    {
      path: 'src/components/PWAInstallButton.tsx',
      content: `import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstalled, triggerInstall } = usePWAInstall();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        <span>مثبّت كـ PWA</span>
      </div>
    );
  }

  return (
    <button
      onClick={triggerInstall}
      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
    >
      <Download className="w-4 h-4" />
      <span>تثبيت التطبيق (PWA)</span>
    </button>
  );
};`
    },
    {
      path: 'src/components/DashboardView.tsx',
      content: `import React from 'react';
import { Users, Clock, DollarSign, Activity } from 'lucide-react';
import { Employee, AttendanceRecord, PaymentRecord } from '../types';

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({ employees, attendance, payments, onNavigate }) => {
  const activeCount = employees.filter(e => e.status === 'active').length;
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.length;
  const totalSalaries = employees.reduce((acc, e) => acc + (e.baseSalary || 0), 0);
  const totalPayments = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('employees')}
          className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl hover:border-indigo-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">إجمالي الموظفين</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{employees.length}</div>
          <div className="text-xs text-emerald-400 font-medium">{activeCount} موظف على رأس العمل</div>
        </div>

        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">حضور اليوم</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{presentToday}</div>
          <div className="text-xs text-slate-400 font-medium">نسبة الحضور: {employees.length ? Math.round((presentToday / employees.length) * 100) : 0}%</div>
        </div>

        <div 
          onClick={() => onNavigate('payments')}
          className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl hover:border-amber-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">مسير الرواتب الشهري</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalSalaries.toLocaleString()} ر.س</div>
          <div className="text-xs text-slate-400 font-medium">المدفوعات المسجلة: {totalPayments.toLocaleString()} ر.س</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">حالة النظام PWA</span>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-400 mb-1">متصل وجاهز</div>
          <div className="text-xs text-slate-400">تخزين محلي مؤمّن + استجابة سريعة</div>
        </div>
      </div>

      {/* Quick Actions & Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>آخر سجلات الحضور اليومية</span>
          </h3>
          {todayAttendance.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              لم يتم تسجيل حضور اليوم بعد. اضغط على قسم الحضور لتسجيل الدوام!
            </div>
          ) : (
            <div className="space-y-2">
              {todayAttendance.slice(0, 5).map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs">
                  <div className="font-semibold text-white">{record.employeeName}</div>
                  <div className="text-indigo-300">دخول: {record.checkIn}</div>
                  <div className="text-emerald-400">{record.checkOut ? \`خروج: \${record.checkOut}\` : 'على رأس العمل'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>فريق العمل النشط</span>
          </h3>
          <div className="space-y-2">
            {employees.slice(0, 4).map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs">
                <div>
                  <div className="font-semibold text-white">{emp.name}</div>
                  <div className="text-slate-400 text-[11px]">{emp.department} • {emp.position}</div>
                </div>
                <div className="text-emerald-400 font-bold">{emp.baseSalary.toLocaleString()} ر.س</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};`
    },
    {
      path: 'src/components/AttendanceView.tsx',
      content: `import React, { useState } from 'react';
import { Clock, Plus, Download, CheckCircle2, Play, Pause } from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { exportToExcel } from '../services/excelExporter';

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => void;
}

export const AttendanceView: React.FC<Props> = ({ employees, attendance, onAddAttendance }) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const handleQuickCheckIn = () => {
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: AttendanceRecord = {
      id: \`att_\${Date.now()}\`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: dateStr,
      checkIn: timeStr,
      workHours: 8,
      overtimeHours: 0,
      status: 'present'
    };

    onAddAttendance(newRecord);
  };

  const handleExport = () => {
    if (attendance.length === 0) {
      alert('لا توجد سجلات لتصديرها!');
      return;
    }
    exportToExcel(attendance, 'سجل_الحضور_والانصراف');
  };

  return (
    <div className="space-y-6">
      {/* Quick Punch Bar */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-indigo-500/30 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>تسجيل البصمة والدوام المباشر</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">اختر الموظف لتسجيل الحضور الفوري في التاريخ والوقت الحالي</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
              ))}
            </select>

            <button
              onClick={handleQuickCheckIn}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل حضور الآن</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">سجلات الحضور والانصراف</h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            لا توجد سجلات حضور مسجلة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">الموظف</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">وقت الدخول</th>
                  <th className="p-3">وقت الخروج</th>
                  <th className="p-3">ساعات العمل</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {attendance.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-700/30 transition">
                    <td className="p-3 font-semibold text-white">{rec.employeeName}</td>
                    <td className="p-3 text-slate-300">{rec.date}</td>
                    <td className="p-3 text-indigo-300">{rec.checkIn}</td>
                    <td className="p-3 text-slate-400">{rec.checkOut || 'مستمر'}</td>
                    <td className="p-3 text-slate-300">{rec.workHours} س</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {rec.status === 'present' ? 'حاضر' : rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};`
    },
    {
      path: 'src/components/EmployeesListView.tsx',
      content: `import React, { useState } from 'react';
import { Users, Plus, Search, Trash2 } from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeesListView: React.FC<Props> = ({ employees, onAddEmployee, onDeleteEmployee }) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('تطوير البرمجيات');
  const [newSalary, setNewSalary] = useState('10000');

  const filtered = employees.filter(e => 
    e.name.includes(search) || e.department.includes(search) || e.code.includes(search)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEmp: Employee = {
      id: \`emp_\${Date.now()}\`,
      name: newName.trim(),
      code: \`EMP-\${Math.floor(100 + Math.random() * 900)}\`,
      department: newDept,
      position: 'موظف',
      phone: '0500000000',
      baseSalary: Number(newSalary) || 8000,
      hourlyRate: 50,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onAddEmployee(newEmp);
    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو القسم..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 hover:border-slate-600 transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                <span className="text-[11px] text-indigo-400 font-mono">{emp.code}</span>
              </div>
              <button
                onClick={() => onDeleteEmployee(emp.id)}
                className="text-slate-500 hover:text-red-400 transition p-1 cursor-pointer"
                title="حذف الموظف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">القسم:</span>
                <span>{emp.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المسمى:</span>
                <span>{emp.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الراتب الأساسي:</span>
                <span className="text-emerald-400 font-semibold">{emp.baseSalary.toLocaleString()} ر.س</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">تاريخ الانضمام: {emp.joinedDate}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">نشط</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-white">إضافة موظف جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  placeholder="مثال: محمد العمري"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">القسم</label>
                <select
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="تطوير البرمجيات">تطوير البرمجيات</option>
                  <option value="الموارد البشرية">الموارد البشرية</option>
                  <option value="المبيعات والتسويق">المبيعات والتسويق</option>
                  <option value="المالية">المالية</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">الراتب الشهري (ر.س)</label>
                <input
                  type="number"
                  required
                  value={newSalary}
                  onChange={e => setNewSalary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  حفظ الموظف
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};`
    },
    {
      path: 'src/components/PaymentsView.tsx',
      content: `import React, { useState } from 'react';
import { DollarSign, Plus, Download } from 'lucide-react';
import { Employee, PaymentRecord } from '../types';
import { exportToExcel } from '../services/excelExporter';

interface Props {
  employees: Employee[];
  payments: PaymentRecord[];
  onAddPayment: (p: PaymentRecord) => void;
}

export const PaymentsView: React.FC<Props> = ({ employees, payments, onAddPayment }) => {
  const [showModal, setShowModal] = useState(false);
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [amount, setAmount] = useState('5000');
  const [pType, setPType] = useState<'salary' | 'advance' | 'bonus'>('salary');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const newPayment: PaymentRecord = {
      id: \`pay_\${Date.now()}\`,
      employeeId: emp.id,
      employeeName: emp.name,
      amount: Number(amount) || 0,
      paymentType: pType,
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
    };

    onAddPayment(newPayment);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">إدارة الدفعات والرواتب</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToExcel(payments, 'كشف_الرواتب_والدفعات')}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير كشف الرواتب</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل دفعة / راتب</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
        {payments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            لا توجد دفعات أو رواتب مسجلة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">الموظف</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">نوع الدفعة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الشهر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition">
                    <td className="p-3 font-semibold text-white">{p.employeeName}</td>
                    <td className="p-3 text-emerald-400 font-bold">{p.amount.toLocaleString()} ر.س</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
                        {p.paymentType === 'salary' ? 'راتب شهري' : p.paymentType === 'advance' ? 'سلفة' : 'مكافأة'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{p.date}</td>
                    <td className="p-3 text-slate-400">{p.month}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-white">تسجيل صرف راتب أو سلفة</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">الموظف</label>
                <select
                  value={empId}
                  onChange={e => setEmpId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} (الراتب: {e.baseSalary} ر.س)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">المبلغ (ر.س)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">نوع العملية</label>
                <select
                  value={pType}
                  onChange={e => setPType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="salary">راتب شهري أساسي</option>
                  <option value="advance">سلفة مالية</option>
                  <option value="bonus">مكافأة وبدلات</option>
                </select>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  تأكيد الصرف
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};`
    },
    {
      path: 'src/components/BackupSettingsView.tsx',
      content: `import React from 'react';
import { Save, Download, Upload, Shield, Smartphone } from 'lucide-react';
import { Employee, AttendanceRecord, PaymentRecord } from '../types';

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
}

export const BackupSettingsView: React.FC<Props> = ({ employees, attendance, payments }) => {
  const handleExportBackup = () => {
    const backup = {
      version: '1.0',
      date: new Date().toISOString(),
      employees,
      attendance,
      payments
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`attendance_backup_\${new Date().toISOString().split('T')[0]}.json\`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span>النسخ الاحتياطي وإدارة البيانات</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          جميع بيانات الموظفين وسجلات الحضور والرواتب مخزنة محلياً في متصفحك عبر LocalStorage / IndexedDB وتعمل بشكل كامل دون الحاجة لخادم سحابي خارجي.
        </p>

        <div className="pt-3 flex gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل نسخة احتياطية كاملة (JSON)</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span>مواصفات تطبيق PWA المتقدم</span>
        </h3>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
          <li>يدعم التثبيت المستقل على نظام Windows و Android و iOS و macOS.</li>
          <li>يحتوي على Web App Manifest كامل مع أيقونات 192x192 و 512x512.</li>
          <li>يعمل دون اتصال بالإنترنت 100% مع حفظ فوري لكافة السجلات.</li>
        </ul>
      </div>
    </div>
  );
};`
    },
    {
      path: 'src/App.tsx',
      content: `import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Settings, Download, Activity, CheckCircle2 } from 'lucide-react';
import { Employee, AttendanceRecord, PaymentRecord } from './types';
import { dbService } from './services/db';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { EmployeesListView } from './components/EmployeesListView';
import { PaymentsView } from './components/PaymentsView';
import { BackupSettingsView } from './components/BackupSettingsView';
import { PWAInstallButton } from './components/PWAInstallButton';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'payments' | 'settings'>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    setEmployees(dbService.getEmployees());
    setAttendance(dbService.getAttendance());
    setPayments(dbService.getPayments());
  }, []);

  const handleAddEmployee = (emp: Employee) => {
    const updated = [...employees, emp];
    setEmployees(updated);
    dbService.saveEmployees(updated);
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    dbService.saveEmployees(updated);
  };

  const handleAddAttendance = (record: AttendanceRecord) => {
    const updated = [record, ...attendance];
    setAttendance(updated);
    dbService.saveAttendance(updated);
  };

  const handleAddPayment = (payment: PaymentRecord) => {
    const updated = [payment, ...payments];
    setPayments(updated);
    dbService.savePayments(updated);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* App Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">نظام الحضور والرواتب الذكي</h1>
              <p className="text-[11px] text-slate-400">تطبيق PWA بدون إنترنت لإدارة الموظفين والدوام</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-800/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap \${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }\`}
          >
            <Activity className="w-4 h-4" />
            <span>لوحة المؤشرات</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap \${
              activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }\`}
          >
            <Clock className="w-4 h-4" />
            <span>تسجيل الحضور</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap \${
              activeTab === 'employees' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }\`}
          >
            <Users className="w-4 h-4" />
            <span>فريق العمل ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap \${
              activeTab === 'payments' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }\`}
          >
            <DollarSign className="w-4 h-4" />
            <span>الرواتب والبدلات</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap \${
              activeTab === 'settings' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }\`}
          >
            <Settings className="w-4 h-4" />
            <span>النسخ والـ PWA</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            employees={employees}
            attendance={attendance}
            payments={payments}
            onNavigate={(tab) => setActiveTab(tab as any)}
          />
        )}
        {activeTab === 'attendance' && (
          <AttendanceView
            employees={employees}
            attendance={attendance}
            onAddAttendance={handleAddAttendance}
          />
        )}
        {activeTab === 'employees' && (
          <EmployeesListView
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}
        {activeTab === 'payments' && (
          <PaymentsView
            employees={employees}
            payments={payments}
            onAddPayment={handleAddPayment}
          />
        )}
        {activeTab === 'settings' && (
          <BackupSettingsView
            employees={employees}
            attendance={attendance}
            payments={payments}
          />
        )}
      </main>
    </div>
  );
}

export default App;`
    },
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
    },
    {
      path: 'src/index.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Cairo', system-ui, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
}`
    },
    {
      path: 'public/icon.svg',
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#4f46e5"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="#ffffff" stroke-width="6"/>
  <polyline points="50 25 50 50 68 50" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
</svg>`
    },
    {
      path: 'README.md',
      content: `# نظام إدارة حضور ورواتب الموظفين (PWA)

تطبيق ويب تقدمي متكامل لإدارة شؤون الموظفين، متابعة الدوام اليومي، إدارة الرواتب والسلف، وتصدير التقارير بصيغة Excel و JSON.

### المميزات الرئيسية:
- **تسجيل الحضور الفوري**: إمكانية تسجيل بصمة حضور الموظف بضغطة زر.
- **إدارة الرواتب والسلف**: حساب مستحقات كل موظف وتصدير كشوف الحسابات.
- **تطبيق PWA كامل**: يعمل بدون اتصال بالإنترنت ويتم تثبيته كتطبيق حقيقي على الحاسوب أو الهاتف.
- **مبني باستخدام React 18 و Tailwind CSS**: أداء عالي وتجربة مستخدم متميزة.`
    }
  ]
};
