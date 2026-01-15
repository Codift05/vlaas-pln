'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, User, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import styled from 'styled-components'

const VendorHeaderContainer = styled.header`
  height: 80px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  .vendor-header-content {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .vendor-header-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .page-title {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.5px;
    font-family: 'Inter', sans-serif;
  }

  .vendor-header-right {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  /* Notifications */
  .notification-container {
    position: relative;
  }

  .notification-icon {
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 12px;
  }

  .notification-icon:hover {
    transform: scale(1.05);
    background: #f1f5f9;
    color: #3b82f6;
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

  .notification-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: -80px;
    background: #ffffff;
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid #e2e8f0;
    min-width: 380px;
    max-width: 420px;
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

  .notification-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .notification-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }

  .notification-count {
    font-size: 13px;
    color: #64748b;
    font-family: 'Inter', sans-serif;
  }

  .notification-list {
    max-height: 380px;
    overflow-y: auto;
  }

  .notification-item {
    padding: 14px 20px;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s;
    cursor: pointer;
  }

  .notification-item:hover {
    background: #f8fafc;
  }

  .notification-item.unread {
    background: rgba(59, 130, 246, 0.02);
    border-left: 3px solid #3b82f6;
  }

  .notification-item p {
    font-size: 14px;
    color: #334155;
    margin: 0 0 4px 0;
    font-family: 'Inter', sans-serif;
  }

  .notification-time {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'Inter', sans-serif;
  }

  /* Profile Dropdown */
  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px 8px 8px;
    background: #f8fafc;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
  }

  .user-profile:hover {
    background: #f1f5f9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
    flex-shrink: 0;
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

  .dropdown-arrow-svg {
    color: #8b95a1;
    flex-shrink: 0;
  }

  .profile-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    min-width: 200px;
    overflow: hidden;
    z-index: 1000;
    animation: slideDown 0.3s ease;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    border: none;
    background: transparent;
  }

  .dropdown-item:hover {
    background: #f8fafc;
  }

  .dropdown-item.logout {
    color: #ef4444;
    border-top: 1px solid #f1f5f9;
  }

  .dropdown-item.logout:hover {
    background: #fef2f2;
  }

  .item-icon-svg {
    flex-shrink: 0;
  }

  .dropdown-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 8px 0;
  }

  /* Responsive */
  @media (max-width: 968px) {
    padding: 0 20px;

    .page-title {
      font-size: 20px;
    }

    .user-info {
      display: none;
    }

    .notification-dropdown,
    .profile-dropdown {
      right: -10px;
    }
  }

  @media (max-width: 600px) {
    padding: 0 15px;

    .page-title {
      font-size: 18px;
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

  .logo-pln {
    height: 42px;
    width: auto;
    object-fit: contain;
    transition: transform 0.2s;
  }

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

function VendorHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userName, setUserName] = useState('Vendor')
  const [userInitial, setUserInitial] = useState('V')

  useEffect(() => {
    // Load vendor profile from localStorage
    const savedProfile = localStorage.getItem('vendorProfile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        if (profile.picName) {
          setUserName(profile.picName)
          setUserInitial(profile.picName.charAt(0).toUpperCase())
        } else if (profile.companyName) {
          setUserName(profile.companyName)
          setUserInitial(profile.companyName.charAt(0).toUpperCase())
        }
      } catch (error) {
        console.error('Error parsing profile:', error)
      }
    }
  }, [])

  // Listen for storage changes to update name in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem('vendorProfile')
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          if (profile.picName) {
            setUserName(profile.picName)
            setUserInitial(profile.picName.charAt(0).toUpperCase())
          } else if (profile.companyName) {
            setUserName(profile.companyName)
            setUserInitial(profile.companyName.charAt(0).toUpperCase())
          }
        } catch (error) {
          console.error('Error parsing profile:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // Custom event for same-window updates
    window.addEventListener('profileUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileUpdated', handleStorageChange)
    }
  }, [])

  const getPageTitle = () => {
    switch (pathname) {
      case '/vendor-portal':
        return 'Dashboard'
      case '/vendor-portal/pengajuan':
        return 'Buat Pengajuan'
      case '/vendor-portal/profile':
        return 'Profil Perusahaan'
      default:
        return 'Portal Vendor'
    }
  }

  const notifications = [
    { id: 1, message: 'Surat SRT/VND/2025/001 telah disetujui', time: '2 jam lalu', unread: true },
    { id: 2, message: 'Surat SRT/VND/2025/003 ditolak. Cek alasan penolakan.', time: '1 hari lalu', unread: true },
    { id: 3, message: 'Pengajuan SRT/VND/2025/002 sedang diproses', time: '2 hari lalu', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = () => {
    localStorage.removeItem('vendorLoggedIn')
    localStorage.removeItem('vendorEmail')
    router.push('/vendor-login')
  }

  const handleProfileClick = () => {
    setShowProfileMenu(false)
    router.push('/vendor-portal/profile')
  }

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  return (
    <VendorHeaderContainer>
      <div className="vendor-header-content">

        <div className="vendor-header-left">
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>

        <div className="vendor-header-right">
          {/* PLN & Danantara Logo */}
          <LogoGroup>
            <img src="/images/Logo_PLN.png" alt="PLN Logo" className="logo-pln" />
            <img src="/images/Logo_Danantara%20(2).png" alt="Danantara Logo" className="logo-danantara" />
            <div className="logo-text">
              <strong>PLN (Persero)</strong>
              <span>UPT Manado</span>
            </div>
          </LogoGroup>
          {/* Notifications */}
          <div className="notification-container">
            <div className="notification-icon" onClick={toggleNotifications}>
              <Bell size={24} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifikasi</h3>
                  <span className="notification-count">{unreadCount} baru</span>
                </div>
                <div className="notification-list">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="user-profile" onClick={toggleProfileMenu}>
            <div className="user-avatar">{userInitial}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">Partner</span>
            </div>
            {showProfileMenu ? (
              <ChevronUp className="dropdown-arrow-svg" size={16} strokeWidth={2.5} />
            ) : (
              <ChevronDown className="dropdown-arrow-svg" size={16} strokeWidth={2.5} />
            )}
            {showProfileMenu && (
              <div className="profile-dropdown" onClick={e => e.stopPropagation()}>
                <div className="dropdown-item" onClick={handleProfileClick}>
                  <User className="item-icon-svg" size={18} strokeWidth={2} />
                  <span>Profil Saya</span>
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut className="item-icon-svg" size={18} strokeWidth={2} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorHeaderContainer>
  )
}

export default VendorHeader
