import { Edge, MarkerType } from 'reactflow';
import CustomGraphNode from './CustomGraphNode';

const EDGE_STROKE = '#334155';
const LABEL_BG = '#0F172A';
const LABEL_BORDER = 'rgba(255,255,255,0.10)';
const LABEL_TEXT = '#94A3B8';

const MARKER_END = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
  color: EDGE_STROKE,
};

export const EDGE_LINE_STYLE: React.CSSProperties = {
  stroke: EDGE_STROKE,
  strokeWidth: 1.5,
};

export const EDGE_LABEL_PROPS = {
  labelStyle: {
    fontFamily: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fill: LABEL_TEXT,
  },
  labelBgStyle: {
    fill: LABEL_BG,
    stroke: LABEL_BORDER,
    strokeWidth: 1,
    fillOpacity: 1,
  },
  labelBgPadding: [5, 9] as [number, number],
  labelBgBorderRadius: 999,
};

export const EDGE_DEFAULTS: Partial<Edge> = {
  type: 'smoothstep',
  animated: false,
  style: EDGE_LINE_STYLE,
  markerEnd: MARKER_END,
  ...EDGE_LABEL_PROPS,
};

export function applyEdgeDefaults<T extends Edge>(edges: T[]): T[] {
  return edges.map((edge) => ({
    ...EDGE_DEFAULTS,
    ...edge,
    style: { ...EDGE_LINE_STYLE, ...edge.style },
    labelStyle: { ...EDGE_LABEL_PROPS.labelStyle, ...edge.labelStyle },
    labelBgStyle: { ...EDGE_LABEL_PROPS.labelBgStyle, ...edge.labelBgStyle },
    labelBgPadding: edge.labelBgPadding ?? EDGE_LABEL_PROPS.labelBgPadding,
    labelBgBorderRadius: edge.labelBgBorderRadius ?? EDGE_LABEL_PROPS.labelBgBorderRadius,
    markerEnd: edge.markerEnd ?? MARKER_END,
  }));
}

export const nodeTypes = {
  custom: CustomGraphNode,
};
