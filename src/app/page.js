import React from 'react'
import DashboardLayout from './components/DashboardLayout'

const Page = () => {
  return (
    <DashboardLayout>
      <div className="dash-welcome">
        <div className="dash-welcome-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1>Welcome, Super Admin</h1>
        <p>Select a section from the sidebar to get started.</p>
      </div>
    </DashboardLayout>
  )
}

export default Page