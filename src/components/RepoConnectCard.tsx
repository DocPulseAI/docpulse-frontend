import React from 'react'
import { Github } from 'lucide-react'

interface RepoConnectCardProps {
  handleConnectGitHub: () => void
}

export const RepoConnectCard: React.FC<RepoConnectCardProps> = ({ handleConnectGitHub }) => {
  return (
    <div className="repo-connect-card">
      <div className="repo-connect-icon">
        <Github size={40} />
      </div>
      <h2>Connect your GitHub account</h2>
      <p>
        You've signed in with email/password. To enable AI-powered documentation
        intelligence, you need to connect your GitHub account first.
      </p>
      <button className="repo-connect-btn" onClick={handleConnectGitHub}>
        <Github size={18} />
        Connect GitHub
      </button>
    </div>
  )
}
