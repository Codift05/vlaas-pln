import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './Pengaturan.css'

function Pengaturan() {
  const [activeTab, setActiveTab] = useState('profil')
  const [userRole] = useState('Super Admin') // Simulasi role user

  // State untuk Profil
  const [profileData, setProfileData] = useState({
    namaLengkap: 'Admin User',
    email: 'admin@pln-vlaas.com',
    telepon: '021-1234567',
    alamat: 'Jl. Sudirman No. 123, Jakarta'
  })

  // State untuk Password
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // State untuk User Management
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserData, setNewUserData] = useState({
    email: '',
    namaLengkap: '',
    role: 'Verifikator'
  })

  const adminUsers = [
    { id: 1, nama: 'Super Admin', email: 'superadmin@pln.com', role: 'Super Admin', status: 'Aktif', lastLogin: '19/12/2025 10:30' },
    { id: 2, nama: 'Verifikator 1', email: 'verifikator1@pln.com', role: 'Verifikator', status: 'Aktif', lastLogin: '19/12/2025 09:15' },
    { id: 3, nama: 'Verifikator 2', email: 'verifikator2@pln.com', role: 'Verifikator', status: 'Aktif', lastLogin: '18/12/2025 16:45' },
    { id: 4, nama: 'Admin Support', email: 'support@pln.com', role: 'Verifikator', status: 'Nonaktif', lastLogin: '15/12/2025 14:20' }
  ]

  // State untuk Konfigurasi Sistem
  const [systemConfig, setSystemConfig] = useState({
    retentionEnabled: true,
    retentionMonths: 12,
    emailNotifEnabled: true,
    approvedTemplate: 'Dokumen Anda telah disetujui...',
    rejectedTemplate: 'Dokumen Anda ditolak karena...'
  })

  // State untuk Audit Log
  const auditLogs = [
    { id: 1, user: 'Super Admin', action: 'Login ke sistem', timestamp: '19/12/2025 10:30:15', ipAddress: '192.168.1.100' },
    { id: 2, user: 'Verifikator 1', action: 'Menyetujui dokumen #AST001', timestamp: '19/12/2025 09:15:30', ipAddress: '192.168.1.101' },
    { id: 3, user: 'Verifikator 2', action: 'Menolak dokumen #VND005', timestamp: '18/12/2025 16:45:22', ipAddress: '192.168.1.102' },
    { id: 4, user: 'Super Admin', action: 'Menambah user baru: Admin Support', timestamp: '15/12/2025 14:20:10', ipAddress: '192.168.1.100' },
    { id: 5, user: 'Verifikator 1', action: 'Mengubah status dokumen #AST003', timestamp: '15/12/2025 11:30:45', ipAddress: '192.168.1.101' }
  ]

  const handleProfileUpdate = (e) => {
    e.preventDefault()
    alert('Profil berhasil diperbarui!')
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok!')
      return
    }
    alert('Password berhasil diubah!')
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleAddUser = (e) => {
    e.preventDefault()
    console.log('Menambah user baru:', newUserData)
    alert('User baru berhasil ditambahkan!')
    setShowAddUserModal(false)
    setNewUserData({ email: '', namaLengkap: '', role: 'Verifikator' })
  }

  const handleDeactivateUser = (userId, userName) => {
    if (window.confirm(`Apakah Anda yakin ingin menonaktifkan akses ${userName}?`)) {
      alert(`Akses ${userName} berhasil dinonaktifkan!`)
    }
  }

  const handleSystemConfigSave = () => {
    alert('Konfigurasi sistem berhasil disimpan!')
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Pengaturan" />
        
        <div className="content-area">
          {/* Tab Navigation */}
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profil' ? 'active' : ''}`}
              onClick={() => setActiveTab('profil')}
            >
              👤 Profil & Akun
            </button>
            {userRole === 'Super Admin' && (
              <>
                <button 
                  className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  👥 Manajemen User
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
                  onClick={() => setActiveTab('system')}
                >
                  ⚙️ Konfigurasi Sistem
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  📋 Log Audit
                </button>
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="settings-content">
            {/* Profil & Akun Tab */}
            {activeTab === 'profil' && (
              <div className="tab-panel">
                <div className="settings-section">
                  <h3 className="section-title">Edit Profil Pengguna</h3>
                  <form onSubmit={handleProfileUpdate} className="settings-form">
                    <div className="form-row">
                      <div className="form-group-settings">
                        <label>Nama Lengkap</label>
                        <input
                          type="text"
                          value={profileData.namaLengkap}
                          onChange={(e) => setProfileData({...profileData, namaLengkap: e.target.value})}
                        />
                      </div>
                      <div className="form-group-settings">
                        <label>Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group-settings">
                        <label>Telepon</label>
                        <input
                          type="tel"
                          value={profileData.telepon}
                          onChange={(e) => setProfileData({...profileData, telepon: e.target.value})}
                        />
                      </div>
                      <div className="form-group-settings">
                        <label>Alamat</label>
                        <input
                          type="text"
                          value={profileData.alamat}
                          onChange={(e) => setProfileData({...profileData, alamat: e.target.value})}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-save">💾 Simpan Perubahan</button>
                  </form>
                </div>

                <div className="settings-section">
                  <h3 className="section-title">Keamanan</h3>
                  <form onSubmit={handlePasswordChange} className="settings-form">
                    <div className="form-group-settings">
                      <label>Password Lama</label>
                      <input
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        placeholder="Masukkan password lama"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group-settings">
                        <label>Password Baru</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          placeholder="Masukkan password baru"
                        />
                      </div>
                      <div className="form-group-settings">
                        <label>Konfirmasi Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          placeholder="Konfirmasi password baru"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-save">🔒 Ubah Password</button>
                  </form>
                  
                  <div className="recovery-section">
                    <p className="recovery-text">Lupa password? Gunakan fitur pemulihan akun</p>
                    <button className="btn-recovery">📧 Kirim Email Reset Password</button>
                  </div>
                </div>
              </div>
            )}

            {/* Manajemen User Tab */}
            {activeTab === 'users' && userRole === 'Super Admin' && (
              <div className="tab-panel">
                <div className="settings-section">
                  <div className="section-header">
                    <h3 className="section-title">Daftar Pengguna Admin</h3>
                    <button className="btn-add-user" onClick={() => setShowAddUserModal(true)}>
                      ➕ Tambah Admin Baru
                    </button>
                  </div>
                  
                  <div className="users-table-container">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Login Terakhir</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="user-name">{user.nama}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`role-badge ${user.role === 'Super Admin' ? 'super' : 'verif'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge-user ${user.status === 'Aktif' ? 'active' : 'inactive'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="last-login">{user.lastLogin}</td>
                            <td>
                              {user.status === 'Aktif' && user.role !== 'Super Admin' && (
                                <button 
                                  className="btn-deactivate"
                                  onClick={() => handleDeactivateUser(user.id, user.nama)}
                                >
                                  🚫 Nonaktifkan
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Konfigurasi Sistem Tab */}
            {activeTab === 'system' && userRole === 'Super Admin' && (
              <div className="tab-panel">
                <div className="settings-section">
                  <h3 className="section-title">Kebijakan Retensi Data</h3>
                  <div className="config-group">
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={systemConfig.retentionEnabled}
                          onChange={(e) => setSystemConfig({...systemConfig, retentionEnabled: e.target.checked})}
                        />
                        <span className="toggle-text">Aktifkan penghapusan otomatis dokumen yang ditolak</span>
                      </label>
                    </div>
                    {systemConfig.retentionEnabled && (
                      <div className="form-group-settings">
                        <label>Hapus setelah (bulan)</label>
                        <input
                          type="number"
                          value={systemConfig.retentionMonths}
                          onChange={(e) => setSystemConfig({...systemConfig, retentionMonths: e.target.value})}
                          min="1"
                          max="36"
                        />
                        <small>Dokumen dengan status "Rejected" akan dihapus otomatis setelah periode ini</small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="settings-section">
                  <h3 className="section-title">Pengaturan Notifikasi Email</h3>
                  <div className="config-group">
                    <div className="toggle-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={systemConfig.emailNotifEnabled}
                          onChange={(e) => setSystemConfig({...systemConfig, emailNotifEnabled: e.target.checked})}
                        />
                        <span className="toggle-text">Aktifkan notifikasi email ke vendor</span>
                      </label>
                    </div>
                    
                    {systemConfig.emailNotifEnabled && (
                      <>
                        <div className="form-group-settings">
                          <label>Template Email - Approved</label>
                          <textarea
                            value={systemConfig.approvedTemplate}
                            onChange={(e) => setSystemConfig({...systemConfig, approvedTemplate: e.target.value})}
                            rows="4"
                            placeholder="Template email untuk dokumen yang disetujui"
                          />
                        </div>
                        <div className="form-group-settings">
                          <label>Template Email - Rejected</label>
                          <textarea
                            value={systemConfig.rejectedTemplate}
                            onChange={(e) => setSystemConfig({...systemConfig, rejectedTemplate: e.target.value})}
                            rows="4"
                            placeholder="Template email untuk dokumen yang ditolak"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <button className="btn-save" onClick={handleSystemConfigSave}>
                    💾 Simpan Konfigurasi
                  </button>
                </div>
              </div>
            )}

            {/* Log Audit Tab */}
            {activeTab === 'audit' && userRole === 'Super Admin' && (
              <div className="tab-panel">
                <div className="settings-section">
                  <h3 className="section-title">Riwayat Aktivitas Sistem</h3>
                  <p className="section-description">
                    Log aktivitas ini tidak dapat diubah atau dihapus untuk menjaga integritas audit trail
                  </p>
                  
                  <div className="audit-filters">
                    <input type="date" className="filter-input-audit" placeholder="Dari tanggal" />
                    <input type="date" className="filter-input-audit" placeholder="Sampai tanggal" />
                    <input type="text" className="filter-input-audit" placeholder="Cari user atau aktivitas..." />
                    <button className="btn-filter-audit">🔍 Filter</button>
                  </div>

                  <div className="audit-table-container">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>User</th>
                          <th>Aktivitas</th>
                          <th>IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="timestamp">{log.timestamp}</td>
                            <td className="user-audit">{log.user}</td>
                            <td className="action">{log.action}</td>
                            <td className="ip-address">{log.ipAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Tambah User */}
        {showAddUserModal && (
          <div className="modal-overlay-settings" onClick={() => setShowAddUserModal(false)}>
            <div className="modal-content-settings" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-settings">
                <h3>Tambah Admin Baru</h3>
                <button className="modal-close-settings" onClick={() => setShowAddUserModal(false)}>✕</button>
              </div>
              <form onSubmit={handleAddUser} className="modal-form-settings">
                <div className="form-group-settings">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    placeholder="admin@pln.com"
                    required
                  />
                </div>
                <div className="form-group-settings">
                  <label>Nama Lengkap <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newUserData.namaLengkap}
                    onChange={(e) => setNewUserData({...newUserData, namaLengkap: e.target.value})}
                    placeholder="Nama lengkap admin"
                    required
                  />
                </div>
                <div className="form-group-settings">
                  <label>Role <span className="required">*</span></label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                    required
                  >
                    <option value="Verifikator">Verifikator</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div className="modal-footer-settings">
                  <button type="button" className="btn-cancel-settings" onClick={() => setShowAddUserModal(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-submit-settings">
                    ➕ Tambah User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pengaturan
