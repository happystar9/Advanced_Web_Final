import React from 'react'

type Props = {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export const SettingsLayout: React.FC<Props> = ({ sidebar, children }) => {
  return (
    <div className="settings-layout">
      <div className="sidebar">{sidebar}</div>
      <div className="main-panel">{children}</div>
    </div>
  )
}

export const SidebarCard: React.FC<{children?: React.ReactNode}> = ({ children }) => (
  <div className="sidebar-card">{children}</div>
)

export const SidebarItem: React.FC<{active?: boolean; onClick?: () => void; children?: React.ReactNode}> = ({ active, onClick, children }) => (
  <button className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
)

export default SettingsLayout
