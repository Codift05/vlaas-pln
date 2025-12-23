import { NavLink } from 'react-router-dom'
import { Home, FileText, User } from 'lucide-react'
import './VendorSidebar.css'

function VendorSidebar() {
  const menuItems = [
    { path: '/vendor-portal', icon: Home, label: 'Dashboard' },
    { path: '/vendor-portal/pengajuan', icon: FileText, label: 'Buat Pengajuan' },
    { path: '/vendor-portal/profile', icon: User, label: 'Profil Perusahaan' },
  ]

  return (
    <aside className="vendor-sidebar">
      <div className="vendor-sidebar-header">
        <div className="vendor-sidebar-logo">
          <img src="/images/Logo_vlaas.png" alt="VLAAS Logo" className="vendor-sidebar-logo-img" />
          <div className="vendor-sidebar-logo-info">
            <div className="vendor-sidebar-logo-text">PLN VLAAS</div>
            <div className="vendor-sidebar-logo-desc">Vendor Management</div>
          </div>
        </div>
      </div>

      <nav className="vendor-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/vendor-portal'}
              className={({ isActive }) => 
                `vendor-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} className="vendor-nav-icon" />
              <span className="vendor-nav-text">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default VendorSidebar
