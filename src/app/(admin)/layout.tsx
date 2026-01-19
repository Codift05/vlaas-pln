'use client'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import ProtectedRoute from '../../components/ProtectedRoute'

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #b5dced 0%, #d4e7f5 50%, #e8e3f5 100%);
  background-attachment: fixed;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 15% 20%, rgba(181, 220, 237, 0.3), transparent 35%),
      radial-gradient(circle at 85% 75%, rgba(232, 227, 245, 0.25), transparent 35%);
    pointer-events: none;
    z-index: 0;
  }
`;

const MainContent = styled.div<{ $isExpanded: boolean }>`
  flex: 1;
  margin-left: ${props => props.$isExpanded ? '15rem' : '5rem'};
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  min-height: 100vh;

  /* Zoom 110-125% detection - effective width reduces */
  @media (max-width: 1536px) {
    margin-left: ${props => props.$isExpanded ? '14rem' : '4.5rem'};
  }

  @media (max-width: 1400px) {
    margin-left: ${props => props.$isExpanded ? '13rem' : '4.5rem'};
  }

  @media (max-width: 1200px) {
    margin-left: 0 !important;
  }

  @media (max-width: 968px) {
    margin-left: 0 !important;
  }
`;

const ContentArea = styled.div`
  padding: clamp(1.25rem, 2vw, 2.5rem) clamp(1.5rem, 2.5vw, 2.5rem);
  flex: 1;

  @media (max-width: 1400px) {
    padding: clamp(1rem, 1.5vw, 2rem);
  }

  @media (max-width: 968px) {
    padding: 1.25rem;
  }

  @media (max-width: 600px) {
    padding: 0.938rem;
  }
`;

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile drawer
  const [isExpanded, setIsExpanded] = useState(false) // Desktop mini/full
  const [isHydrated, setIsHydrated] = useState(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarExpanded')
    if (saved !== null) {
      setIsExpanded(saved === 'true')
    }
    setIsHydrated(true)
  }, [])

  // Save sidebar state to localStorage when changed
  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem('sidebarExpanded', String(newState))
  }

  return (
    <ProtectedRoute>
      <LayoutContainer>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isExpanded={isExpanded}
          toggleSidebar={toggleSidebar}
        />
        <MainContent $isExpanded={isExpanded}>
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} isExpanded={isExpanded} />
          <ContentArea>
            {children}
          </ContentArea>
        </MainContent>
      </LayoutContainer>
    </ProtectedRoute>
  )
}
