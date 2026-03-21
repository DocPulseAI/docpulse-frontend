import type { TeamRole } from '../types/team'
import { ROLE_META } from '../types/team'

interface RoleBadgeProps {
    role: TeamRole
    size?: 'sm' | 'md'
}

/**
 * Color-coded role badge matching CodeRabbit severity badge pattern.
 * Owner → Purple, Maintainer → Blue, Reviewer → Green, Viewer → Gray
 */
export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const meta = ROLE_META[role]
    const className = `cr-role-badge cr-role-badge--${meta.color}${size === 'sm' ? ' cr-role-badge--sm' : ''}`

    return (
        <span className={className} title={meta.description}>
            {meta.label}
        </span>
    )
}
