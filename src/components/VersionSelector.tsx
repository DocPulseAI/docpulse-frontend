import { useState, useMemo } from 'react'
import { ChevronDown, GitCommit, Clock } from 'lucide-react'
import type { DocumentVersion } from '../services/api'

interface VersionSelectorProps {
    versions: DocumentVersion[]
    currentCommit: string
    onSelect: (commit: string) => void
}

/**
 * Dropdown showing commit SHA (short), timestamp, author.
 * Matches CodeRabbit's version selector pattern.
 */
export default function VersionSelector({ versions, currentCommit, onSelect }: VersionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)

    const current = useMemo(
        () => versions.find(v => v.commit === currentCommit),
        [versions, currentCommit]
    )

    return (
        <div className="doc-version-selector">
            <button className="doc-version-trigger" onClick={() => setIsOpen(!isOpen)}>
                <GitCommit size={12} />
                <span className="doc-version-sha">{currentCommit.substring(0, 7)}</span>
                {current?.metadata?.branch && (
                    <span className="doc-version-branch">{current.metadata.branch}</span>
                )}
                <ChevronDown size={12} className={isOpen ? 'doc-version-chevron--open' : ''} />
            </button>

            {isOpen && (
                <>
                    <div className="doc-version-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="doc-version-dropdown">
                        <div className="doc-version-dropdown-head">Versions ({versions.length})</div>
                        <div className="doc-version-dropdown-list">
                            {versions.map(v => (
                                <button
                                    key={v.commit}
                                    className={`doc-version-item ${v.commit === currentCommit ? 'doc-version-item--active' : ''}`}
                                    onClick={() => { onSelect(v.commit); setIsOpen(false) }}
                                >
                                    <div className="doc-version-item-top">
                                        <span className="doc-version-item-sha">{v.commit.substring(0, 7)}</span>
                                        {v.commit === currentCommit && <span className="doc-version-item-current">Current</span>}
                                    </div>
                                    <div className="doc-version-item-meta">
                                        {v.metadata?.branch && (
                                            <span className="doc-version-item-branch">
                                                <GitCommit size={10} /> {v.metadata.branch}
                                            </span>
                                        )}
                                        {v.metadata?.createdAt && (
                                            <span className="doc-version-item-time">
                                                <Clock size={10} /> {new Date(v.metadata.createdAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
