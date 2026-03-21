import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'

export interface ExecutionStep {
  id: string
  label: string
  type?: string
  filePath?: string
  line?: number | null
  details?: string
}

interface ExecutionFlowCanvasProps {
  steps: ExecutionStep[]
  onSelectStep?: (step: ExecutionStep) => void
}

export default function ExecutionFlowCanvas({ steps, onSelectStep }: ExecutionFlowCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  const normalizedSteps = useMemo(() => {
    return steps.length > 0
      ? steps
      : [{ id: 'empty', label: 'No execution path available', type: 'empty', details: 'Execution path data not found in impact report.' }]
  }, [steps])

  useEffect(() => {
    if (!svgRef.current) return

    const width = 960
    const height = Math.max(220, normalizedSteps.length * 110)
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const defs = svg.append('defs')
    defs.append('marker')
      .attr('id', 'portal-flow-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#f0b45b')

    const nodeWidth = 320
    const nodeHeight = 62
    const centerX = width / 2 - nodeWidth / 2

    normalizedSteps.forEach((step, index) => {
      const top = 32 + index * 94
      const group = svg.append('g')
        .attr('transform', `translate(${centerX}, ${top})`)
        .style('cursor', onSelectStep ? 'pointer' : 'default')

      group.append('rect')
        .attr('rx', 18)
        .attr('ry', 18)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('fill', '#111723')
        .attr('stroke', '#304056')
        .attr('stroke-width', 1.2)

      group.append('text')
        .attr('x', 24)
        .attr('y', 26)
        .attr('fill', '#f5f7fb')
        .attr('font-size', 15)
        .attr('font-weight', 600)
        .text(step.label)

      group.append('text')
        .attr('x', 24)
        .attr('y', 46)
        .attr('fill', '#8ca0bf')
        .attr('font-size', 12)
        .text(step.filePath || step.details || step.type || '')

      if (onSelectStep) {
        group.on('click', () => onSelectStep(step))
      }

      if (index < normalizedSteps.length - 1) {
        svg.append('line')
          .attr('x1', width / 2)
          .attr('x2', width / 2)
          .attr('y1', top + nodeHeight)
          .attr('y2', top + 94)
          .attr('stroke', '#f0b45b')
          .attr('stroke-width', 2.5)
          .attr('marker-end', 'url(#portal-flow-arrow)')
      }
    })
  }, [normalizedSteps, onSelectStep])

  return (
    <div className="portal-flow-svg-wrap">
      <svg ref={svgRef} className="portal-flow-svg" />
    </div>
  )
}
