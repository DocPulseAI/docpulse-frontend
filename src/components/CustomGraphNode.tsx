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

/** Reads a CSS custom property value from :root at runtime. */
const cssVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

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
  colorVar: string; // CSS variable name
  tintAlpha: number;
  borderAlpha: number;
  tag: string;
  icon: LucideIcon;
}

const NODE_THEMES: Record<NodeType, NodeTheme> = {
  API: {
    colorVar: '--graph-node-service',
    tintAlpha: 0.10,
    borderAlpha: 0.35,
    tag: 'API',
    icon: Server,
  },
  Controller: {
    colorVar: '--graph-node-controller',
    tintAlpha: 0.10,
    borderAlpha: 0.35,
    tag: 'Controller',
    icon: GitBranch,
  },
  Service: {
    colorVar: '--graph-node-model',
    tintAlpha: 0.10,
    borderAlpha: 0.30,
    tag: 'Service',
    icon: Layers,
  },
  Entity: {
    colorVar: '--graph-node-queue',
    tintAlpha: 0.10,
    borderAlpha: 0.30,
    tag: 'Entity',
    icon: Database,
  },
  Module: {
    colorVar: '--graph-node-unknown',
    tintAlpha: 0.12,
    borderAlpha: 0.30,
    tag: 'Module',
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

  // Resolve color from CSS variable at render time (respects theme)
  const colorVarName = isCyclic ? '--graph-node-error' : baseTheme.colorVar;
  const color = `var(${colorVarName})`;
  const Icon = baseTheme.icon;


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
          borderLeft: `3px solid ${color}`,
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
    border: `1px solid ${selected ? color : 'var(--border-default)'}`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 8,
    padding: '10px 12px 10px 14px',
    fontFamily: "var(--font-sans)",
    cursor: 'grab',
    boxSizing: 'border-box',
    boxShadow: selected
      ? `0 0 0 1px color-mix(in srgb, ${color} 33%, transparent), 0 4px 24px color-mix(in srgb, ${color} 13%, transparent)`
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
    background: `color-mix(in srgb, ${color} 13%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 27%, transparent)`,
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
    color: `var(--text-muted)`,
    background: `color-mix(in srgb, ${color} 9%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
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
    background: `linear-gradient(to right, color-mix(in srgb, ${color} 27%, transparent), transparent)`,
    margin: '7px 0',
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ ...makeHandleStyle(color), top: -4 }} />
      <Handle type="target" position={Position.Left} style={{ ...makeHandleStyle(color), left: -4 }} />

      <div style={containerStyle} className="custom-graph-node">
        <div style={headerStyle}>
          <div style={iconBadgeStyle}>
            <Icon size={13} color={cssVar(colorVarName)} strokeWidth={2.2} />
          </div>
          <span style={labelStyle}>{data.label}</span>
        </div>

        <div style={dividerStyle} />

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span style={tagStyle}>{baseTheme.tag}</span>
        </div>

        {data.description && (
          <div style={descStyle} title={data.description}>{data.description}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...makeHandleStyle(color), bottom: -4 }} />
      <Handle type="source" position={Position.Right} style={{ ...makeHandleStyle(color), right: -4 }} />
    </>
  );
});

CustomGraphNode.displayName = 'CustomGraphNode';

export default CustomGraphNode;
