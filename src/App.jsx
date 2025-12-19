import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManajemenAset from './pages/ManajemenAset'
import DataVendor from './pages/DataVendor'
import Laporan from './pages/Laporan'
import Pengaturan from './pages/Pengaturan'
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
              <DataVendor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/laporan" 
          element={
            <ProtectedRoute>
              <Laporan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pengaturan" 
          element={
            <ProtectedRoute>
              <Pengaturan />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
