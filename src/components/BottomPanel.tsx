import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, AlertTriangle, Sparkles, AlertCircle, GripHorizontal } from 'lucide-react'

type BottomTab = 'drift' | 'ai-summary' | 'validation'

interface BottomPanelProps {
    isOpen: boolean
    onToggle: () => void
    driftContent?: string
    aiSummary?: string
    validationErrors?: string[]
}

/**
 * Collapsible bottom panel with tabs: Drift Report, AI Summary, Validation Errors.
 * Resizable via drag handle.
 */
export default function BottomPanel({ isOpen, onToggle, driftContent, aiSummary, validationErrors }: BottomPanelProps) {
    const [activeTab, setActiveTab] = useState<BottomTab>('ai-summary')
    const [height, setHeight] = useState(220)

    const handleDrag = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        const startY = e.clientY
        const startH = height
        const onMove = (ev: MouseEvent) => {
            const diff = startY - ev.clientY
            setHeight(Math.max(120, Math.min(500, startH + diff)))
        }
        const onUp = () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }, [height])

    const tabs: { key: BottomTab; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: 'drift', label: 'Drift Report', icon: <AlertTriangle size={12} /> },
        { key: 'ai-summary', label: 'AI Summary', icon: <Sparkles size={12} /> },
        { key: 'validation', label: 'Validation', icon: <AlertCircle size={12} />, count: validationErrors?.length },
    ]

    return (
        <div className="doc-bottom-panel-wrapper">
            {/* Toggle bar */}
            <button className="doc-bottom-toggle" onClick={onToggle}>
                <span className="doc-bottom-toggle-label">
                    {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    Panel
                </span>
                <div className="doc-bottom-toggle-tabs">
                    {tabs.map(t => (
                        <span key={t.key} className="doc-bottom-toggle-tab">
                            {t.icon}
                            {t.count != null && t.count > 0 && <span className="doc-bottom-toggle-count">{t.count}</span>}
                        </span>
                    ))}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="doc-bottom-panel"
                        initial={{ height: 0 }}
                        animate={{ height }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        {/* Drag handle */}
                        <div className="doc-bottom-drag" onMouseDown={handleDrag}>
                            <GripHorizontal size={14} />
                        </div>

                        {/* Tabs */}
                        <div className="doc-bottom-tabs">
                            {tabs.map(t => (
                                <button
                                    key={t.key}
                                    className={`doc-bottom-tab ${activeTab === t.key ? 'doc-bottom-tab--active' : ''}`}
                                    onClick={() => setActiveTab(t.key)}
                                >
                                    {t.icon} {t.label}
                                    {t.count != null && t.count > 0 && <span className="doc-bottom-tab-badge">{t.count}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="doc-bottom-content">
                            {activeTab === 'drift' && (
                                <div className="doc-bottom-text">
                                    {driftContent || <span className="doc-bottom-empty">No drift report available for this version.</span>}
                                </div>
                            )}
                            {activeTab === 'ai-summary' && (
                                <div className="doc-bottom-text">
                                    {aiSummary || <span className="doc-bottom-empty">No AI summary available for this version.</span>}
                                </div>
                            )}
                            {activeTab === 'validation' && (
                                <div className="doc-bottom-text">
                                    {validationErrors && validationErrors.length > 0 ? (
                                        <ul className="doc-bottom-error-list">
                                            {validationErrors.map((e, i) => (
                                                <li key={i} className="doc-bottom-error-item">
                                                    <AlertCircle size={12} /> {e}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="doc-bottom-empty">No validation errors.</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
