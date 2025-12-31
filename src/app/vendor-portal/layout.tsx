'use client'
import VendorHeader from '../../components/VendorHeader'
import VendorSidebar from '../../components/VendorSidebar'
import VendorProtectedRoute from '../../components/VendorProtectedRoute'
import './VendorLayout.css'

export default function VendorPortalLayout({ children }) {
    return (
        <VendorProtectedRoute>
            <div className="vendor-layout">
                <VendorSidebar />
                <div className="vendor-main-content">
                    <VendorHeader />
                    <main className="vendor-content-area">
                        {children}
                    </main>
                </div>
            </div>
        </VendorProtectedRoute>
    )
}
