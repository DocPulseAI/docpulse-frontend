import './Logo.css'

interface LogoProps {
  size?: number
  className?: string
  animated?: boolean
}

export default function Logo({ size = 40, className = '', animated = true }: LogoProps) {
  const cls = `dp-logo ${animated ? 'dp-logo--animated' : ''} ${className}`.trim()
  // Original image is rectangular ~1.4:1 ratio
  const w = Math.round(size * 1.4)
  const h = size

  return (
    <svg
      className={cls}
      width={w}
      height={h}
      viewBox="0 0 154 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dpG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="dpG2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="dpPulse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="40%" stopColor="#818cf8" stopOpacity="1" />
          <stop offset="60%" stopColor="#c084fc" stopOpacity="1" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </linearGradient>
        <filter id="dpGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dpCoreGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ═══════════════════════════════════════════════════
          Structure matches the original rectangular logo:

          Left column:  3 nodes on a vertical spine
          Diagonals:    top & bottom nodes → center hub
          Horizontal:   mid node → hub (straight)
          Right side:   3 horizontal lines with PCB trace bends
          Terminals:    3 nodes at far right

          Coordinates:
          Left nodes:   (18, 18), (18, 55), (18, 92)
          Hub:          (58, 55)
          Right terms:  (138, 18), (138, 55), (138, 92)
          ═══════════════════════════════════════════════════ */}

      {/* ── LAYER 1: Dim base structure (depth) ── */}
      <g opacity="0.15" stroke="url(#dpG1)" strokeWidth="2.5" strokeLinecap="round">
        {/* Vertical spine */}
        <line x1="18" y1="18" x2="18" y2="92" />
        {/* Diagonals */}
        <line x1="18" y1="18" x2="58" y2="55" />
        <line x1="18" y1="92" x2="58" y2="55" />
        {/* Full-width horizontals */}
        <line x1="18" y1="18" x2="138" y2="18" />
        <line x1="18" y1="55" x2="138" y2="55" />
        <line x1="18" y1="92" x2="138" y2="92" />
      </g>

      {/* ── LAYER 2: Main glowing paths ── */}
      <g filter="url(#dpGlow)">
        {/* Left vertical spine */}
        <line className="dp-path" x1="18" y1="18" x2="18" y2="92"
          stroke="url(#dpG1)" strokeWidth="4" strokeLinecap="round" />

        {/* Diagonal: top-left → hub */}
        <line className="dp-path" x1="18" y1="18" x2="58" y2="55"
          stroke="url(#dpG2)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Diagonal: bottom-left → hub */}
        <line className="dp-path" x1="18" y1="92" x2="58" y2="55"
          stroke="url(#dpG2)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Full-width horizontal: top */}
        <line className="dp-path" x1="18" y1="18" x2="138" y2="18"
          stroke="url(#dpG1)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Full-width horizontal: middle */}
        <line className="dp-path" x1="18" y1="55" x2="138" y2="55"
          stroke="url(#dpG1)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Full-width horizontal: bottom */}
        <line className="dp-path" x1="18" y1="92" x2="138" y2="92"
          stroke="url(#dpG1)" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* ── LAYER 3: PCB circuit trace details (right side) ── */}
      <g className="dp-traces" opacity="0.45" strokeLinecap="round">
        {/* Traces between top and mid horizontal */}
        <path d="M78 32 H100 L106 38 H126" stroke="#818cf8" strokeWidth="2"
          className="dp-trace dp-trace--1" />
        <path d="M82 26 H96 L102 32 H120" stroke="#60a5fa" strokeWidth="1.6"
          className="dp-trace dp-trace--2" />

        {/* Traces between mid and bottom horizontal */}
        <path d="M78 69 H100 L106 75 H126" stroke="#818cf8" strokeWidth="2"
          className="dp-trace dp-trace--3" />
        <path d="M82 63 H96 L102 69 H120" stroke="#60a5fa" strokeWidth="1.6"
          className="dp-trace dp-trace--4" />
      </g>

      {/* ── LAYER 4: Node halos (behind nodes) ── */}
      <g className="dp-halos">
        <circle className="dp-halo" cx="18" cy="18" r="10" fill="#60a5fa" opacity="0.12" />
        <circle className="dp-halo" cx="18" cy="55" r="9" fill="#60a5fa" opacity="0.1" />
        <circle className="dp-halo" cx="18" cy="92" r="10" fill="#60a5fa" opacity="0.12" />
        <circle className="dp-halo dp-halo--core" cx="58" cy="55" r="12" fill="#c084fc" opacity="0.15" />
        <circle className="dp-halo" cx="138" cy="18" r="11" fill="#818cf8" opacity="0.15" />
        <circle className="dp-halo" cx="138" cy="55" r="11" fill="#818cf8" opacity="0.15" />
        <circle className="dp-halo" cx="138" cy="92" r="11" fill="#818cf8" opacity="0.15" />
      </g>

      {/* ── LAYER 5: Solid nodes ── */}
      <g filter="url(#dpGlow)">
        {/* Left column nodes (hollow, bright border) */}
        <circle cx="18" cy="18" r="5.5" fill="var(--bg-canvas, #0f172a)" stroke="#60a5fa" strokeWidth="2.5"
          className="dp-node dp-node--left" />
        <circle cx="18" cy="55" r="5" fill="var(--bg-canvas, #0f172a)" stroke="#60a5fa" strokeWidth="2.5"
          className="dp-node dp-node--left" />
        <circle cx="18" cy="92" r="5.5" fill="var(--bg-canvas, #0f172a)" stroke="#60a5fa" strokeWidth="2.5"
          className="dp-node dp-node--left" />

        {/* Center hub node (solid glow) */}
        <circle cx="58" cy="55" r="6" fill="url(#dpG2)" filter="url(#dpCoreGlow)"
          className="dp-node dp-node--core" />
        <circle cx="58" cy="55" r="2.5" fill="#e0e7ff" opacity="0.9" />

        {/* Right terminal nodes (solid bright) */}
        <circle cx="138" cy="18" r="6.5" fill="url(#dpG1)" className="dp-node dp-node--right" />
        <circle cx="138" cy="55" r="6.5" fill="url(#dpG1)" className="dp-node dp-node--right" />
        <circle cx="138" cy="92" r="6.5" fill="url(#dpG1)" className="dp-node dp-node--right" />
        {/* Bright inner dots */}
        <circle cx="138" cy="18" r="2.5" fill="#e0e7ff" opacity="0.8" />
        <circle cx="138" cy="55" r="2.5" fill="#e0e7ff" opacity="0.8" />
        <circle cx="138" cy="92" r="2.5" fill="#e0e7ff" opacity="0.8" />
      </g>

      {/* ── LAYER 6: Data flow particles ── */}
      <g className="dp-particles" filter="url(#dpGlow)">
        {/* INPUT: left nodes → hub (diagonals + horizontal) */}
        <circle r="2" fill="#60a5fa" opacity="0.9" className="dp-particle">
          <animateMotion dur="2s" repeatCount="indefinite" path="M18,18 L58,55" begin="0s" />
        </circle>
        <circle r="2" fill="#818cf8" opacity="0.9" className="dp-particle">
          <animateMotion dur="1.6s" repeatCount="indefinite" path="M18,55 L58,55" begin="0.7s" />
        </circle>
        <circle r="2" fill="#a78bfa" opacity="0.9" className="dp-particle">
          <animateMotion dur="2s" repeatCount="indefinite" path="M18,92 L58,55" begin="1.4s" />
        </circle>

        {/* OUTPUT: along full horizontal paths to terminals */}
        <circle r="2" fill="#c084fc" opacity="0.9" className="dp-particle">
          <animateMotion dur="3s" repeatCount="indefinite" path="M18,18 L138,18" begin="0.5s" />
        </circle>
        <circle r="2" fill="#818cf8" opacity="0.9" className="dp-particle">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M18,55 L138,55" begin="1.5s" />
        </circle>
        <circle r="2" fill="#60a5fa" opacity="0.9" className="dp-particle">
          <animateMotion dur="3s" repeatCount="indefinite" path="M18,92 L138,92" begin="2.2s" />
        </circle>
      </g>
    </svg>
  )
}

