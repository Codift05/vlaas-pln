'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, User } from 'lucide-react'
import styled from 'styled-components'

const VendorSidebarWrapper = styled.aside`
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #5a9dc4 0%, #7eb9d9 50%, #8ac4dd 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  transition: transform 0.3s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.2);

  .vendor-sidebar-header {
    height: 80px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.08);
  }

  .vendor-sidebar-logo {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .vendor-sidebar-logo-img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    background: white;
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .vendor-sidebar-logo-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .vendor-sidebar-logo-text {
    font-size: 20px;
    font-weight: 800;
    color: white;
    letter-spacing: 0.5px;
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  .vendor-sidebar-logo-desc {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.75);
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.3px;
  }

  .vendor-nav {
    flex: 1;
    padding: 20px 0;
    overflow-y: auto;
  }

  .vendor-nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 24px;
    margin: 4px 12px;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border-radius: 12px;
    border-left: 3px solid transparent;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  .vendor-nav-item:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
    transform: translateX(4px);
    border-left-color: rgba(255, 255, 255, 0.5);
  }

  .vendor-nav-item.active {
    background: rgba(255, 255, 255, 0.18);
    color: white;
    border-left-color: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .vendor-nav-icon {
    color: currentColor;
    flex-shrink: 0;
  }

  .vendor-nav-text {
    flex: 1;
  }

  .vendor-sidebar-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .vendor-logout-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
    padding: 15px 25px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }

  .vendor-logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  /* Scrollbar Styling */
  .vendor-nav::-webkit-scrollbar {
    width: 6px;
  }

  .vendor-nav::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  .vendor-nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .vendor-nav::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    transform: translateX(-100%);

    &.active {
      transform: translateX(0);
    }
  }
`;

function VendorSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { path: '/vendor-portal', icon: Home, label: 'Dashboard' },
    { path: '/vendor-portal/pengajuan', icon: FileText, label: 'Buat Pengajuan' },
    { path: '/vendor-portal/profile', icon: User, label: 'Profil Perusahaan' },
  ]

  return (
    <VendorSidebarWrapper className="vendor-sidebar">
      <div className="vendor-sidebar-header">
        <div className="vendor-sidebar-logo">
          <img src="/images/Logo_vlaas.png" alt="VLAAS Logo" className="vendor-sidebar-logo-img" />
          <div className="vendor-sidebar-logo-info">
            <div className="vendor-sidebar-logo-text">PLN VLAAS</div>
            <div className="vendor-sidebar-logo-desc">Vendor Management</div>
          </div>
        </div>
      </div>

      <nav className="vendor-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.path === '/vendor-portal'
            ? pathname === '/vendor-portal'
            : pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`vendor-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="vendor-nav-icon" />
              <span className="vendor-nav-text">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </VendorSidebarWrapper>
  )
}

export default VendorSidebar
