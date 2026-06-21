import React from 'react'
import { 
  Loader2, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCw,
  FolderOpen
} from 'lucide-react'

// ==========================================
// 1. CARD COMPONENT
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  headerActions?: React.ReactNode
  footer?: React.ReactNode
  isElevated?: boolean
  isHoverable?: boolean
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerActions,
  footer,
  children,
  className = '',
  isElevated = false,
  isHoverable = true,
  ...props
}) => {
  const baseClass = 'rounded-xl border border-default bg-subtle p-5 transition-all duration-300'
  const hoverClass = isHoverable ? 'hover:border-accent hover:shadow-glow hover:translate-y-[-2px]' : ''
  const shadowClass = isElevated ? 'shadow-md' : 'shadow-sm'
  
  return (
    <div 
      className={`${baseClass} ${hoverClass} ${shadowClass} ${className}`}
      {...props}
    >
      {(title || headerActions) && (
        <div className="flex items-start justify-between border-b border-default pb-4 mb-4 gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-primary">{title}</h3>}
            {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className="text-sm text-secondary">{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-default flex items-center justify-between text-xs text-muted">
          {footer}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 2. PANEL COMPONENT
// ==========================================
interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  sidebar?: React.ReactNode
}

export const Panel: React.FC<PanelProps> = ({
  header,
  sidebar,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`} {...props}>
      {sidebar && (
        <div className="w-full md:w-64 shrink-0 rounded-xl border border-default bg-canvas p-4 shadow-sm">
          {sidebar}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {header && (
          <div className="border-b border-default pb-4 mb-5 flex items-center justify-between">
            {header}
          </div>
        )}
        <div className="rounded-xl border border-default bg-subtle p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. SECTION COMPONENT
// ==========================================
interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string
  description?: string
  divider?: boolean
}

export const Section: React.FC<SectionProps> = ({
  heading,
  description,
  divider = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <section className={`mb-8 ${className}`} {...props}>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary tracking-tight">{heading}</h2>
        {description && <p className="text-sm text-muted mt-1 max-w-3xl">{description}</p>}
      </div>
      <div className="text-sm text-secondary">{children}</div>
      {divider && <hr className="border-default mt-8" />}
    </section>
  )
}

// ==========================================
// 4. STATUS BADGE COMPONENT
// ==========================================
export type BadgeStatus = 'queued' | 'running' | 'success' | 'failed' | 'warning' | 'pending'

interface StatusBadgeProps {
  status: BadgeStatus
  label?: string
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md'
}) => {
  const configs: Record<BadgeStatus, { bg: string; text: string; icon: React.ReactNode; defaultLabel: string }> = {
    queued: {
      bg: 'bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'Queued'
    },
    pending: {
      bg: 'bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'Pending'
    },
    running: {
      bg: 'bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80',
      text: 'text-blue-700 dark:text-blue-300',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      defaultLabel: 'Running'
    },
    success: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'Succeeded'
    },
    failed: {
      bg: 'bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80',
      text: 'text-rose-700 dark:text-rose-300',
      icon: <XCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'Failed'
    },
    warning: {
      bg: 'bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80',
      text: 'text-amber-700 dark:text-amber-300',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      defaultLabel: 'Warning'
    }
  }

  const current = configs[status] || configs.queued
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-3 py-1 text-xs gap-1.5'

  return (
    <span className={`inline-flex items-center rounded-full font-medium select-none ${current.bg} ${current.text} ${sizeClasses}`}>
      {current.icon}
      <span>{label || current.defaultLabel}</span>
    </span>
  )
}

// ==========================================
// 5. EMPTY STATE COMPONENT
// ==========================================
interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <FolderOpen className="w-12 h-12 text-muted" />,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-default rounded-2xl bg-canvas/30 max-w-md mx-auto my-6">
      <div className="mb-4 p-3 rounded-full bg-subtle/50 text-muted shadow-sm">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <p className="text-xs text-muted mt-2 mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-btn-primary-bg text-white hover:opacity-90 shadow-md cursor-pointer active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ==========================================
// 6. LOADING STATE COMPONENT
// ==========================================
interface LoadingStateProps {
  label?: string
  description?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading analysis details...',
  description = 'Retrieving real-time workspace schemas'
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-default animate-pulse absolute" />
        <Loader2 className="w-8 h-8 text-accent animate-spin relative" />
      </div>
      <h3 className="text-sm font-semibold text-primary">{label}</h3>
      <p className="text-xs text-muted mt-1">{description}</p>
    </div>
  )
}

// ==========================================
// 7. ERROR STATE COMPONENT
// ==========================================
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Analysis Fetch Failed',
  message,
  onRetry
}) => {
  return (
    <div className="p-6 border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl max-w-xl mx-auto flex items-start gap-4 shadow-sm my-4">
      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">{title}</h4>
        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/30 cursor-pointer transition-all active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 8. PROGRESS CARD COMPONENT
// ==========================================
interface ProgressCardProps {
  runId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  stage: string
  progress: number
  currentTask: string
  startedAt: string
  onCancel?: () => void
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  runId,
  status,
  stage,
  progress,
  currentTask,
  startedAt,
  onCancel
}) => {
  const badgeStatus: BadgeStatus = 
    status === 'RUNNING' ? 'running' :
    status === 'COMPLETED' ? 'success' :
    status === 'FAILED' ? 'failed' : 'queued'

  const formattedTime = new Date(startedAt).toLocaleTimeString()

  return (
    <Card 
      className="p-5 border-l-4 border-l-accent" 
      isHoverable={false}
      headerActions={
        <div className="flex items-center gap-2">
          <StatusBadge status={badgeStatus} label={status} />
          {status === 'RUNNING' && onCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-medium text-rose-500 hover:text-rose-600 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded cursor-pointer transition-all"
            >
              Cancel Run
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-xs text-muted flex items-center justify-between mb-1">
            <span>RUN INDEX: #{runId.substring(0, 8)}</span>
            <span>STARTED: {formattedTime}</span>
          </div>
          <div className="text-sm font-bold text-primary truncate">
            {stage} &mdash; <span className="font-semibold text-secondary">{currentTask}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-muted mb-1.5">
            <span>Overall Pipeline Execution</span>
            <span className="text-accent">{progress}%</span>
          </div>
          <div className="w-full bg-default rounded-full h-2 overflow-hidden border border-subtle">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
