import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import Footer from './components/Footer'
import './styles/landing.css'

// Lazy load heavy sections for performance
const PipelineSection = lazy(() => import('./components/PipelineSection'))
const IntelligencePortalShowcase = lazy(() => import('./components/IntelligencePortalShowcase'))
const DashboardSection = lazy(() => import('./components/DashboardSection'))
const TeamSection = lazy(() => import('./components/TeamSection'))
const DiagramShowcase = lazy(() => import('./components/DiagramShowcase'))
const ArtifactShowcase = lazy(() => import('./components/ArtifactShowcase'))
const OrganizationIntegrationSection = lazy(() => import('./components/OrganizationIntegrationSection'))

function SectionLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="lp-status-dot" style={{ background: 'var(--accent-purple)' }} />
        <div className="lp-status-dot" style={{ background: 'var(--accent-blue)', animationDelay: '0.2s' }} />
        <div className="lp-status-dot" style={{ background: 'var(--accent-green)', animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}



export default function LandingPage() {
  return (
    <div className="landing-page relative">
      <Navbar />
      <main>
        <HeroSection />

        <Suspense fallback={<SectionLoader />}>
          <PipelineSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <IntelligencePortalShowcase />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <DashboardSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <TeamSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <DiagramShowcase />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ArtifactShowcase />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <OrganizationIntegrationSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
