'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, Settings, Moon, Sun, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import styled from 'styled-components'

const HeaderContainer = styled.header`
  height: 80px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  /* Hamburger Menu */
  .hamburger-menu {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background 0.3s;
    z-index: 101;
    position: relative;
  }

  .hamburger-menu:hover {
    background: #f5f5f5;
  }

  .hamburger-menu:active {
    transform: scale(0.95);
  }

  .hamburger-menu span {
    width: 24px;
    height: 3px;
    background: #1e5ba8;
    border-radius: 2px;
    transition: all 0.3s;
    display: block;
  }

  .header-title {
    font-size: 26px;
    font-weight: 700;
    color: #2b3f50;
    margin: 0;
    letter-spacing: -0.5px;
    font-family: 'Inter', sans-serif;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: rgba(248, 250, 252, 0.8);
    padding: 11px 22px;
    border-radius: 30px;
    gap: 10px;
    min-width: 320px;
    border: 1px solid rgba(226, 232, 240, 0.4);
    transition: all 0.25s;
  }

  .search-box:focus-within {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(126, 185, 217, 0.3);
    box-shadow: 0 2px 8px rgba(126, 185, 217, 0.1);
  }

  .search-icon-svg {
    color: #8b95a1;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #2b3f50;
    font-family: 'Inter', sans-serif;
  }

  .search-input::placeholder {
    color: #a5b0bc;
    font-weight: 400;
  }

  .notification-icon {
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
    color: #5a9dc4;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 12px;
  }

  .notification-icon:hover {
    transform: scale(1.05);
    background: rgba(248, 250, 252, 0.8);
  }

  .notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(238, 90, 82, 0.3);
    font-family: 'Inter', sans-serif;
  }

  .user-profile {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 30px;
    transition: all 0.25s;
  }

  .user-profile:hover {
    background: rgba(248, 250, 252, 0.8);
  }

  .dropdown-arrow-svg {
    color: #8b95a1;
    margin-left: 4px;
    transition: transform 0.3s;
    flex-shrink: 0;
  }

  /* Profile Dropdown */
  .profile-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 10px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(226, 232, 240, 0.4);
    min-width: 240px;
    z-index: 1000;
    animation: slideDown 0.3s ease;
    overflow: hidden;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;
    color: #2b3f50;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }

  .dropdown-item:hover {
    background: rgba(248, 250, 252, 0.8);
  }

  .dropdown-item.logout {
    color: #ff6b6b;
  }

  .dropdown-item.logout:hover {
    background: rgba(255, 107, 107, 0.08);
  }

  .item-icon-svg {
    color: #5a9dc4;
    flex-shrink: 0;
  }

  .dropdown-item.logout .item-icon-svg {
    color: #ff6b6b;
  }

  .dropdown-divider {
    height: 1px;
    background: rgba(226, 232, 240, 0.5);
    margin: 8px 0;
  }

  /* Toggle Switch for Night Mode */
  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    margin-left: auto;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #d1d5db;
    transition: 0.3s;
    border-radius: 24px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .toggle-switch input:checked + .toggle-slider {
    background: linear-gradient(135deg, #7eb9d9 0%, #5a9dc4 100%);
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .user-avatar {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #7eb9d9 0%, #5a9dc4 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(126, 185, 217, 0.2);
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #2b3f50;
    font-family: 'Inter', sans-serif;
  }

  .user-role {
    font-size: 12px;
    color: #8b95a1;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }

  @media (max-width: 968px) {
    .hamburger-menu {
      display: flex !important;
      pointer-events: auto;
    }
    
    padding: 0 20px;

    .search-box {
      min-width: 150px;
    }
    
    .header-title {
      font-size: 20px;
    }

    .user-info {
      display: none;
    }
    
    .profile-dropdown {
      right: -10px;
    }
  }

  @media (max-width: 600px) {
    padding: 0 15px;
    
    .header-title {
      font-size: 18px;
    }
    
    .search-box {
      display: none;
    }
    
    .notification-icon {
      font-size: 20px;
    }
  }
`;

function Header({ onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard'
      case '/aset':
        return 'Manajemen Aset'
      case '/vendor':
        return 'Data Vendor'
      case '/laporan':
        return 'Laporan & Analitik'
      case '/pengaturan':
        return 'Pengaturan'
      default:
        return 'Dashboard'
    }
  }

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
    e.stopPropagation()
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
    <HeaderContainer>
      <div className="header-left">
        <button className="hamburger-menu" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="header-title">{getPageTitle()}</h1>
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
    </HeaderContainer>
  )
}

export default Header
