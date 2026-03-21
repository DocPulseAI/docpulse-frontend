import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, FileText, FileCode, FileJson, Image, Settings, FolderClosed, FolderOpen } from 'lucide-react'

export interface TreeFile {
    id: string
    label: string
    folder: string
    /** file extension for icon selection */
    ext?: string
    /** last modified for display */
    lastModified?: string
}

interface FileTreePanelProps {
    files: TreeFile[]
    activeFileId: string
    onFileSelect: (id: string) => void
}

/** File icon based on extension */
function FileIcon({ name }: { name: string }) {
    const lower = name.toLowerCase()
    if (lower.endsWith('.md') || lower.endsWith('.mdx') || lower.endsWith('.txt')) return <FileText size={13} className="doc-tree-icon doc-tree-icon--md" />
    if (lower.endsWith('.json')) return <FileJson size={13} className="doc-tree-icon doc-tree-icon--json" />
    if (lower.endsWith('.mmd') || lower.endsWith('.mermaid')) return <Image size={13} className="doc-tree-icon doc-tree-icon--diagram" />
    if (lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.js') || lower.endsWith('.py')) return <FileCode size={13} className="doc-tree-icon doc-tree-icon--code" />
    if (lower === 'settings') return <Settings size={13} className="doc-tree-icon doc-tree-icon--config" />
    return <FileText size={13} className="doc-tree-icon" />
}

/**
 * Fixed-width left panel file tree. Exact CodeRabbit tree structure:
 * - Folder grouping with expand/collapse
 * - Active file highlight with left accent border
 * - Monospace file names
 * - Compact spacing (8px grid)
 * - Independent scroll
 */
export default function FileTreePanel({ files, activeFileId, onFileSelect }: FileTreePanelProps) {
    // Group files by folder
    const groups = useMemo(() => {
        const map: Record<string, TreeFile[]> = {}
        for (const f of files) {
            if (!map[f.folder]) map[f.folder] = []
            map[f.folder].push(f)
        }
        return Object.entries(map)
    }, [files])

    // Track expanded folders — all expanded by default
    const [expanded, setExpanded] = useState<Set<string>>(new Set(groups.map(([key]) => key)))

    const toggleFolder = (folder: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(folder) ? next.delete(folder) : next.add(folder)
            return next
        })
    }

    return (
        <div className="doc-tree">
            <div className="doc-tree-head">
                <span className="doc-tree-head-title">Files</span>
                <span className="doc-tree-head-count">{files.length}</span>
            </div>

            <div className="doc-tree-body">
                {groups.map(([folder, folderFiles]) => {
                    const isOpen = expanded.has(folder)
                    return (
                        <div key={folder} className="doc-tree-group">
                            <button className="doc-tree-folder" onClick={() => toggleFolder(folder)}>
                                {isOpen
                                    ? <><FolderOpen size={13} className="doc-tree-folder-icon" /><ChevronDown size={11} /></>
                                    : <><FolderClosed size={13} className="doc-tree-folder-icon" /><ChevronRight size={11} /></>
                                }
                                <span className="doc-tree-folder-name">{folder}/</span>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15, ease: 'easeInOut' }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        {folderFiles.map(file => (
                                            <button
                                                key={file.id}
                                                className={`doc-tree-file ${activeFileId === file.id ? 'doc-tree-file--active' : ''}`}
                                                onClick={() => onFileSelect(file.id)}
                                            >
                                                <FileIcon name={file.label} />
                                                <span className="doc-tree-file-name">{file.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
