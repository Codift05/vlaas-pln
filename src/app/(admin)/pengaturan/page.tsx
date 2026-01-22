'use client'
import { useState, useEffect } from 'react'
import { User, Users, Settings, Mail, Search, Lock, FileText, Save, UserPlus, Ban, CheckCircle, XCircle } from 'lucide-react'
import './Pengaturan.css'
import {
    updateProfile,
    changePassword,
    sendPasswordResetEmail,
    getUserProfile,
    getAllAdminUsers,
    createAdminUser,
    deactivateUser,
    activateUser,
    getAuditLogs,
    saveSystemConfig,
    getSystemConfig,
    createAuditLog
} from '../../../services/userService'
import { supabase } from '../../../lib/supabaseClient'

function Pengaturan() {
    const [activeTab, setActiveTab] = useState('profil')
    const [userRole, setUserRole] = useState('Super Admin')
    const [currentUserId, setCurrentUserId] = useState('')
    const [loading, setLoading] = useState(false)

    // State untuk Profil
    const [profileData, setProfileData] = useState({
        namaLengkap: '',
        email: '',
        telepon: '',
        alamat: ''
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
    const [adminUsers, setAdminUsers] = useState<any[]>([])

    // State untuk Konfigurasi Sistem
    const [systemConfig, setSystemConfig] = useState({
        retentionEnabled: true,
        retentionMonths: 12,
        emailNotifEnabled: true,
        approvedTemplate: '',
        rejectedTemplate: ''
    })

    // State untuk Audit Log
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [auditFilters, setAuditFilters] = useState({
        startDate: '',
        endDate: '',
        search: ''
    })

    // Load data on mount
    useEffect(() => {
        loadUserData()
        if (userRole === 'Super Admin') {
            loadAdminUsers()
            loadSystemConfig()
            loadAuditLogs()
        }
    }, [userRole])

    const loadUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setCurrentUserId(user.id)
                const result = await getUserProfile(user.id)
                if (result.success && (result as any).data) {
                    setProfileData({
                        namaLengkap: (result as any).data.full_name || '',
                        email: user.email || '',
                        telepon: (result as any).data.phone || '',
                        alamat: (result as any).data.address || ''
                    })
                    setUserRole((result as any).data.role || 'Admin')
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error)
        }
    }

    const loadAdminUsers = async () => {
        const result = await getAllAdminUsers()
        if (result.success) {
            setAdminUsers((result as any).data)
        }
    }

    const loadSystemConfig = async () => {
        const result = await getSystemConfig()
        if (result.success && (result as any).data) {
            setSystemConfig({
                retentionEnabled: (result as any).data.retention_enabled,
                retentionMonths: (result as any).data.retention_months,
                emailNotifEnabled: (result as any).data.email_notif_enabled,
                approvedTemplate: (result as any).data.approved_template,
                rejectedTemplate: (result as any).data.rejected_template
            })
        }
    }

    const loadAuditLogs = async () => {
        const result = await getAuditLogs(auditFilters)
        if (result.success) {
            setAuditLogs((result as any).data)
        }
    }

    const handleProfileUpdate = async (e: any) => {
        e.preventDefault()

        let userIdToUse = currentUserId;

        // Fallback: Jika state currentUserId kosong, coba ambil dari session langsung
        if (!userIdToUse) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    userIdToUse = user.id;
                    setCurrentUserId(user.id); // Update state untuk next time
                }
            } catch (err) {
                console.error("Failed to fetch user on demand", err);
            }
        }

        if (!userIdToUse) {
            alert('Sesi anda telah berakhir atau data tidak valid. Mohon login ulang.')
            return
        }

        setLoading(true)
        try {
            const result = await updateProfile(userIdToUse, profileData)
            if (result.success) {
                // Update local state jika berhasil
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // Refresh data agar sinkron
                    const updatedProfile = await getUserProfile(user.id)
                    if (updatedProfile.success && (updatedProfile as any).data) {
                        setProfileData(prev => ({ ...prev, ... (updatedProfile as any).data }))
                    }
                }

                alert((result as any).message)

                // Dispatch event agar Header update otomatis
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('profile-updated'))
                }

                await createAuditLog('Memperbarui profil pengguna')
            } else {
                alert('Gagal memperbarui profil: ' + (result as any).error)
            }
        } catch (error) {
            alert('Terjadi kesalahan saat memperbarui profil')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e: any) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Password baru dan konfirmasi tidak cocok!')
            return
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password minimal 6 karakter!')
            return
        }
        setLoading(true)
        try {
            const result = await changePassword(passwordData.oldPassword, passwordData.newPassword)
            if (result.success) {
                alert((result as any).message)
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                await createAuditLog('Mengubah password')
            } else {
                alert('Gagal mengubah password: ' + (result as any).error)
            }
        } catch (error) {
            alert('Terjadi kesalahan saat mengubah password')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!profileData.email) {
            alert('Email tidak tersedia')
            return
        }
        setLoading(true)
        try {
            const result = await sendPasswordResetEmail(profileData.email)
            if (result.success) {
                alert((result as any).message)
            } else {
                alert('Gagal mengirim email reset: ' + (result as any).error)
            }
        } catch (error) {
            alert('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await createAdminUser(newUserData)
            if (result.success) {
                alert((result as any).message)
                setShowAddUserModal(false)
                setNewUserData({ email: '', namaLengkap: '', role: 'Verifikator' })
                await loadAdminUsers()
                await createAuditLog(`Menambah user baru: ${newUserData.namaLengkap}`)
            } else {
                alert('Gagal menambah user: ' + (result as any).error)
            }
        } catch (error) {
            alert('Terjadi kesalahan saat menambah user')
        } finally {
            setLoading(false)
        }
    }

    const handleDeactivateUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menonaktifkan akses ${userName}?`)) {
            return
        }
        setLoading(true)
        try {
            const result = await deactivateUser(userId)
            if (result.success) {
                alert((result as any).message)
                await loadAdminUsers()
                await createAuditLog(`Menonaktifkan user: ${userName}`)
            } else {
                alert('Gagal menonaktifkan user: ' + (result as any).error)
            }
        } catch (error) {
            alert('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleActivateUser = async (userId: string, userName: string) => {
        setLoading(true)
        try {
            const result = await activateUser(userId)
            if (result.success) {
                alert((result as any).message)
                await loadAdminUsers()
                await createAuditLog(`Mengaktifkan user: ${userName}`)
            } else {
                alert('Gagal mengaktifkan user: ' + (result as any).error)
            }
        } catch (error) {
            alert('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleSystemConfigSave = async () => {
        setLoading(true)
        try {
            const result = await saveSystemConfig(systemConfig)
            if (result.success) {
                alert((result as any).message)
            } else {
                alert('Gagal menyimpan konfigurasi: ' + (result as any).error)
            }
        } catch (error) {
            alert('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleAuditFilter = async () => {
        await loadAuditLogs()
    }

    return (
        <>
            {/* Tab Navigation */}
            <div className="settings-tabs">
                <button
                    className={`tab-btn ${activeTab === 'profil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profil')}
                >
                    <User size={18} /> Profil & Akun
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Lock size={18} /> Keamanan
                </button>
                {userRole === 'Super Admin' && (
                    <>
                        <button
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <Users size={18} /> Manajemen User
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
                            onClick={() => setActiveTab('system')}
                        >
                            <Settings size={18} /> Konfigurasi Sistem
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                            onClick={() => setActiveTab('audit')}
                        >
                            <FileText size={18} /> Log Audit
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
                            <div className="section-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#3b82f6',
                                        display: 'flex',
                                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                                    }}>
                                        <User size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="section-title" style={{ marginBottom: '4px' }}>Edit Profil Pengguna</h3>
                                        <p className="section-description" style={{ marginBottom: 0 }}>Perbarui informasi pribadi anda</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleProfileUpdate} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group-settings">
                                        <label>Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={profileData.namaLengkap}
                                            onChange={(e) => setProfileData({ ...profileData, namaLengkap: e.target.value })}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    <div className="form-group-settings">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            placeholder="Masukkan email"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group-settings">
                                        <label>Telepon</label>
                                        <input
                                            type="tel"
                                            value={profileData.telepon}
                                            onChange={(e) => setProfileData({ ...profileData, telepon: e.target.value })}
                                            placeholder="Masukkan nomor telepon"
                                        />
                                    </div>
                                    <div className="form-group-settings">
                                        <label>Alamat</label>
                                        <input
                                            type="text"
                                            value={profileData.alamat}
                                            onChange={(e) => setProfileData({ ...profileData, alamat: e.target.value })}
                                            placeholder="Masukkan alamat"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-save"><Save size={18} /> Simpan Perubahan</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Keamanan Tab */}
                {activeTab === 'security' && (
                    <div className="tab-panel">
                        <div className="settings-section">
                            <div className="section-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        color: '#f59e0b',
                                        display: 'flex',
                                        boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
                                    }}>
                                        <Lock size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="section-title" style={{ marginBottom: '4px' }}>Ubah Password</h3>
                                        <p className="section-description" style={{ marginBottom: 0 }}>Amankan akun anda dengan password kuat</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handlePasswordChange} className="settings-form">
                                <div className="form-group-settings">
                                    <label>Password Lama</label>
                                    <input
                                        type="password"
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        placeholder="Masukkan password lama"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group-settings">
                                        <label>Password Baru</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="Masukkan password baru"
                                        />
                                    </div>
                                    <div className="form-group-settings">
                                        <label>Konfirmasi Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="Konfirmasi password baru"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    <Lock size={18} /> {loading ? 'Mengubah...' : 'Ubah Password'}
                                </button>
                            </form>

                            <div className="password-reset-section">
                                <p className="password-reset-text">Lupa password? Gunakan fitur pemulihan akun</p>
                                <button className="btn-reset" onClick={handlePasswordReset} disabled={loading}>
                                    <Mail size={18} /> {loading ? 'Mengirim...' : 'Kirim Email Reset Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manajemen User Tab */}
                {activeTab === 'users' && userRole === 'Super Admin' && (
                    <div className="tab-panel">
                        <div className="settings-section">
                            <div className="section-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10b981',
                                        display: 'flex',
                                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Users size={20} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="section-title" style={{ marginBottom: 0 }}>Daftar Pengguna Admin</h3>
                                </div>
                                <button className="btn-add-user" onClick={() => setShowAddUserModal(true)}>
                                    <UserPlus size={18} /> Tambah Admin Baru
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
                                                <td className="user-name">{user.full_name}</td>
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
                                                <td className="last-login">{user.last_login ? new Date(user.last_login).toLocaleString('id-ID') : '-'}</td>
                                                <td>
                                                    {user.role !== 'Super Admin' && (
                                                        user.status === 'Aktif' ? (
                                                            <button
                                                                className="btn-deactivate"
                                                                onClick={() => handleDeactivateUser(user.id, user.full_name)}
                                                                disabled={loading}
                                                            >
                                                                <Ban size={16} /> Nonaktifkan
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-activate"
                                                                onClick={() => handleActivateUser(user.id, user.full_name)}
                                                                disabled={loading}
                                                            >
                                                                <CheckCircle size={16} /> Aktifkan
                                                            </button>
                                                        )
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
                            <div className="section-header" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: 'rgba(124, 58, 237, 0.1)',
                                        color: '#7c3aed',
                                        display: 'flex',
                                        boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
                                    }}>
                                        <Settings size={20} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="section-title" style={{ marginBottom: 0 }}>Kebijakan Retensi Data</h3>
                                </div>
                            </div>
                            <div className="config-group">
                                <div className="toggle-group">
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={systemConfig.retentionEnabled}
                                            onChange={(e) => setSystemConfig({ ...systemConfig, retentionEnabled: e.target.checked })}
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
                                            onChange={(e) => setSystemConfig({ ...systemConfig, retentionMonths: parseInt(e.target.value) || 0 })}
                                            min="1"
                                            max="36"
                                            placeholder="Masukkan jumlah bulan"
                                        />
                                        <small>Dokumen dengan status "Rejected" akan dihapus otomatis setelah periode ini</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="settings-section">
                            <div className="section-header" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: 'rgba(236, 72, 153, 0.1)',
                                        color: '#ec4899',
                                        display: 'flex',
                                        boxShadow: '0 2px 4px rgba(236, 72, 153, 0.1)'
                                    }}>
                                        <Mail size={20} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="section-title" style={{ marginBottom: 0 }}>Pengaturan Notifikasi Email</h3>
                                </div>
                            </div>
                            <div className="config-group">
                                <div className="toggle-group">
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={systemConfig.emailNotifEnabled}
                                            onChange={(e) => setSystemConfig({ ...systemConfig, emailNotifEnabled: e.target.checked })}
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
                                                onChange={(e) => setSystemConfig({ ...systemConfig, approvedTemplate: e.target.value })}
                                                rows={4}
                                                placeholder="Template email untuk dokumen yang disetujui"
                                            />
                                        </div>
                                        <div className="form-group-settings">
                                            <label>Template Email - Rejected</label>
                                            <textarea
                                                value={systemConfig.rejectedTemplate}
                                                onChange={(e) => setSystemConfig({ ...systemConfig, rejectedTemplate: e.target.value })}
                                                rows={4}
                                                placeholder="Template email untuk dokumen yang ditolak"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <button className="btn-save" onClick={handleSystemConfigSave} disabled={loading}>
                                <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Log Audit Tab */}
                {activeTab === 'audit' && userRole === 'Super Admin' && (
                    <div className="tab-panel">
                        <div className="settings-section">
                            <div className="section-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: 'rgba(100, 116, 139, 0.1)',
                                        color: '#64748b',
                                        display: 'flex',
                                        boxShadow: '0 2px 4px rgba(100, 116, 139, 0.1)'
                                    }}>
                                        <FileText size={20} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="section-title" style={{ marginBottom: 0 }}>Riwayat Aktivitas Sistem</h3>
                                </div>
                            </div>
                            <p className="section-description">
                                Log aktivitas ini tidak dapat diubah atau dihapus untuk menjaga integritas audit trail
                            </p>

                            <div className="audit-filters">
                                <input
                                    type="date"
                                    className="filter-input-audit"
                                    placeholder="Dari tanggal"
                                    value={auditFilters.startDate}
                                    onChange={(e) => setAuditFilters({ ...auditFilters, startDate: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="filter-input-audit"
                                    placeholder="Sampai tanggal"
                                    value={auditFilters.endDate}
                                    onChange={(e) => setAuditFilters({ ...auditFilters, endDate: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="filter-input-audit"
                                    placeholder="Cari user atau aktivitas..."
                                    value={auditFilters.search}
                                    onChange={(e) => setAuditFilters({ ...auditFilters, search: e.target.value })}
                                />
                                <button className="btn-filter-audit" onClick={handleAuditFilter} disabled={loading}>
                                    <Search size={18} /> {loading ? 'Memfilter...' : 'Filter'}
                                </button>
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
                                                <td className="timestamp">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                                <td className="user-audit">{log.profiles?.full_name || 'System'}</td>
                                                <td className="action">{log.action}</td>
                                                <td className="ip-address">{log.ip_address}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
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
                                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                    placeholder="admin@pln.com"
                                    required
                                />
                            </div>
                            <div className="form-group-settings">
                                <label>Nama Lengkap <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={newUserData.namaLengkap}
                                    onChange={(e) => setNewUserData({ ...newUserData, namaLengkap: e.target.value })}
                                    placeholder="Nama lengkap admin"
                                    required
                                />
                            </div>
                            <div className="form-group-settings">
                                <label>Role <span className="required">*</span></label>
                                <select
                                    value={newUserData.role}
                                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                                    required
                                    title="Pilih role user"
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
                                    <UserPlus size={18} /> Tambah User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Pengaturan
