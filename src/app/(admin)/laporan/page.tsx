'use client'
import { useState, useEffect } from 'react'
import Select from 'react-select'
import { FileDown, FileText, Clock, CheckCircle, BarChart2, ClipboardList, Hourglass, Target, Activity } from 'lucide-react'
import { contractService } from '@/services/contractService'
import './Laporan.css'

// Define types
interface Contract {
    id: string
    status: string
    created_at: string
    budget_type?: string // AI or AO
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
    active: number
    warning: number
    danger: number
    total: number
    count?: number // Keep optional for backward compatibility if needed, or remove
}

function Laporan() {
    // const [sidebarOpen, setSidebarOpen] = useState(false) // Handled by layout
    const [dateRange, setDateRange] = useState({ value: 'tahun-ini', label: 'Tahun Ini' })
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
    // (removed grouped bar chart logic, keep only stacked bar logic)
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
    const [allContracts, setAllContracts] = useState<Contract[]>([])
    const [budgetData, setBudgetData] = useState({
        terkontrak: 0,
        dalamProses: 0,
        selesai: 0,
        dalamPemeriksaan: 0,
        telahDiperiksa: 0,
        terbayar: 0
    })

    const [budgetTypeData, setBudgetTypeData] = useState({
        ai: 0, // Anggaran Investasi
        ao: 0  // Anggaran Operasional
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await contractService.getAllContracts()

            if (result.success) {
                const data = (result as any).data as Contract[]
                setAllContracts(data)
                // processAnalytics(data) // Removed to prevent flicker. useEffect will trigger applyFilters.
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
        } finally {
            setLoading(false)
        }
    }

    // Effect to re-process analytics when filters change
    useEffect(() => {
        if (allContracts.length > 0) {
            applyFilters()
        }
    }, [dateRange, filterStatus, startDate, endDate, allContracts])

    const applyFilters = () => {
        let filtered = [...allContracts]

        // 1. Filter by Status
        if (filterStatus.value !== 'all') {
            filtered = filtered.filter(c => {
                const s = (c.status || '').toLowerCase()
                if (filterStatus.value === 'approved') return ['selesai', 'terbayar', 'telah diperiksa', 'aktif'].includes(s)
                if (filterStatus.value === 'rejected') return ['batal', 'ditolak', 'masalah'].includes(s)
                if (filterStatus.value === 'pending') return ['proses', 'pemeriksaan', 'amandemen', 'terkontrak'].some(k => s.includes(k))
                return true
            })
        }

        // 2. Filter by Date (Periode) - using created_at
        const now = new Date()
        filtered = filtered.filter(c => {
            if (!c.created_at) return false
            const date = new Date(c.created_at)

            if (dateRange.value === 'hari-ini') {
                return date.toDateString() === now.toDateString()
            }
            if (dateRange.value === 'minggu-ini') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return date >= oneWeekAgo
            }
            if (dateRange.value === 'bulan-ini') {
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            }
            if (dateRange.value === 'tahun-ini') {
                return date.getFullYear() === now.getFullYear()
            }
            if (dateRange.value === 'custom' && startDate && endDate) {
                const start = new Date(startDate)
                const end = new Date(endDate)
                end.setHours(23, 59, 59) // End of day
                return date >= start && date <= end
            }
            return true
        })

        processAnalytics(filtered)
    }

    const processAnalytics = (contracts: Contract[]) => {
        // 1. KPI Calculations
        const total = contracts.length

        // Real Approval Rate: (Approved / Total) * 100
        const approvedCount = contracts.filter(c => {
            const s = (c.status || '').toLowerCase()
            return ['selesai', 'terbayar', 'telah diperiksa', 'aktif'].includes(s)
        }).length
        const approvalRate = total > 0 ? ((approvedCount / total) * 100).toFixed(0) : 0

        // Real Average Cycle Time: (Start Date - Created Date)
        let totalDays = 0
        let countWithDates = 0
        contracts.forEach(c => {
            if (c.created_at && c.start_date) {
                const start = new Date(c.created_at).getTime()
                const end = new Date(c.start_date).getTime()
                const diffTime = Math.abs(end - start)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                totalDays += diffDays
                countWithDates++
            }
        })
        const avgTime = countWithDates > 0 ? (totalDays / countWithDates).toFixed(1) : 0

        const pending = contracts.filter(c => {
            const s = (c.status || '').toLowerCase()
            return ['proses', 'pemeriksaan', 'amandemen'].some(k => s.includes(k))
        }).length

        setKpiData({
            avgCycleTime: Number(avgTime),
            approvalRate: approvalRate,
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
                case 'Aktif':
                    buckets.terkontrak += amount;
                    break;
                case 'Dalam Proses Pekerjaan': buckets.dalamProses += amount; break;
                case 'Selesai': buckets.selesai += amount; break;
                case 'Dalam Pemeriksaan': buckets.dalamPemeriksaan += amount; break;
                case 'Telah Diperiksa': buckets.telahDiperiksa += amount; break;
                case 'Terbayar': buckets.terbayar += amount; break;
                default: break;
            }
        })

        setBudgetData(buckets)

        // 3. Budget Type Calculation (AI vs AO)
        const typeBuckets = { ai: 0, ao: 0 }
        contracts.forEach(c => {
            if (!c.budget_type) return;
            const amount = Number(c.amount) || 0;
            const type = c.budget_type.toUpperCase();
            if (type.includes('AI') || type.includes('INVESTASI')) {
                typeBuckets.ai += amount;
            } else if (type.includes('AO') || type.includes('OPERASIONAL')) {
                typeBuckets.ao += amount;
            }
        })
        setBudgetTypeData(typeBuckets)

        // 3. Monthly Volume (Stacked Data)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const chartData = months.map(m => ({ month: m, active: 0, warning: 0, danger: 0, total: 0 }))

        contracts.forEach(c => {
            if (!c.start_date) return

            const date = new Date(c.start_date)
            const monthIdx = date.getMonth()

            if (monthIdx >= 0 && monthIdx < 12) {
                const status = (c.status || '').toLowerCase()

                if (['selesai', 'terbayar', 'telah diperiksa', 'aktif'].includes(status)) {
                    chartData[monthIdx].active += 1
                } else if (
                    ['proses', 'pemeriksaan', 'terkontrak', 'amandemen', 'perbaikan'].some(k => status.includes(k))
                ) {
                    chartData[monthIdx].warning += 1
                } else {
                    chartData[monthIdx].danger += 1
                }
                chartData[monthIdx].total += 1
            }
        })

        setMonthlyData(chartData)
    } // <-- Add this closing brace to end processAnalytics

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



    // const maxCount = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.count)) : 10

    const handleExport = async (format: string) => {
        if (format === 'CSV') {
            const headers = ['ID', 'Nama Kontrak', 'Vendor', 'Status', 'Nilai', 'Tgl Buat', 'Tgl Mulai']
            const rows = allContracts.map(c => [
                c.id,
                `"${c.name || ''}"`, // Quote to handle commas
                `"${c.vendor_name || ''}"`,
                c.status,
                c.amount,
                c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
                c.start_date ? new Date(c.start_date).toLocaleDateString() : ''
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `laporan_kontrak_${new Date().toISOString().slice(0, 10)}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else if (format === 'PDF') {
            try {
                // Dynamic import to avoid SSR issues
                const jsPDF = (await import('jspdf')).default
                const autoTable = (await import('jspdf-autotable')).default

                const doc = new jsPDF()

                // Header
                doc.setFontSize(18)
                doc.setFont('helvetica', 'bold')
                doc.text('LAPORAN KONTRAK', 14, 20)

                doc.setFontSize(10)
                doc.setFont('helvetica', 'normal')
                doc.text('PLN (Persero) UPT Manado', 14, 28)
                doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 34)

                // KPI Summary Box
                doc.setFillColor(240, 248, 255)
                doc.rect(14, 40, 182, 30, 'F')
                doc.setFontSize(9)
                doc.setFont('helvetica', 'bold')
                doc.text('RINGKASAN KPI', 16, 46)
                doc.setFont('helvetica', 'normal')
                doc.text(`Total Dokumen: ${kpiData.totalDocuments}`, 16, 52)
                doc.text(`Rata-rata Waktu Proses: ${kpiData.avgCycleTime} hari`, 16, 58)
                doc.text(`Rasio Persetujuan: ${kpiData.approvalRate}%`, 70, 52)
                doc.text(`Menunggu Review: ${kpiData.pendingDocuments}`, 70, 58)
                doc.text(`Filter: ${filterStatus.label}`, 130, 52)
                doc.text(`Periode: ${dateRange.label}`, 130, 58)

                // Budget Distribution
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.text('Distribusi Anggaran per Status', 14, 78)

                const budgetHeaders = [['Status', 'Nilai (Rp)', 'Persentase']]
                const budgetRows = [
                    ['Terkontrak', budgetData.terkontrak.toLocaleString('id-ID'), `${getPercent(budgetData.terkontrak).toFixed(1)}%`],
                    ['Dalam Proses', budgetData.dalamProses.toLocaleString('id-ID'), `${getPercent(budgetData.dalamProses).toFixed(1)}%`],
                    ['Selesai', budgetData.selesai.toLocaleString('id-ID'), `${getPercent(budgetData.selesai).toFixed(1)}%`],
                    ['Dalam Pemeriksaan', budgetData.dalamPemeriksaan.toLocaleString('id-ID'), `${getPercent(budgetData.dalamPemeriksaan).toFixed(1)}%`],
                    ['Telah Diperiksa', budgetData.telahDiperiksa.toLocaleString('id-ID'), `${getPercent(budgetData.telahDiperiksa).toFixed(1)}%`],
                    ['Terbayar', budgetData.terbayar.toLocaleString('id-ID'), `${getPercent(budgetData.terbayar).toFixed(1)}%`],
                ]

                autoTable(doc, {
                    head: budgetHeaders,
                    body: budgetRows,
                    startY: 82,
                    theme: 'grid',
                    headStyles: { fillColor: [94, 157, 196], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    columnStyles: {
                        1: { halign: 'right' },
                        2: { halign: 'center' }
                    }
                })

                // Contract List
                const finalY = (doc as any).lastAutoTable.finalY || 130
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.text('Daftar Kontrak', 14, finalY + 10)

                const contractHeaders = [['No', 'ID', 'Nama Kontrak', 'Vendor', 'Status', 'Nilai (Rp)']]
                const contractRows = allContracts.map((c, idx) => [
                    (idx + 1).toString(),
                    c.id || '-',
                    (c.name || '-').substring(0, 30),
                    (c.vendor_name || '-').substring(0, 25),
                    c.status || '-',
                    (c.amount || 0).toLocaleString('id-ID')
                ])

                autoTable(doc, {
                    head: contractHeaders,
                    body: contractRows,
                    startY: finalY + 14,
                    theme: 'striped',
                    headStyles: { fillColor: [94, 157, 196], fontSize: 8 },
                    bodyStyles: { fontSize: 7 },
                    columnStyles: {
                        0: { cellWidth: 10, halign: 'center' },
                        1: { cellWidth: 20 },
                        2: { cellWidth: 50 },
                        3: { cellWidth: 40 },
                        4: { cellWidth: 30, halign: 'center' },
                        5: { cellWidth: 30, halign: 'right' }
                    },
                    margin: { left: 14, right: 14 }
                })

                // Footer
                const pageCount = doc.getNumberOfPages()
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i)
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'italic')
                    doc.text(
                        `Halaman ${i} dari ${pageCount}`,
                        doc.internal.pageSize.width / 2,
                        doc.internal.pageSize.height - 10,
                        { align: 'center' }
                    )
                }

                // Save PDF
                doc.save(`Laporan_Kontrak_${new Date().toISOString().slice(0, 10)}.pdf`)
            } catch (error) {
                console.error('Error generating PDF:', error)
                alert('Gagal membuat PDF. Silakan coba lagi.')
            }
        }
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
                                    { value: 'semua', label: 'Semua Waktu' },
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
                        <h3><BarChart2 size={20} style={{ display: 'inline', marginRight: '8px' }} /> Tren Kontrak Bulanan</h3>
                        <span className="chart-subtitle">Distribusi status kontrak per bulan</span>
                    </div>
                    <div className="bar-chart-container">
                        {(monthlyData as any[]).map((data, index) => {
                            const maxTotal = monthlyData.length > 0 ? Math.max(...(monthlyData as any[]).map(d => d.total), 1) : 10;
                            const heightPercentage = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;

                            const activeHeigth = data.total > 0 ? (data.active / data.total) * 100 : 0;
                            const warningHeight = data.total > 0 ? (data.warning / data.total) * 100 : 0;
                            const dangerHeight = data.total > 0 ? (data.danger / data.total) * 100 : 0;

                            return (
                                <div key={index} className="bar-wrapper">
                                    <div className="bar-stack-container" style={{ height: `${heightPercentage}%`, minHeight: data.total > 0 ? '4px' : '0' }}>
                                        {/* Tooltip */}
                                        <div className="bar-tooltip">
                                            <div className="tooltip-header">{data.month}</div>
                                            <div className="tooltip-row"><span className="dot active"></span> Selesai/Aktif: {data.active}</div>
                                            <div className="tooltip-row"><span className="dot warning"></span> Proses/Rev: {data.warning}</div>
                                            <div className="tooltip-row"><span className="dot danger"></span> Batal/Lain: {data.danger}</div>
                                            <div className="tooltip-total">Total: {data.total}</div>
                                        </div>

                                        {/* Segments (Reverse order: Danger Bottom, Warning Middle, Active Top) */}
                                        {data.danger > 0 && <div className="bar-segment danger" style={{ height: `${dangerHeight}%` }}></div>}
                                        {data.warning > 0 && <div className="bar-segment warning" style={{ height: `${warningHeight}%` }}></div>}
                                        {data.active > 0 && <div className="bar-segment active" style={{ height: `${activeHeigth}%` }}></div>}
                                    </div>
                                    <span className="bar-label">{data.month}</span>
                                </div>
                            )
                        })}
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
                    <div className="laporan-pie-chart-container">
                        <div className="laporan-pie-chart">
                            <svg viewBox="0 0 100 100" className="laporan-pie-svg">
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

            {/* Budget Breakdown Section (AI & AO Split) */}
            <div className="budget-section">
                {/* AI Card */}
                <div className="chart-card budget-card">
                    <div className="chart-header">
                        <h3><Activity size={20} style={{ display: 'inline', marginRight: '8px', color: '#3b82f6' }} /> Anggaran Investasi (AI)</h3>
                        <span className="chart-subtitle">Detail alokasi anggaran investasi</span>
                    </div>
                    <div className="laporan-pie-chart-container">
                        <div className="laporan-pie-chart">
                            <svg viewBox="0 0 100 100" className="laporan-pie-svg">
                                <g transform="rotate(-90 50 50)">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="#e2e8f0"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="#3b82f6"
                                        strokeWidth="12"
                                        strokeDasharray={`${(budgetTypeData.ai / (budgetTypeData.ai + budgetTypeData.ao || 1)) * 251.2} ${251.2}`}
                                        strokeDashoffset="0"
                                        strokeLinecap="round"
                                    />
                                </g>
                                <text x="50" y="47" textAnchor="middle" fontSize="6px" fill="#64748b" fontWeight="500">Total AI</text>
                                <text x="50" y="55" textAnchor="middle" fontSize="9px" fill="#1e293b" fontWeight="700">
                                    {budgetTypeData.ai >= 1e9
                                        ? `${(budgetTypeData.ai / 1e9).toFixed(1)} M`
                                        : `${(budgetTypeData.ai / 1e6).toFixed(0)} Jt`}
                                </text>
                            </svg>
                        </div>
                        <div className="legend-item" style={{ marginTop: '10px' }}>
                            <span className="legend-count" style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                                {((budgetTypeData.ai / (budgetTypeData.ai + budgetTypeData.ao || 1)) * 100).toFixed(1)}%
                            </span>
                            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '6px' }}>dari total anggaran</span>
                        </div>
                    </div>
                </div>

                {/* AO Card */}
                <div className="chart-card budget-card">
                    <div className="chart-header">
                        <h3><Activity size={20} style={{ display: 'inline', marginRight: '8px', color: '#10b981' }} /> Anggaran Operasional (AO)</h3>
                        <span className="chart-subtitle">Detail alokasi anggaran operasional</span>
                    </div>
                    <div className="laporan-pie-chart-container">
                        <div className="laporan-pie-chart">
                            <svg viewBox="0 0 100 100" className="laporan-pie-svg">
                                <g transform="rotate(-90 50 50)">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="#e2e8f0"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="#10b981"
                                        strokeWidth="12"
                                        strokeDasharray={`${(budgetTypeData.ao / (budgetTypeData.ai + budgetTypeData.ao || 1)) * 251.2} ${251.2}`}
                                        strokeDashoffset="0"
                                        strokeLinecap="round"
                                    />
                                </g>
                                <text x="50" y="47" textAnchor="middle" fontSize="6px" fill="#64748b" fontWeight="500">Total AO</text>
                                <text x="50" y="55" textAnchor="middle" fontSize="9px" fill="#1e293b" fontWeight="700">
                                    {budgetTypeData.ao >= 1e9
                                        ? `${(budgetTypeData.ao / 1e9).toFixed(1)} M`
                                        : `${(budgetTypeData.ao / 1e6).toFixed(0)} Jt`}
                                </text>
                            </svg>
                        </div>
                        <div className="legend-item" style={{ marginTop: '10px' }}>
                            <span className="legend-count" style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                                {((budgetTypeData.ao / (budgetTypeData.ai + budgetTypeData.ao || 1)) * 100).toFixed(1)}%
                            </span>
                            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '6px' }}>dari total anggaran</span>
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}

export default Laporan
