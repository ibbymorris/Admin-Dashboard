import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Wallet, Users, Layers, Briefcase, Rocket, FileText, Settings, Search, Bell, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, AlertTriangle, CheckCircle2, Clock, Zap, Sparkles, BrainCircuit, Filter, Download, CreditCard, DollarSign, TrendingUp, TrendingDown, Activity, ChevronRight, Mail, Shield, Link as LinkIcon, CheckSquare, XCircle, FilePlus2, Trash2, DownloadCloud, Info
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, addDays, formatDistanceToNow, addYears, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- Mock Data ---
// Overview & Finance
const financialTrendData = [
  { month: 'Jan', revenue: 120000, costs: 70000, margin: 50000, mrr: 115000, boosters: 5000 },
  { month: 'Feb', revenue: 135000, costs: 75000, margin: 60000, mrr: 125000, boosters: 10000 },
  { month: 'Mar', revenue: 142000, costs: 82000, margin: 60000, mrr: 130000, boosters: 12000 },
  { month: 'Apr', revenue: 155000, costs: 85000, margin: 70000, mrr: 145000, boosters: 10000 },
  { month: 'May', revenue: 175000, costs: 95000, margin: 80000, mrr: 160000, boosters: 15000 },
  { month: 'Jun', revenue: 189000, costs: 98000, margin: 91000, mrr: 172000, boosters: 17000 },
];

const revenueComposition = financialTrendData.map(d => ({
  month: d.month,
  Retainer: d.mrr,
  'Boosters/Overage': d.boosters
}));

// People & Capacity
const initialCapacityData = [
  { team: 'Brand Design', allocated: 850, available: 1000, utilization: 85 },
  { team: 'Motion', allocated: 580, available: 600, utilization: 96.6 },
  { team: 'Web Dev', allocated: 920, available: 1200, utilization: 76.6 },
  { team: 'Copy', allocated: 300, available: 400, utilization: 75 },
  { team: 'Data Ops', allocated: 650, available: 800, utilization: 81.2 },
];

const initialStaffData = [
  { id: 1, name: 'Alex Jensen', role: 'Sr. Designer', team: 'Brand Design', utilization: 94, velocity: 12, fpa: 88, status: 'risk', timezone: 'EMEA', email: 'alex.j@agency.com', permissionRole: 'Admin' },
  { id: 2, name: 'Sarah Connors', role: 'Motion Lead', team: 'Motion', utilization: 78, velocity: 8, fpa: 95, status: 'healthy', timezone: 'AMER', email: 'sarah.c@agency.com', permissionRole: 'Admin' },
  { id: 3, name: 'Dravius Thorne', role: 'Full Stack Dev', team: 'Web Dev', utilization: 102, velocity: 15, fpa: 92, status: 'burnout', timezone: 'APAC', email: 'dravius.t@agency.com', permissionRole: 'Member' },
  { id: 4, name: 'Emily Chen', role: 'Designer', team: 'Brand Design', utilization: 65, velocity: 10, fpa: 75, status: 'under', timezone: 'AMER', email: 'emily.c@agency.com', permissionRole: 'Member' },
  { id: 5, name: 'Marcus Low', role: 'Data Analyst', team: 'Data Ops', utilization: 88, velocity: 20, fpa: 98, status: 'healthy', timezone: 'EMEA', email: 'marcus.l@agency.com', permissionRole: 'Member' },
];

// Work & SLAs
const initialWorkLanes = {
  todo: [
    { id: 101, client: 'Acme Corp', title: 'Q3 Social Assets', type: 'Design', due: addDays(new Date(), 2), slaStatus: 'healthy', assignee: 'EJ' },
    { id: 102, client: 'NexusTech', title: 'Landing Page V2', type: 'Web', due: addDays(new Date(), 1), slaStatus: 'warning', assignee: 'DT' },
  ],
  inProgress: [
    { id: 103, client: 'Soylent Corp', title: 'Explainer Video', type: 'Motion', due: new Date(), slaStatus: 'danger', assignee: 'SC' },
    { id: 104, client: 'Acme Corp', title: 'Email Templates', type: 'Design', due: addDays(new Date(), 1), slaStatus: 'healthy', assignee: 'AJ' },
    { id: 105, client: 'Globex', title: 'Data Dashboard', type: 'Web', due: addDays(new Date(), 3), slaStatus: 'healthy', assignee: 'ML' },
  ],
  review: [
    { id: 106, client: 'Umbrella', title: 'Pitch Deck Polish', type: 'Design', due: new Date(), slaStatus: 'warning', assignee: 'AJ' },
  ]
};

const slaData = [
  { name: '< 12h', value: 450, color: '#10b981' },
  { name: '12-24h', value: 320, color: '#3b82f6' },
  { name: '24h+', value: 80, color: '#f59e0b' },
  { name: 'Late', value: 25, color: '#ef4444' },
];

// Clients
const initialClientData = [
  { id: 1, name: 'Acme Corp', plan: 'Enterprise', mrr: 45000, health: 92, nps: 65, renewal: '2024-12-01', usage: 88 },
  { id: 2, name: 'NexusTech', plan: 'Growth', mrr: 12000, health: 45, nps: 30, renewal: '2024-08-15', usage: 105 },
  { id: 3, name: 'Soylent Corp', plan: 'Pro', mrr: 8500, health: 98, nps: 80, renewal: '2024-10-01', usage: 70 },
  { id: 4, name: 'Globex', plan: 'Enterprise', mrr: 55000, health: 85, nps: 75, renewal: '2025-01-01', usage: 82 },
  { id: 5, name: 'Umbrella Inc', plan: 'Growth', mrr: 15000, health: 72, nps: 50, renewal: '2024-09-01', usage: 95 },
];

// Onboarding
const initialOnboardingData = {
  clients: [
    { id: 1, name: 'Stark Industries', stage: 'Contract Signed', progress: 25, eta: '2 days' },
    { id: 2, name: 'Wayne Ent.', stage: 'Tech Integration', progress: 60, eta: '5 days' },
    { id: 3, name: 'Massive Dynamic', stage: 'First Brief', progress: 90, eta: '1 day' },
  ],
  staff: [
    { id: 1, name: 'L. Croft', role: 'Designer', stage: 'Portfolio Review', status: 'pending' },
    { id: 2, name: 'N. Drake', role: 'Copywriter', stage: 'Contract Sent', status: 'waiting' },
  ]
};

// Invoices
const initialInvoiceData = [
    { id: 1, clientName: 'Acme Corp', amount: 15000, dueDate: new Date(), status: 'Pending', description: 'Q3 Retainer' },
    { id: 2, clientName: 'Globex', amount: 25000, dueDate: addDays(new Date(), -5), status: 'Overdue', description: 'Booster Hours' },
    { id: 3, clientName: 'Soylent Corp', amount: 8500, dueDate: addDays(new Date(), -2), status: 'Paid', description: 'Current Month Retainer' },
    { id: 4, clientName: 'NexusTech', amount: 12000, dueDate: addDays(new Date(), 30), status: 'Pending', description: 'Next Month Retainer' },
    { id: 5, clientName: 'Acme Corp', amount: 45000, dueDate: subMonths(new Date(), 1), status: 'Paid', description: 'Last Month Retainer' },
    { id: 6, clientName: 'Globex', amount: 55000, dueDate: subMonths(new Date(), 1), status: 'Paid', description: 'Last Month Retainer' },
    { id: 7, clientName: 'Umbrella Inc', amount: 15000, dueDate: addDays(new Date(), -3), status: 'Paid', description: 'Current Month Booster' },
];

// Generic Activity Feed
const recentActivity = [
  { id: 1, type: 'alert', msg: 'Margin dip detected in "NexusTech" account due to high revisions.', time: '10m ago' },
  { id: 2, type: 'success', msg: 'New client "Stark Industries" contract signed ($50k ARR).', time: '1h ago' },
  { id: 3, type: 'info', msg: '4 SLA breaches imminent in Motion queue.', time: '2h ago' },
  { id: 4, type: 'neutral', msg: 'Monthly board pack generated successfully.', time: '5h ago' },
];

// --- Shared Components ---

const MetricCard = ({
  title, value, subValue, trend, trendValue, alert, icon: Icon, onClick
}: {
  title: string; value: string; subValue?: string; trend?: 'up' | 'down' | 'neutral'; trendValue?: string; alert?: boolean; icon?: React.ElementType; onClick?: () => void;
}) => (
  <div onClick={onClick} className={cn("bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md cursor-default", onClick && "cursor-pointer hover:border-indigo-300", alert && "ring-2 ring-rose-500/30")}>
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-sm font-medium text-slate-500 truncate pr-4">{title}</h3>
      {Icon && <Icon className="w-5 h-5 text-slate-400 shrink-0" />}
      {alert && <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-bl-lg" />}
    </div>
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      {subValue && <span className="text-sm text-slate-500 font-medium truncate">{subValue}</span>}
    </div>
    {trend && (
      <div className="flex items-center mt-2 gap-1 text-sm">
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> :
         trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-rose-500" /> : null}
        <span className={cn("font-medium", trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500')}>
          {trendValue}
        </span>
        <span className="text-slate-400 ml-1">vs last mo</span>
      </div>
    )}
  </div>
);

const Badge: React.FC<{
  children?: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'indigo' | 'purple';
  className?: string;
}> = ({ children, variant = 'neutral', className }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap", variants[variant], className)}>
      {children}
    </span>
  );
}

const SectionHeader = ({ title, subtitle, actions }: { title: string, subtitle?: string, actions?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="flex gap-3">
      {actions}
    </div>
  </div>
);

// --- Views ---

const OverviewView = ({ onViewChange, metrics }: { onViewChange: (view: string) => void, metrics: any }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard title="MRR" value="$172,000" trend="up" trendValue="+8.2%" icon={Wallet} onClick={() => onViewChange('finance')} />
      <MetricCard title="Delivery Utilization" value="84.2%" subValue="(Billable/Avail)" trend="up" trendValue="+2.4%" icon={Zap} onClick={() => onViewChange('people')} />
      <MetricCard title="On-time SLA" value="96.8%" trend="down" trendValue="-1.1%" alert={true} icon={Clock} onClick={() => onViewChange('work')} />
      <MetricCard 
        title="First-Pass Acceptance" 
        value={`${metrics.averageFpa.toFixed(1)}%`}
        subValue="(Target 85%)" 
        trend={metrics.fpaTrendDirection} 
        trendValue={`${metrics.fpaTrendValue.toFixed(1)}%`}
        icon={CheckCircle2}
        onClick={() => onViewChange('people')}
      />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div><h3 className="text-base font-semibold text-slate-900">Financial Performance</h3><p className="text-sm text-slate-500">Revenue vs Contribution Margin (L6M)</p></div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={financialTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => [`$${v.toLocaleString()}`, '']} />
              <Legend iconType='circle' wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Area type="monotone" dataKey="margin" name="Gross Margin" fill="#c7d2fe" stroke="#6366f1" strokeWidth={2} fillOpacity={0.4} />
              <Bar dataKey="revenue" name="Total Revenue" barSize={20} fill="#1e293b" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="mrr" name="MRR" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Current Queue SLA</h3>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slaData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {slaData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val) => [val, 'Jobs']} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-slate-900">875</text>
                <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-500 font-medium">Active Jobs</text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {slaData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4"><h3 className="text-base font-semibold text-slate-900">Live Signals</h3><BrainCircuit className="w-4 h-4 text-indigo-500" /></div>
          <div className="space-y-3">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex gap-3 items-start">
                <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", act.type === 'alert' ? 'bg-rose-500' : act.type === 'success' ? 'bg-emerald-500' : act.type === 'info' ? 'bg-amber-500' : 'bg-slate-300')} />
                <div><p className="text-sm text-slate-700 leading-tight">{act.msg}</p><span className="text-xs text-slate-400">{act.time}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FinanceView = ({ invoices, onCreateInvoiceClick, metrics }: { invoices: any[], onCreateInvoiceClick: () => void, metrics: any }) => (
  <div className="space-y-6 animate-fade-in">
    <SectionHeader title="Finance" subtitle="P&L, Revenue Composition, and Unit Economics" actions={
      <>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"><Download className="w-4 h-4" /> Export Board Pack</button>
        <button onClick={onCreateInvoiceClick} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> Create Invoice</button>
      </>
    } />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard 
        title="Cash Collected (MTD)" 
        value={formatCurrency(metrics.cashCollected)} 
        subValue={`${metrics.collectedPercentage.toFixed(0)}% of invoiced`} 
        trend={metrics.cashTrendDirection} 
        trendValue={`${metrics.cashTrendValue.toFixed(1)}%`}
        icon={DollarSign} 
        onClick={() => {}}
      />
      <MetricCard 
        title="Outstanding AR" 
        value="$84,300" 
        subValue="$12k > 30 days" 
        trend="down" 
        trendValue="5%" 
        alert={true} 
        icon={AlertTriangle} 
        onClick={() => {}} 
      />
      <MetricCard 
         title="Contribution Margin" 
         value={`${metrics.contributionMargin.toFixed(1)}%`}
         subValue="Target: 60%" 
         trend={metrics.marginTrendDirection}
         trendValue={`${metrics.marginTrendValue.toFixed(1)}%`}
         icon={TrendingUp} 
         onClick={() => {}}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-6">Revenue Composition</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueComposition} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value: any) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Retainer" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Boosters/Overage" stackId="a" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-base font-semibold text-slate-900">Client Profitability (Top 5)</h3>
           <Badge variant="indigo">Ranked by Margin $</Badge>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Revenue</th><th className="px-4 py-3">Margin %</th><th className="px-4 py-3">Trend</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[ 
              { c: 'Acme Corp', r: 45000, m: 62, t: 'up' }, { c: 'Globex', r: 55000, m: 58, t: 'neutral' },
              { c: 'Umbrella', r: 15000, m: 45, t: 'down' }, { c: 'NexusTech', r: 12000, m: 25, t: 'down' },
              { c: 'Soylent', r: 8500, m: 70, t: 'up' }
            ].map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-medium text-slate-900">{row.c}</td>
                <td className="px-4 py-3">{formatCurrency(row.r)}</td>
                <td className="px-4 py-3"><Badge variant={row.m > 60 ? 'success' : row.m < 40 ? 'danger' : 'warning'}>{row.m}%</Badge></td>
                <td className="px-4 py-3">{row.t === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500"/> : row.t === 'down' ? <TrendingDown className="w-4 h-4 text-rose-500"/> : <MoreHorizontal className="w-4 h-4 text-slate-300"/>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-6">Recent Invoices</h3>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
          <tr>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map(invoice => (
            <tr key={invoice.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-medium text-slate-900">{invoice.clientName}</td>
              <td className="px-4 py-3">{formatCurrency(invoice.amount)}</td>
              <td className="px-4 py-3 text-slate-500">{format(invoice.dueDate, 'MMM d, yyyy')}</td>
              <td className="px-4 py-3">
                <Badge variant={invoice.status === 'Paid' ? 'success' : invoice.status === 'Overdue' ? 'danger' : 'warning'}>{invoice.status}</Badge>
              </td>
              <td className="px-4 py-3"><button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PeopleView = ({
  onInviteClick,
  onAutoRebalance,
  isRebalancing,
  staffData,
  capacityData,
  aiMessage
}: {
  onInviteClick: () => void;
  onAutoRebalance: () => void;
  isRebalancing: boolean;
  staffData: typeof initialStaffData;
  capacityData: typeof initialCapacityData;
  aiMessage: string;
}) => (
  <div className="space-y-6 animate-fade-in">
    <SectionHeader title="People & Performance" actions={<button onClick={onInviteClick} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> Invite Staff</button>} />
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
       <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-slate-900">Capacity Heatmap</h3>
            <Badge variant="indigo">Hiring Signal: Motion</Badge>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 1400]} />
                <YAxis type="category" dataKey="team" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} width={80} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="allocated" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="available" stackId="a" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
       </div>
       <div className="bg-indigo-900 p-6 rounded-xl text-white flex flex-col justify-center bg-cover" style={{backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')"}}>
          <Sparkles className="w-8 h-8 text-indigo-300 mb-4" />
          <h3 className="text-lg font-bold mb-2">AI Optimization</h3>
          <p className="text-indigo-200 text-sm leading-relaxed mb-6">
            {aiMessage}
          </p>
          <button
            onClick={onAutoRebalance}
            disabled={isRebalancing}
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRebalancing ? 'Rebalancing...' : 'Auto-Rebalance Queue'}
          </button>
       </div>
    </div>

    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr><th className="px-6 py-3">Staff Member</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Utilization</th><th className="px-6 py-3">Velocity</th><th className="px-6 py-3">FPA %</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staffData.map((staff) => (
            <tr key={staff.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">{staff.name.substring(0,2).toUpperCase()}</div>
                {staff.name}
                {staff.status === 'burnout' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
              </td>
              <td className="px-6 py-4 text-slate-500">{staff.role}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 w-10">{staff.utilization}%</span>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={cn(
                        'h-2.5 rounded-full',
                        staff.utilization > 95 ? 'bg-rose-500' :
                        staff.utilization > 90 ? 'bg-amber-500' :
                        staff.utilization >= 70 ? 'bg-emerald-500' :
                        'bg-slate-400'
                      )}
                      style={{ width: `${Math.min(staff.utilization, 100)}%` }}
                      title={`${staff.utilization}% Utilized`}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{staff.velocity}/wk</td>
              <td className="px-6 py-4"><Badge variant={staff.fpa > 90 ? 'success' : staff.fpa < 80 ? 'warning' : 'neutral'}>{staff.fpa}%</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const WorkView = ({ workLanes, onTaskMove }: { workLanes: typeof initialWorkLanes, onTaskMove: (taskId: number, source: string, dest: string) => void }) => {
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <SectionHeader title="Work & SLAs" subtitle="Production Control Center" actions={<button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Brief</button>} />
      
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {[ // Kanban Columns
          { id: 'todo', title: 'Now / Next', tasks: workLanes.todo, accent: 'border-slate-300' },
          { id: 'inProgress', title: 'In Production', tasks: workLanes.inProgress, accent: 'border-indigo-500' },
          { id: 'review', title: 'In Review / QA', tasks: workLanes.review, accent: 'border-amber-500' }
        ].map(col => (
          <div 
            key={col.id} 
            className={cn(
              "flex flex-col bg-slate-100 rounded-xl p-2 transition-colors duration-200",
              draggedOverColumn === col.id && "bg-indigo-100/70"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDragEnter={() => setDraggedOverColumn(col.id)}
            onDragLeave={() => setDraggedOverColumn(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggedOverColumn(null);
              try {
                const { taskId, sourceColumn } = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (sourceColumn !== col.id) {
                    onTaskMove(taskId, sourceColumn, col.id);
                }
              } catch (error) {
                console.error("Failed to parse drag-and-drop data", error);
              }
            }}
          >
            <div className={cn("flex justify-between items-center px-3 py-2 mb-2 border-t-4 rounded-t bg-white mx-1 mt-1 shadow-sm", col.accent)}>
              <h3 className="font-semibold text-slate-700 text-sm">{col.title}</h3>
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-bold">{col.tasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-1">
              {col.tasks.map(task => (
                <div 
                  key={task.id} 
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, sourceColumn: col.id }));
                    (e.currentTarget as HTMLElement).classList.add('opacity-50', 'scale-[0.98]');
                  }}
                  onDragEnd={(e) => {
                    (e.currentTarget as HTMLElement).classList.remove('opacity-50', 'scale-[0.98]');
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="neutral" className="text-[10px]">{task.client}</Badge>
                    {task.slaStatus === 'danger' && <Badge variant="danger" className="animate-pulse">SLA Breach</Badge>}
                  </div>
                  <h4 className="font-medium text-slate-900 mb-3 leading-tight">{task.title}</h4>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div className="flex items-center gap-1.5"><Clock className={cn("w-3.5 h-3.5", task.slaStatus === 'danger' ? 'text-rose-500' : task.slaStatus === 'warning' ? 'text-amber-500' : 'text-slate-400')} /> 
                      <span className={cn(task.slaStatus === 'danger' ? 'text-rose-600 font-medium' : '')}>
                        {format(task.due, 'MMM d, ha')}
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{task.assignee}</div>
                  </div>
                </div>
              ))}
               {col.tasks.length === 0 && <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">Empty Lane</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientsView = ({ clientData, onNewClientClick, onManageClick }: { clientData: typeof initialClientData, onNewClientClick: () => void, onManageClick: (client: any) => void }) => (
  <div className="space-y-6 animate-fade-in">
    <SectionHeader title="Client Portfolio" subtitle="Health, Revenue, and Expansion Opportunities" actions={<button onClick={onNewClientClick} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Client</button>} />

    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
         <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="Search clients..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 ring-indigo-500/20 outline-none" />
         </div>
         <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50"><Filter className="w-4 h-4"/> Filters</button>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr><th className="px-6 py-3">Client Name</th><th className="px-6 py-3">Plan & MRR</th><th className="px-6 py-3">Health Score</th><th className="px-6 py-3">Usage</th><th className="px-6 py-3">NPS</th><th className="px-6 py-3 text-right">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clientData.map((client) => (
            <tr key={client.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4 font-semibold text-slate-900">{client.name}</td>
              <td className="px-6 py-4">
                <div className="text-slate-900 font-medium">{formatCurrency(client.mrr)}<span className="text-slate-500 font-normal text-xs ml-1">/mo</span></div>
                <div className="text-xs text-slate-500">{client.plan}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                   <div className={cn("w-3 h-3 rounded-full", client.health > 80 ? 'bg-emerald-500' : client.health < 50 ? 'bg-rose-500' : 'bg-amber-500')} />
                   <span className="font-medium">{client.health}/100</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 w-10">{client.usage}%</span>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={cn(
                        'h-2.5 rounded-full',
                        client.usage > 95 ? 'bg-rose-500' :
                        client.usage > 90 ? 'bg-amber-500' :
                        client.usage >= 70 ? 'bg-emerald-500' :
                        'bg-slate-400'
                      )}
                      style={{ width: `${Math.min(client.usage, 100)}%` }}
                      title={`${client.usage}% Utilized`}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4"><Badge variant={client.nps > 60 ? 'success' : client.nps < 30 ? 'danger' : 'neutral'}>{client.nps}</Badge></td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onManageClick(client)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OnboardingView = ({ onboardingData, onInviteClick }: { onboardingData: typeof initialOnboardingData, onInviteClick: () => void }) => (
  <div className="space-y-8 animate-fade-in">
    <SectionHeader title="Onboarding Pipeline" subtitle="Track new clients and staff entering the orbit" />
    
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Client Onboarding */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Rocket className="w-5 h-5 text-indigo-500"/> Client Launches</h3>
          <Badge variant="indigo">{onboardingData.clients.length} Active</Badge>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          {onboardingData.clients.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{c.name}</h4>
                <span className="text-xs font-medium text-slate-500">ETA: {c.eta}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>{c.stage}</span><span>{c.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${c.progress}%`}} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Onboarding */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-500"/> Staff Intake</h3>
          <button onClick={onInviteClick} className="text-sm text-indigo-600 font-medium hover:underline">Send Invites +</button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
           <table className="w-full text-sm">
             <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200"><tr><th className="px-4 py-3 text-left">Candidate</th><th className="px-4 py-3 text-left">Stage</th><th className="px-4 py-3">Status</th></tr></thead>
             <tbody className="divide-y divide-slate-100">
               {onboardingData.staff.map(s => (
                 <tr key={s.id}>
                   <td className="px-4 py-3 font-medium">{s.name}<div className="text-slate-500 text-xs font-normal">{s.role}</div></td>
                   <td className="px-4 py-3 text-slate-600">{s.stage}</td>
                   <td className="px-4 py-3 text-center">
                     {s.status === 'pending' ? <Badge variant="warning">Action Req</Badge> : <Badge variant="neutral">Waiting</Badge>}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  </div>
);

// --- Report View ---

const customReportsData = [
  { id: 1, name: 'Q2 Finance Overview', createdAt: new Date('2024-06-15'), metrics: ['MRR', 'Margin', 'Client Profitability'], dateRange: 'This Quarter', schedule: 'Monthly' },
  { id: 2, name: 'Weekly Delivery Health', createdAt: new Date('2024-06-20'), metrics: ['Utilization', 'On-time SLA', 'FPA %'], dateRange: 'Last 7 Days', schedule: 'Weekly' },
  { id: 3, name: 'Acme Corp - Performance Deep Dive', createdAt: new Date('2024-06-22'), metrics: ['MRR', 'Margin', 'Usage', 'NPS'], dateRange: 'Last 30 Days', schedule: 'None' },
];

const availableMetrics = {
  Finance: ['MRR', 'Revenue Composition', 'Client Profitability', 'Contribution Margin', 'Cash Collected'],
  People: ['Staff Utilization', 'Team Capacity', 'Velocity', 'First-Pass Acceptance (FPA)'],
  Work: ['On-time SLA', 'Queue Turnaround Time', 'Revision Rates'],
  Clients: ['Client Health Score', 'Plan Usage', 'NPS Score', 'Renewal Pipeline'],
};

const CreateReportModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (report: any) => void }) => {
  const [reportName, setReportName] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [format, setFormat] = useState('PDF');
  const [schedule, setSchedule] = useState('None');

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  const handleSubmit = () => {
    if (!reportName || selectedMetrics.length === 0) {
      alert('Please provide a report name and select at least one metric.');
      return;
    }
    onCreate({
      id: Date.now(),
      name: reportName,
      createdAt: new Date(),
      metrics: selectedMetrics,
      dateRange,
      schedule,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Create Custom Report</h2>
          <p className="text-sm text-slate-500 mt-1">Build a tailored report by selecting your desired metrics and timeframes.</p>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label htmlFor="reportName" className="text-sm font-medium text-slate-700">Report Name</label>
            <input type="text" id="reportName" value={reportName} onChange={e => setReportName(e.target.value)} placeholder="e.g., Q3 Client Health Summary" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(availableMetrics).map(([category, metrics]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600">{category}</h4>
                  <div className="space-y-2">
                    {metrics.map(metric => {
                      const isSelected = selectedMetrics.includes(metric);
                      return (
                        <label 
                          key={metric} 
                          className={cn(
                            "flex items-center gap-3 text-sm text-slate-700 cursor-pointer p-3 rounded-lg border-2 transition-all",
                            isSelected 
                              ? "bg-indigo-50 border-indigo-500 font-semibold" 
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => handleMetricToggle(metric)} 
                            className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-2 focus:ring-indigo-500/50" 
                          />
                          <span className="flex-1">{metric}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200 space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Date Range</label>
                      <div className="flex flex-wrap gap-2">
                      {['Last 7 Days', 'Last 30 Days', 'This Quarter', 'Last 6 Months'].map(range => (
                          <button key={range} type="button" onClick={() => setDateRange(range)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border", dateRange === range ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>{range}</button>
                      ))}
                      </div>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Export Format</label>
                      <div className="flex gap-2">
                          {['PDF', 'CSV'].map(f => (
                              <button key={f} type="button" onClick={() => setFormat(f)} className={cn("px-4 py-2 rounded-lg text-sm font-medium border w-full text-center", format === f ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>{f}</button>
                          ))}
                      </div>
                  </div>
              </div>
              <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Schedule & Delivery</label>
                  <div className="flex gap-4">
                      <select value={schedule} onChange={e => setSchedule(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none">
                          <option>None</option><option>Daily</option><option>Weekly</option><option>Monthly</option>
                      </select>
                      {schedule !== 'None' && <input type="email" placeholder="recipient@example.com" className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />}
                  </div>
              </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Generate & Save</button>
        </div>
      </div>
    </div>
  );
}

const ReportsView = () => {
  const [reports, setReports] = useState(customReportsData);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateReport = (newReport: any) => {
    setReports(prev => [newReport, ...prev]);
  };
  
  const handleDeleteReport = (id: number) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Reports Center" subtitle="Generate, schedule, and export custom operational reports" actions={
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><FilePlus2 className="w-4 h-4" /> Create Report</button>
      } />
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/70">
            <tr>
              <th className="px-6 py-3">Report Name</th>
              <th className="px-6 py-3">Date Created</th>
              <th className="px-6 py-3">Metrics</th>
              <th className="px-6 py-3">Schedule</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map(report => (
              <tr key={report.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{report.name}</td>
                <td className="px-6 py-4 text-slate-500">{format(report.createdAt, 'MMM d, yyyy')} <span className="text-xs text-slate-400">({formatDistanceToNow(report.createdAt, { addSuffix: true })})</span></td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {report.metrics.slice(0, 3).map(metric => <Badge key={metric} variant="neutral">{metric}</Badge>)}
                    {report.metrics.length > 3 && <Badge variant="neutral">+{report.metrics.length - 3} more</Badge>}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {report.schedule !== 'None' ? <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {report.schedule}</div> : 'Once'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium"><Download className="w-4 h-4"/> Download</button>
                    <button onClick={() => handleDeleteReport(report.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
             {reports.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No custom reports created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isCreateModalOpen && <CreateReportModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateReport} />}
    </div>
  );
};

const billingHistoryData = [
  { id: 'inv_123', date: subMonths(new Date(), 1), amount: 45000, status: 'Paid' },
  { id: 'inv_122', date: subMonths(new Date(), 2), amount: 45000, status: 'Paid' },
  { id: 'inv_121', date: subMonths(new Date(), 3), amount: 42500, status: 'Paid' },
  { id: 'inv_120', date: subMonths(new Date(), 4), amount: 42500, status: 'Paid' },
];

const SettingsView = ({ staffData, onUpdateStaffRole }: { staffData: typeof initialStaffData, onUpdateStaffRole: (id: number, role: string) => void}) => {
  const [activeTab, setActiveTab] = useState('General');
  const [workspaceName, setWorkspaceName] = useState('My DaaS Agency');
  const [workspaceUrl, setWorkspaceUrl] = useState('agency.orbitos.app');

  const TABS = ['General', 'Roles & Permissions', 'Integrations', 'Billing'];
  
  const renderContent = () => {
    switch(activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            <div className="p-6 border border-slate-200 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-900">General Workspace Settings</h3>
              <p className="text-sm text-slate-500 mt-1">Update your workspace name and URL.</p>
              <div className="mt-6 space-y-4">
                 <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Workspace Name</label>
                    <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full max-w-sm px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none"/>
                 </div>
                 <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Workspace URL</label>
                    <div className="flex items-center max-w-sm">
                      <input type="text" value={workspaceUrl} onChange={(e) => setWorkspaceUrl(e.target.value)} className="w-full px-3 py-2 bg-white border border-r-0 border-slate-300 rounded-l-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none"/>
                      <span className="px-3 py-2 bg-slate-50 border border-slate-300 text-slate-500 text-sm rounded-r-lg">.orbitos.app</span>
                    </div>
                 </div>
              </div>
            </div>
             <div className="flex justify-end p-4 bg-slate-50 -m-6 -mb-8 mt-6 rounded-b-xl border-t border-slate-200">
               <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save Changes</button>
             </div>
          </div>
        )
      case 'Roles & Permissions':
        return (
           <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Manage Team Access</h3>
              <p className="text-sm text-slate-500">Control who can see and do what in your workspace.</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                   <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200"><tr><th className="px-4 py-3 text-left">Member</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-center">Permissions</th></tr></thead>
                   <tbody className="divide-y divide-slate-100">
                     {staffData.map(staff => (
                       <tr key={staff.id}>
                         <td className="px-4 py-3 font-medium">{staff.name}<div className="text-slate-500 text-xs font-normal">{staff.email}</div></td>
                         <td className="px-4 py-3 text-slate-600">{staff.role}</td>
                         <td className="px-4 py-3 text-center">
                           <select value={staff.permissionRole} onChange={(e) => onUpdateStaffRole(staff.id, e.target.value)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 ring-indigo-500/50 outline-none">
                             <option>Admin</option>
                             <option>Member</option>
                           </select>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
           </div>
        )
      case 'Integrations':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Active Integrations</h3>
            <p className="text-sm text-slate-500">Connect your tools to power the OrbitOS data warehouse.</p>
            <div className="space-y-3 mt-4">
              {[ 
                { name: 'Slack', status: 'connected', icon: Mail }, { name: 'QuickBooks', status: 'connected', icon: CreditCard },
                { name: 'Google Workspace', status: 'alert', icon: Shield }, { name: 'HubSpot', status: 'disconnected', icon: LinkIcon }
              ].map(tool => (
                <div key={tool.name} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center">
                      <tool.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{tool.name}</h4>
                      {tool.status === 'alert' && <span className="text-xs text-rose-500 font-medium">Needs Re-authentication</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {tool.status === 'connected' ? <Badge variant="success"><CheckSquare className="w-3 h-3 mr-1 inline-block"/>Synced</Badge> : 
                     tool.status === 'alert' ? <Badge variant="danger">Error</Badge> : 
                     <button className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50">Connect</button>}
                    <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'Billing':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing Hub</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Current Plan</h4>
                  <p className="text-2xl font-bold text-slate-900">Enterprise <span className="text-base font-normal text-slate-500">/ monthly</span></p>
                  <p className="text-slate-600 mt-2 font-medium">{formatCurrency(45000)}<span className="text-sm font-normal"> per month</span></p>
                  <p className="text-xs text-slate-400 mt-1">Next bill on {format(addMonths(new Date(), 1), 'MMM d, yyyy')}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Change Plan</button>
                    <button className="flex-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                   <h4 className="text-sm font-medium text-slate-500 mb-2">Payment Method</h4>
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-8 bg-white border border-slate-200 rounded-md flex items-center justify-center">
                        <svg className="w-8" viewBox="0 0 48 48" fill="none"><path d="M31.233 24H16.767c-1.332 0-2.585.534-3.504 1.48A5.138 5.138 0 0 0 11.79 29.5v.333a5.138 5.138 0 0 0 5.138 5.138h14.145a5.138 5.138 0 0 0 5.138-5.138v-.333a5.138 5.138 0 0 0-1.473-4.02 4.85 4.85 0 0 0-3.504-1.48zM16.767 13.029h14.145c1.332 0 2.585.534 3.504 1.48a5.138 5.138 0 0 1 1.473 4.02v.333a5.138 5.138 0 0 1-5.138-5.138H16.767a5.138 5.138 0 0 1-5.138-5.138v-.333a5.138 5.138 0 0 1 1.473-4.02c.919-.947 2.172-1.48 3.504-1.48z" fill="#007bff"></path></svg>
                     </div>
                     <div>
                       <p className="font-semibold text-slate-800">Visa ending in 4242</p>
                       <p className="text-sm text-slate-500">Expires 12/2026</p>
                     </div>
                   </div>
                   <button className="w-full mt-4 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Update Payment Method</button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing History</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                   <thead className="bg-slate-50/70 text-xs uppercase text-slate-500 border-b border-slate-200">
                     <tr><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-left">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Invoice</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {billingHistoryData.map(inv => (
                       <tr key={inv.id}>
                         <td className="px-4 py-3 text-slate-600">{format(inv.date, 'MMM d, yyyy')}</td>
                         <td className="px-4 py-3 font-medium text-slate-800">Monthly Subscription</td>
                         <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(inv.amount)}</td>
                         <td className="px-4 py-3 text-center"><Badge variant="success">Paid</Badge></td>
                         <td className="px-4 py-3 text-center">
                           <button className="text-indigo-600 hover:underline text-xs font-medium flex items-center gap-1 mx-auto"><DownloadCloud className="w-3.5 h-3.5" /> PDF</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <SectionHeader title="Settings" subtitle="Manage your workspace, team access, and integrations" />
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === tab ? "border-indigo-500 text-indigo-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-700")}>
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// --- Modals & Panels ---

const InviteStaffModal = ({ onClose, onInvite }: { onClose: () => void, onInvite: (staff: any) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Designer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) {
      alert('Please fill out all fields.');
      return;
    }
    onInvite({
      id: Date.now(),
      name,
      role,
      stage: 'Invite Sent',
      status: 'waiting',
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Invite New Staff Member</h2>
            <p className="text-sm text-slate-500">They will receive an email to set up their account.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="staffName" className="text-sm font-medium text-slate-700 block mb-2">Full Name</label>
              <input type="text" id="staffName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Jane Doe" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
            </div>
            <div>
              <label htmlFor="staffEmail" className="text-sm font-medium text-slate-700 block mb-2">Email Address</label>
              <input type="email" id="staffEmail" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane.doe@example.com" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
            </div>
            <div>
              <label htmlFor="staffRole" className="text-sm font-medium text-slate-700 block mb-2">Role</label>
              <select id="staffRole" value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none">
                <option>Designer</option>
                <option>Sr. Designer</option>
                <option>Motion Lead</option>
                <option>Full Stack Dev</option>
                <option>Copywriter</option>
                <option>Data Analyst</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Send Invite</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const NewClientModal = ({ onClose, onAddClient }: { onClose: () => void, onAddClient: (client: any) => void }) => {
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('Growth');
  const [mrr, setMrr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plan || !mrr) {
      alert('Please fill out all fields.');
      return;
    }
    onAddClient({
      name,
      plan,
      mrr: parseInt(mrr, 10)
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Add New Client</h2>
            <p className="text-sm text-slate-500">Onboard a new client to the portfolio.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="clientName" className="text-sm font-medium text-slate-700 block mb-2">Client Name</label>
              <input type="text" id="clientName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Stark Industries" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
            </div>
            <div>
              <label htmlFor="clientPlan" className="text-sm font-medium text-slate-700 block mb-2">Subscription Plan</label>
              <select id="clientPlan" value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none">
                <option>Enterprise</option>
                <option>Growth</option>
                <option>Pro</option>
              </select>
            </div>
             <div>
              <label htmlFor="clientMrr" className="text-sm font-medium text-slate-700 block mb-2">MRR (Monthly Recurring Revenue)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">$</span>
                <input type="number" id="clientMrr" value={mrr} onChange={e => setMrr(e.target.value)} placeholder="12000" className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Add Client</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CreateInvoiceModal = ({ onClose, onCreate, clients }: { onClose: () => void, onCreate: (invoice: any) => void, clients: typeof initialClientData }) => {
  const [clientName, setClientName] = useState(clients[0]?.name || '');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !amount || !dueDate) {
      alert('Please select a client, amount, and due date.');
      return;
    }
    onCreate({
      clientName,
      amount: parseInt(amount, 10),
      dueDate: new Date(dueDate),
      description,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Create New Invoice</h2>
            <p className="text-sm text-slate-500">Generate an invoice for a client.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="invoiceClient" className="text-sm font-medium text-slate-700 block mb-2">Client</label>
              <select id="invoiceClient" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none">
                {clients.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                <label htmlFor="invoiceAmount" className="text-sm font-medium text-slate-700 block mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">$</span>
                  <input type="number" id="invoiceAmount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="12000" className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="invoiceDueDate" className="text-sm font-medium text-slate-700 block mb-2">Due Date</label>
                <input type="date" id="invoiceDueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="invoiceDescription" className="text-sm font-medium text-slate-700 block mb-2">Description</label>
              <textarea id="invoiceDescription" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Q3 Retainer Fee" rows={3} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Create Invoice</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ManageClientModal = ({ client, onClose, onUpdate, onDelete }: { client: any, onClose: () => void, onUpdate: (client: any) => void, onDelete: (id: number) => void }) => {
  const [name, setName] = useState(client.name);
  const [plan, setPlan] = useState(client.plan);
  const [mrr, setMrr] = useState(client.mrr.toString());

  useEffect(() => {
    setName(client.name);
    setPlan(client.plan);
    setMrr(client.mrr.toString());
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...client, name, plan, mrr: parseInt(mrr, 10) || 0 });
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Manage Client</h2>
            <p className="text-sm text-slate-500">Edit details or remove client from the portfolio.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="manageClientName" className="text-sm font-medium text-slate-700 block mb-2">Client Name</label>
              <input type="text" id="manageClientName" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
            </div>
            <div>
              <label htmlFor="manageClientPlan" className="text-sm font-medium text-slate-700 block mb-2">Subscription Plan</label>
              <select id="manageClientPlan" value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none">
                <option>Enterprise</option>
                <option>Growth</option>
                <option>Pro</option>
              </select>
            </div>
            <div>
              <label htmlFor="manageClientMrr" className="text-sm font-medium text-slate-700 block mb-2">MRR (Monthly Recurring Revenue)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">$</span>
                <input type="number" id="manageClientMrr" value={mrr} onChange={e => setMrr(e.target.value)} className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={() => onDelete(client.id)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100"
            >
              <Trash2 className="w-4 h-4" />
              Delete Client
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const NotificationPanel = ({ notifications, onClose }: { notifications: typeof recentActivity, onClose: () => void }) => {
    const iconMap = {
        alert: { Icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-100' },
        success: { Icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
        info: { Icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
        neutral: { Icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100' },
    };

    return (
      <div className="absolute top-16 right-6 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[500px] overflow-hidden animate-slide-in z-50">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-slate-800">Notifications</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XCircle className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => {
                const { Icon, color, bg } = iconMap[notif.type as keyof typeof iconMap] || iconMap.neutral;
                return (
                  <div key={notif.id} className="flex gap-4 p-4 hover:bg-slate-50/70 cursor-pointer">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-tight">{notif.msg}</p>
                      <span className="text-xs text-slate-400 mt-1">{notif.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">No new notifications.</div>
          )}
        </div>
        <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
          <button className="text-xs font-medium text-indigo-600 hover:underline">Mark all as read</button>
        </div>
      </div>
    );
};


// --- Main Layout ---

export default function App() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInviteStaffModalOpen, setIsInviteStaffModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isManageClientModalOpen, setIsManageClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const [isRebalancing, setIsRebalancing] = useState(false);
  const [aiMessage, setAiMessage] = useState(`"Motion team will hit 105% capacity by Friday. Recommend approving 20h overtime or shifting 3 non-urgent briefs."`);

  const [onboardingState, setOnboardingState] = useState(initialOnboardingData);
  const [clientState, setClientState] = useState(initialClientData);
  const [invoices, setInvoices] = useState(initialInvoiceData);
  const [workLanesState, setWorkLanesState] = useState(initialWorkLanes);
  const [staffState, setStaffState] = useState(initialStaffData);
  const [capacityState, setCapacityState] = useState(initialCapacityData);
  
  const [aiChatHistory, setAiChatHistory] = useState([
    { 
      id: 1,
      sender: 'user', 
      text: "How's our margin on the NexusTech account?" 
    },
    { 
      id: 2,
      sender: 'ai', 
      text: 'The margin on "NexusTech" has dipped by 3% over the last 7 days. This seems to be caused by high freelance utilization due to an increased number of revisions.',
      actions: ['showDetails', 'optimizeSpend'] 
    }
  ]);
  const [aiInput, setAiInput] = useState('');

  const notificationsContainerRef = useRef<HTMLDivElement>(null);
  const notificationBellRef = useRef<HTMLButtonElement>(null);
  const aiChatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsContainerRef.current &&
        !notificationsContainerRef.current.contains(event.target as Node) &&
        notificationBellRef.current &&
        !notificationBellRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);
  
  useEffect(() => {
    if (aiChatContainerRef.current) {
        aiChatContainerRef.current.scrollTop = aiChatContainerRef.current.scrollHeight;
    }
  }, [aiChatHistory]);


  const financeMetrics = useMemo(() => {
    // --- Cash Collected (MTD) ---
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const cashCollected = invoices
      .filter(inv => inv.status === 'Paid' && inv.dueDate >= currentMonthStart && inv.dueDate <= currentMonthEnd)
      .reduce((sum, inv) => sum + inv.amount, 0);

    const invoicedThisMonth = invoices
      .filter(inv => inv.dueDate >= currentMonthStart && inv.dueDate <= currentMonthEnd)
      .reduce((sum, inv) => sum + inv.amount, 0);

    const collectedPercentage = invoicedThisMonth > 0 ? (cashCollected / invoicedThisMonth) * 100 : 0;

    const collectedLastMonth = invoices
      .filter(inv => inv.status === 'Paid' && inv.dueDate >= lastMonthStart && inv.dueDate <= lastMonthEnd)
      .reduce((sum, inv) => sum + inv.amount, 0);

    let cashTrendValue = 0;
    if (collectedLastMonth > 0) {
      cashTrendValue = ((cashCollected - collectedLastMonth) / collectedLastMonth) * 100;
    } else if (cashCollected > 0) {
      cashTrendValue = 100;
    }
    const cashTrendDirection = cashTrendValue > 0.1 ? 'up' : cashTrendValue < -0.1 ? 'down' : 'neutral';


    // --- Contribution Margin ---
    const totalRevenue = financialTrendData.reduce((sum, d) => sum + d.revenue, 0);
    const totalCosts = financialTrendData.reduce((sum, d) => sum + d.costs, 0);
    const contributionMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

    const latestMonth = financialTrendData[financialTrendData.length - 1];
    const prevMonth = financialTrendData[financialTrendData.length - 2];

    const latestMargin = latestMonth.revenue > 0 ? (latestMonth.revenue - latestMonth.costs) / latestMonth.revenue : 0;
    const prevMargin = prevMonth.revenue > 0 ? (prevMonth.revenue - prevMonth.costs) / prevMonth.revenue : 0;

    const marginTrendValue = (latestMargin - prevMargin) * 100;
    const marginTrendDirection = marginTrendValue > 0.1 ? 'up' : marginTrendValue < -0.1 ? 'down' : 'neutral';

    return {
      cashCollected,
      collectedPercentage,
      cashTrendValue: Math.abs(cashTrendValue),
      cashTrendDirection,
      contributionMargin,
      marginTrendValue: Math.abs(marginTrendValue),
      marginTrendDirection
    };
  }, [invoices]);

  const overviewMetrics = useMemo(() => {
    // --- First-Pass Acceptance ---
    const totalFpa = staffState.reduce((sum, staff) => sum + staff.fpa, 0);
    const averageFpa = staffState.length > 0 ? totalFpa / staffState.length : 0;

    // Simulate last month's data for trend calculation
    const lastMonthAverageFpa = 88.0; 
    
    const fpaTrendValue = averageFpa - lastMonthAverageFpa;
    const fpaTrendDirection = fpaTrendValue > 0.1 ? 'up' : fpaTrendValue < -0.1 ? 'down' : 'neutral';

    return {
        averageFpa,
        fpaTrendValue: Math.abs(fpaTrendValue),
        fpaTrendDirection
    };
  }, [staffState]);

  const handleInviteStaff = (newStaffMember: any) => {
    setOnboardingState(prevState => ({
      ...prevState,
      staff: [...prevState.staff, newStaffMember]
    }));
    setIsInviteStaffModalOpen(false);
  };
  
  const handleAddNewClient = (newClient: any) => {
    const newClientWithDefaults = {
      ...newClient,
      id: Date.now(),
      health: 100, // Default good health for new clients
      nps: 0,
      usage: 0,
      renewal: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    };
    setClientState(prevState => [newClientWithDefaults, ...prevState]);
    setIsNewClientModalOpen(false);
  };
  
  const handleCreateInvoice = (newInvoice: any) => {
    const newInvoiceWithDefaults = {
      ...newInvoice,
      id: Date.now(),
      status: 'Pending',
    };
    setInvoices(prevState => [newInvoiceWithDefaults, ...prevState]);
    setIsCreateInvoiceModalOpen(false);
  };

  const handleOpenManageClient = (client: any) => {
    setSelectedClient(client);
    setIsManageClientModalOpen(true);
  };

  const handleUpdateClient = (updatedClient: any) => {
    setClientState(prevState =>
      prevState.map(client =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
    setIsManageClientModalOpen(false);
  };

  const handleDeleteClient = (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        setClientState(prevState => prevState.filter(client => client.id !== clientId));
        setIsManageClientModalOpen(false);
    }
  };

  const handleTaskMove = (taskId: number, sourceColumnId: string, destinationColumnId: string) => {
    if (sourceColumnId === destinationColumnId) return;

    setWorkLanesState(prev => {
        const newLanes: { [key: string]: any[] } = { 
            todo: [...prev.todo],
            inProgress: [...prev.inProgress],
            review: [...prev.review]
        };

        const sourceKey = sourceColumnId as keyof typeof initialWorkLanes;
        const destKey = destinationColumnId as keyof typeof initialWorkLanes;

        const sourceColumn = newLanes[sourceKey];
        
        const taskIndex = sourceColumn.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            console.error("Task not found in source column");
            return prev; // Task not found, return original state
        }
        
        const [movedTask] = sourceColumn.splice(taskIndex, 1);
        
        const destColumn = newLanes[destKey];
        destColumn.unshift(movedTask);

        return {
            todo: newLanes.todo,
            inProgress: newLanes.inProgress,
            review: newLanes.review
        };
    });
  };
  
  const handleUpdateStaffRole = (staffId: number, newRole: string) => {
    setStaffState(prevState =>
      prevState.map(staff =>
        staff.id === staffId ? { ...staff, permissionRole: newRole } : staff
      )
    );
  };
  
  const handleAutoRebalance = () => {
    setIsRebalancing(true);
    
    // Reset message to default after a while
    setTimeout(() => {
      setAiMessage(`"Motion team will hit 105% capacity by Friday. Recommend approving 20h overtime or shifting 3 non-urgent briefs."`);
    }, 8000);

    setTimeout(() => {
        const inProgressTasks = [...workLanesState.inProgress];
        const taskToMoveIndex = inProgressTasks.findIndex(t => t.slaStatus === 'healthy');

        if (taskToMoveIndex === -1) {
            alert("AI analysis complete: No non-urgent tasks are available to rebalance at this time.");
            setIsRebalancing(false);
            return;
        }
        
        const taskToMove = inProgressTasks.splice(taskToMoveIndex, 1)[0];

        // FIX: Safely calculate staff initials to avoid runtime errors on names without spaces.
        const staffMember = staffState.find(s => {
          const nameParts = s.name.split(' ');
          if (nameParts.length < 2) {
            return false;
          }
          const initials = nameParts[0].substring(0, 1) + nameParts[1].substring(0, 1);
          return initials === taskToMove.assignee;
        });
        
        if (!staffMember || !staffMember.team) {
            console.error("Could not find staff member or team for assignee:", taskToMove.assignee);
            alert("An error occurred while rebalancing. Could not find the assigned staff member's team.");
            setIsRebalancing(false);
            return;
        }
        
        const staffTeam = staffMember.team;

        setWorkLanesState(prev => ({
            ...prev,
            inProgress: inProgressTasks,
            todo: [taskToMove, ...prev.todo],
        }));

        setCapacityState(prev => prev.map(team => 
            team.team === staffTeam
                ? { ...team, allocated: Math.max(0, team.allocated - 8) }
                : team
        ));

        setStaffState(prev => prev.map(staff => 
            staff.id === staffMember.id
                ? { ...staff, utilization: Math.max(0, staff.utilization - 5) }
                : staff
        ));
        
        setAiMessage(`Success! Moved "${taskToMove.title}" to the 'Now / Next' queue to free up capacity in the ${staffTeam} team.`);
        setIsRebalancing(false);
    }, 1500);
  };
  
  const handleShowProjectDetails = () => {
    setCurrentView('work');
    setIsAiOpen(false);
    setAiChatHistory(prev => [...prev, { id: Date.now(), sender: 'ai', text: "Okay, I've navigated you to the Work & SLAs view." }]);
  };

  const handleOptimizeSpend = () => {
    const latestMessage = aiChatHistory[aiChatHistory.length - 1];
    if (latestMessage.sender === 'ai' && latestMessage.actions) {
        const updatedHistory = [...aiChatHistory];
        updatedHistory[updatedHistory.length - 1] = { ...latestMessage, actions: [] }; // Remove actions
        setAiChatHistory(updatedHistory);
    }

    setTimeout(() => {
        setAiChatHistory(prev => [
            ...prev,
            { 
                id: Date.now(),
                sender: 'ai', 
                text: "I've flagged the account for a budget review and paused non-essential freelance spend. This should improve the health score." 
            }
        ]);
        
        setClientState(prevClients => 
            prevClients.map(c => 
                c.name === 'NexusTech' 
                    ? { ...c, health: Math.min(100, c.health + 15) } 
                    : c
            )
        );
    }, 500);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiInput.trim() === '') return;

    const newUserMessage = { id: Date.now(), sender: 'user', text: aiInput };
    setAiChatHistory(prev => [...prev, newUserMessage]);
    setAiInput('');

    setTimeout(() => {
      let aiResponseText = "I'm sorry, I can only provide information about the NexusTech account margin right now.";
      let actions: string[] = [];
      if (aiInput.toLowerCase().includes('nexustech') || aiInput.toLowerCase().includes('margin')) {
        aiResponseText = 'The margin on "NexusTech" has dipped by 3% over the last 7 days. This is caused by high freelance utilization due to an increased number of revisions.';
        actions = ['showDetails', 'optimizeSpend'];
      }
      const newAiMessage = { id: Date.now() + 1, sender: 'ai', text: aiResponseText, actions };
      setAiChatHistory(prev => [...prev, newAiMessage]);
    }, 1000);
  };

  const ViewComponent = useMemo(() => {
    switch(currentView) {
      case 'overview': return () => <OverviewView onViewChange={setCurrentView} metrics={overviewMetrics} />;
      case 'finance': return () => <FinanceView invoices={invoices} onCreateInvoiceClick={() => setIsCreateInvoiceModalOpen(true)} metrics={financeMetrics} />;
      case 'people': return () => <PeopleView onInviteClick={() => setIsInviteStaffModalOpen(true)} onAutoRebalance={handleAutoRebalance} isRebalancing={isRebalancing} staffData={staffState} capacityData={capacityState} aiMessage={aiMessage} />;
      case 'work': return () => <WorkView workLanes={workLanesState} onTaskMove={handleTaskMove} />;
      case 'clients': return () => <ClientsView clientData={clientState} onNewClientClick={() => setIsNewClientModalOpen(true)} onManageClick={handleOpenManageClient} />;
      case 'onboarding': return () => <OnboardingView onboardingData={onboardingState} onInviteClick={() => setIsInviteStaffModalOpen(true)} />;
      case 'reports': return ReportsView;
      case 'settings': return () => <SettingsView staffData={staffState} onUpdateStaffRole={handleUpdateStaffRole} />;
      default: return () => <OverviewView onViewChange={setCurrentView} metrics={overviewMetrics} />;
    }
  }, [currentView, onboardingState, clientState, invoices, workLanesState, staffState, capacityState, isRebalancing, aiMessage, financeMetrics, overviewMetrics]);

  const SidebarItem = ({ icon: Icon, label, view, isActive, onClick }: any) => (
    <button onClick={onClick} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200")}>
      <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-slate-500")} /> {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800 shrink-0 relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <Rocket className="w-6 h-6 text-indigo-500 mr-2" /><span className="text-lg font-bold text-white tracking-tight">Orbit<span className="text-indigo-400">OS</span></span>
        </div>
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Main</div>
          <SidebarItem icon={LayoutDashboard} label="Overview" view="overview" isActive={currentView === 'overview'} onClick={() => setCurrentView('overview')} />
          <SidebarItem icon={Wallet} label="Finance" view="finance" isActive={currentView === 'finance'} onClick={() => setCurrentView('finance')} />
          <SidebarItem icon={Users} label="People" view="people" isActive={currentView === 'people'} onClick={() => setCurrentView('people')} />
          <SidebarItem icon={Layers} label="Work & SLAs" view="work" isActive={currentView === 'work'} onClick={() => setCurrentView('work')} />
          <SidebarItem icon={Briefcase} label="Clients" view="clients" isActive={currentView === 'clients'} onClick={() => setCurrentView('clients')} />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-8">Ops</div>
          <SidebarItem icon={Rocket} label="Onboarding" view="onboarding" isActive={currentView === 'onboarding'} onClick={() => setCurrentView('onboarding')} />
          <SidebarItem icon={FileText} label="Reports" view="reports" isActive={currentView === 'reports'} onClick={() => setCurrentView('reports')} />
        </div>
        <div className="p-3 mt-auto">
          <SidebarItem icon={Settings} label="Settings" view="settings" isActive={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
          <div className="mt-4 px-3 py-3 bg-slate-800 rounded-xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">AD</div>
             <div className="overflow-hidden"><p className="text-sm font-medium text-white truncate">Admin User</p><p className="text-xs text-slate-400 truncate">owner@agency.com</p></div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2" /><input type="text" placeholder="Command + K to search..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"/>
            <kbd className="hidden md:inline-flex items-center h-5 px-1.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-300 rounded shadow-sm">K</kbd>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setIsAiOpen(!isAiOpen)}><BrainCircuit className="w-4 h-4" /> Ask AI</div>
            <button ref={notificationBellRef} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative text-slate-400 hover:text-slate-600"><Bell className="w-5 h-5" /><span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" /></button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex gap-2">
               <button onClick={() => setIsNewClientModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 shadow-sm">New Client</button>
               <button onClick={() => setCurrentView('work')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm"><Plus className="w-4 h-4" /> New Brief</button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 scroll-smooth">
          <div className="max-w-[1600px] mx-auto"><ViewComponent /></div>
        </main>

        {/* AI Assistant Panel */}
        {isAiOpen && (
          <div className="absolute top-16 right-6 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-in z-50">
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-2 font-bold text-slate-800">
                 <Sparkles className="w-5 h-5 text-indigo-500" />
                 <span>Orbit AI Assistant</span>
               </div>
               <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <XCircle className="w-5 h-5" />
               </button>
            </div>
            <div ref={aiChatContainerRef} className="p-4 flex-1 overflow-y-auto bg-slate-50 space-y-6">
              {aiChatHistory.map((message) => {
                  if (message.sender === 'user') {
                      return (
                          <div key={message.id} className="flex justify-end">
                              <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none shadow-sm text-sm max-w-xs">
                                  {message.text}
                              </div>
                          </div>
                      );
                  }
                  return (
                      <div key={message.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                              <BrainCircuit className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="flex flex-col gap-2 items-start">
                              <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm text-sm text-slate-700 max-w-xs">
                                  {message.text}
                              </div>
                              {message.actions && message.actions.length > 0 && (
                                  <div className="flex gap-2 flex-wrap">
                                      {message.actions.includes('showDetails') && (
                                          <button onClick={handleShowProjectDetails} className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-full hover:bg-slate-50 transition-colors">Show project details</button>
                                      )}
                                      {message.actions.includes('optimizeSpend') && (
                                          <button onClick={handleOptimizeSpend} className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-full hover:bg-slate-50 transition-colors">Optimize spend</button>
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}
            </div>
            <form onSubmit={handleAiSubmit} className="p-3 border-t border-slate-200 bg-white relative">
               <input 
                 type="text"
                 value={aiInput}
                 onChange={(e) => setAiInput(e.target.value)}
                 placeholder="Ask about NexusTech..." 
                 className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 ring-indigo-500/50 outline-none transition-all" 
                />
               <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors">
                 <ArrowUpRight className="w-4 h-4" />
               </button>
            </form>
          </div>
        )}
        
        {/* Notifications Panel */}
        {isNotificationsOpen && (
            <div ref={notificationsContainerRef}>
                <NotificationPanel notifications={recentActivity} onClose={() => setIsNotificationsOpen(false)} />
            </div>
        )}
        
        {/* Modals */}
        {isInviteStaffModalOpen && <InviteStaffModal onClose={() => setIsInviteStaffModalOpen(false)} onInvite={handleInviteStaff} />}
        {isNewClientModalOpen && <NewClientModal onClose={() => setIsNewClientModalOpen(false)} onAddClient={handleAddNewClient} />}
        {isCreateInvoiceModalOpen && <CreateInvoiceModal onClose={() => setIsCreateInvoiceModalOpen(false)} onCreate={handleCreateInvoice} clients={clientState} />}
        {isManageClientModalOpen && selectedClient && (
          <ManageClientModal
            client={selectedClient}
            onClose={() => setIsManageClientModalOpen(false)}
            onUpdate={handleUpdateClient}
            onDelete={handleDeleteClient}
          />
        )}
      </div>
    </div>
  );
}
