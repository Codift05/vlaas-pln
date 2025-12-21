import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [devMode, setDevMode] = useState(localStorage.getItem('devMode') === 'true')

  const handleLogin = (e) => {
    e.preventDefault()
    // Simulasi login - nanti bisa diganti dengan API call
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true')
      navigate('/dashboard')
    }
  }

  const toggleDevMode = () => {
    const newDevMode = !devMode
    setDevMode(newDevMode)
    localStorage.setItem('devMode', newDevMode.toString())
    if (newDevMode) {
      navigate('/dashboard')
    }
  }

  const platforms = [
    {
      logo: '/images/Logo_vlaas.png',
      name: 'VLAAS',
      description: 'Vendor Letter Archive & Approval System - Platform Digital Terpadu untuk Manajemen Surat Vendor PLN'
    },
    {
      logo: '/images/Logo_PLN.png',
      name: 'PT PLN (Persero)',
      description: 'Perusahaan Listrik Negara - Menerangi Indonesia dengan energi yang andal dan berkelanjutan'
    },
    {
      logo: '/images/Logo_BUMN.png',
      name: 'Badan Usaha Milik Negara',
      description: 'BUMN Untuk Indonesia - Berkarya untuk negeri, melayani dengan hati'
    },
    {
      logo: '/images/Logo_UNSRAT.png',
      name: 'Universitas Sam Ratulangi',
      description: 'Program Magang - Kemitraan pendidikan untuk mengembangkan talenta digital Indonesia'
    }
  ]

  return (
    <div className="login-container">
      {/* Left Side - Platform Information */}
      <div className="left-section">
        <div className="sso-header">
          <h1 className="sso-title">Sistem Manajemen Vendor</h1>
          <p className="sso-subtitle">
            Selamat datang di VLAAS - Platform Digital Terpadu untuk Manajemen Surat dan Aset Vendor PT PLN (Persero).<br />
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

      {/* Right Side - Login Form */}
      <div className="right-section">
        <div className="back-button">
        </div>

        <div className="login-form-wrapper">
          <div className="login-logo">
            <img src="/images/Logo_vlaas.png" alt="VLAAS Logo" className="vlaas-logo" />
          </div>

          <form className="login-form" onSubmit={handleLogin}>
          <h1 className="form-title">Log In Akun</h1>
          <p className="form-greeting">
            Selamat Datang di <span className="highlight">VLAAS</span>
          </p>

          <div className="input-group">
            <label className="input-label">
              Email atau No. Handphone <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="example@pln.co.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
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
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Ingat Saya</span>
            </label>
            <a href="#" className="forgot-password">Lupa Password</a>
          </div>

          <button type="submit" className="login-button">LOGIN</button>

          <p className="register-text">
            Belum Punya Akun? <a href="#" className="register-link">Daftar</a>
          </p>
        </form>

        <div className="footer">
          <p className="footer-text">Powered by UPT PLN Manado</p>
        </div>
        </div>

        {/* Developer Mode Toggle */}
        <div className="dev-mode-container">
          <label className="dev-mode-toggle">
            <input 
              type="checkbox" 
              checked={devMode}
              onChange={toggleDevMode}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Developer Mode</span>
          </label>
          {devMode && (
            <p className="dev-mode-info">Akses penuh ke semua halaman</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
