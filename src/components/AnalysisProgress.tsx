import React from 'react'
import { useRunEvents } from './AnalysisTimeline'
import { Loader2, CheckCircle2, XCircle, Circle, HelpCircle } from 'lucide-react'

interface UIStage {
  id: string
  label: string
  description: string
  status: 'pending' | 'running' | 'succeeded' | 'failed'
}

export const AnalysisProgress = ({ runId }: { runId: string }) => {
  const { progress } = useRunEvents(runId)

  if (!progress) {
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-xl border border-default bg-subtle/50 mb-4 animate-pulse">
        <Loader2 size={16} className="animate-spin text-accent" />
        <span className="text-xs text-muted font-medium">Connecting to live analysis progress...</span>
      </div>
    )
  }

  const { status, stage, progress: pct, currentTask } = progress
  const isCompleted = status === 'COMPLETED' || status === 'SUCCEEDED'
  const isFailed = status === 'FAILED'

  const overallStatusColor = isCompleted
    ? 'text-emerald-500 dark:text-emerald-400'
    : isFailed
    ? 'text-rose-500 dark:text-rose-400'
    : 'text-blue-500 dark:text-blue-400'

  const overallBgColor = isCompleted
    ? 'bg-emerald-500/10'
    : isFailed
    ? 'bg-rose-500/10'
    : 'bg-blue-500/10'

  // Map 5 backend stage strings & percentages into 8 UI stages
  const getUIStages = (): UIStage[] => {
    const isCloning = currentTask.toLowerCase().includes('clon') || currentTask.toLowerCase().includes('fetch')
    
    const getStageStatus = (
      startPct: number,
      endPct: number,
      activeStageName: string
    ): 'pending' | 'running' | 'succeeded' | 'failed' => {
      if (isFailed) {
        if (pct >= endPct) return 'succeeded'
        if (pct >= startPct) return 'failed'
        return 'pending'
      }
      if (isCompleted) return 'succeeded'

      if (pct >= endPct) return 'succeeded'
      if (pct >= startPct) {
        if (stage === activeStageName) return 'running'
        return 'succeeded'
      }
      return 'pending'
    }

    return [
      {
        id: 'queued',
        label: 'Queued',
        description: 'Placed in the orchestration queue',
        status: isFailed && pct === 0 ? 'failed' : pct > 0 ? 'succeeded' : 'running'
      },
      {
        id: 'fetch',
        label: 'Repository Fetch',
        description: 'Cloning repo source code and commits',
        status: isFailed && pct < 10 && stage === 'CODE_ANALYSIS'
          ? 'failed'
          : stage === 'CODE_ANALYSIS' && isCloning
          ? 'running'
          : pct >= 10
          ? 'succeeded'
          : 'pending'
      },
      {
        id: 'analysis',
        label: 'Static Analysis (Epic 1)',
        description: 'Parsing AST and generating modular relations',
        status: isFailed && stage === 'CODE_ANALYSIS' && !isCloning
          ? 'failed'
          : stage === 'CODE_ANALYSIS' && !isCloning
          ? 'running'
          : pct >= 25
          ? 'succeeded'
          : 'pending'
      },
      {
        id: 'docs',
        label: 'Documentation Gen (Epic 2)',
        description: 'Analyzing components and generating reference docs',
        status: getStageStatus(25, 50, 'DOCUMENTATION')
      },
      {
        id: 'drift',
        label: 'Drift Detection (Epic 3)',
        description: 'Comparing codebase states for code/doc drifts',
        status: getStageStatus(50, 85, 'DRIFT_ANALYSIS')
      },
      {
        id: 'summary',
        label: 'Summary Gen (Epic 4)',
        description: 'Generating executive summaries and risk reports',
        status: getStageStatus(85, 95, 'SUMMARY_GENERATION')
      },
      {
        id: 'upload',
        label: 'Artifact Upload',
        description: 'Uploading report snapshots and graphs to cloud storage',
        status: isFailed && pct >= 95 && pct < 100
          ? 'failed'
          : pct === 100 || isCompleted
          ? 'succeeded'
          : pct >= 95
          ? 'running'
          : 'pending'
      },
      {
        id: 'completed',
        label: 'Completed',
        description: 'Orchestration pipeline resolved successfully',
        status: isCompleted ? 'succeeded' : isFailed ? 'failed' : 'pending'
      }
    ]
  }

  const uiStages = getUIStages()

  return (
    <div className="flex flex-col gap-5 p-5 border border-default bg-subtle rounded-2xl shadow-sm mb-4">
      {/* Live progress header */}
      <div className="flex items-center justify-between border-b border-default pb-4">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : isFailed ? (
            <XCircle className="w-5 h-5 text-rose-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          <div>
            <h3 className="text-sm font-bold text-primary">Live Progress</h3>
            <p className="text-[10px] text-muted font-medium mt-0.5 uppercase tracking-wide">
              {stage.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${overallStatusColor} ${overallBgColor}`}>
          {pct}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-default rounded-full h-1.5 overflow-hidden border border-subtle">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 8-stage timeline panel */}
      <div className="flex flex-col mt-2">
        {uiStages.map((s, idx) => {
          const isLast = idx === uiStages.length - 1
          
          // Style classes depending on stage status
          const colors = {
            succeeded: {
              text: 'text-primary font-semibold',
              desc: 'text-muted',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
              line: 'bg-emerald-500/40'
            },
            running: {
              text: 'text-blue-500 font-bold',
              desc: 'text-secondary font-medium',
              icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
              line: 'bg-blue-500/30 dashed-border'
            },
            failed: {
              text: 'text-rose-500 font-bold',
              desc: 'text-rose-400/80',
              icon: <XCircle className="w-4 h-4 text-rose-500" />,
              line: 'bg-rose-500/30'
            },
            pending: {
              text: 'text-muted font-medium',
              desc: 'text-muted/60',
              icon: <Circle className="w-4 h-4 text-muted/40" />,
              line: 'bg-default'
            }
          }[s.status]

          return (
            <div key={s.id} className="flex gap-4 min-h-[50px] relative">
              {/* Connector lines & bullet */}
              <div className="flex flex-col items-center shrink-0 w-5">
                <div className="flex items-center justify-center w-5 h-5">
                  {colors.icon}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 ${colors.line}`} />
                )}
              </div>

              {/* Stage details */}
              <div className="flex-1 pb-4">
                <span className={`text-xs block leading-tight ${colors.text}`}>{s.label}</span>
                <span className={`text-[10px] block mt-0.5 leading-relaxed ${colors.desc}`}>{s.description}</span>
                {s.status === 'running' && (
                  <span className="inline-block text-[9px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full mt-1.5 max-w-full truncate">
                    {currentTask}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
