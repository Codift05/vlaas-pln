import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManajemenAset from './pages/ManajemenAset'
import DataVendor from './pages/DataVendor'
import Laporan from './pages/Laporan'
import Pengaturan from './pages/Pengaturan'
import VendorLayout from './pages/VendorLayout'
import VendorDashboard from './pages/VendorDashboard'
import VendorPengajuan from './pages/VendorPengajuan'
import VendorProfile from './pages/VendorProfile'
import './App.css'

// Protected Route for Admin
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  const devMode = localStorage.getItem('devMode') === 'true'
  return (isLoggedIn || devMode) ? children : <Navigate to="/" />
}

// Protected Route for Vendor
function VendorProtectedRoute({ children }) {
  const isVendorLoggedIn = localStorage.getItem('vendorLoggedIn')
  return isVendorLoggedIn ? children : <Navigate to="/vendor-login" />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
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

        {/* Vendor Routes - using same Login component */}
        <Route path="/vendor-login" element={<Login />} />
        <Route 
          path="/vendor-portal" 
          element={
            <VendorProtectedRoute>
              <VendorLayout />
            </VendorProtectedRoute>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="pengajuan" element={<VendorPengajuan />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
