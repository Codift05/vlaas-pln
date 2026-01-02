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
    // Untuk chart perbandingan status per bulan
    interface MonthlyCompareData {
        month: string;
        dalamProses: number;
        terbayar: number;
    }
    const [monthlyCompareData, setMonthlyCompareData] = useState<MonthlyCompareData[]>([])
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
    const [budgetData, setBudgetData] = useState({
        terkontrak: 0,
        dalamProses: 0,
        selesai: 0,
        dalamPemeriksaan: 0,
        telahDiperiksa: 0,
        terbayar: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await contractService.getAllContracts()

            if (result.success) {
                processAnalytics((result as any).data as Contract[])
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
        const approved = contracts.filter(c => c.status === 'Telah Diperiksa' || c.status === 'Selesai' || c.status === 'Terbayar').length
        const pending = contracts.filter(c => c.status === 'Dalam Pemeriksaan' || c.status === 'Dalam Proses Pekerjaan').length

        // Simulating approval rate based on 'completed' vs total
        const rate = total > 0 ? ((approved / total) * 100).toFixed(0) : 0

        setKpiData({
            avgCycleTime: 2.5,
            approvalRate: rate,
            totalDocuments: total,
            pendingDocuments: pending
        })

        // 2. Budget Distribution Calculation
        const buckets = {
            terkontrak: 0,
            dalamProses: 0,
            selesai: 0,
            dalamPemeriksaan: 0,
            telahDiperiksa: 0,
            terbayar: 0
        }

        contracts.forEach(c => {
            const amount = Number(c.amount) || 0
            switch (c.status) {
                case 'Terkontrak':
                case 'Aktif': // Handle legacy data
                    buckets.terkontrak += amount;
                    break;
                case 'Dalam Proses Pekerjaan': buckets.dalamProses += amount; break;
                case 'Selesai': buckets.selesai += amount; break;
                case 'Dalam Pemeriksaan': buckets.dalamPemeriksaan += amount; break;
                case 'Telah Diperiksa': buckets.telahDiperiksa += amount; break;
                case 'Terbayar': buckets.terbayar += amount; break;
                default: break; // Ignore unknowns or 'Aktif' legacy
            }
        })

        setBudgetData(buckets)

        // 3. Monthly Volume & Perbandingan Status
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const volumeByMonth = new Array(12).fill(0)
        // Untuk chart perbandingan
        const compareByMonth = Array.from({ length: 12 }, () => ({ dalamProses: 0, terbayar: 0 }))

        contracts.forEach(c => {
            const date = new Date(c.created_at)
            const monthIdx = date.getMonth()
            volumeByMonth[monthIdx]++
            if (c.status === 'Dalam Proses Pekerjaan') compareByMonth[monthIdx].dalamProses++
            if (c.status === 'Terbayar') compareByMonth[monthIdx].terbayar++
        })

        const chartData = months.map((month, idx) => ({
            month,
            count: volumeByMonth[idx]
        }))
        setMonthlyData(chartData)

        const compareChartData = months.map((month, idx) => ({
            month,
            dalamProses: compareByMonth[idx].dalamProses,
            terbayar: compareByMonth[idx].terbayar
        }))
        setMonthlyCompareData(compareChartData)
    }

    const totalBudget = Object.values(budgetData).reduce((a, b) => a + b, 0);

    const getPercent = (value: number) => {
        if (totalBudget === 0) return 0;
        return ((value / totalBudget) * 100);
    };

    // Calculate segments for Pie Chart
    const segments = [
        { label: 'Terkontrak', value: budgetData.terkontrak, color: '#3b82f6' }, // Blue
        { label: 'Dalam Proses', value: budgetData.dalamProses, color: '#f59e0b' }, // Amber
        { label: 'Selesai', value: budgetData.selesai, color: '#10b981' }, // Emerald
        { label: 'Dalam Pemeriksaan', value: budgetData.dalamPemeriksaan, color: '#8b5cf6' }, // Violet
        { label: 'Telah Diperiksa', value: budgetData.telahDiperiksa, color: '#06b6d4' }, // Cyan
        { label: 'Terbayar', value: budgetData.terbayar, color: '#6366f1' } // Indigo
    ];

    let currentOffset = 0;
    const pieSegments = segments.map(seg => {
        const percent = getPercent(seg.value);
        const strokeLength = (percent / 100) * 251.2; // 251.2 is circumference
        const offset = currentOffset;
        currentOffset -= strokeLength; // SVG stroke-dashoffset is counter-clockwise/negative usually
        return { ...seg, percent, strokeLength, offset };
    });



    // Untuk chart perbandingan, ambil max dari kedua status
    const maxCompareCount = monthlyCompareData.length > 0 ? Math.max(...monthlyCompareData.map(d => Math.max(d.dalamProses, d.terbayar))) : 10

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
                {/* Bar Chart - Perbandingan Dalam Proses & Terbayar */}
                <div className="chart-card large">
                    <div className="chart-header">
                        <h3><BarChart2 size={20} style={{ display: 'inline', marginRight: '8px' }} /> Jumlah Kontrak Bulanan</h3>
                        <span className="chart-subtitle">Perbandingan "Dalam Proses" & "Terbayar"</span>
                    </div>
                    <div className="bar-chart-container" style={{ display: 'flex', alignItems: 'end', height: 220, background: 'transparent', padding: '0 8px', borderRadius: 18 }}>
                        {monthlyCompareData.map((data, index) => (
                            <div key={index} className="bar-wrapper" style={{ width: 44, margin: '0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'end' }}>
                                <div style={{ display: 'flex', width: '100%', gap: 4, alignItems: 'end', height: 180, justifyContent: 'center' }}>
                                    {/* Dalam Proses */}
                                    <div
                                        className="bar-laporan"
                                        style={{
                                            height: `${maxCompareCount ? (data.dalamProses / maxCompareCount) * 100 : 0}%`,
                                            width: 16,
                                            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                                                borderRadius: 0,
                                            marginRight: 2,
                                            position: 'relative',
                                            boxShadow: '0 2px 8px rgba(251,191,36,0.08)',
                                            transition: 'height 0.3s',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {data.dalamProses > 0 && <span className="bar-value" style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700, position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', opacity: 0.7 }}>{data.dalamProses}</span>}
                                    </div>
                                    {/* Terbayar */}
                                    <div
                                        className="bar-laporan"
                                        style={{
                                            height: `${maxCompareCount ? (data.terbayar / maxCompareCount) * 100 : 0}%`,
                                            width: 16,
                                            background: 'linear-gradient(180deg, #a5b4fc 0%, #6366f1 100%)',
                                                borderRadius: 0,
                                            marginLeft: 2,
                                            position: 'relative',
                                            boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
                                            transition: 'height 0.3s',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {data.terbayar > 0 && <span className="bar-value" style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', opacity: 0.7 }}>{data.terbayar}</span>}
                                    </div>
                                </div>
                                <span className="bar-label" style={{ fontSize: 15, marginTop: 10, color: '#334155', fontWeight: 500, letterSpacing: 0 }}>{data.month}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 8, background: '#f59e0b', borderRadius: 4, display: 'inline-block' }}></span> Dalam Proses</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 8, background: '#6366f1', borderRadius: 4, display: 'inline-block' }}></span> Terbayar</span>
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
                                <g transform="rotate(-90 50 50)">
                                    {pieSegments.map((seg, idx) => (
                                        <circle
                                            key={idx}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            stroke={seg.color}
                                            strokeWidth="20"
                                            strokeDasharray={`${seg.strokeLength} ${251.2 - seg.strokeLength}`}
                                            strokeDashoffset={seg.offset}
                                        />
                                    ))}
                                </g>
                                {/* Center Text for Total Budget */}
                                <text x="50" y="47" textAnchor="middle" fontSize="6px" fill="#64748b" fontWeight="500">Total Anggaran</text>
                                <text x="50" y="55" textAnchor="middle" fontSize="7px" fill="#1e293b" fontWeight="700">
                                    {totalBudget >= 1e9
                                        ? `${(totalBudget / 1e9).toFixed(1)} M`
                                        : (totalBudget >= 1e6 ? `${(totalBudget / 1e6).toFixed(1)} Jt` : `Rp ${totalBudget.toLocaleString('id-ID')}`)
                                    }
                                </text>
                            </svg>
                        </div>
                        <div className="pie-legend" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {pieSegments.map((seg, idx) => (
                                <div key={idx} className="legend-item" style={{ marginBottom: 0 }}>
                                    <span className="legend-color" style={{ backgroundColor: seg.color }}></span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="legend-text" style={{ fontSize: '11px', color: '#64748b' }}>{seg.label}</span>
                                        <span className="legend-count" style={{ fontSize: '13px', fontWeight: 600 }}>
                                            {seg.percent.toFixed(1)}%
                                            <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px', fontWeight: 400 }}>
                                                (Rp {(seg.value / 1e6).toFixed(0)} Jt)
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}

export default Laporan
