import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store/hooks'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import AcceptInvitation from './pages/AcceptInvitation'
import DocumentViewerLayout from './pages/DocumentViewer/Layout'
import DocumentOverview from './pages/DocumentViewer/Overview'
import DocumentArchitecture from './pages/DocumentViewer/Architecture'
import DocumentApiExplorer from './pages/DocumentViewer/ApiExplorer'
import DocumentImpact from './pages/DocumentViewer/Impact'
import DocumentAdr from './pages/DocumentViewer/Adr'
import DocumentDependencies from './pages/DocumentViewer/Dependencies'
import DocumentDataModel from './pages/DocumentViewer/DataModel'
import DocumentDrift from './pages/DocumentViewer/Drift'
import DocumentComparison from './pages/DocumentComparison'
import CommitAnalysis from './pages/CommitAnalysis'
import DriftAnalysis from './pages/DriftAnalysis'
import ProjectTeam from './pages/ProjectTeam'
import Profile from './pages/Profile'
import Repositories from './pages/Repositories'
import IntelligenceShell from './pages/Intelligence/IntelligenceShell'
import IntelligenceOverview from './pages/Intelligence/IntelligenceOverview'
import IntelligenceArchitecture from './pages/Intelligence/IntelligenceArchitecture'
import IntelligenceDependencies from './pages/Intelligence/IntelligenceDependencies'
import IntelligenceApis from './pages/Intelligence/IntelligenceApis'
import IntelligenceCallFlow from './pages/Intelligence/IntelligenceCallFlow'
import IntelligenceChanges from './pages/Intelligence/IntelligenceChanges'
import IntelligenceDocs from './pages/Intelligence/IntelligenceDocs'
import LandingPage from './pages/LandingPage/LandingPage'
import Signup from './pages/Signup'
import VerifyOTP from './pages/VerifyOTP'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import CommandPalette from './components/CommandPalette'

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <div className="app">
      {isAuthenticated && <CommandPalette />}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify_otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Invitation Route */}
        <Route path="/invite/:token" element={<AcceptInvitation />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/repositories"
          element={<ProtectedRoute><Repositories /></ProtectedRoute>}
        />
        <Route
          path="/projects"
          element={<ProtectedRoute><Projects /></ProtectedRoute>}
        />
        <Route
          path="/projects/:id"
          element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>}
        />
        <Route
          path="/projects/:id/team"
          element={<ProtectedRoute><ProjectTeam /></ProtectedRoute>}
        />
        {/* Intelligence Portal — full 7-section experience */}
        <Route
          path="/intelligence"
          element={<ProtectedRoute><IntelligenceShell /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<IntelligenceOverview />} />
          <Route path="architecture" element={<IntelligenceArchitecture />} />
          <Route path="dependencies" element={<IntelligenceDependencies />} />
          <Route path="apis" element={<IntelligenceApis />} />
          <Route path="callflow" element={<IntelligenceCallFlow />} />
          <Route path="changes" element={<IntelligenceChanges />} />
          <Route path="docs" element={<IntelligenceDocs />} />
        </Route>
        <Route
          path="/projects/:id/intelligence"
          element={<ProtectedRoute><IntelligenceShell /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<IntelligenceOverview />} />
          <Route path="architecture" element={<IntelligenceArchitecture />} />
          <Route path="dependencies" element={<IntelligenceDependencies />} />
          <Route path="apis" element={<IntelligenceApis />} />
          <Route path="callflow" element={<IntelligenceCallFlow />} />
          <Route path="changes" element={<IntelligenceChanges />} />
          <Route path="docs" element={<IntelligenceDocs />} />
        </Route>
        <Route
          path="/projects/:id/docs/:commit"
          element={<ProtectedRoute><DocumentViewerLayout /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DocumentOverview />} />
          <Route path="architecture" element={<DocumentArchitecture />} />
          <Route path="api" element={<DocumentApiExplorer />} />
          <Route path="impact" element={<DocumentImpact />} />
          <Route path="adr" element={<DocumentAdr />} />
          <Route path="dependencies" element={<DocumentDependencies />} />
          <Route path="data-model" element={<DocumentDataModel />} />
          <Route path="drift" element={<DocumentDrift />} />
        </Route>
        <Route
          path="/projects/:id/compare"
          element={<ProtectedRoute><DocumentComparison /></ProtectedRoute>}
        />
        <Route
          path="/commits"
          element={<ProtectedRoute><CommitAnalysis /></ProtectedRoute>}
        />
        <Route
          path="/drift"
          element={<ProtectedRoute><DriftAnalysis /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>}
        />

        {/* Default */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
