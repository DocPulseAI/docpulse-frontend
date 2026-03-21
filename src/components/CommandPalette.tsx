import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Layout, FolderGit2, Settings, Sun, Moon,
    FileText, GitBranch, BarChart3, Shield, Command
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAppSelector } from '../store/hooks'

interface CommandItem {
    id: string
    label: string
    icon: React.ReactNode
    action: () => void
    section: string
    keywords?: string
}

export default function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAppSelector((state) => state.auth)

    const commands: CommandItem[] = [
        { id: 'nav-dashboard', label: 'Go to Dashboard', icon: <Layout size={16} />, action: () => navigate('/dashboard'), section: 'Navigation', keywords: 'home overview' },
        { id: 'nav-projects', label: 'Go to Projects', icon: <FolderGit2 size={16} />, action: () => navigate('/projects'), section: 'Navigation', keywords: 'repositories repos' },
        ...(user?.role === 'admin' ? [{ id: 'nav-settings', label: 'Go to Settings', icon: <Settings size={16} />, action: () => navigate('/settings'), section: 'Navigation', keywords: 'admin config' }] : []),
        { id: 'theme-toggle', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />, action: toggleTheme, section: 'Preferences', keywords: 'theme dark light mode' },
        { id: 'feat-docs', label: 'Documentation Explorer', icon: <FileText size={16} />, action: () => navigate('/projects'), section: 'Features', keywords: 'docs markdown' },
        { id: 'feat-drift', label: 'Drift Analysis', icon: <BarChart3 size={16} />, action: () => navigate('/dashboard'), section: 'Features', keywords: 'drift radar score' },
        { id: 'feat-compare', label: 'Version Comparison', icon: <GitBranch size={16} />, action: () => navigate('/projects'), section: 'Features', keywords: 'diff compare versions' },
        { id: 'feat-risk', label: 'Risk Assessment', icon: <Shield size={16} />, action: () => navigate('/dashboard'), section: 'Features', keywords: 'risk score breaking changes' },
    ]

    const filtered = query.trim()
        ? commands.filter(cmd => {
            const q = query.toLowerCase()
            return cmd.label.toLowerCase().includes(q) || cmd.keywords?.toLowerCase().includes(q)
        })
        : commands

    const sections = Array.from(new Set(filtered.map(c => c.section)))

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            setOpen(prev => !prev)
            setQuery('')
            setSelectedIndex(0)
        }
        if (e.key === 'Escape') {
            setOpen(false)
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    const handleSelect = (cmd: CommandItem) => {
        cmd.action()
        setOpen(false)
        setQuery('')
    }

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex])
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="cmd-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        className="cmd-dialog"
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cmd-input-wrap">
                            <Search size={16} className="cmd-search-icon" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type a command or search..."
                                className="cmd-input"
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                                onKeyDown={handleInputKeyDown}
                            />
                            <kbd className="cmd-kbd">ESC</kbd>
                        </div>

                        <div className="cmd-list">
                            {filtered.length === 0 && (
                                <div className="cmd-empty">No results found</div>
                            )}
                            {sections.map(section => (
                                <div key={section}>
                                    <div className="cmd-section-label">{section}</div>
                                    {filtered.filter(c => c.section === section).map((cmd) => {
                                        const globalIndex = filtered.indexOf(cmd)
                                        return (
                                            <button
                                                key={cmd.id}
                                                className={`cmd-item ${globalIndex === selectedIndex ? 'cmd-item-active' : ''}`}
                                                onClick={() => handleSelect(cmd)}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                            >
                                                <span className="cmd-item-icon">{cmd.icon}</span>
                                                <span className="cmd-item-label">{cmd.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="cmd-footer">
                            <span className="cmd-hint">
                                <Command size={11} /> <span>K</span> to toggle
                            </span>
                            <span className="cmd-hint">↑↓ navigate</span>
                            <span className="cmd-hint">↵ select</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
