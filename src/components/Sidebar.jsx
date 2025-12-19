import { NavLink, useNavigate } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    navigate('/')
  }

  return (
    <div className="sidebar">
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

        <NavLink to="/pengaturan" className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Pengaturan</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Keluar</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
