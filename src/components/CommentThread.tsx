import { useState } from 'react'
import { MessageCircle, Send, X, User } from 'lucide-react'
import RoleBadge from './RoleBadge'
import type { TeamRole } from '../types/team'

export interface Comment {
    id: string
    author: string
    role: TeamRole
    content: string
    timestamp: string
    line?: number
}

interface CommentThreadProps {
    comments: Comment[]
    onAddComment: (content: string) => void
    onClose: () => void
    lineNumber?: number
}

/**
 * Inline comment thread — popover style with threaded discussion.
 * Minimal design: avatar, role badge, timestamp.
 * Appears in right margin or collapsible panel.
 */
export default function CommentThread({ comments, onAddComment, onClose, lineNumber }: CommentThreadProps) {
    const [newComment, setNewComment] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return
        onAddComment(newComment.trim())
        setNewComment('')
    }

    return (
        <div className="doc-comment-thread">
            <div className="doc-comment-header">
                <div className="doc-comment-header-left">
                    <MessageCircle size={13} />
                    <span className="doc-comment-header-title">
                        {lineNumber != null ? `Line ${lineNumber}` : 'Comments'}
                    </span>
                    <span className="doc-comment-header-count">{comments.length}</span>
                </div>
                <button className="doc-comment-close" onClick={onClose}>
                    <X size={14} />
                </button>
            </div>

            <div className="doc-comment-body">
                {comments.length === 0 && (
                    <div className="doc-comment-empty">No comments yet</div>
                )}

                {comments.map(c => (
                    <div key={c.id} className="doc-comment-item">
                        <div className="doc-comment-item-top">
                            <div className="doc-comment-avatar">
                                <User size={12} />
                            </div>
                            <span className="doc-comment-author">{c.author}</span>
                            <RoleBadge role={c.role} size="sm" />
                            <span className="doc-comment-time">{formatTime(c.timestamp)}</span>
                        </div>
                        <div className="doc-comment-content">{c.content}</div>
                    </div>
                ))}
            </div>

            <form className="doc-comment-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="doc-comment-input"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                />
                <button type="submit" className="doc-comment-send" disabled={!newComment.trim()}>
                    <Send size={13} />
                </button>
            </form>
        </div>
    )
}

function formatTime(iso: string): string {
    const d = Date.now() - new Date(iso).getTime()
    if (d < 60_000) return 'now'
    if (d < 3_600_000) return `${Math.floor(d / 60_000)}m`
    if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h`
    return new Date(iso).toLocaleDateString()
}
