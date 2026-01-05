// ...existing code from previous patch (Next.js styled-components version)...
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Users, FileBarChart } from 'lucide-react'
import styled from 'styled-components'

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }

  @media (max-width: 968px) {
    display: block;
    &.active {
      opacity: 1;
    }
  }
`;

const SidebarWrapper = styled.div`
  width: ${props => props.$isExpanded ? '280px' : '88px'};
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: none; /* Removed to prevent shadow on Header */
  z-index: 1000;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid #e2e8f0;
  overflow: hidden;

  .sidebar-header {
    height: 80px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: ${props => props.$isExpanded ? 'flex-start' : 'center'};
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    justify-content: ${props => props.$isExpanded ? 'flex-start' : 'center'};
  }

  .sidebar-logo-img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    background: transparent;
    flex-shrink: 0;
  }

  .sidebar-logo-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    opacity: ${props => props.$isExpanded ? 1 : 0};
    visibility: ${props => props.$isExpanded ? 'visible' : 'hidden'};
    transition: opacity 0.2s, visibility 0.2s;
    white-space: nowrap;
    overflow: hidden;
  }

  .sidebar-logo-text {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    font-family: var(--font-inter);
    line-height: 1.2;
  }

  .sidebar-logo-desc {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    font-family: var(--font-inter);
  }

  .sidebar-nav {
    flex: 1;
    padding: 24px 12px;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border-radius: 12px;
    font-family: var(--font-inter);
    justify-content: ${props => props.$isExpanded ? 'flex-start' : 'center'};
    height: 48px;
  }

  .nav-item:hover {
    background: #f8fafc;
    color: #3b82f6;
  }

  .nav-item.active {
    background: #eff6ff;
    color: #3b82f6;
    font-weight: 600;
  }

  .nav-icon-svg {
    flex-shrink: 0;
    transition: color 0.2s;
  }

  .nav-text {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    opacity: ${props => props.$isExpanded ? 1 : 0};
    visibility: ${props => props.$isExpanded ? 'visible' : 'hidden'};
    transition: opacity 0.2s;
    width: ${props => props.$isExpanded ? 'auto' : 0};
  }

  @media (max-width: 968px) {
    width: 280px;
    transform: translateX(-100%);
    &.open {
      transform: translateX(0);
    }
    
    .sidebar-header { justify-content: flex-start; }
    .sidebar-logo { justify-content: flex-start; }
    .sidebar-logo-info { opacity: 1; visibility: visible; }
    .nav-item { justify-content: flex-start; }
    .nav-text { opacity: 1; visibility: visible; width: auto; }
  }
`;


function Sidebar({ isOpen, onClose, isExpanded, toggleSidebar }) {
  const pathname = usePathname();
  const isActive = (path) => pathname === path ? 'active' : '';

  const handleNavClick = () => {
    if (window.innerWidth <= 968 && onClose) onClose();
  };

  return (
    <>
      <Overlay className={isOpen ? 'active' : ''} onClick={onClose} />
      <SidebarWrapper className={isOpen ? 'open' : ''} $isExpanded={isExpanded}>
        <div className="sidebar-header" onClick={toggleSidebar} title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}>
          <div className="sidebar-logo">
            <img src="/images/Logo_vlaas.png" alt="VLAAS Logo" className="sidebar-logo-img" />
            <div className="sidebar-logo-info">
              <div className="sidebar-logo-text">PLN VLAAS</div>
              <div className="sidebar-logo-desc">Vendor Management</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className={`nav-item ${isActive('/dashboard')}`} onClick={handleNavClick}>
            <LayoutDashboard className="nav-icon-svg" size={22} strokeWidth={2} />
            <span className="nav-text">Dashboard</span>
          </Link>

          <Link href="/aset" className={`nav-item ${isActive('/aset')}`} onClick={handleNavClick}>
            <Package className="nav-icon-svg" size={22} strokeWidth={2} />
            <span className="nav-text">Manajemen Kontrak</span>
          </Link>

          <Link href="/vendor" className={`nav-item ${isActive('/vendor')}`} onClick={handleNavClick}>
            <Users className="nav-icon-svg" size={22} strokeWidth={2} />
            <span className="nav-text">Data Vendor</span>
          </Link>

          <Link href="/laporan" className={`nav-item ${isActive('/laporan')}`} onClick={handleNavClick}>
            <FileBarChart className="nav-icon-svg" size={22} strokeWidth={2} />
            <span className="nav-text">Laporan</span>
          </Link>
        </nav>
      </SidebarWrapper>
    </>
  );
}

export default Sidebar;
