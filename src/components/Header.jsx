'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, Settings, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import styled from 'styled-components'

const HeaderContainer = styled.header`
  height: 80px;
  background: var(--bg-header);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s, border-color 0.3s;
/* ... skipping unchanged styled components lines if possible or including them contextually ... */
/* I will assume I need to replace the specific blocks */

/* Since replace_file_content requires contiguous block, I will do two edits if they are far apart, 
   but Header definition is at top and LogoGroup at bottom. */


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
    background: var(--bg-hover);
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
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.5px;
    font-family: var(--font-inter);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: var(--bg-hover);
    padding: 11px 22px;
    border-radius: 30px;
    gap: 10px;
    min-width: 320px;
    border: 1px solid var(--border-color);
    transition: all 0.25s;
  }

  .search-box:focus-within {
    background: var(--bg-card);
    border-color: rgba(126, 185, 217, 0.3);
    box-shadow: var(--shadow-md);
  }

  .search-icon-svg {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: var(--text-primary);
    font-family: var(--font-inter);
  }

  .search-input::placeholder {
    color: var(--text-muted);
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
    background: var(--bg-hover);
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
    font-family: var(--font-inter);
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
    background: var(--bg-hover);
  }

  .dropdown-arrow-svg {
    color: var(--text-muted);
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
    background: var(--bg-card);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
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
    color: var(--text-primary);
    font-family: var(--font-inter);
    font-weight: 500;
  }

  .dropdown-item:hover {
    background: var(--bg-hover);
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
    background: var(--border-color);
    margin: 8px 0;
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
    .notification-icon {
      font-size: 20px;
    }
  }
`;

const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 16px;
  padding-right: 24px;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  height: 50px;

  @media (max-width: 1200px) {
    display: none;
  }

  /* PLN Logo - Standard Size */
  .logo-pln {
    height: 42px;
    width: auto;
    object-fit: contain;
    transition: transform 0.2s;
  }

  /* Danantara Logo - Maximize for 80px Header */
  .logo-danantara {
    height: 28px;
    width: auto;
    object-fit: contain;
    transition: transform 0.2s;
  }
  
  img:hover {
      transform: scale(1.05);
  }
  
  .logo-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.2;
      border-left: 1px solid rgba(0,0,0,0.1);
      padding-left: 16px;
      margin-left: 0px;
      
      strong {
          font-size: 15px;
          color: #334155;
          font-weight: 700;
          letter-spacing: -0.01em;
      }
      span {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.02em;
      }
  }
`;

function Header({ onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard'
      case '/aset':
        return 'Manajemen Kontrak'
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

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('devMode')
    router.push('/')
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
        <LogoGroup>
          <img src="/images/Logo_PLN.png" alt="Logo PLN" className="logo-pln" />
          <img src="/images/Logo_Danantara (2).png" alt="Logo Danantara" className="logo-danantara" />
          <div className="logo-text">
            <strong>PLN (Persero)</strong>
            <span>UPT Manado</span>
          </div>
        </LogoGroup>
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
