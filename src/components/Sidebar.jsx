'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Users, FileBarChart } from 'lucide-react'
import './Sidebar.css'

function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  const isActive = (path) => pathname === path ? 'active' : ''

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/images/Logo_vlaas.png" alt="VLAAS Logo" className="sidebar-logo-img" />
            <div className="sidebar-logo-info">
              <div className="sidebar-logo-text">PLN VLAAS</div>
              <div className="sidebar-logo-desc">Vendor Management</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
            <LayoutDashboard className="nav-icon-svg" size={20} strokeWidth={2} />
            <span className="nav-text">Dashboard</span>
          </Link>

          <Link href="/aset" className={`nav-item ${isActive('/aset')}`}>
            <Package className="nav-icon-svg" size={20} strokeWidth={2} />
            <span className="nav-text">Manajemen Aset</span>
          </Link>

          <Link href="/vendor" className={`nav-item ${isActive('/vendor')}`}>
            <Users className="nav-icon-svg" size={20} strokeWidth={2} />
            <span className="nav-text">Data Vendor</span>
          </Link>

          <Link href="/laporan" className={`nav-item ${isActive('/laporan')}`}>
            <FileBarChart className="nav-icon-svg" size={20} strokeWidth={2} />
            <span className="nav-text">Laporan</span>
          </Link>
        </nav>
      </div>
    </>
  )
}

export default Sidebar
