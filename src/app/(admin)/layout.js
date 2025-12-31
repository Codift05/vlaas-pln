'use client'
import { useState } from 'react'
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

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  min-height: 100vh;

  @media (max-width: 968px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  padding: 32px 40px;
  flex: 1;

  @media (max-width: 968px) {
    padding: 20px;
  }

  @media (max-width: 600px) {
    padding: 15px;
  }
`;

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <ProtectedRoute>
            <LayoutContainer>
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <MainContent>
                    <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <ContentArea>
                        {children}
                    </ContentArea>
                </MainContent>
            </LayoutContainer>
        </ProtectedRoute>
    )
}
