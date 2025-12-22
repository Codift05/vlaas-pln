import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, Moon, Sun, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import './Header.css'


function Header({ title, onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [nightMode, setNightMode] = useState(localStorage.getItem('nightMode') === 'true')
  const navigate = useNavigate()

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('devMode')
    navigate('/')
  }

  const toggleNightMode = () => {
    const newMode = !nightMode
    setNightMode(newMode)
    localStorage.setItem('nightMode', newMode)
    document.body.classList.toggle('night-mode', newMode)
  }

  const goToSettings = () => {
    navigate('/pengaturan')
    setShowProfileMenu(false)
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger-menu" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <div className="search-box">
          <Search className="search-icon-svg" size={18} strokeWidth={2} />
          <input type="text" placeholder="Cari..." className="search-input" />
        </div>
        <div className="notification-icon">
          <Bell size={22} strokeWidth={2} />
          <span className="notification-badge">3</span>
        </div>
        <div className="user-profile" onClick={toggleProfileMenu}>
          <div className="user-avatar">A</div>
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">Administrator</span>
          </div>
          {showProfileMenu ? (
            <ChevronUp className="dropdown-arrow-svg" size={16} strokeWidth={2.5} />
          ) : (
            <ChevronDown className="dropdown-arrow-svg" size={16} strokeWidth={2.5} />
          )}
          
          {showProfileMenu && (
            <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-item" onClick={goToSettings}>
                <Settings className="item-icon-svg" size={18} strokeWidth={2} />
                <span>Pengaturan</span>
              </div>
              <div className="dropdown-item" onClick={toggleNightMode}>
                {nightMode ? (
                  <Sun className="item-icon-svg" size={18} strokeWidth={2} />
                ) : (
                  <Moon className="item-icon-svg" size={18} strokeWidth={2} />
                )}
                <span>Night Mode</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={nightMode}
                    onChange={toggleNightMode}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <LogOut className="item-icon-svg" size={18} strokeWidth={2} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
