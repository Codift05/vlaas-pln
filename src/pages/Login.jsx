import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  return (
    <div className="login-container">
      {/* Left Side - Blue Section */}
      <div className="left-section">
        <div className="logo-container">
          <div className="logo">
            <div className="logo-icon">₴</div>
            <div className="logo-text">PLN VLAAS</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="right-section">
        <div className="menu-icon">
          <div className="menu-line"></div>
          <div className="menu-line"></div>
          <div className="menu-line"></div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <h1 className="title">Masuk ke<br />PLN VLAAS</h1>
          <p className="subtitle">Akses Sistem Manajemen Aset Anda</p>

          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
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
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">Masuk</button>

          <p className="register-text">
            Vendor baru? <a href="#" className="register-link">Daftar di sini</a>
          </p>
        </form>

        <div className="pagination">
          <button className="arrow-btn" type="button">←</button>
          <button className="arrow-btn" type="button">→</button>
          <span className="page-number">01 <span className="page-total">/ 01</span></span>
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
            <p className="dev-mode-info">🔓 Akses penuh ke semua halaman</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
