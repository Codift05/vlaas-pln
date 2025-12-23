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
          {/* Search Box */}
          <div className="search-box">
            <div className="search-icon">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Cari..." 
            />
          </div>

          {/* Notifications */}
          <div className="notification-container">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifikasi</h3>
                  <button className="clear-all-btn">Hapus Semua</button>
                </div>
                <div className="notification-list">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                      <h4>Notifikasi Pengajuan</h4>
                      <p>{notif.message}</p>
                      <small>{notif.time}</small>
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
              <div className="profile-avatar">V</div>
              <div className="profile-info">
                <div className="profile-name">Vendor</div>
                <div className="profile-role">Perusahaan</div>
              </div>
              <ChevronDown size={16} className={`profile-dropdown-icon ${showProfileMenu ? 'open' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <button className="profile-dropdown-item" onClick={handleProfileClick}>
                  <User size={16} />
                  <span>Profil Saya</span>
                </button>
                <button className="profile-dropdown-item logout" onClick={handleLogout}>
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
