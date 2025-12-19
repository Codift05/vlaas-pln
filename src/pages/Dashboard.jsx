import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './Dashboard.css'

function Dashboard() {
  const stats = [
    { title: 'Total Aset', value: '1,234', icon: '📦', color: '#3498db' },
    { title: 'Aset Aktif', value: '987', icon: '✅', color: '#2ecc71' },
    { title: 'Dalam Perbaikan', value: '45', icon: '🔧', color: '#f39c12' },
    { title: 'Total Vendor', value: '156', icon: '👥', color: '#9b59b6' },
  ]

  const recentActivities = [
    { action: 'Aset baru ditambahkan', item: 'Transformer 500KVA', time: '2 jam lalu' },
    { action: 'Pemeliharaan selesai', item: 'Generator Set A-123', time: '5 jam lalu' },
    { action: 'Vendor terdaftar', item: 'PT Elektrindo Jaya', time: '1 hari lalu' },
    { action: 'Laporan dikirim', item: 'Laporan Bulanan Oktober', time: '2 hari lalu' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Dashboard" />
        
        <div className="content-area">
          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                <div className="stat-icon" style={{ background: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-title">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-card">
              <h3 className="card-title">Statistik Aset Bulanan</h3>
              <div className="chart-placeholder">
                <div className="bar-chart">
                  {[65, 85, 75, 95, 70, 90, 80, 88, 92, 78, 85, 95].map((height, index) => (
                    <div key={index} className="bar" style={{ height: `${height}%` }}>
                      <span className="bar-label">{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="card-title">Status Aset</h3>
              <div className="pie-chart">
                <div className="pie-slice slice-1"></div>
                <div className="pie-slice slice-2"></div>
                <div className="pie-slice slice-3"></div>
                <div className="pie-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#2ecc71' }}></span>
                    <span>Aktif (80%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#f39c12' }}></span>
                    <span>Perbaikan (15%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#e74c3c' }}></span>
                    <span>Tidak Aktif (5%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="activity-section">
            <h3 className="card-title">Aktivitas Terkini</h3>
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">📋</div>
                  <div className="activity-details">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-item-name">{activity.item}</p>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
