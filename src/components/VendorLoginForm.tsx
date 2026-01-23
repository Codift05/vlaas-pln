/**
 * Vendor Login Component dengan fitur:
 * 1. Login vendor
 * 2. Forgot Password (Lupa Password)
 * 3. Register dengan data lengkap sesuai profil
 */

'use client'
import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { requestPasswordReset, resetPassword, registerVendor } from '../services/vendorAuthService'
import { supabase } from '../lib/supabaseClient'

export function VendorLoginForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Modal states
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [showRegister, setShowRegister] = useState(false)

    // Forgot password
    const [forgotStep, setForgotStep] = useState(1)
    const [forgotData, setForgotData] = useState({
        email: '',
        token: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Register data (sesuai profil)
    const [registerData, setRegisterData] = useState({
        // Informasi Perusahaan
        companyName: '',
        companyType: 'PT',
        npwp: '',
        siup: '',
        tdp: '',
        established: '',

        // Alamat
        address: '',
        city: '',
        province: '',
        postalCode: '',

        // Kontak
        phone: '',
        fax: '',
        email: '',

        // Penanggung Jawab
        picName: '',
        picPosition: '',
        picPhone: '',
        picEmail: '',

        // Password
        password: '',
        confirmPassword: ''
    })

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Check credentials in vendor_users table
            const { data: vendor, error: loginError } = await supabase
                .from('vendor_users')
                .select('*')
                .eq('email', email)
                .eq('password', password) // In production, use hashed password
                .single()

            if (loginError || !vendor) {
                setError('Email atau password salah')
                setLoading(false)
                return
            }

            // Save to localStorage
            localStorage.setItem('vendorLoggedIn', 'true')
            localStorage.setItem('vendorEmail', vendor.email)
            localStorage.setItem('vendorUserId', vendor.id.toString())
            localStorage.setItem('vendorProfile', JSON.stringify({
                userId: vendor.id,
                email: vendor.email,
                companyName: vendor.company_name || '',
                picName: vendor.pic_name || '',
                profileImage: vendor.profile_image || ''
            }))

            router.push('/vendor-portal')
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPasswordStep1 = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await requestPasswordReset(forgotData.email)

            if (result.success) {
                alert(result.message + '\n\nKode: ' + result.data?.resetToken)
                setForgotStep(2)
            } else {
                setError(result.error || 'Terjadi kesalahan')
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPasswordStep2 = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (forgotData.newPassword !== forgotData.confirmPassword) {
                setError('Password tidak cocok')
                setLoading(false)
                return
            }

            const result = await resetPassword(
                forgotData.email,
                forgotData.token,
                forgotData.newPassword
            )

            if (result.success) {
                alert(result.message)
                setShowForgotPassword(false)
                setForgotStep(1)
                setForgotData({
                    email: '',
                    token: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                setError(result.error || 'Terjadi kesalahan')
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (registerData.password !== registerData.confirmPassword) {
                setError('Password tidak cocok')
                setLoading(false)
                return
            }

            const result = await registerVendor({
                companyName: registerData.companyName,
                companyType: registerData.companyType,
                email: registerData.email,
                password: registerData.password,
                phone: registerData.phone,
                address: registerData.address,
                city: registerData.city,
                province: registerData.province,
                postalCode: registerData.postalCode,
                fax: registerData.fax,
                picName: registerData.picName,
                picPosition: registerData.picPosition,
                picPhone: registerData.picPhone,
                picEmail: registerData.picEmail,
                npwp: registerData.npwp,
                siup: registerData.siup,
                tdp: registerData.tdp,
                established: registerData.established ? parseInt(registerData.established) : undefined
            })

            if (result.success) {
                alert(result.message)
                setShowRegister(false)
                setEmail(registerData.email)
            } else {
                setError(result.error || 'Terjadi kesalahan')
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Login Form */}
            {!showForgotPassword && !showRegister && (
                <form onSubmit={handleLogin}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="input-group">
                        <label>Email atau No. Handphone *</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Vendor@gmail.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <label>
                            <input type="checkbox" /> Ingat Saya
                        </label>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}
                            className="forgot-password"
                        >
                            Lupa Password
                        </a>
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Loading...' : 'LOGIN'}
                    </button>

                    <p className="register-text">
                        Belum punya akun vendor? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); }}>Daftar Sekarang</a>
                    </p>
                </form>
            )}

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="modal">
                    <h2>Lupa Password</h2>
                    {forgotStep === 1 ? (
                        <form onSubmit={handleForgotPasswordStep1}>
                            {error && <div className="error-message">{error}</div>}
                            <div className="input-group">
                                <label>Email Terdaftar *</label>
                                <input
                                    type="email"
                                    value={forgotData.email}
                                    onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Mengirim...' : 'Kirim Kode Reset'}
                            </button>
                            <button type="button" onClick={() => setShowForgotPassword(false)}>
                                Batal
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPasswordStep2}>
                            {error && <div className="error-message">{error}</div>}
                            <div className="input-group">
                                <label>Kode Reset (6 digit) *</label>
                                <input
                                    type="text"
                                    value={forgotData.token}
                                    onChange={(e) => setForgotData({ ...forgotData, token: e.target.value })}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Password Baru *</label>
                                <input
                                    type="password"
                                    value={forgotData.newPassword}
                                    onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Konfirmasi Password *</label>
                                <input
                                    type="password"
                                    value={forgotData.confirmPassword}
                                    onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Mengubah...' : 'Reset Password'}
                            </button>
                            <button type="button" onClick={() => {
                                setShowForgotPassword(false);
                                setForgotStep(1);
                            }}>
                                Batal
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Register Modal - Formulir Lengkap */}
            {showRegister && (
                <div className="modal register-modal">
                    <h2>Daftar Vendor Baru</h2>
                    <form onSubmit={handleRegister}>
                        {error && <div className="error-message">{error}</div>}

                        <h3>Informasi Perusahaan</h3>
                        <div className="input-group">
                            <label>Nama Perusahaan *</label>
                            <input
                                type="text"
                                value={registerData.companyName}
                                onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                                placeholder="PT Nama Perusahaan"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Jenis Badan Usaha *</label>
                            <select
                                value={registerData.companyType}
                                onChange={(e) => setRegisterData({ ...registerData, companyType: e.target.value })}
                                required
                            >
                                <option value="PT">PT (Perseroan Terbatas)</option>
                                <option value="CV">CV (Commanditaire Vennootschap)</option>
                                <option value="UD">UD (Usaha Dagang)</option>
                                <option value="Koperasi">Koperasi</option>
                                <option value="Yayasan">Yayasan</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>NPWP</label>
                                <input
                                    type="text"
                                    value={registerData.npwp}
                                    onChange={(e) => setRegisterData({ ...registerData, npwp: e.target.value })}
                                    placeholder="00.000.000.0-000.000"
                                />
                            </div>
                            <div className="input-group">
                                <label>Tahun Berdiri</label>
                                <input
                                    type="number"
                                    value={registerData.established}
                                    onChange={(e) => setRegisterData({ ...registerData, established: e.target.value })}
                                    placeholder="2020"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>No. SIUP</label>
                                <input
                                    type="text"
                                    value={registerData.siup}
                                    onChange={(e) => setRegisterData({ ...registerData, siup: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>TDP</label>
                                <input
                                    type="text"
                                    value={registerData.tdp}
                                    onChange={(e) => setRegisterData({ ...registerData, tdp: e.target.value })}
                                />
                            </div>
                        </div>

                        <h3>Alamat Perusahaan</h3>
                        <div className="input-group">
                            <label>Alamat Lengkap *</label>
                            <textarea
                                value={registerData.address}
                                onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                                placeholder="Jalan, Nomor, RT/RW, Kelurahan, Kecamatan"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>Kota/Kabupaten</label>
                                <input
                                    type="text"
                                    value={registerData.city}
                                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                                    placeholder="Jakarta"
                                />
                            </div>
                            <div className="input-group">
                                <label>Provinsi</label>
                                <input
                                    type="text"
                                    value={registerData.province}
                                    onChange={(e) => setRegisterData({ ...registerData, province: e.target.value })}
                                    placeholder="DKI Jakarta"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Kode Pos</label>
                            <input
                                type="text"
                                value={registerData.postalCode}
                                onChange={(e) => setRegisterData({ ...registerData, postalCode: e.target.value })}
                                placeholder="12345"
                            />
                        </div>

                        <h3>Kontak Perusahaan</h3>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Telepon *</label>
                                <input
                                    type="tel"
                                    value={registerData.phone}
                                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                    placeholder="021-12345678"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Fax</label>
                                <input
                                    type="tel"
                                    value={registerData.fax}
                                    onChange={(e) => setRegisterData({ ...registerData, fax: e.target.value })}
                                    placeholder="021-12345679"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email Perusahaan *</label>
                            <input
                                type="email"
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                placeholder="info@perusahaan.com"
                                required
                            />
                        </div>

                        <h3>Penanggung Jawab</h3>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={registerData.picName}
                                    onChange={(e) => setRegisterData({ ...registerData, picName: e.target.value })}
                                    placeholder="Budi Santoso"
                                />
                            </div>
                            <div className="input-group">
                                <label>Jabatan</label>
                                <input
                                    type="text"
                                    value={registerData.picPosition}
                                    onChange={(e) => setRegisterData({ ...registerData, picPosition: e.target.value })}
                                    placeholder="Direktur"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>No. Telepon</label>
                                <input
                                    type="tel"
                                    value={registerData.picPhone}
                                    onChange={(e) => setRegisterData({ ...registerData, picPhone: e.target.value })}
                                    placeholder="0812-3456-7890"
                                />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={registerData.picEmail}
                                    onChange={(e) => setRegisterData({ ...registerData, picEmail: e.target.value })}
                                    placeholder="budi@perusahaan.com"
                                />
                            </div>
                        </div>

                        <h3>Keamanan</h3>
                        <div className="input-group">
                            <label>Password *</label>
                            <input
                                type="password"
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                placeholder="Minimal 6 karakter"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Konfirmasi Password *</label>
                            <input
                                type="password"
                                value={registerData.confirmPassword}
                                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                placeholder="Ulangi password"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Mendaftar...' : 'DAFTAR'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setShowRegister(false)}>
                                Batal
                            </button>
                        </div>

                        <p className="login-text">
                            Sudah punya akun? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(false); }}>Login di sini</a>
                        </p>
                    </form>
                </div>
            )}
        </div>
    )
}
