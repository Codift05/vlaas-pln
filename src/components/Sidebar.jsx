import { NavLink } from 'react-router-dom'
import './Sidebar.css'

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">₴</div>
          <div className="sidebar-logo-text">PLN VLAAS</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink to="/aset" className="nav-item">
          <span className="nav-icon">📦</span>
          <span className="nav-text">Manajemen Aset</span>
        </NavLink>

        <NavLink to="/vendor" className="nav-item">
          <span className="nav-icon">👥</span>
          <span className="nav-text">Data Vendor</span>
        </NavLink>

        <NavLink to="/laporan" className="nav-item">
          <span className="nav-icon">📊</span>
          <span className="nav-text">Laporan</span>
        </NavLink>
      </nav>
      </div>
    </>
  )
}

export default Sidebar
