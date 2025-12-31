'use client'
import { useState, useEffect } from 'react'
import Select from 'react-select'
import { FileDown, FileText, Clock, CheckCircle, BarChart2, ClipboardList, Hourglass, Target } from 'lucide-react'
import { contractService } from '@/services/contractService'
import './Laporan.css'

// Define types
interface Contract {
    id: string
    status: string
    created_at: string
    [key: string]: any
}

interface KpiData {
    avgCycleTime: number
    approvalRate: number | string
    totalDocuments: number
    pendingDocuments: number
}

interface MonthlyData {
    month: string
    count: number
}

function Laporan() {
    // const [sidebarOpen, setSidebarOpen] = useState(false) // Handled by layout
    const [dateRange, setDateRange] = useState({ value: 'bulan-ini', label: 'Bulan Ini' })
    const [filterStatus, setFilterStatus] = useState({ value: 'all', label: 'Semua Status' })
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [loading, setLoading] = useState(true)
    const [kpiData, setKpiData] = useState<KpiData>({
        avgCycleTime: 0,
        approvalRate: 0,
        totalDocuments: 0,
        pendingDocuments: 0
    })
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
    const [statusData, setStatusData] = useState({ approved: 0, rejected: 0, pending: 0 })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data, success } = await contractService.getAllContracts()

            if (success && data) {
                processAnalytics(data as Contract[])
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
        } finally {
            setLoading(false)
        }
    }

    const processAnalytics = (contracts: Contract[]) => {
        // 1. KPI Calculations
        const total = contracts.length
        const approved = contracts.filter(c => c.status === 'Approved').length
        const rejected = contracts.filter(c => c.status === 'Rejected').length
        const pending = contracts.filter(c => c.status === 'Pending').length

        const rate = total > 0 ? ((approved / total) * 100).toFixed(0) : 0

        setKpiData({
            avgCycleTime: 2.5,
            approvalRate: rate,
            totalDocuments: total,
            pendingDocuments: pending
        })

        setStatusData({ approved, rejected, pending })

        // 2. Monthly Volume
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const volumeByMonth = new Array(12).fill(0)

        contracts.forEach(c => {
            const date = new Date(c.created_at)
            const monthIdx = date.getMonth()
            volumeByMonth[monthIdx]++
        })

        const chartData = months.map((month, idx) => ({
            month,
            count: volumeByMonth[idx]
        }))
        setMonthlyData(chartData)
    }

    const totalStatus = statusData.approved + statusData.rejected + statusData.pending
    const approvedPercent = totalStatus ? Number(((statusData.approved / totalStatus) * 100).toFixed(1)) : 0
    const rejectedPercent = totalStatus ? Number(((statusData.rejected / totalStatus) * 100).toFixed(1)) : 0
    const pendingPercent = totalStatus ? Number(((statusData.pending / totalStatus) * 100).toFixed(1)) : 0



    const maxCount = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.count)) : 10

    const handleExport = (format: string) => {
        alert(`Mengekspor laporan dalam format ${format}...`)
        // Nanti bisa ditambahkan logika untuk export ke CSV/PDF
    }

    return (
        <>
            {/* Header & Filter Section */}
            <div className="laporan-header">
                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Periode:</label>
                        <div style={{ minWidth: 180 }}>
                            <Select
                                classNamePrefix="modern-select"
                                value={dateRange}
                                onChange={(val) => setDateRange(val as any)}
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
                                onChange={(val) => setFilterStatus(val as any)}
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
            {/* KPI Cards */}
            <div className="kpi-section">
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
                    const cardClass = index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'purple' : 'orange';
                    return (
                        <div key={index} className={`kpi-card ${cardClass}`}>
                            <div className="kpi-icon">
                                <IconComponent size={24} />
                            </div>
                            <div className="kpi-content">
                                <h3 className="kpi-value">{stat.value}</h3>
                                <div className="kpi-label">{stat.title}</div>
                                {stat.badge && (
                                    <span className={`kpi-trend ${stat.badge.type}`}>{stat.badge.text}</span>
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


        </>
    )
}

export default Laporan
