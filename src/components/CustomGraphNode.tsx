import { memo, CSSProperties } from 'react';
import { Handle, Position, NodeProps, useViewport } from 'reactflow';
import {
  Server,
  GitBranch,
  Layers,
  Database,
  Box,
  LucideIcon,
} from 'lucide-react';

export type NodeType = 'API' | 'Controller' | 'Service' | 'Entity' | 'Module';

export interface CustomNodeData {
  label: string;
  type: NodeType;
  description?: string;
  fullPath?: string;
  depthLevel?: number;
  isCyclic?: boolean;
}

interface NodeTheme {
  color: string;
  tint: string;
  border: string;
  tag: string;
  tagText: string;
  icon: LucideIcon;
}

const NODE_THEMES: Record<NodeType, NodeTheme> = {
  API: {
    color: '#3B82F6',
    tint: 'rgba(59, 130, 246, 0.10)',
    border: 'rgba(59, 130, 246, 0.35)',
    tag: 'API',
    tagText: '#93C5FD',
    icon: Server,
  },
  Controller: {
    color: '#A855F7',
    tint: 'rgba(168, 85, 247, 0.10)',
    border: 'rgba(168, 85, 247, 0.35)',
    tag: 'Controller',
    tagText: '#D8B4FE',
    icon: GitBranch,
  },
  Service: {
    color: '#22C55E',
    tint: 'rgba(34, 197, 94, 0.10)',
    border: 'rgba(34, 197, 94, 0.30)',
    tag: 'Service',
    tagText: '#86EFAC',
    icon: Layers,
  },
  Entity: {
    color: '#F97316',
    tint: 'rgba(249, 115, 22, 0.10)',
    border: 'rgba(249, 115, 22, 0.30)',
    tag: 'Entity',
    tagText: '#FDBA74',
    icon: Database,
  },
  Module: {
    color: '#6B7280',
    tint: 'rgba(107, 114, 128, 0.12)',
    border: 'rgba(107, 114, 128, 0.30)',
    tag: 'Module',
    tagText: '#9CA3AF',
    icon: Box,
  },
};

const makeHandleStyle = (color: string): CSSProperties => ({
  width: 8,
  height: 8,
  background: color,
  border: `2px solid var(--bg-canvas)`,
  borderRadius: '50%',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
});

const CustomGraphNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  const type: NodeType = data.type ?? 'Module';
  const baseTheme = NODE_THEMES[type] ?? NODE_THEMES.Module;
  
  const isCyclic = data.isCyclic ?? false;
  const depth = data.depthLevel ?? 0;
  const depthOpacity = Math.max(0.45, 1 - depth * 0.08);

  const cyclicOverrides = isCyclic ? {
    color: '#EF4444',
    tint: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.50)',
    tagText: '#FCA5A5',
  } : {};

  const theme = { ...baseTheme, ...cyclicOverrides };
  const Icon = theme.icon;

  const { zoom } = useViewport();
  const useMini = zoom < 0.45;

  if (useMini) {
    return (
      <>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <div style={{
          width: 90,
          height: 28,
          borderRadius: 4,
          borderLeft: `3px solid ${theme.color}`,
          background: 'var(--bg-elevated)',
          border: `1px solid var(--border-default)`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          overflow: 'hidden',
          opacity: depthOpacity,
        }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {data.label}
          </span>
        </div>
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      </>
    );
  }

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: 200,
    background: 'var(--bg-elevated)',
    border: `1px solid ${selected ? theme.color : 'var(--border-default)'}`,
    borderLeft: `4px solid ${theme.color}`,
    borderRadius: 8,
    padding: '10px 12px 10px 14px',
    fontFamily: "var(--font-sans)",
    cursor: 'grab',
    boxSizing: 'border-box',
    boxShadow: selected
      ? `0 0 0 1px ${theme.color}55, 0 4px 24px ${theme.color}22`
      : 'var(--shadow-sm)',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    backdropFilter: 'blur(4px)',
    opacity: depthOpacity,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  };

  const iconBadgeStyle: CSSProperties = {
    flexShrink: 0,
    width: 26,
    height: 26,
    borderRadius: 5,
    background: `${theme.color}22`,
    border: `1px solid ${theme.color}44`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle: CSSProperties = {
    flex: 1,
    fontSize: 11.5,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '0.01em',
    lineHeight: 1.3,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
  };

  const tagStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.tagText,
    background: `${theme.color}18`,
    border: `1px solid ${theme.color}33`,
    borderRadius: 4,
    padding: '2px 6px',
    marginTop: 2,
  };

  const descStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-secondary)',
    marginTop: 5,
    lineHeight: 1.4,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  const dividerStyle: CSSProperties = {
    height: 1,
    background: `linear-gradient(to right, ${theme.color}44, transparent)`,
    margin: '7px 0',
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ ...makeHandleStyle(theme.color), top: -4 }} />
      <Handle type="target" position={Position.Left} style={{ ...makeHandleStyle(theme.color), left: -4 }} />

      <div style={containerStyle} className="custom-graph-node">
        <div style={headerStyle}>
          <div style={iconBadgeStyle}>
            <Icon size={13} color={theme.color} strokeWidth={2.2} />
          </div>
          <span style={labelStyle}>{data.label}</span>
        </div>

        <div style={dividerStyle} />

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span style={tagStyle}>{theme.tag}</span>
        </div>

        {data.description && (
          <div style={descStyle} title={data.description}>{data.description}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...makeHandleStyle(theme.color), bottom: -4 }} />
      <Handle type="source" position={Position.Right} style={{ ...makeHandleStyle(theme.color), right: -4 }} />
    </>
  );
});

CustomGraphNode.displayName = 'CustomGraphNode';

export default CustomGraphNode;
