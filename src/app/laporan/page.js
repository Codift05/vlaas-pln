'use client'
import { useState } from 'react'
import Select from 'react-select'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import ProtectedRoute from '../../components/ProtectedRoute'
import { FileDown, FileText, Clock, CheckCircle, BarChart2, Users, ClipboardList, Hourglass, Target } from 'lucide-react'
import './Laporan.css'

function Laporan() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [dateRange, setDateRange] = useState({ value: 'bulan-ini', label: 'Bulan Ini' })
    const [filterStatus, setFilterStatus] = useState({ value: 'all', label: 'Semua Status' })
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Data dummy untuk KPI
    const kpiData = {
        avgCycleTime: 2.5,
        approvalRate: 85,
        totalDocuments: 156,
        pendingDocuments: 12
    }

    // Data dummy untuk grafik volume bulanan
    const monthlyData = [
        { month: 'Jan', count: 45 },
        { month: 'Feb', count: 52 },
        { month: 'Mar', count: 48 },
        { month: 'Apr', count: 61 },
        { month: 'Mei', count: 55 },
        { month: 'Jun', count: 58 },
        { month: 'Jul', count: 63 },
        { month: 'Agu', count: 59 },
        { month: 'Sep', count: 67 },
        { month: 'Okt', count: 71 },
        { month: 'Nov', count: 68 },
        { month: 'Des', count: 73 }
    ]

    // Data dummy untuk pie chart
    const statusData = {
        approved: 133,
        rejected: 23,
        pending: 12
    }

    const totalStatus = statusData.approved + statusData.rejected + statusData.pending
    const approvedPercent = ((statusData.approved / totalStatus) * 100).toFixed(1)
    const rejectedPercent = ((statusData.rejected / totalStatus) * 100).toFixed(1)
    const pendingPercent = ((statusData.pending / totalStatus) * 100).toFixed(1)

    // Data dummy untuk top vendor
    const topVendors = [
        { nama: 'PT Elektrindo Jaya', totalSurat: 28, ditolak: 3, rate: 89 },
        { nama: 'CV Maju Bersama Electric', totalSurat: 24, ditolak: 2, rate: 92 },
        { nama: 'PT Sentosa Generator', totalSurat: 22, ditolak: 5, rate: 77 },
        { nama: 'CV Kabel Utama Indonesia', totalSurat: 19, ditolak: 1, rate: 95 },
        { nama: 'PT Teknindo Power System', totalSurat: 17, ditolak: 4, rate: 76 }
    ]

    const maxCount = Math.max(...monthlyData.map(d => d.count))

    const handleExport = (format) => {
        alert(`Mengekspor laporan dalam format ${format}...`)
        // Nanti bisa ditambahkan logika untuk export ke CSV/PDF
    }

    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="main-content">
                    <Header title="Laporan & Analitik" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                    <div className="content-area">
                        {/* Header & Filter Section */}
                        <div className="laporan-header">
                            <div className="filter-controls">
                                <div className="filter-group">
                                    <label>Periode:</label>
                                    <div style={{ minWidth: 180 }}>
                                        <Select
                                            classNamePrefix="modern-select"
                                            value={dateRange}
                                            onChange={setDateRange}
                                            options={[
                                                { value: 'hari-ini', label: 'Hari Ini' },
                                                { value: 'minggu-ini', label: 'Minggu Ini' },
                                                { value: 'bulan-ini', label: 'Bulan Ini' },
                                                { value: 'tahun-ini', label: 'Tahun Ini' },
                                                { value: 'custom', label: 'Custom Range' },
                                            ]}
                                            isSearchable={false}
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
                                                    borderRadius: 14,
                                                    background: 'rgba(255,255,255,0.9)',
                                                    borderColor: state.isFocused ? '#7eb9d9' : 'rgba(200,210,220,0.5)',
                                                    boxShadow: state.isFocused ? '0 4px 16px rgba(126,185,217,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                                                    minHeight: 44,
                                                    fontFamily: 'Inter, sans-serif',
                                                    fontWeight: 500,
                                                    fontSize: 15,
                                                    color: '#2b3f50',
                                                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    borderRadius: 10,
                                                    background: state.isSelected ? '#e3f2fd' : state.isFocused ? '#f4f8fb' : 'white',
                                                    color: '#2b3f50',
                                                    fontWeight: state.isSelected ? 700 : 500,
                                                    fontSize: 15,
                                                    fontFamily: 'Inter, sans-serif',
                                                    padding: '10px 18px',
                                                    cursor: 'pointer',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    borderRadius: 14,
                                                    boxShadow: '0 8px 32px rgba(126,185,217,0.10)',
                                                    marginTop: 4,
                                                    zIndex: 9999,
                                                    position: 'absolute',
                                                }),
                                            }}
                                        />
                                    </div>
                                </div>

                                {dateRange.value === 'custom' && (
                                    <div className="date-range">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="date-input"
                                        />
                                        <span>-</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                )}

                                <div className="filter-group">
                                    <label>Filter Status:</label>
                                    <div style={{ minWidth: 180 }}>
                                        <Select
                                            classNamePrefix="modern-select"
                                            value={filterStatus}
                                            onChange={setFilterStatus}
                                            options={[
                                                { value: 'all', label: 'Semua Status' },
                                                { value: 'approved', label: 'Approved' },
                                                { value: 'rejected', label: 'Rejected' },
                                                { value: 'pending', label: 'Pending' },
                                            ]}
                                            isSearchable={false}
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
                                                    borderRadius: 14,
                                                    background: 'rgba(255,255,255,0.9)',
                                                    borderColor: state.isFocused ? '#7eb9d9' : 'rgba(200,210,220,0.5)',
                                                    boxShadow: state.isFocused ? '0 4px 16px rgba(126,185,217,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                                                    minHeight: 44,
                                                    fontFamily: 'Inter, sans-serif',
                                                    fontWeight: 500,
                                                    fontSize: 15,
                                                    color: '#2b3f50',
                                                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    borderRadius: 10,
                                                    background: state.isSelected ? '#e3f2fd' : state.isFocused ? '#f4f8fb' : 'white',
                                                    color: '#2b3f50',
                                                    fontWeight: state.isSelected ? 700 : 500,
                                                    fontSize: 15,
                                                    fontFamily: 'Inter, sans-serif',
                                                    padding: '10px 18px',
                                                    cursor: 'pointer',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    borderRadius: 14,
                                                    boxShadow: '0 8px 32px rgba(126,185,217,0.10)',
                                                    marginTop: 4,
                                                    zIndex: 20,
                                                }),
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="export-buttons">
                                <button className="btn-export csv" onClick={() => handleExport('CSV')}>
                                    <FileDown size={18} /> Export CSV
                                </button>
                                <button className="btn-export pdf" onClick={() => handleExport('PDF')}>
                                    <FileText size={18} /> Export PDF
                                </button>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="stats-grid">
                            {[
                                {
                                    title: 'Rata-rata Waktu Proses',
                                    value: `${kpiData.avgCycleTime} Hari`,
                                    icon: Clock,
                                    color: '#7c4dff',
                                    bgColor: '#ede7f6',
                                    badge: { text: '↓ 0.3 hari lebih cepat', type: 'positive' },
                                },
                                {
                                    title: 'Rasio Persetujuan',
                                    value: `${kpiData.approvalRate}%`,
                                    icon: CheckCircle,
                                    color: '#2ecc71',
                                    bgColor: '#e8f5e9',
                                    badge: { text: '↑ 3% dari bulan lalu', type: 'positive' },
                                },
                                {
                                    title: 'Total Dokumen',
                                    value: kpiData.totalDocuments,
                                    icon: ClipboardList,
                                    color: '#9b59b6',
                                    bgColor: '#f3e5f5',
                                    badge: { text: 'Periode ini', type: 'neutral' },
                                },
                                {
                                    title: 'Menunggu Review',
                                    value: kpiData.pendingDocuments,
                                    icon: Hourglass,
                                    color: '#f39c12',
                                    bgColor: '#fff8e1',
                                    badge: { text: 'Perlu perhatian', type: 'warning' },
                                },
                            ].map((stat, index) => {
                                const IconComponent = stat.icon;
                                return (
                                    <div key={index} className="stat-card">
                                        <div className="stat-icon-wrapper" style={{ background: stat.bgColor }}>
                                            <IconComponent className="stat-icon-svg" style={{ color: stat.color }} strokeWidth={2.5} size={28} />
                                        </div>
                                        <div className="stat-info">
                                            <h3 className="stat-value">{stat.value}</h3>
                                            <p className="stat-title">{stat.title}</p>
                                            {stat.badge && (
                                                <span className={`stat-badge ${stat.badge.type}`}>{stat.badge.text}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts Section */}
                        <div className="charts-container">
                            {/* Bar Chart - Volume Bulanan */}
                            <div className="chart-card large">
                                <div className="chart-header">
                                    <h3><BarChart2 size={20} style={{ display: 'inline', marginRight: '8px' }} /> Volume Dokumen Bulanan</h3>
                                    <span className="chart-subtitle">Tren beban kerja sepanjang tahun</span>
                                </div>
                                <div className="bar-chart-container">
                                    {monthlyData.map((data, index) => (
                                        <div key={index} className="bar-wrapper">
                                            <div
                                                className="bar-laporan"
                                                style={{ height: `${(data.count / maxCount) * 100}%` }}
                                            >
                                                <span className="bar-value">{data.count}</span>
                                            </div>
                                            <span className="bar-label">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pie Chart - Komposisi Keputusan */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3><Target size={20} style={{ display: 'inline', marginRight: '8px' }} /> Komposisi Keputusan</h3>
                                    <span className="chart-subtitle">Distribusi status dokumen</span>
                                </div>
                                <div className="pie-chart-container">
                                    <div className="pie-chart">
                                        <svg viewBox="0 0 100 100" className="pie-svg">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="#2ecc71"
                                                strokeWidth="20"
                                                strokeDasharray={`${approvedPercent * 2.51} ${251 - approvedPercent * 2.51}`}
                                                strokeDashoffset="0"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="#e74c3c"
                                                strokeWidth="20"
                                                strokeDasharray={`${rejectedPercent * 2.51} ${251 - rejectedPercent * 2.51}`}
                                                strokeDashoffset={`-${approvedPercent * 2.51}`}
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="#f39c12"
                                                strokeWidth="20"
                                                strokeDasharray={`${pendingPercent * 2.51} ${251 - pendingPercent * 2.51}`}
                                                strokeDashoffset={`-${(approvedPercent + rejectedPercent) * 2.51}`}
                                            />
                                        </svg>
                                    </div>
                                    <div className="pie-legend">
                                        <div className="legend-item">
                                            <span className="legend-color approved"></span>
                                            <span className="legend-text">Approved ({approvedPercent}%)</span>
                                            <span className="legend-count">{statusData.approved}</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-color rejected"></span>
                                            <span className="legend-text">Rejected ({rejectedPercent}%)</span>
                                            <span className="legend-count">{statusData.rejected}</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-color pending"></span>
                                            <span className="legend-text">Pending ({pendingPercent}%)</span>
                                            <span className="legend-count">{statusData.pending}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vendor Insights */}
                        <div className="vendor-insights">
                            <div className="insights-header">
                                <h3><Users size={20} style={{ display: 'inline', marginRight: '8px' }} /> Top 5 Vendor Teraktif</h3>
                                <span className="insights-subtitle">Vendor dengan volume dokumen tertinggi</span>
                            </div>
                            <div className="vendor-table-container">
                                <table className="vendor-insights-table">
                                    <thead>
                                        <tr>
                                            <th>Peringkat</th>
                                            <th>Nama Vendor</th>
                                            <th>Total Surat</th>
                                            <th>Ditolak</th>
                                            <th>Success Rate</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topVendors.map((vendor, index) => (
                                            <tr key={index}>
                                                <td className="rank">
                                                    <span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span>
                                                </td>
                                                <td className="vendor-name-cell">{vendor.nama}</td>
                                                <td className="text-center">{vendor.totalSurat}</td>
                                                <td className="text-center rejected-count">{vendor.ditolak}</td>
                                                <td className="text-center">
                                                    <div className="rate-bar">
                                                        <div
                                                            className="rate-fill"
                                                            style={{
                                                                width: `${vendor.rate}%`,
                                                                backgroundColor: vendor.rate >= 90 ? '#2ecc71' : vendor.rate >= 80 ? '#f39c12' : '#e74c3c'
                                                            }}
                                                        ></div>
                                                        <span className="rate-text">{vendor.rate}%</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`status-badge-vendor ${vendor.rate >= 85 ? 'excellent' : 'needs-improvement'}`}>
                                                        {vendor.rate >= 85 ? 'Excellent' : 'Needs Review'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default Laporan
