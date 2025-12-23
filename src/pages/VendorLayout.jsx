import { Outlet } from 'react-router-dom'
import VendorHeader from '../components/VendorHeader'
import VendorSidebar from '../components/VendorSidebar'
import './VendorLayout.css'

function VendorLayout() {
  return (
    <div className="vendor-layout">
      <VendorSidebar />
      <div className="vendor-main-content">
        <VendorHeader />
        <main className="vendor-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default VendorLayout
