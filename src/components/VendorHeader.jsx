import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, User, LogOut, ChevronDown, Search } from 'lucide-react'
import './VendorHeader.css'

function VendorHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const getPageTitle = () => {
    switch (location.pathname) {
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
    navigate('/vendor-login')
  }

  const handleProfileClick = () => {
    setShowProfileMenu(false)
    navigate('/vendor-portal/profile')
  }

  return (
    <header className="vendor-header">
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
              <Bell size={60} strokeWidth={2.5} />
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
    </header>
  )
}

export default VendorHeader
