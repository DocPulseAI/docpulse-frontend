import React from 'react'

type IntelligenceViewState = 'no_view' | 'preview' | 'published_ok' | 'published_partial' | 'published_failed' | 'stale'

const styleByState: Record<IntelligenceViewState, string> = {
  no_view: 'bg-slate-100 text-slate-700',
  preview: 'bg-amber-100 text-amber-700',
  published_ok: 'bg-emerald-100 text-emerald-700',
  published_partial: 'bg-orange-100 text-orange-700',
  published_failed: 'bg-rose-100 text-rose-700',
  stale: 'bg-violet-100 text-violet-700',
}

const labelByState: Record<IntelligenceViewState, string> = {
  no_view: 'No View',
  preview: 'Preview',
  published_ok: 'Published',
  published_partial: 'Published (Partial)',
  published_failed: 'Published (Failed)',
  stale: 'Published (Stale)',
}

interface Props {
  state: IntelligenceViewState
}

const IntelligenceStatusBadge: React.FC<Props> = ({ state }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${styleByState[state]}`}>
      {labelByState[state]}
    </span>
  )
}

export default IntelligenceStatusBadge
