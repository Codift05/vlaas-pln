'use client'
import React, { FC, useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { login as loginService } from '../services/authService'
import { supabase } from '../lib/supabaseClient'
import styled from 'styled-components'

interface Platform {
  logo: string
  name: string
  description: string
}

const LoginContainer = styled.div`
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  /* Left Section - Platform Information */
  .left-section {
    flex: 0 0 45%;
    background: linear-gradient(135deg, #b8e6f5 0%, #d4f1f9 100%);
    padding: 60px 50px;
    overflow-y: auto;
  }

  .sso-header {
    margin-bottom: 40px;
  }

  .sso-title {
    font-size: 42px;
    font-weight: bold;
    color: #1e3c72;
    margin-bottom: 20px;
  }

  .sso-subtitle {
    font-size: 15px;
    color: #555;
    line-height: 1.6;
  }

  .platforms-list {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .platform-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .platform-item:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .platform-icon {
    font-size: 42px;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .platform-info {
    flex: 1;
  }

  .platform-name {
    font-size: 18px;
    font-weight: bold;
    color: #1e3c72;
    margin-bottom: 5px;
  }

  .platform-desc {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
  }

  /* Right Section - Login Form */
  .right-section {
    flex: 0 0 55%;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 80px;
    position: relative;
  }

  .back-button {
    position: absolute;
    top: 40px;
    left: 80px;
  }

  .back-button button {
    background: none;
    border: none;
    color: #1e88e5;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s;
  }

  .back-button button:hover {
    color: #1565c0;
  }

  .login-form-wrapper {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }

  .login-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 35px;
  }

  .vlaas-logo {
    height: 70px;
    width: auto;
    object-fit: contain;
  }

  .login-form {
    width: 100%;
  }

  .form-title {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  .form-greeting {
    color: #666;
    margin-bottom: 35px;
    font-size: 15px;
  }

  .highlight {
    color: #1e88e5;
    font-weight: 600;
  }

  .input-group {
    margin-bottom: 25px;
  }

  .input-label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .required {
    color: #e53935;
  }

  .input-field {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 15px;
    transition: all 0.2s;
    box-sizing: border-box;
    background: #f8f9fa;
  }

  .input-field:focus {
    outline: none;
    border-color: #1e88e5;
    background: white;
  }

  .password-wrapper {
    position: relative;
  }

  .toggle-password {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #666;
  }

  .remember-me input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .forgot-password {
    color: #1e88e5;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }

  .forgot-password:hover {
    text-decoration: underline;
  }

  .login-button {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 1px;
  }

  .login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  }

  .login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Error Message */
  .error-message {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    color: #c33;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .error-icon {
    font-size: 18px;
  }

  .register-text {
    text-align: center;
    margin-top: 25px;
    color: #666;
    font-size: 14px;
  }

  .register-link {
    color: #1e88e5;
    text-decoration: none;
    font-weight: 600;
  }

  .register-link:hover {
    text-decoration: underline;
  }

  .footer {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }

  .footer-logo {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .footer-text {
    font-size: 13px;
    color: #999;
  }

  /* Developer Mode */
  .dev-mode-container {
    position: fixed;
    bottom: 24px;
    right: 75px;
    z-index: 1000;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dev-mode-toggle {
    display: block;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    min-height: 32px;
  }

  .toggle-label {
    font-size: 14px;
    color: #333;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
    order: 2;
    line-height: 32px;
  }

  .dev-mode-toggle input[type="checkbox"] {
    display: none;
  }

  .toggle-slider {
    position: relative;
    width: 60px;
    height: 32px;
    background: #e0e0e0;
    border-radius: 32px;
    transition: all 0.3s ease;
    flex-shrink: 0;
    order: 1;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: 3px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .dev-mode-toggle input[type="checkbox"]:checked + .toggle-slider {
    background: #4cd964;
  }

  .dev-mode-toggle input[type="checkbox"]:checked + .toggle-slider::before {
    transform: translateX(28px);
  }

  .dev-mode-info {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(30, 136, 229, 0.15);
    font-size: 12px;
    color: #1e88e5;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    text-align: center;
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .left-section {
      flex: 0 0 40%;
      padding: 40px 30px;
    }
    
    .right-section {
      flex: 0 0 60%;
      padding: 40px 50px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    
    .left-section {
      flex: none;
      height: auto;
      padding: 30px 20px;
    }
    
    .right-section {
      flex: 1;
      padding: 30px 20px;
    }
    
    .back-button {
      left: 20px;
      top: 20px;
    }
    
    .sso-title {
      font-size: 32px;
    }
    
    .form-title {
      font-size: 26px;
    }
  }

  /* Register Modal Styles */
  .register-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
    overflow-y: auto;
  }

  .register-modal-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .register-modal-header {
    padding: 30px 30px 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
    border-radius: 16px 16px 0 0;
  }

  .register-modal-title {
    font-size: 28px;
    font-weight: bold;
    color: #1e3c72;
    margin: 0;
  }

  .register-modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: #999;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .register-modal-close:hover {
    background: #f5f5f5;
    color: #333;
  }

  .register-modal-body {
    padding: 30px;
  }

  .register-modal-subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 25px;
    font-size: 14px;
  }

  @media (max-width: 640px) {
    .register-modal-card {
      max-width: 100%;
      max-height: 100vh;
      border-radius: 0;
    }

    .register-modal-header {
      padding: 20px;
      border-radius: 0;
    }

    .register-modal-title {
      font-size: 22px;
    }

    .register-modal-body {
      padding: 20px;
    }
  }
`;

const Login: FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [devMode, setDevMode] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false)

  // Register form fields
  const [registerData, setRegisterData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    telepon: '',
    alamat: '',
    kontakPerson: ''
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDevMode(localStorage.getItem('devMode') === 'true')
    }
  }, [])

  const isVendorLogin = pathname === '/vendor-login'
  const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validasi
      if (!registerData.nama || !registerData.email || !registerData.password || !registerData.telepon) {
        setError('Nama, email, password, dan telepon wajib diisi')
        setLoading(false)
        return
      }

      if (registerData.password !== registerData.confirmPassword) {
        setError('Password dan konfirmasi password tidak cocok')
        setLoading(false)
        return
      }

      if (registerData.password.length < 6) {
        setError('Password minimal 6 karakter')
        setLoading(false)
        return
      }

      // 1. Create user account in vendor_users table
      const { data: newUser, error: userError } = await supabase
        .from('vendor_users')
        .insert([{
          email: registerData.email,
          password: registerData.password, // In production, hash this!
          profile_image: null
        }])
        .select()
        .single()

      if (userError) {
        console.error('User creation error:', userError)
        if (userError.code === '23505') {
          setError('Email sudah terdaftar. Gunakan email lain.')
        } else if (userError.message) {
          setError(`Gagal membuat akun: ${userError.message}`)
        } else {
          setError('Gagal membuat akun. Pastikan semua data sudah benar.')
        }
        setLoading(false)
        return
      }

      // 2. Generate vendor ID
      const { data: existingVendors, error: countError } = await supabase
        .from('vendors')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)

      if (countError) throw countError

      let newVendorId = 'VND001'
      if (existingVendors && existingVendors.length > 0) {
        const lastId = existingVendors[0].id
        const lastNumber = parseInt(lastId.replace('VND', ''))
        newVendorId = `VND${String(lastNumber + 1).padStart(3, '0')}`
      }

      // 3. Create vendor profile in vendors table with user_id reference
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert([{
          id: newVendorId,
          user_id: newUser.id, // Link to vendor_users
          nama: registerData.nama,
          email: registerData.email,
          telepon: registerData.telepon,
          alamat: registerData.alamat || '',
          kontak_person: registerData.kontakPerson || '',
          status: 'Aktif'
        }])

      if (vendorError) {
        console.error('Vendor profile error:', vendorError)
        // Rollback: delete user if vendor creation fails
        await supabase.from('vendor_users').delete().eq('id', newUser.id)

        setError(`Gagal membuat profil vendor: ${vendorError.message}`)
        setLoading(false)
        return
      }

      // Registrasi berhasil
      alert(`Registrasi berhasil! ID Vendor Anda: ${newVendorId}\n\nSilakan login dengan email dan password yang sudah didaftarkan.`)

      // Reset form dan kembali ke login
      setRegisterData({
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
        telepon: '',
        alamat: '',
        kontakPerson: ''
      })
      setIsRegisterMode(false)
      setEmail(registerData.email)

    } catch (err) {
      console.error('Register error:', err)
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? err.message
        : 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (devMode) {
        if (isVendorLogin) {
          localStorage.setItem('vendorLoggedIn', 'true')
          localStorage.setItem('vendorEmail', email || 'vendor@demo.com')
          router.push('/vendor-portal')
        } else {
          localStorage.setItem('adminLoggedIn', 'true')
          localStorage.setItem('adminEmail', email || 'admin@demo.com')
          router.push('/dashboard')
        }
        setLoading(false)
        return
      }

      if (!email || !password) {
        setError('Email dan password harus diisi')
        setLoading(false)
        return
      }

      if (isVendorLogin) {
        // Authenticate vendor from vendor_users table
        const { data: user, error: authError } = await supabase
          .from('vendor_users')
          .select('id, email, profile_image')
          .eq('email', email)
          .eq('password', password)
          .single()

        if (authError || !user) {
          setError('Email atau password salah')
          setLoading(false)
          return
        }

        // Get vendor profile data
        const { data: vendorProfile, error: profileError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError || !vendorProfile) {
          setError('Profil vendor tidak ditemukan')
          setLoading(false)
          return
        }

        // Store login session
        localStorage.setItem('vendorLoggedIn', 'true')
        localStorage.setItem('vendorEmail', email)
        localStorage.setItem('vendorUserId', user.id.toString())

        // Store complete profile data
        localStorage.setItem('vendorProfile', JSON.stringify({
          userId: user.id,
          vendorId: vendorProfile.id,
          email: user.email,
          profileImage: user.profile_image || '',
          companyName: vendorProfile.nama,
          picName: vendorProfile.kontak_person,
          nama: vendorProfile.nama,
          alamat: vendorProfile.alamat,
          telepon: vendorProfile.telepon,
          kontak_person: vendorProfile.kontak_person
        }))

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }

        router.push('/vendor-portal')
      } else {
        const result = await loginService(email, password)

        if (result.success) {
          console.log('Login berhasil:', 'data' in result ? result.data : null)

          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true')
          }

          router.push('/dashboard')
        } else {
          setError(('error' in result ? result.error : null) || 'Email atau password salah')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const toggleDevMode = (): void => {
    const newDevMode = !devMode
    setDevMode(newDevMode)
    localStorage.setItem('devMode', newDevMode.toString())

    if (newDevMode) {
      if (isVendorLogin) {
        localStorage.setItem('vendorLoggedIn', 'true')
        localStorage.setItem('vendorEmail', 'vendor@demo.com')
        router.push('/vendor-portal')
      } else {
        localStorage.setItem('adminLoggedIn', 'true')
        localStorage.setItem('adminEmail', 'admin@demo.com')
        router.push('/dashboard')
      }
    }
  }

  const platforms: Platform[] = [
    {
      logo: '/images/Logo SAKTI 3.png',
      name: 'SAKTI',
      description: 'Sistem Arsip & Kontrak Terintegrasi - Platform Digital Terpadu untuk Manajemen Surat Vendor PLN'
    },
    {
      logo: '/images/Logo_PLN.png',
      name: 'PT PLN (Persero)',
      description: 'Perusahaan Listrik Negara - Menerangi Indonesia dengan energi yang andal dan berkelanjutan'
    },
    {
      logo: '/images/Danantara.jpg',
      name: 'Danantara Indonesia',
      description: 'Holding BUMN Indonesia - Mengakselerasi transformasi ekonomi nasional melalui sinergi perusahaan strategis'
    },
    {
      logo: '/images/Logo_UNSRAT.png',
      name: 'Universitas Sam Ratulangi',
      description: 'Program Magang - Kemitraan pendidikan untuk mengembangkan talenta digital Indonesia'
    }
  ]

  return (
    <LoginContainer>
      <div className="left-section">
        <div className="sso-header">
          <h1 className="sso-title">Sistem Manajemen Vendor</h1>
          <p className="sso-subtitle">
            Selamat datang di SAKTI - Platform Digital Terpadu untuk Manajemen Surat dan Aset Vendor PT PLN (Persero).<br />
            Kelola dokumen vendor, aset, dan laporan dengan sistem yang aman, efisien, dan terintegrasi.
          </p>
        </div>

        <div className="platforms-list">
          {platforms.map((platform, index) => (
            <div key={index} className="platform-item">
              <div className="platform-icon">
                <img src={platform.logo} alt={platform.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="platform-info">
                <h3 className="platform-name">{platform.name}</h3>
                <p className="platform-desc">{platform.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="right-section">
        <div className="back-button"></div>

        <div className="login-form-wrapper">
          <div className="login-logo">
            <img src="/images/Logo SAKTI 2.png" alt="SAKTI Logo" className="vlaas-logo" />
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <h1 className="form-title">
              {isVendorLogin ? 'Login Sebagai Vendor' : 'Login Sebagai Admin'}
            </h1>
            <p className="form-greeting">
              Selamat Datang di <span className="highlight">VLAAS</span>
            </p>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <div className="input-group">
              <label className="input-label">
                Email atau No. Handphone <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="example@pln.co.id"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Password <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="input-field"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Ingat Saya</span>
              </label>
              <a href="#" className="forgot-password">Lupa Password</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Memproses...' : 'LOGIN'}
            </button>

            {isVendorLogin ? (
              <p className="register-text">
                Belum punya akun vendor? <a href="#" className="register-link" onClick={(e) => { e.preventDefault(); setIsRegisterMode(true); setError(''); }}>Daftar Sekarang</a>
              </p>
            ) : (
              <p className="register-text">
                Login sebagai vendor? <a href="/vendor-login" className="register-link">Klik di sini</a>
              </p>
            )}
          </form>

          <div className="footer">
            <p className="footer-text">Powered by UPT PLN Manado</p>
          </div>
        </div>

        <div className="dev-mode-container">
          <label className="dev-mode-toggle">
            <input
              type="checkbox"
              checked={devMode}
              onChange={toggleDevMode}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Register Modal Popup */}
      {isRegisterMode && (
        <div className="register-modal-overlay" onClick={() => { setIsRegisterMode(false); setError(''); }}>
          <div className="register-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="register-modal-header">
              <h2 className="register-modal-title">Daftar Vendor Baru</h2>
              <button className="register-modal-close" onClick={() => { setIsRegisterMode(false); setError(''); }}>
                ×
              </button>
            </div>

            <div className="register-modal-body">
              <p className="register-modal-subtitle">
                Selamat Datang di <span className="highlight">VLAAS</span>
              </p>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label className="input-label">
                    Nama Vendor <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="PT Nama Vendor"
                    value={registerData.nama}
                    onChange={(e) => setRegisterData({ ...registerData, nama: e.target.value })}
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="vendor@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Telepon <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={registerData.telepon}
                    onChange={(e) => setRegisterData({ ...registerData, telepon: e.target.value })}
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Alamat
                  </label>
                  <input
                    type="text"
                    placeholder="Alamat lengkap vendor"
                    value={registerData.alamat}
                    onChange={(e) => setRegisterData({ ...registerData, alamat: e.target.value })}
                    className="input-field"
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Kontak Person
                  </label>
                  <input
                    type="text"
                    placeholder="Nama kontak person"
                    value={registerData.kontakPerson}
                    onChange={(e) => setRegisterData({ ...registerData, kontakPerson: e.target.value })}
                    className="input-field"
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="input-field"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Konfirmasi Password <span className="required">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="login-button" disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? 'Memproses...' : 'DAFTAR'}
                </button>

                <p className="register-text">
                  Sudah punya akun? <a href="#" className="register-link" onClick={(e) => { e.preventDefault(); setIsRegisterMode(false); setError(''); }}>Login di sini</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </LoginContainer>
  )
}

export default Login
