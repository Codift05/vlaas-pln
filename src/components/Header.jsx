'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, Settings, LogOut, ChevronDown, ChevronUp, FileText, UserPlus, Clock } from 'lucide-react'
import styled from 'styled-components'
import { supabase } from '../lib/supabaseClient'

const HeaderContainer = styled.header`
  height: clamp(4rem, 5rem, 6rem);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(1.5rem, 2rem, 2.5rem);
  box-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
/* ... skipping unchanged styled components lines if possible or including them contextually ... */
/* I will assume I need to replace the specific blocks */

/* Since replace_file_content requires contiguous block, I will do two edits if they are far apart, 
   but Header definition is at top and LogoGroup at bottom. */


  .header-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 1.25rem, 1.5rem);
  }

  /* Hamburger Menu */
  .hamburger-menu {
    display: none;
    flex-direction: column;
    gap: 0.313rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
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
    width: 1.5rem;
    height: 0.188rem;
    background: #1e5ba8;
    border-radius: 0.125rem;
    transition: all 0.3s;
    display: block;
  }

  .header-title {
    font-size: clamp(1.25rem, 1.5rem, 1.625rem);
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.03125rem;
    font-family: var(--font-inter);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 1.563rem, 2rem);
  }

  .search-box {
    display: flex;
    align-items: center;
    background: #f8fafc;
    padding: 0.688rem 1.375rem;
    border-radius: 1.875rem;
    gap: 0.625rem;
    min-width: clamp(12rem, 20rem, 24rem);
    border: 1px solid #e2e8f0;
    transition: all 0.25s;
  }

  .search-box:focus-within {
    background: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 1400px) {
    .search-box {
      min-width: 15rem;
    }
  }

  .search-icon-svg {
    color: #94a3b8;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #334155;
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
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 0.75rem;
  }

  .notification-icon:hover {
    transform: scale(1.05);
    background: #f1f5f9;
    color: #3b82f6;
  }

  .notification-badge {
    position: absolute;
    top: -0.313rem;
    right: -0.313rem;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: white;
    font-size: clamp(0.625rem, 0.688rem, 0.75rem);
    font-weight: 700;
    padding: 0.188rem 0.375rem;
    border-radius: 0.625rem;
    min-width: 1.125rem;
    text-align: center;
    box-shadow: 0 0.125rem 0.375rem rgba(238, 90, 82, 0.3);
    font-family: var(--font-inter);
  }

  /* Notification Dropdown */
  .notification-dropdown {
    position: absolute;
    top: calc(100% + 0.625rem);
    right: -5rem;
    background: var(--bg-card);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    min-width: clamp(20rem, 23.75rem, 26.25rem);
    max-width: 26.25rem;
    z-index: 1000;
    animation: slideDown 0.3s ease;
    overflow: hidden;
  }

  .notification-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .notification-header h3 {
    font-size: clamp(0.875rem, 1rem, 1.125rem);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .notification-header .mark-read {
    font-size: clamp(0.688rem, 0.75rem, 0.813rem);
    color: #5a9dc4;
    cursor: pointer;
    font-weight: 600;
  }

  .notification-header .mark-read:hover {
    text-decoration: underline;
  }

  .notification-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .notification-item {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    gap: 12px;
  }

  .notification-item:hover {
    background: var(--bg-hover);
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .notification-icon-wrapper.contract {
    background: #eff6ff;
    color: #3b82f6;
  }

  .notification-icon-wrapper.vendor {
    background: #f0fdf4;
    color: #22c55e;
  }

  .notification-icon-wrapper.amendment {
    background: #fef3c7;
    color: #f59e0b;
  }

  .notification-content {
    flex: 1;
  }

  .notification-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .notification-desc {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .notification-time {
    font-size: 11px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .notification-empty {
    padding: 40px 20px;
    text-align: center;
    color: var(--text-muted);
  }

  .notification-empty-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
    opacity: 0.3;
  }

  .user-profile {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 1.875rem;
    transition: all 0.25s;
  }

  .user-profile:hover {
    background: var(--bg-hover);
  }

  @media (max-width: 1400px) {
    .user-profile {
      padding: 0.5rem;
      gap: 0.5rem;
    }
  }

  .dropdown-arrow-svg {
    color: #94a3b8;
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
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)

  // Ambil daftar notifikasi yang sudah dibaca dari localStorage
  const getReadNotifIds = () => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('readNotifIds') || '[]')
    } catch {
      return []
    }
  }

  // Simpan daftar notifikasi yang sudah dibaca ke localStorage
  const setReadNotifIds = (ids) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('readNotifIds', JSON.stringify(ids))
  }
  const router = useRouter()
  const pathname = usePathname()

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Fetch contract history for recent amendments
      const { data: contractHistory } = await supabase
        .from('contract_history')
        .select('*, contracts(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent vendors
      const { data: vendors } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      const notifs = []

      // Add contract history notifications
      if (contractHistory) {
        contractHistory.forEach(history => {
          notifs.push({
            id: `contract-${history.id}`,
            type: history.action.includes('Amandemen') ? 'amendment' : 'contract',
            title: history.action,
            description: `${history.contracts?.name || 'Kontrak'} - ${history.details?.substring(0, 50)}...`,
            time: getRelativeTime(history.created_at),
            icon: FileText
          })
        })
      }

      // Add vendor notifications
      if (vendors) {
        vendors.forEach(vendor => {
          notifs.push({
            id: `vendor-${vendor.id}`,
            type: 'vendor',
            title: 'Vendor Baru Ditambahkan',
            description: `${vendor.nama || vendor.name} telah terdaftar di sistem`,
            time: getRelativeTime(vendor.created_at),
            icon: UserPlus
          })
        })
      }

      // Filter notifikasi yang sudah dibaca
      const readIds = getReadNotifIds()
      const filteredNotifs = notifs.filter(n => !readIds.includes(n.id))

      // Sort by time and limit
      filteredNotifs.sort((a, b) => b.id.localeCompare(a.id))
      setNotifications(filteredNotifs.slice(0, 8))
      setNotificationCount(filteredNotifs.length)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Baru saja'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

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
        <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={22} strokeWidth={2} />
          {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
          {showNotifications && (
            <div className="notification-dropdown" onClick={e => e.stopPropagation()}>
              <div className="notification-header">
                <h3>Notifikasi</h3>
                <span className="mark-read" onClick={() => {
                  // Simpan semua ID notifikasi yang sedang tampil ke localStorage
                  const ids = notifications.map(n => n.id)
                  setReadNotifIds([...getReadNotifIds(), ...ids])
                  setNotifications([])
                  setNotificationCount(0)
                }}>Tandai sudah dibaca</span>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => {
                    const IconComponent = notif.icon
                    return (
                      <div key={notif.id} className="notification-item">
                        <div className={`notification-icon-wrapper ${notif.type}`}>
                          <IconComponent size={18} strokeWidth={2} />
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notif.title}</div>
                          <div className="notification-desc">{notif.description}</div>
                          <div className="notification-time">
                            <Clock size={11} />
                            {notif.time}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="notification-empty">
                    <Bell className="notification-empty-icon" size={48} strokeWidth={1.5} />
                    <p>Tidak ada notifikasi</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
