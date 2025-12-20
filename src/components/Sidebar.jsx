import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Users, FileBarChart } from 'lucide-react'
import './Sidebar.css'

function Sidebar({ isOpen, onClose }) {
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
        <NavLink to="/dashboard" className="nav-item">
          <LayoutDashboard className="nav-icon-svg" size={20} strokeWidth={2} />
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink to="/aset" className="nav-item">
          <Package className="nav-icon-svg" size={20} strokeWidth={2} />
          <span className="nav-text">Manajemen Aset</span>
        </NavLink>

        <NavLink to="/vendor" className="nav-item">
          <Users className="nav-icon-svg" size={20} strokeWidth={2} />
          <span className="nav-text">Data Vendor</span>
        </NavLink>

        <NavLink to="/laporan" className="nav-item">
          <FileBarChart className="nav-icon-svg" size={20} strokeWidth={2} />
          <span className="nav-text">Laporan</span>
        </NavLink>
      </nav>
      </div>
    </>
  )
}

export default Sidebar
