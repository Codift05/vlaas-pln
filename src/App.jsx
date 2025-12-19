import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManajemenAset from './pages/ManajemenAset'
import './App.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  const devMode = localStorage.getItem('devMode') === 'true'
  return (isLoggedIn || devMode) ? children : <Navigate to="/" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aset" 
          element={
            <ProtectedRoute>
              <ManajemenAset />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vendor" 
          element={
            <ProtectedRoute>
              <div style={{ padding: '50px', textAlign: 'center' }}>
                <h1>Halaman Data Vendor</h1>
                <p>Dalam Pengembangan...</p>
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/laporan" 
          element={
            <ProtectedRoute>
              <div style={{ padding: '50px', textAlign: 'center' }}>
                <h1>Halaman Laporan</h1>
                <p>Dalam Pengembangan...</p>
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pengaturan" 
          element={
            <ProtectedRoute>
              <div style={{ padding: '50px', textAlign: 'center' }}>
                <h1>Halaman Pengaturan</h1>
                <p>Dalam Pengembangan...</p>
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
