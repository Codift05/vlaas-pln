import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [devMode, setDevMode] = useState(localStorage.getItem('devMode') === 'true');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect if this is vendor login based on URL
  const isVendorLogin = location.pathname === '/vendor-login';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Developer Mode - bypass authentication
      if (devMode) {
        if (isVendorLogin) {
          localStorage.setItem('vendorLoggedIn', 'true');
          localStorage.setItem('vendorEmail', email || 'vendor@demo.com');
          navigate('/vendor-portal');
        } else {
          localStorage.setItem('adminLoggedIn', 'true');
          localStorage.setItem('adminEmail', email || 'admin@demo.com');
          navigate('/dashboard');
        }
        setLoading(false);
        return;
      }

      // Validasi input
      if (!email || !password) {
        setError('Email dan password harus diisi');
        setLoading(false);
        return;
      }

      if (isVendorLogin) {
        // Vendor login - simple localStorage for now
        localStorage.setItem('vendorLoggedIn', 'true');
        localStorage.setItem('vendorEmail', email);
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        navigate('/vendor-portal');
      } else {
        // Admin login - Call Supabase authentication
        const result = await loginService(email, password);

        if (result.success) {
          // Login berhasil
          console.log('Login berhasil:', result.data);
          
          // Simpan remember me jika dicentang
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }
          
          // Navigate ke dashboard
          navigate('/dashboard');
        } else {
          // Login gagal
          setError(result.error || 'Email atau password salah');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDevMode = () => {
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    localStorage.setItem('devMode', newDevMode.toString());
    
    // Auto login when developer mode is activated
    if (newDevMode) {
      if (isVendorLogin) {
        localStorage.setItem('vendorLoggedIn', 'true');
        localStorage.setItem('vendorEmail', 'vendor@demo.com');
        navigate('/vendor-portal');
      } else {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminEmail', 'admin@demo.com');
        navigate('/dashboard');
      }
    }
  };

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
          <h1 className="form-title">{isVendorLogin ? 'Login Sebagai Vendor' : 'Log In Akun'}</h1>
          <p className="form-greeting">
            Selamat Datang di <span className="highlight">VLAAS</span>
          </p>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

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
                onChange={(e) => setPassword(e.target.value)}
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
                onChange={(e) => setRememberMe(e.target.checked)}
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
              Belum punya akun vendor? <a href="#" className="register-link">Daftar Sekarang</a>
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

        {/* Developer Mode Toggle */}
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
    </div>
  )
}

export default Login
