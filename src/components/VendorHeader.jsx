'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, User, LogOut, ChevronDown, Search } from 'lucide-react'
import styled from 'styled-components'

const VendorHeaderContainer = styled.header`
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
    color: #2b3f50;
    margin: 0;
    letter-spacing: -0.5px;
    font-family: 'Inter', sans-serif;
  }

  .vendor-header-right {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  /* Search Box */
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

  .search-icon {
    color: #8b95a1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #2b3f50;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }

  .search-input::placeholder {
    color: #a5b0bc;
    font-weight: 400;
  }

  /* Notifications */
  .notification-container {
    position: relative;
  }

  .notification-btn {
    position: relative;
    width: 56px;
    height: 56px;
    border: none;
    background: transparent;
    border-radius: 16px;
    color: #8b95a1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s;
    outline: none;
    overflow: visible;
  }

  .notification-btn:hover {
    color: #5a9dc4;
    transform: scale(1.05);
  }

  .notification-btn:focus {
    outline: none;
    border: none;
  }

  .notification-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 13px;
    font-weight: 700;
    padding: 5px 9px;
    border-radius: 14px;
    min-width: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  .notification-dropdown {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background: white;
    border: 1px solid rgba(226, 232, 240, 0.6);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    width: 360px;
    max-height: 480px;
    overflow: hidden;
    z-index: 1000;
    animation: dropdownSlide 0.25s ease;
  }

  @keyframes dropdownSlide {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
    background: rgba(248, 250, 252, 0.5);
  }

  .notification-header h3 {
    font-size: 15px;
    font-weight: 700;
    color: #2b3f50;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }

  .clear-all-btn {
    background: none;
    border: none;
    color: #5a9dc4;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }

  .clear-all-btn:hover {
    background: rgba(126, 185, 217, 0.1);
    color: #7eb9d9;
  }

  .notification-list {
    max-height: 380px;
    overflow-y: auto;
  }

  .notification-item {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.4);
    transition: background 0.2s;
    cursor: pointer;
  }

  .notification-item:hover {
    background: rgba(248, 250, 252, 0.6);
  }

  .notification-item.unread {
    background: rgba(126, 185, 217, 0.05);
    border-left: 3px solid #7eb9d9;
  }

  .notification-item h4 {
    font-size: 14px;
    font-weight: 600;
    color: #2b3f50;
    margin: 0 0 6px 0;
    font-family: 'Inter', sans-serif;
  }

  .notification-item p {
    font-size: 13px;
    color: #5a6d7f;
    margin: 0 0 6px 0;
    line-height: 1.4;
    font-family: 'Inter', sans-serif;
  }

  .notification-item small {
    font-size: 12px;
    color: #8b95a1;
    font-family: 'Inter', sans-serif;
  }

  .no-notifications {
    padding: 40px 20px;
    text-align: center;
    color: #8b95a1;
  }

  .no-notifications svg {
    color: #cbd5e0;
    margin-bottom: 12px;
  }

  .no-notifications p {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }

  /* Profile Dropdown */
  .profile-container {
    position: relative;
  }

  .profile-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px 8px 8px;
    background: rgba(248, 250, 252, 0.8);
    border: 1px solid rgba(226, 232, 240, 0.4);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.25s;
  }

  .profile-btn:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(126, 185, 217, 0.3);
    box-shadow: 0 2px 8px rgba(126, 185, 217, 0.1);
  }

  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7eb9d9 0%, #5a9dc4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
    font-family: 'Inter', sans-serif;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .profile-name {
    font-size: 14px;
    font-weight: 600;
    color: #2b3f50;
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  .profile-role {
    font-size: 12px;
    color: #8b95a1;
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  .profile-dropdown-icon {
    color: #8b95a1;
    transition: transform 0.25s;
    flex-shrink: 0;
  }

  .profile-dropdown-icon.open {
    transform: rotate(180deg);
  }

  .profile-dropdown {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background: white;
    border: 1px solid rgba(226, 232, 240, 0.6);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    min-width: 220px;
    overflow: hidden;
    z-index: 1000;
    animation: dropdownSlide 0.25s ease;
  }

  .profile-dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    color: #5a6d7f;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }

  .profile-dropdown-item:hover {
    background: rgba(248, 250, 252, 0.8);
    color: #2b3f50;
  }

  .profile-dropdown-item.logout {
    color: #c0392b;
    border-top: 1px solid rgba(226, 232, 240, 0.6);
  }

  .profile-dropdown-item.logout:hover {
    background: rgba(231, 76, 60, 0.08);
  }

  .profile-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    color: #5a6d7f;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }

  .profile-menu-item:hover {
    background: rgba(248, 250, 252, 0.8);
    color: #2b3f50;
  }

  .profile-menu-item.logout {
    color: #c0392b;
    border-top: 1px solid rgba(226, 232, 240, 0.6);
  }

  .profile-menu-item.logout:hover {
    background: rgba(231, 76, 60, 0.08);
  }

  /* Responsive */
  @media (max-width: 768px) {
    padding: 0 20px;
    height: 70px;

    .page-title {
      font-size: 20px;
    }

    .search-box {
      display: none;
    }

    .profile-info {
      display: none;
    }

    .notification-dropdown,
    .profile-dropdown {
      right: -20px;
    }
  }
`;

function VendorHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

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

  return (
    <VendorHeaderContainer>
      <div className="vendor-header-content">
        <div className="vendor-header-left">
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>

        <div className="vendor-header-right">
          {/* Notifications */}
          <div className="notification-container">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={24} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

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
          <div className="profile-container">
            <button
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                <User size={18} />
              </div>
              <span className="profile-name">Vendor</span>
              <ChevronDown size={16} />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <button className="profile-menu-item" onClick={handleProfileClick}>
                  <User size={16} />
                  <span>Profil Saya</span>
                </button>
                <button className="profile-menu-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorHeaderContainer>
  )
}

export default VendorHeader
