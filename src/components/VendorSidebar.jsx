'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, User } from 'lucide-react'
import './VendorSidebar.css'

function VendorSidebar() {
  const pathname = usePathname()

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
          const isActive = item.path === '/vendor-portal'
            ? pathname === '/vendor-portal'
            : pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`vendor-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="vendor-nav-icon" />
              <span className="vendor-nav-text">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default VendorSidebar
