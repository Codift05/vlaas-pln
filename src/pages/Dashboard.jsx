import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Package, CheckCircle, Wrench, Users, FileText, TrendingUp, Activity } from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const stats = [
    { title: 'Total Aset', value: '1,234', icon: Package, color: '#3498db', bgColor: '#e3f2fd' },
    { title: 'Aset Aktif', value: '987', icon: CheckCircle, color: '#2ecc71', bgColor: '#e8f5e9' },
    { title: 'Dalam Perbaikan', value: '45', icon: Wrench, color: '#f39c12', bgColor: '#fff3e0' },
    { title: 'Total Vendor', value: '156', icon: Users, color: '#9b59b6', bgColor: '#f3e5f5' },
  ]

  const recentActivities = [
    { action: 'Aset baru ditambahkan', item: 'Transformer 500KVA', time: '2 jam lalu', icon: Package },
    { action: 'Pemeliharaan selesai', item: 'Generator Set A-123', time: '5 jam lalu', icon: CheckCircle },
    { action: 'Vendor terdaftar', item: 'PT Elektrindo Jaya', time: '1 hari lalu', icon: Users },
    { action: 'Laporan dikirim', item: 'Laporan Bulanan Oktober', time: '2 hari lalu', icon: FileText },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header title="Dashboard" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="content-area">
          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="stat-card">
                  <div className="stat-icon-wrapper" style={{ background: stat.bgColor }}>
                    <IconComponent className="stat-icon-svg" style={{ color: stat.color }} strokeWidth={2.5} size={28} />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Statistik Aset Bulanan</h3>
                <TrendingUp size={20} className="card-icon" />
              </div>
              <div className="chart-placeholder">
                <div className="bar-chart">
                  {[65, 85, 75, 95, 70, 90, 80, 88, 92, 78, 85, 95].map((height, index) => (
                    <div key={index} className="bar-wrapper">
                      <div className="bar" style={{ height: `${height}%` }}>
                        <span className="bar-value">{Math.round(height)}</span>
                      </div>
                      <span className="bar-label">{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Status Aset</h3>
                <Activity size={20} className="card-icon" />
              </div>
              <div className="pie-chart-container">
                <div className="pie-chart">
                  <div className="pie-slice"></div>
                </div>
                <div className="pie-center">
                  <div className="pie-total">987</div>
                  <div className="pie-label">Total</div>
                </div>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#2ecc71' }}></span>
                  <span className="legend-text">Aktif</span>
                  <span className="legend-value">80%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#f39c12' }}></span>
                  <span className="legend-text">Perbaikan</span>
                  <span className="legend-value">15%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#e74c3c' }}></span>
                  <span className="legend-text">Tidak Aktif</span>
                  <span className="legend-value">5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="activity-section">
            <div className="card-header">
              <h3 className="card-title">Aktivitas Terkini</h3>
              <FileText size={20} className="card-icon" />
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, index) => {
                const ActivityIcon = activity.icon
                return (
                  <div key={index} className="activity-item">
                    <div className="activity-icon-wrapper">
                      <ActivityIcon className="activity-icon-svg" size={20} strokeWidth={2} />
                    </div>
                    <div className="activity-details">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-item-name">{activity.item}</p>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
