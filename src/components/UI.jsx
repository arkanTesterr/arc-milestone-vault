import { MILESTONE_STATUS, STATUS_DOT_COLORS } from '../utils/constants';

// ─── Status Badge ───────────────────────────────────────────
export function StatusBadge({ status }) {
  const s = MILESTONE_STATUS[status] || MILESTONE_STATUS[0];
  return (
    <span className={`status-badge ${s.bg} ${s.text} ${s.border} border`}>
      <svg className="h-2 w-2" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="4" fill={STATUS_DOT_COLORS[status] || '#888'} />
      </svg>
      {s.label}
    </span>
  );
}

// ─── Progress Bar ───────────────────────────────────────────
export function ProgressBar({ completed, total, className = '' }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-display font-medium text-vault-muted">Milestone Progress</span>
        <span className="text-xs font-mono text-arc-400">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-vault-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-arc-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-vault-muted mt-1 font-mono">{completed} / {total} completed</p>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, accent = false }) {
  return (
    <div className={`stat-card group transition-all duration-300 hover:border-arc-500/30 ${accent ? 'animate-pulse-glow' : ''}`}>
      <div className="flex items-center gap-2 text-vault-muted">
        {icon}
        <span className="text-xs font-display font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-display font-bold mt-1 ${accent ? 'text-arc-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-vault-muted font-mono">{sub}</p>}
    </div>
  );
}

// ─── Loading Spinner ────────────────────────────────────────
export function LoadingSpinner({ size = 'md', text = 'Loading…' }) {
  const sz = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-10 w-10' : 'h-7 w-7';
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <svg className={`animate-spin ${sz} text-arc-500`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text && <p className="text-sm text-vault-muted font-display">{text}</p>}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-vault-muted/40">{icon}</div>
      <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
      <p className="text-sm text-vault-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────
export function SectionHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="font-display font-bold text-xl text-white">{title}</h2>
        {subtitle && <p className="text-sm text-vault-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
