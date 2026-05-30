import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Database, Network, GitBranch, FileText, BookOpen,
    Code2, Eye, Copy, Check, ChevronRight, Layers,
    ArrowRight, Maximize2, X
} from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import MarkdownRenderer from '../../../components/MarkdownRenderer'
import MermaidDiagram from '../../../components/MermaidDiagram'



// ─── Demo Project Files ───────────────────────────────────────────────────────
// Using a fictional "ShopStream" e-commerce project for maximum relevance to SWEs

interface DemoFile {
    id: string
    name: string
    type: 'mermaid' | 'markdown'
    icon: React.ReactNode
    iconColor: string
    label: string
    code: string
}

const demoFiles: DemoFile[] = [
    {
        id: 'er-diagram',
        name: 'er.mmd',
        type: 'mermaid',
        icon: <Database size={14} />,
        iconColor: 'var(--accent-orange)',
        label: 'ER Diagram',
        code: `erDiagram
    USERS {
        uuid id PK
        string email UK
        string username
        string password_hash
        timestamp created_at
        enum role
    }
    PRODUCTS {
        uuid id PK
        string title
        text description
        decimal price
        int stock_count
        uuid category_id FK
        jsonb metadata
    }
    ORDERS {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        enum status
        timestamp placed_at
        timestamp shipped_at
    }
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }
    PAYMENTS {
        uuid id PK
        uuid order_id FK
        decimal amount
        enum method
        enum status
        string transaction_id
        timestamp processed_at
    }
    CATEGORIES {
        uuid id PK
        string name
        string slug
        uuid parent_id FK
    }
    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        int rating
        text comment
        timestamp created_at
    }

    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDER_ITEMS }o--|| PRODUCTS : references
    ORDERS ||--o| PAYMENTS : "paid via"
    PRODUCTS }o--|| CATEGORIES : "belongs to"
    PRODUCTS ||--o{ REVIEWS : receives
    CATEGORIES ||--o{ CATEGORIES : "parent of"`,
    },
    {
        id: 'architecture',
        name: 'system.mmd',
        type: 'mermaid',
        icon: <Network size={14} />,
        iconColor: 'var(--accent-blue)',
        label: 'Architecture',
        code: `graph TB
    subgraph Client["🖥️ Client Layer"]
        WEB["React SPA"]
        MOB["Mobile App"]
    end

    subgraph Gateway["🔀 API Gateway"]
        NGINX["Nginx Reverse Proxy"]
        AUTH["Auth Middleware"]
        RATE["Rate Limiter"]
    end

    subgraph Services["⚙️ Microservices"]
        USER_SVC["User Service<br/>Node.js"]
        PRODUCT_SVC["Product Service<br/>Python"]
        ORDER_SVC["Order Service<br/>Go"]
        PAYMENT_SVC["Payment Service<br/>Java"]
        NOTIFY_SVC["Notification Service<br/>Node.js"]
        SEARCH_SVC["Search Service<br/>Python"]
    end

    subgraph Data["💾 Data Layer"]
        PG[("PostgreSQL<br/>Primary DB")]
        REDIS[("Redis<br/>Cache")]
        ES[("Elasticsearch<br/>Full-text")]
        S3["S3 Bucket<br/>Assets"]
    end

    subgraph Infra["📊 Observability"]
        PROM["Prometheus"]
        GRAF["Grafana"]
        JAEG["Jaeger Tracing"]
    end

    WEB --> NGINX
    MOB --> NGINX
    NGINX --> AUTH --> RATE
    RATE --> USER_SVC & PRODUCT_SVC & ORDER_SVC & PAYMENT_SVC
    ORDER_SVC --> NOTIFY_SVC
    PRODUCT_SVC --> SEARCH_SVC
    USER_SVC & ORDER_SVC & PAYMENT_SVC --> PG
    PRODUCT_SVC --> PG & REDIS
    SEARCH_SVC --> ES
    PRODUCT_SVC --> S3
    USER_SVC & PRODUCT_SVC & ORDER_SVC --> PROM --> GRAF
    ORDER_SVC --> JAEG`,
    },
    {
        id: 'sequence',
        name: 'sequence.mmd',
        type: 'mermaid',
        icon: <GitBranch size={14} />,
        iconColor: 'var(--accent-green)',
        label: 'Sequence',
        code: `sequenceDiagram
    autonumber
    actor Customer
    participant Web as React Frontend
    participant GW as API Gateway
    participant Auth as Auth Service
    participant Cart as Cart Service
    participant Order as Order Service
    participant Pay as Payment Service
    participant Notify as Notification

    Customer->>Web: Click "Checkout"
    Web->>GW: POST /api/checkout
    GW->>Auth: Validate JWT Token
    Auth-->>GW: ✅ Token Valid

    GW->>Cart: GET /cart/{userId}
    Cart-->>GW: Cart Items + Totals

    GW->>Order: POST /orders
    Note over Order: Create order record<br/>Status: PENDING

    Order->>Pay: POST /payments/charge
    Pay->>Pay: Process via Stripe
    alt Payment Success
        Pay-->>Order: ✅ Payment Confirmed
        Order->>Order: Status → CONFIRMED
        Order->>Notify: Emit OrderConfirmed
        Notify->>Customer: 📧 Email Confirmation
        Notify->>Customer: 📱 Push Notification
        Order-->>GW: 201 Order Created
        GW-->>Web: Order Confirmation
        Web-->>Customer: Show Success Page
    else Payment Failed
        Pay-->>Order: ❌ Payment Declined
        Order->>Order: Status → FAILED
        Order-->>GW: 402 Payment Required
        GW-->>Web: Error Response
        Web-->>Customer: Show Retry Option
    end`,
    },

    {
        id: 'adr',
        name: 'ADR-001.md',
        type: 'markdown',
        icon: <FileText size={14} />,
        iconColor: 'var(--accent-blue)',
        label: 'ADR',
        code: `# ADR-001: Adopt CI-Generated Living Documentation

## Status
Accepted

## Context
Documentation drift causes onboarding delays and release risk. Our codebase changes daily, but manual docs updates are inconsistent.

## Decision
Generate and update project docs automatically in CI for every push:
- README
- Architecture artifacts (ADR, arch, ER, sequence, systems)
- API documentation

## Consequences
- Lower documentation drift risk
- Faster team onboarding and review
- Reliable documentation visibility for all teammates
`,
    },
    {
        id: 'readme',
        name: 'README.generated.md',
        type: 'markdown',
        icon: <BookOpen size={14} />,
        iconColor: 'var(--accent-cyan)',
        label: 'README',
        code: `# 🛍️ ShopStream — E-Commerce Platform

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Docker](https://img.shields.io/badge/docker-ready-blue)]()

> A production-grade microservices e-commerce platform built with modern cloud-native patterns.

## 🏗️ Architecture Overview

ShopStream is composed of **6 independent microservices**, each owning its domain logic and data:

| Service | Stack | Port | Description |
|---------|-------|------|-------------|
| User Service | Node.js + Express | 3001 | Authentication, profiles, RBAC |
| Product Service | Python + FastAPI | 3002 | Catalog, search, inventory |
| Order Service | Go + Gin | 3003 | Orders, cart, checkout flow |
| Payment Service | Java + Spring | 3004 | Stripe integration, refunds |
| Notification | Node.js + Bull | 3005 | Email, SMS, push notifications |
| Search Service | Python + FastAPI | 3006 | Elasticsearch-powered search |

## 🚀 Quick Start

\`\`\`bash
# Clone and start all services
git clone https://github.com/shopstream/platform.git
cd platform

# Start infrastructure
docker-compose up -d postgres redis elasticsearch

# Start all services
make dev

# Run migrations
make migrate

# Seed demo data
make seed
\`\`\`

## 📊 API Endpoints

\`\`\`
POST   /api/auth/register     Register new user
POST   /api/auth/login        Authenticate user
GET    /api/products           List products
GET    /api/products/:id       Get product details
POST   /api/orders             Create order
POST   /api/payments/charge    Process payment
GET    /api/orders/:id/track   Track order status
\`\`\`

## 🧪 Testing

\`\`\`bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run coverage
\`\`\`

---
*Auto-generated by CI Living Documentation • Last updated: 2 minutes ago*`,
    },
    {
        id: 'api-reference',
        name: 'api-reference.md',
        type: 'markdown',
        icon: <FileText size={14} />,
        iconColor: 'var(--accent-pink)',
        label: 'API Docs',
        code: `# 📡 ShopStream API Reference

## Authentication

### POST \`/api/auth/register\`

Register a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "securePassword123!"
}
\`\`\`

**Response:** \`201 Created\`
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "john_doe",
  "token": "eyJhbGciOiJIUz...",
  "expiresIn": 3600
}
\`\`\`

---

### POST \`/api/auth/login\`

Authenticate and receive a JWT token.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",  
  "password": "securePassword123!"
}
\`\`\`

---

## Products

### GET \`/api/products\`

List all products with pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| category | string | — | Filter by category |
| sort | string | created_at | Sort field |
| q | string | — | Search query |

**Response:** \`200 OK\`
\`\`\`json
{
  "data": [
    {
      "id": "prod_001",
      "title": "Wireless Headphones",
      "price": 79.99,
      "stock": 142,
      "rating": 4.5,
      "category": "Electronics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1284,
    "pages": 65
  }
}
\`\`\`

---

## Orders

### POST \`/api/orders\`

Create a new order from the user's cart.

**Headers:** \`Authorization: Bearer <token>\`

**Request Body:**
\`\`\`json
{
  "items": [
    { "productId": "prod_001", "quantity": 2 },
    { "productId": "prod_042", "quantity": 1 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105"
  }
}
\`\`\`

---

*Auto-generated from OpenAPI spec • ShopStream v2.1.0*`,
    },
]

// ─── Syntax Highlighting (basic Mermaid) ──────────────────────────────────────
function highlightMermaid(code: string): string {
    const lines = code.split('\n')
    return lines
        .map((line) => {
            // First, HTML-escape the line
            const escaped = line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')

            // Collect all match ranges with their classes
            interface MatchRange { start: number; end: number; cls: string }
            const matches: MatchRange[] = []

            const addMatches = (regex: RegExp, cls: string) => {
                let m
                while ((m = regex.exec(escaped)) !== null) {
                    matches.push({ start: m.index, end: m.index + m[0].length, cls })
                }
            }

            // Keywords
            addMatches(/\b(erDiagram|graph|sequenceDiagram|classDiagram|flowchart|subgraph|end|participant|actor|Note over|alt|else|autonumber|TB|LR|TD|RL|PK|FK|UK)\b/g, 'hl-keyword')
            // Strings (quoted)
            addMatches(/"([^"]*)"/g, 'hl-string')
            // Types
            addMatches(/\b(string|int|uuid|text|decimal|timestamp|enum|jsonb|Boolean|Decimal|DateTime|String|UUID|Int|void|Object|List)\b/g, 'hl-type')
            // Relationships
            addMatches(/(\|\|--|\-\-o\{|\|\|--o\||}o--\|\||\|\|--\|{|\.\.\&gt;|--\&gt;|--\&gt;\&gt;|--\))/g, 'hl-relation')
            // Comments
            addMatches(/(%%.*)$/g, 'hl-comment')

            // Sort by start position
            matches.sort((a, b) => a.start - b.start)

            // Remove overlapping matches (keep first/earliest)
            const filtered: MatchRange[] = []
            let lastEnd = 0
            for (const m of matches) {
                if (m.start >= lastEnd) {
                    filtered.push(m)
                    lastEnd = m.end
                }
            }

            // Build final HTML in a single pass
            let result = ''
            let pos = 0
            for (const m of filtered) {
                result += escaped.slice(pos, m.start)
                result += `<span class="${m.cls}">${escaped.slice(m.start, m.end)}</span>`
                pos = m.end
            }
            result += escaped.slice(pos)

            return result
        })
        .join('\n')
}

function highlightMarkdown(code: string): string {
    const lines = code.split('\n')
    return lines
        .map((line) => {
            let processed = line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')

            // Headers
            if (/^#{1,6}\s/.test(line)) {
                processed = `<span class="hl-keyword" style="font-weight:bold">${processed}</span>`
            }
            // Bold
            processed = processed.replace(
                /\*\*([^*]+)\*\*/g,
                '<span class="hl-bold">**$1**</span>'
            )
            // Inline code
            processed = processed.replace(
                /`([^`]+)`/g,
                '<span class="hl-string" style="padding:0 4px;border-radius:3px">`$1`</span>'
            )
            // Links / badges
            processed = processed.replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<span class="hl-link">[$1]($2)</span>'
            )
            // Table separators
            if (/^\|[-|:\s]+\|$/.test(line.trim())) {
                processed = `<span class="hl-dim">${processed}</span>`
            }
            // Blockquotes
            if (/^&gt;/.test(processed)) {
                processed = `<span class="hl-comment">${processed}</span>`
            }
            // List items
            if (/^\s*[-*]\s/.test(line)) {
                processed = processed.replace(/^(\s*)([-*])/, '$1<span class="hl-keyword">$2</span>')
            }

            return processed
        })
        .join('\n')
}

// ─── Code Editor Panel ────────────────────────────────────────────────────────
function CodeEditor({ code, type }: { code: string; type: 'mermaid' | 'markdown' }) {
    const [copied, setCopied] = useState(false)
    const lines = code.split('\n')

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [code])

    const highlighted = type === 'mermaid' ? highlightMermaid(code) : highlightMarkdown(code)

    return (
        <div className="lp-code-editor">
            {/* Editor top bar */}
            <div className="lp-code-editor-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Code2 size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Source Code
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className={`lp-copy-btn ${copied ? 'copied' : ''}`}
                    style={{}}
                >
                    {copied ? <Check size={10} /> : <Copy size={10} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            {/* Code content */}
            <div className="lp-code-editor-content">
                <div style={{ display: 'flex' }}>
                    {/* Line numbers */}
                    <div className="lp-code-gutter">
                        {lines.map((_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>
                    {/* Code */}
                    <pre
                        className="lp-code-body"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                </div>
            </div>
        </div>
    )
}



// ─── Fullscreen Modal ─────────────────────────────────────────────────────────
function FullscreenModal({ file, onClose }: { file: DemoFile; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lp-fs-overlay"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="lp-fs-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal header */}
                <div className="lp-fs-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: file.iconColor }}>{file.icon}</span>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</span>
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)' }}>
                            {file.type}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lp-fs-close"
                    >
                        <X size={16} />
                    </button>
                </div>
                {/* Split pane */}
                <div className="lp-fs-body">
                    <div style={{ overflow: 'auto', borderRight: '1px solid var(--border-muted)' }}>
                        <CodeEditor code={file.code} type={file.type} />
                    </div>
                    <div style={{ overflow: 'auto', padding: 16 }}>
                        {file.type === 'mermaid' ? (
                            <MermaidDiagram code={file.code} title={file.label} />
                        ) : (
                            <MarkdownRenderer content={file.code} />
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiagramShowcase() {
    const [activeFile, setActiveFile] = useState<string>(demoFiles[0].id)
    const [fullscreenFile, setFullscreenFile] = useState<DemoFile | null>(null)
    const currentFile = demoFiles.find((f) => f.id === activeFile) || demoFiles[0]

    return (
        <section id="diagrams" className="lp-section">
            <hr className="lp-divider" />

            <div className="lp-container" style={{ paddingTop: 40 }}>
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="lp-section-header"
                >
                    <span className="lp-badge">
                        <Code2 size={13} style={{ color: 'var(--accent-blue)' }} />
                        Live Diagram Preview
                    </span>
                    <h2 className="lp-section-title" style={{ marginTop: 16 }}>
                        Generated Documentation, Instantly
                    </h2>
                    <p className="lp-section-subtitle">
                        What we generate from your codebase: README, architecture artifacts (ADR, arch, ER, sequence, systems), and API documentation.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', border: '1px solid var(--border-muted)' }}>
                            Auto-generated from your repository
                        </span>
                    </div>
                </motion.div>

                {/* Tab Bar — file selector */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    style={{ marginBottom: 20 }}
                >
                    <div className="lp-diagram-tabs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-muted)', borderRadius: 8, padding: 4 }}>
                        {demoFiles.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => setActiveFile(file.id)}
                                className={`lp-diagram-tab ${activeFile === file.id ? 'active' : ''}`}

                            >
                                <span style={{ color: file.iconColor }}>{file.icon}</span>
                                <span>{file.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Split Pane: Editor + Preview */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFile}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="lp-diagram-pane">
                            <CodeEditor code={currentFile.code} type={currentFile.type} />
                            {currentFile.type === 'mermaid' ? (
                                <div className="lp-preview-pane">
                                    <div className="lp-preview-bar">
                                        <Eye size={12} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                            Rendered Preview
                                        </span>
                                        <span className="lp-live-badge">LIVE</span>
                                    </div>
                                    <div className="lp-preview-content" style={{ padding: 0, overflow: 'auto' }}>
                                        <MermaidDiagram code={currentFile.code} title={currentFile.label} />
                                    </div>
                                </div>
                            ) : (
                                <div className="lp-preview-pane">
                                    <div className="lp-preview-bar">
                                        <Eye size={12} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                            Rendered Preview
                                        </span>
                                        <span className="lp-live-badge">LIVE</span>
                                    </div>
                                    <div className="lp-preview-content" style={{ padding: 16, overflow: 'auto' }}>
                                        <MarkdownRenderer content={currentFile.code} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom bar */}
                        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="lp-status-dot" />
                                    Auto-generated from source
                                </span>
                                <span>{currentFile.code.split('\n').length} lines</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ChevronRight size={10} />
                                    {currentFile.name}
                                </span>
                            </div>
                            <button
                                onClick={() => setFullscreenFile(currentFile)}
                                className="lp-fullscreen-btn"
                                style={{ width: 'auto', padding: '4px 10px', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}
                            >
                                <Maximize2 size={11} />
                                Fullscreen
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    style={{ marginTop: 32, textAlign: 'center' }}
                >
                    <p style={{ fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)' }}>
                        <ArrowRight size={14} />
                        Switch between tabs to explore all auto-generated documentation artifacts
                    </p>
                </motion.div>
            </div>

            {/* Fullscreen modal */}
            <AnimatePresence>
                {fullscreenFile && (
                    <FullscreenModal file={fullscreenFile} onClose={() => setFullscreenFile(null)} />
                )}
            </AnimatePresence>
        </section>
    )
}
