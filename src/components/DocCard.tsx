import React from 'react'

interface DocCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    headerActions?: React.ReactNode
    bodyStyle?: React.CSSProperties
    bodyClassName?: string
}

export default function DocCard({ 
    title, 
    headerActions, 
    children, 
    bodyStyle, 
    bodyClassName, 
    className, 
    ...props 
}: DocCardProps) {
    return (
        <div className={`doc-card ${className || ''}`} {...props}>
            {title && (
                <div className="doc-card-header">
                    <h3 className="doc-card-title">{title}</h3>
                    {headerActions && <div>{headerActions}</div>}
                </div>
            )}
            <div className={`doc-card-body ${bodyClassName || ''}`} style={bodyStyle}>
                {children}
            </div>
        </div>
    )
}
