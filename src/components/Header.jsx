'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Settings, Moon, Sun, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import './Header.css'

function Header({ title, onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNightMode(localStorage.getItem('nightMode') === 'true')
    }
  }, [])

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('devMode')
    router.push('/')
  }

  const toggleNightMode = (e) => {
    e.stopPropagation() // Prevent keeping menu open if desired, or let it stay? Usually toggle switches don't close menu.
    // Actually the formatted code had onClick on the DropdownItem.
    const newMode = !nightMode
    setNightMode(newMode)
    localStorage.setItem('nightMode', newMode)
    document.body.classList.toggle('night-mode', newMode)
  }

  const goToSettings = () => {
    router.push('/pengaturan')
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
          <input className="search-input" type="text" placeholder="Cari..." />
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
            <div className="profile-dropdown" onClick={e => e.stopPropagation()}>
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
                <label className="toggle-switch" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={nightMode} onChange={toggleNightMode} />
                  <span className="toggle-slider" style={nightMode ? { background: 'linear-gradient(135deg, #7eb9d9 0%, #5a9dc4 100%)' } : {}}></span>
                </label>
              </div>
              <div className="dropdown-divider" />
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
