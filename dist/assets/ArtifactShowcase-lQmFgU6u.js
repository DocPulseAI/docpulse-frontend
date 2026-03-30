import{aE as d,r as l,j as e,m as s,aO as f,aJ as m,A as p,bf as v,aP as g,F as y,aZ as j}from"./index-BLpwVYZ4.js";/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]],b=d("folder-open",A);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",key:"hod4my"}],["path",{d:"M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",key:"w4yl2u"}],["path",{d:"M3 5a2 2 0 0 0 2 2h3",key:"f2jnh7"}],["path",{d:"M3 3v13a2 2 0 0 0 2 2h3",key:"k8epm1"}]],C=d("folder-tree",N),w=[{name:"README.generated.md",type:"file",extension:"md",updated:"2 min ago",content:`# CI Living Documentation Platform

## Overview
Automated documentation generation for modern engineering teams.

## Architecture
The platform uses a multi-stage CI pipeline:
1. **Code Analysis** — AST parsing and feature extraction
2. **Impact Detection** — Change diff analysis
3. **Doc Generation** — Automated artifact creation
4. **Intelligence** — Drift detection & health scoring

## Quick Start
\`\`\`bash
npm install @docpulse/cli
docpulse init
docpulse connect <repo-url>
\`\`\``},{name:"documentation-health.md",type:"file",extension:"md",updated:"5 min ago",content:`# Documentation Health Report

| Metric | Score | Status |
|--------|-------|--------|
| Coverage | 97% | ✅ |
| Freshness | 92% | ✅ |
| Accuracy | 95% | ✅ |
| Overall | 94/100 | ✅ |

## Drift Alerts
- ⚠️ api-reference.md: STALE_ENDPOINT
- ℹ️ system.mmd: minor schema drift`},{name:"tree.txt",type:"file",extension:"txt",updated:"2 min ago",content:`.
├── README.generated.md
├── documentation-health.md
├── tree.txt
├── api/
│   ├── api-reference.md
│   └── api-description.json
├── architecture/
│   ├── system.mmd
│   ├── sequence.mmd
│   ├── er.mmd
│   └── architecture.md
├── adr/
│   └── ADR-001.md
├── doc_snapshot.json
└── summary/
    ├── summary.md
    └── summary.json`},{name:"api",type:"folder",children:[{name:"api-reference.md",type:"file",extension:"md",updated:"10 min ago",content:`# API Reference

## Endpoints

### POST /api/v1/analyze
Trigger code analysis for a repository.

### GET /api/v1/health
Returns service health status.

### GET /api/v1/artifacts/{project_id}
Retrieve generated documentation artifacts.`},{name:"api-description.json",type:"file",extension:"json",updated:"10 min ago",content:`openapi: 3.0.3
info:
  title: DocPulse AI API
  version: 2.4.1`}]},{name:"architecture",type:"folder",children:[{name:"system.mmd",type:"file",extension:"mmd",updated:"3 min ago",content:`graph TD
    A[GitHub Webhook] --> B[CI Orchestrator]
    B --> C[Code Analyzer]
    B --> D[Doc Generator]`},{name:"architecture.md",type:"file",extension:"md",updated:"5 min ago",content:`# Architecture Overview

## System Components

### Epic 1: Code Analysis Engine
Parses repository AST and extracts features.`}]},{name:"summary",type:"folder",children:[{name:"summary.md",type:"file",extension:"md",updated:"2 min ago",content:`# Change Summary — v2.4.1

## Changes
- Updated API reference
- Regenerated architecture diagram
- Added ADR-001`},{name:"summary.json",type:"file",extension:"json",updated:"2 min ago",content:`{
  "version": "2.4.1",
  "changes": 3,
  "health_score": 94
}`}]}],c=[{file:"README.generated.md",action:"updated",time:"2 min ago",color:"var(--accent-green)"},{file:"system.mmd",action:"regenerated",time:"3 min ago",color:"var(--accent-blue)"},{file:"ADR-001.md",action:"created",time:"5 min ago",color:"var(--accent-purple)"},{file:"drift_report.json",action:"generated",time:"5 min ago",color:"var(--accent-orange)"},{file:"summary.md",action:"updated",time:"6 min ago",color:"var(--accent-blue)"}];function h(t){switch(t){case"md":return"var(--accent-blue)";case"json":return"var(--accent-orange)";case"yaml":return"var(--accent-green)";case"mmd":return"var(--accent-purple)";default:return"var(--text-muted)"}}function x({node:t,depth:i=0,onSelect:r}){const[o,a]=l.useState(i<1);return t.type==="folder"?e.jsxs("div",{children:[e.jsxs("div",{className:"lp-file-tree-item",style:{paddingLeft:`${i*16+8}px`},onClick:()=>a(!o),children:[o?e.jsx(v,{size:12}):e.jsx(g,{size:12}),e.jsx(b,{size:14,style:{color:"var(--accent-blue)",opacity:.7}}),e.jsxs("span",{style:{fontFamily:"var(--font-mono)",fontSize:13},children:[t.name,"/"]})]}),e.jsx(p,{children:o&&t.children&&e.jsx(s.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},transition:{duration:.15},children:t.children.map(n=>e.jsx(x,{node:n,depth:i+1,onSelect:r},n.name))})})]}):e.jsxs("div",{className:"lp-file-tree-item",style:{paddingLeft:`${i*16+24}px`},onClick:()=>r(t),children:[e.jsx(y,{size:13,style:{color:h(t.extension)}}),e.jsx("span",{style:{flex:1,fontFamily:"var(--font-mono)",fontSize:13},children:t.name})]})}function S({file:t,onClose:i}){return e.jsx(s.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"lp-preview-overlay",onClick:i,children:e.jsxs(s.div,{initial:{opacity:0,y:20,scale:.97},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:20,scale:.97},transition:{duration:.2},className:"lp-preview-modal",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"lp-preview-modal-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(y,{size:14,style:{color:h(t.extension)}}),e.jsx("span",{style:{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:500,color:"var(--text-primary)"},children:t.name}),e.jsx("span",{style:{fontSize:10,fontFamily:"var(--font-mono)",padding:"1px 6px",borderRadius:4,background:"var(--bg-subtle)",color:"var(--text-muted)",border:"1px solid var(--border-muted)"},children:t.extension||"text"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[t.updated&&e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--text-muted)"},children:[e.jsx(m,{size:10})," ",t.updated]}),e.jsx("button",{onClick:i,style:{width:24,height:24,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:"none",color:"var(--text-muted)",cursor:"pointer"},children:e.jsx(j,{size:14})})]})]}),e.jsx("div",{className:"lp-preview-modal-body",children:e.jsx("pre",{children:t.content})})]})})}function z(){const[t,i]=l.useState(null),[r,o]=l.useState(0);return l.useEffect(()=>{c.forEach((a,n)=>{setTimeout(()=>o(u=>Math.max(u,n+1)),500+n*350)})},[]),e.jsxs("section",{id:"artifacts",className:"lp-section",children:[e.jsx("hr",{className:"lp-divider"}),e.jsxs("div",{className:"lp-container",style:{paddingTop:40},children:[e.jsxs(s.div,{initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.5},className:"lp-section-header",children:[e.jsxs("span",{className:"lp-badge",children:[e.jsx(f,{size:13,style:{color:"var(--accent-blue)"}}),"Generated Artifacts"]}),e.jsx("h2",{className:"lp-section-title",style:{marginTop:16},children:"Live Documentation Artifacts"}),e.jsx("p",{className:"lp-section-subtitle",children:"Explore the documentation artifacts generated automatically from your codebase — click any file to preview."})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr",gap:16},children:e.jsxs("div",{className:"lp-grid-2",style:{gridTemplateColumns:"2fr 1fr"},children:[e.jsxs(s.div,{initial:{opacity:0,y:16},whileInView:{opacity:1,y:0},viewport:{once:!0},className:"lp-card",style:{overflow:"hidden"},children:[e.jsxs("div",{className:"lp-card-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(C,{size:14,style:{color:"var(--text-muted)"}}),e.jsx("span",{style:{fontSize:12,fontFamily:"var(--font-mono)",fontWeight:500,color:"var(--text-secondary)"},children:"docs/"})]}),e.jsx("span",{style:{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text-muted)"},children:"generated moments ago"})]}),e.jsx("div",{style:{padding:8},children:w.map(a=>e.jsx(x,{node:a,onSelect:i},a.name))})]}),e.jsxs(s.div,{initial:{opacity:0,y:16},whileInView:{opacity:1,y:0},viewport:{once:!0},transition:{delay:.1},className:"lp-card",style:{overflow:"hidden"},children:[e.jsx("div",{className:"lp-card-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(m,{size:14,style:{color:"var(--text-muted)"}}),e.jsx("span",{style:{fontSize:12,fontFamily:"var(--font-mono)",fontWeight:500,color:"var(--text-secondary)"},children:"Activity"})]})}),e.jsx("div",{style:{padding:10,display:"flex",flexDirection:"column",gap:6},children:c.slice(0,r).map((a,n)=>e.jsxs(s.div,{initial:{opacity:0,x:8},animate:{opacity:1,x:0},className:"lp-activity-item",children:[e.jsx("div",{className:"lp-activity-dot",style:{background:a.color}}),e.jsxs("div",{children:[e.jsxs("div",{className:"lp-activity-file",children:[e.jsx("span",{style:{color:a.color},children:a.file}),e.jsxs("span",{style:{color:"var(--text-muted)"},children:[" ",a.action]})]}),e.jsx("span",{className:"lp-activity-time",children:a.time})]})]},`${a.file}-${n}`))}),e.jsx("div",{style:{padding:"8px 14px",textAlign:"center",borderTop:"1px solid var(--border-muted)"},children:e.jsxs("span",{style:{fontSize:10,fontFamily:"var(--font-mono)",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"var(--text-muted)"},children:[e.jsx("span",{className:"lp-status-dot"}),"Watching for changes..."]})})]})]})})]}),e.jsx(p,{children:t&&t.type==="file"&&e.jsx(S,{file:t,onClose:()=>i(null)})})]})}export{z as default};
