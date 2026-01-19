'use client'
import { useState, useEffect } from 'react'
import Select from 'react-select'
import { FileDown, FileText, Clock, CheckCircle, BarChart2, ClipboardList, Hourglass, Target, Activity, Calendar, DollarSign } from 'lucide-react'
import { contractService } from '@/services/contractService'
import * as vendorService from '@/services/vendorService'
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
    remainingValue: number
    nearDeadline: number
    avgCompletion: number
    totalDocuments: number
    avgCycleTime: number
    approvalRate: number
    pendingDocuments: number
}

interface RemainingContract {
    id: string
    name: string
    vendor_name: string
    amount: number
    status: string
    start_date: string
    end_date: string
}

interface MonthlyData {
    month: string
    total: number
    activeVendors?: number
    activeVendorDetails?: Array<{
        vendorName: string
        contractCount: number
        endDates: string[]
    }>
}

function Laporan() {
    // Helper function untuk format nilai Rupiah yang transparan
    const formatCompactCurrency = (value: number) => {
        if (value >= 1e9) {
            // Miliar - tampilkan dengan 3 desimal untuk transparansi
            return `Rp ${(value / 1e9).toFixed(3)} M`
        } else if (value >= 1e6) {
            // Juta - tampilkan dengan 2 desimal
            return `Rp ${(value / 1e6).toFixed(2)} Jt`
        } else if (value >= 1e3) {
            // Ribu - tampilkan dengan 1 desimal
            return `Rp ${(value / 1e3).toFixed(1)} Rb`
        } else {
            // Di bawah ribu - tampilkan full
            return `Rp ${value.toLocaleString('id-ID')}`
        }
    }

    // const [sidebarOpen, setSidebarOpen] = useState(false) // Handled by layout
    const [dateRange, setDateRange] = useState({ value: 'tahun-ini', label: 'Tahun Ini' })
    const [filterStatus, setFilterStatus] = useState({ value: 'all', label: 'Semua Status' })
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [loading, setLoading] = useState(true)
    const [kpiData, setKpiData] = useState<KpiData>({
        remainingValue: 0,
        nearDeadline: 0,
        avgCompletion: 0,
        totalDocuments: 0,
        avgCycleTime: 0,
        approvalRate: 0,
        pendingDocuments: 0
    })
    const [showRemainingModal, setShowRemainingModal] = useState(false)
    const [remainingContracts, setRemainingContracts] = useState<RemainingContract[]>([])
    const [showDeadlineModal, setShowDeadlineModal] = useState(false)
    const [deadlineContracts, setDeadlineContracts] = useState<RemainingContract[]>([])
    const [showVendorDetailModal, setShowVendorDetailModal] = useState(false)
    const [selectedMonthData, setSelectedMonthData] = useState<any>(null)
    // (removed grouped bar chart logic, keep only stacked bar logic)
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(
        Array(12).fill(null).map((_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][i],
            total: 0,
            activeVendors: 0,
            activeVendorDetails: []
        }))
    )
    const [allContracts, setAllContracts] = useState<Contract[]>([])
    const [allVendors, setAllVendors] = useState<any[]>([])
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

    const [selectedContractYear, setSelectedContractYear] = useState(new Date().getFullYear())
    const [availableContractYears, setAvailableContractYears] = useState<number[]>([new Date().getFullYear()])

    useEffect(() => {
        fetchData()
        fetchVendorData()
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

    const fetchVendorData = async () => {
        try {
            const result = await vendorService.getDashboardVendorData()

            if (result.success && 'data' in result) {
                const { allVendors: vendorsForChart } = result.data
                if (vendorsForChart && vendorsForChart.length > 0) {
                    setAllVendors(vendorsForChart)
                }
            }
        } catch (error) {
            console.error('Error in fetchVendorData:', error)
        }
    }

    // Effect to re-process analytics when filters change
    useEffect(() => {
        if (allContracts.length > 0) {
            applyFilters()
        }
    }, [dateRange, filterStatus, startDate, endDate, allContracts, selectedContractYear])

    // Effect to re-process vendor chart when allVendors or year changes
    useEffect(() => {
        if (allVendors.length > 0) {
            processVendorChartData(allVendors, selectedContractYear)
        }
    }, [allVendors, selectedContractYear])

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

        // Total Nilai Kontrak
        const totalValue = contracts.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

        // Nilai yang Sudah Terbayar
        const paidValue = contracts
            .filter(c => (c.status || '').toLowerCase() === 'terbayar')
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

        // Sisa Nilai Kontrak (Total - Terbayar)
        const remainingValue = totalValue - paidValue

        // Simpan kontrak yang belum terbayar untuk detail modal
        // Filter: Hanya tampilkan status "Dalam Pekerjaan - Telah Diperiksa" saja (tidak termasuk "Terbayar")
        const unpaidContracts = contracts.filter(c => {
            const status = (c.status || '').toLowerCase()
            // Fokus pada "Telah Diperiksa" dan "Dalam Proses Pekerjaan" - tidak tampilkan "Terbayar"
            return status === 'telah diperiksa' || status === 'dalam proses pekerjaan'
        }).map(c => ({
            id: c.id,
            name: c.name,
            vendor_name: c.vendor_name,
            amount: Number(c.amount) || 0,
            status: c.status,
            start_date: c.start_date,
            end_date: c.end_date
        }))
        setRemainingContracts(unpaidContracts)

        // Kontrak Mendekati Jatuh Tempo (30 hari)
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        const nearDeadlineContracts = contracts.filter(c => {
            if (!c.end_date) return false
            const endDate = new Date(c.end_date)
            return endDate > now && endDate <= thirtyDaysFromNow
        })
        const nearDeadline = nearDeadlineContracts.length

        // Simpan data kontrak mendekati deadline untuk modal
        setDeadlineContracts(nearDeadlineContracts.map(c => ({
            id: c.id,
            name: c.name || '',
            vendor_name: c.vendor_name || '',
            amount: Number(c.amount) || 0,
            status: c.status,
            start_date: c.start_date,
            end_date: c.end_date
        })))

        // Tingkat Penyelesaian Rata-rata
        const activeContracts = contracts.filter(c => {
            const s = (c.status || '').toLowerCase()
            return !['selesai', 'terbayar', 'batal'].includes(s)
        })
        const totalProgress = activeContracts.reduce((sum, c) => sum + (Number(c.progress) || 0), 0)
        const avgCompletion = activeContracts.length > 0 ? totalProgress / activeContracts.length : 0

        // Calculate additional KPI fields for PDF export
        // totalDocuments: total contracts
        // avgCycleTime: average days between created_at and end_date (if available)
        // approvalRate: percent of contracts with status 'approved' (selesai, terbayar, telah diperiksa, aktif)
        // pendingDocuments: contracts with status 'pending' (proses, pemeriksaan, amandemen, terkontrak)
        const avgCycleTime =
            contracts.length > 0
                ? contracts.reduce((sum, c) => {
                    if (c.created_at && c.end_date) {
                        const start = new Date(c.created_at)
                        const end = new Date(c.end_date)
                        return sum + Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                    }
                    return sum
                }, 0) /
                contracts.filter(c => c.created_at && c.end_date).length || 0
                : 0

        const approvedStatuses = ['selesai', 'terbayar', 'telah diperiksa', 'aktif']
        const pendingStatuses = ['proses', 'pemeriksaan', 'amandemen', 'terkontrak']

        const approvedCount = contracts.filter(c => approvedStatuses.includes((c.status || '').toLowerCase())).length
        const pendingCount = contracts.filter(c => pendingStatuses.some(s => (c.status || '').toLowerCase().includes(s))).length

        setKpiData({
            remainingValue: remainingValue,
            nearDeadline: nearDeadline,
            avgCompletion: avgCompletion,
            totalDocuments: total,
            avgCycleTime: Number(avgCycleTime.toFixed(1)),
            approvalRate: total > 0 ? Number(((approvedCount / total) * 100).toFixed(1)) : 0,
            pendingDocuments: pendingCount
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
            const status = (c.status || '').toLowerCase()

            if (status === 'dalam pekerjaan' || status === 'dalam proses pekerjaan' || status === 'aktif') {
                buckets.dalamProses += amount
            } else if (status === 'telah diperiksa') {
                buckets.telahDiperiksa += amount
            } else if (status === 'terbayar') {
                buckets.terbayar += amount
            } else if (status === 'terkontrak') {
                buckets.terkontrak += amount
            } else if (status === 'selesai') {
                buckets.selesai += amount
            } else if (status === 'dalam pemeriksaan') {
                buckets.dalamPemeriksaan += amount
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

        // 4. Extract available years from vendors
        const yearsSet = new Set<number>()
        allVendors.forEach(v => {
            if (v.tanggal_registrasi) {
                const year = new Date(v.tanggal_registrasi).getFullYear()
                yearsSet.add(year)
            }
        })
        const years = Array.from(yearsSet).sort((a, b) => b - a)
        if (years.length > 0) {
            setAvailableContractYears(years)
        }
    } // <-- End processAnalytics

    const processVendorChartData = (vendors: any[], year: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const newChartData = months.map(m => ({ month: m, total: 0, activeVendors: 0, activeVendorDetails: [] as any[] }))

        // Hitung vendor baru per bulan
        vendors.forEach(vendor => {
            if (!vendor.tanggal_registrasi) return

            const date = new Date(vendor.tanggal_registrasi)
            const vendorYear = date.getFullYear()
            const monthIndex = date.getMonth()

            if (vendorYear === year && monthIndex >= 0 && monthIndex < 12) {
                newChartData[monthIndex].total += 1
            }
        })

        // Hitung vendor yang AKTIF mengerjakan kontrak per bulan
        // Status aktif: Terkontrak, Dalam Proses Pekerjaan, Dalam Pemeriksaan
        const activeStatuses = ['Terkontrak', 'Dalam Proses Pekerjaan', 'Dalam Pemeriksaan', 'Telah Diperiksa']

        newChartData.forEach((monthData, monthIndex) => {
            const vendorContractMap = new Map<string, { contracts: number, endDates: string[] }>()

            allContracts.forEach(contract => {
                if (!contract.start_date || !contract.end_date) return
                if (!activeStatuses.includes(contract.status)) return

                const startDate = new Date(contract.start_date)
                const endDate = new Date(contract.end_date)
                const checkDate = new Date(year, monthIndex, 15) // Tengah bulan

                // Cek apakah kontrak aktif di bulan ini
                if (checkDate >= startDate && checkDate <= endDate) {
                    const vendorName = contract.vendor_name || 'Unknown'

                    if (!vendorContractMap.has(vendorName)) {
                        vendorContractMap.set(vendorName, { contracts: 0, endDates: [] })
                    }

                    const vendorData = vendorContractMap.get(vendorName)!
                    vendorData.contracts += 1
                    vendorData.endDates.push(contract.end_date)
                }
            })

            monthData.activeVendors = vendorContractMap.size
            monthData.activeVendorDetails = Array.from(vendorContractMap.entries()).map(([name, data]) => ({
                vendorName: name,
                contractCount: data.contracts,
                endDates: data.endDates.sort()
            }))
        })

        setMonthlyData(newChartData)
    }

    const totalBudget = Object.values(budgetData).reduce((a, b) => a + b, 0);

    const getPercent = (value: number) => {
        if (totalBudget === 0) return 0;
        return ((value / totalBudget) * 100);
    };

    // Calculate segments for Pie Chart - hanya 3 status
    const segments = [
        { label: 'Dalam Pekerjaan', value: budgetData.dalamProses, color: '#f59e0b' }, // Orange
        { label: 'Telah Diperiksa', value: budgetData.telahDiperiksa, color: '#8b5cf6' }, // Purple
        { label: 'Terbayar', value: budgetData.terbayar, color: '#10b981' } // Hijau
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
            <div className="kpi-section">
                {[
                    {
                        title: 'Sisa Nilai Kontrak',
                        value: formatCompactCurrency(kpiData.remainingValue),
                        icon: BarChart2,
                        color: '#3b82f6',
                        bgColor: '#eff6ff',
                        badge: { text: 'Belum terbayar', type: 'neutral' },
                        clickable: true,
                        onClick: () => setShowRemainingModal(true)
                    },
                    {
                        title: 'Mendekati Deadline',
                        value: kpiData.nearDeadline,
                        icon: Clock,
                        color: '#f39c12',
                        bgColor: '#fff8e1',
                        badge: { text: 'Dalam 30 hari', type: 'warning' },
                        clickable: true,
                        onClick: () => setShowDeadlineModal(true)
                    },
                ].map((stat, index) => {
                    const IconComponent = stat.icon;
                    const cardClass = index === 0 ? 'blue' : 'orange';
                    return (
                        <div
                            key={index}
                            className={`kpi-card ${cardClass}`}
                            onClick={stat.clickable ? stat.onClick : undefined}
                            style={stat.clickable ? { cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' } : {}}
                            onMouseEnter={(e) => stat.clickable && (e.currentTarget.style.transform = 'translateY(-4px)')}
                            onMouseLeave={(e) => stat.clickable && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
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
                {/* Line Chart - Tren Vendor Baru Bulanan */}
                <div className="chart-card large">
                    <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3><BarChart2 size={20} style={{ display: 'inline', marginRight: '8px' }} /> Tren Vendor Baru Bulanan</h3>
                            <span className="chart-subtitle">Vendor baru terdaftar & vendor aktif mengerjakan kontrak</span>
                        </div>
                        <select
                            value={selectedContractYear}
                            onChange={(e) => setSelectedContractYear(Number(e.target.value))}
                            style={{
                                padding: '8px 32px 8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                color: '#1e293b',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                outline: 'none',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748b\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                minWidth: '100px'
                            }}
                        >
                            {availableContractYears.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="line-chart-container" style={{
                        position: 'relative',
                        height: '280px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Y-axis labels */}
                        <div style={{ position: 'absolute', left: '40px', top: '30px', height: '200px', display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#64748b', textAlign: 'right', paddingRight: '5px', width: '22px' }}>
                            {(() => {
                                const maxVal = Math.max(
                                    ...(monthlyData as any[]).map(d => Math.max(d.total || 0, d.activeVendors || 0)),
                                    0
                                )
                                if (maxVal === 0) {
                                    return [4, 3, 2, 1, 0].map((val, i) => (
                                        <span key={i} style={{ position: 'absolute', top: `${i * 50 - 6}px` }}>{val}</span>
                                    ))
                                }

                                // Buat array nilai unik tanpa duplikasi
                                const labels = []
                                if (maxVal <= 4) {
                                    // Untuk nilai kecil, gunakan semua angka dari max ke 0
                                    for (let i = maxVal; i >= 0; i--) {
                                        labels.push(i)
                                    }
                                } else {
                                    // Untuk nilai besar, bagi menjadi 5 step unik
                                    const step = Math.ceil(maxVal / 4)
                                    const uniqueVals = new Set()
                                    uniqueVals.add(maxVal)
                                    uniqueVals.add(Math.floor(maxVal - step))
                                    uniqueVals.add(Math.floor(maxVal - step * 2))
                                    uniqueVals.add(Math.floor(maxVal - step * 3))
                                    uniqueVals.add(0)

                                    const sortedVals = Array.from(uniqueVals).sort((a, b) => b - a)
                                    labels.push(...sortedVals)
                                }

                                const gridCount = labels.length
                                const gridSpacing = 200 / (gridCount - 1)

                                return labels.map((val, i) => (
                                    <span key={i} style={{ position: 'absolute', top: `${i * gridSpacing - 6}px` }}>{val}</span>
                                ))
                            })()}
                        </div>

                        {/* Chart area */}
                        <svg
                            width="100%"
                            height="220"
                            style={{ marginLeft: '40px', marginTop: '10px' }}
                            viewBox="0 0 880 200"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            {/* Grid lines - dinamis sesuai jumlah label Y */}
                            {(() => {
                                const maxVal = Math.max(
                                    ...(monthlyData as any[]).map(d => Math.max(d.total || 0, d.activeVendors || 0)),
                                    0
                                )
                                const gridCount = maxVal === 0 ? 5 : (maxVal <= 4 ? maxVal + 1 : 5)
                                const gridSpacing = 200 / (gridCount - 1)

                                return Array.from({ length: gridCount }).map((_, i) => (
                                    <line
                                        key={i}
                                        x1="25"
                                        y1={i * gridSpacing}
                                        x2="840"
                                        y2={i * gridSpacing}
                                        stroke="#e2e8f0"
                                        strokeWidth="1"
                                    />
                                ))
                            })()}

                            {/* Area fill untuk vendor baru */}
                            <defs>
                                <linearGradient id="areaGradientVendor" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#2ecc71" stopOpacity="0.05" />
                                </linearGradient>
                                <linearGradient id="areaGradientActive" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                                </linearGradient>
                            </defs>

                            {monthlyData.length > 0 && (() => {
                                const maxValue = Math.max(
                                    ...(monthlyData as any[]).map(d => Math.max(d.total || 0, d.activeVendors || 0)),
                                    1
                                );
                                const paddingLeft = 13;
                                const paddingRight = 40;
                                const chartWidth = 815;
                                const spacing = chartWidth / (monthlyData.length - 1);

                                // Line untuk vendor baru
                                const pointsNew = (monthlyData as any[]).map((data, index) => {
                                    const x = paddingLeft + (index * spacing);
                                    const y = 200 - ((data.total || 0) / maxValue) * 200;
                                    return `${x},${y}`;
                                }).join(' ');

                                // Line untuk vendor aktif
                                const pointsActive = (monthlyData as any[]).map((data, index) => {
                                    const x = paddingLeft + (index * spacing);
                                    const y = 200 - ((data.activeVendors || 0) / maxValue) * 200;
                                    return `${x},${y}`;
                                }).join(' ');

                                const areaPointsNew = `${paddingLeft},200 ${pointsNew} ${paddingLeft + chartWidth},200`;
                                const areaPointsActive = `${paddingLeft},200 ${pointsActive} ${paddingLeft + chartWidth},200`;

                                return (
                                    <>
                                        {/* Area & Line untuk vendor aktif (background) */}
                                        <polyline
                                            points={areaPointsActive}
                                            fill="url(#areaGradientActive)"
                                        />
                                        <polyline
                                            points={pointsActive}
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeDasharray="6 4"
                                        />

                                        {/* Area & Line untuk vendor baru (foreground) */}
                                        <polyline
                                            points={areaPointsNew}
                                            fill="url(#areaGradientVendor)"
                                        />
                                        <polyline
                                            points={pointsNew}
                                            fill="none"
                                            stroke="#2ecc71"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* Circles untuk vendor aktif */}
                                        {(monthlyData as any[]).map((data, index) => {
                                            const x = paddingLeft + (index * spacing);
                                            const yActive = 200 - ((data.activeVendors || 0) / maxValue) * 200;

                                            const tooltipLines = [
                                                `${data.month} ${selectedContractYear}`,
                                                `Vendor Baru: ${data.total || 0}`,
                                                `Vendor Aktif: ${data.activeVendors || 0}`,
                                                '',
                                                'Klik untuk lihat detail lengkap'
                                            ];

                                            if (data.activeVendorDetails && data.activeVendorDetails.length > 0) {
                                                const displayLimit = 3;
                                                data.activeVendorDetails.slice(0, displayLimit).forEach((v: any) => {
                                                    const endDate = new Date(v.endDates[v.endDates.length - 1]);
                                                    tooltipLines.splice(4, 0,
                                                        `• ${v.vendorName} (${v.contractCount} kontrak) - s/d ${endDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}`
                                                    );
                                                });

                                                if (data.activeVendorDetails.length > displayLimit) {
                                                    tooltipLines.splice(4 + displayLimit, 0, `... dan ${data.activeVendorDetails.length - displayLimit} vendor lainnya`);
                                                }
                                            } else {
                                                tooltipLines.splice(4, 0, 'Tidak ada vendor aktif');
                                            }

                                            return (
                                                <g key={`active-${index}`}>
                                                    <circle
                                                        cx={x}
                                                        cy={yActive}
                                                        r="5"
                                                        fill="#fff"
                                                        stroke="#3b82f6"
                                                        strokeWidth="3"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setSelectedMonthData({ ...data, year: selectedContractYear, monthIndex: index });
                                                            setShowVendorDetailModal(true);
                                                        }}
                                                    />
                                                    <title>{tooltipLines.join('\\n')}</title>
                                                </g>
                                            );
                                        })}

                                        {/* Circles untuk vendor baru */}
                                        {(monthlyData as any[]).map((data, index) => {
                                            const x = paddingLeft + (index * spacing);
                                            const y = 200 - ((data.total || 0) / maxValue) * 200;
                                            return (
                                                <g key={`new-${index}`}>
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r="5"
                                                        fill="#fff"
                                                        stroke="#2ecc71"
                                                        strokeWidth="3"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <title>{`${data.month} ${selectedContractYear}: ${data.total || 0} vendor baru`}</title>
                                                </g>
                                            );
                                        })}
                                    </>
                                );
                            })()}
                        </svg>

                        {/* X-axis labels */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingLeft: '40px',
                            fontSize: '12px',
                            color: '#64748b',
                            fontWeight: 500
                        }}>
                            {(monthlyData as any[]).map((data, index) => (
                                <span key={index}>{data.month}</span>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '24px',
                            marginTop: '16px',
                            fontSize: '13px',
                            color: '#64748b'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '3px',
                                    background: '#2ecc71',
                                    borderRadius: '2px'
                                }}></div>
                                <span>Vendor Baru Terdaftar</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '3px',
                                    background: '#3b82f6',
                                    borderRadius: '2px',
                                    backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6, #3b82f6 6px, transparent 6px, transparent 10px)'
                                }}></div>
                                <span>Vendor Aktif Mengerjakan Kontrak</span>
                            </div>
                        </div>
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
                                        ? `${(totalBudget / 1e9).toFixed(3)} M`
                                        : (totalBudget >= 1e6 ? `${(totalBudget / 1e6).toFixed(2)} Jt` : `Rp ${totalBudget.toLocaleString('id-ID')}`)
                                    }
                                </text>
                            </svg>
                        </div>
                        <div className="pie-legend" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                            {pieSegments.map((seg, idx) => (
                                <div key={idx} className="legend-item" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="legend-color" style={{ backgroundColor: seg.color, width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0 }}></span>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <span className="legend-text" style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>{seg.label}</span>
                                        <span className="legend-count" style={{ fontSize: '13px', fontWeight: 600, color: seg.color }}>
                                            {seg.percent.toFixed(2)}%
                                            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px', fontWeight: 400 }}>
                                                ({seg.value >= 1e9 ? `Rp ${(seg.value / 1e9).toFixed(3)} M` : `Rp ${(seg.value / 1e6).toFixed(2)} Jt`})
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
                                        ? `${(budgetTypeData.ai / 1e9).toFixed(3)} M`
                                        : `${(budgetTypeData.ai / 1e6).toFixed(2)} Jt`}
                                </text>
                            </svg>
                        </div>
                        <div className="legend-item" style={{ marginTop: '10px' }}>
                            <span className="legend-count" style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                                {((budgetTypeData.ai / (budgetTypeData.ai + budgetTypeData.ao || 1)) * 100).toFixed(2)}%
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
                                        ? `${(budgetTypeData.ao / 1e9).toFixed(3)} M`
                                        : `${(budgetTypeData.ao / 1e6).toFixed(2)} Jt`}
                                </text>
                            </svg>
                        </div>
                        <div className="legend-item" style={{ marginTop: '10px' }}>
                            <span className="legend-count" style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                                {((budgetTypeData.ao / (budgetTypeData.ai + budgetTypeData.ao || 1)) * 100).toFixed(2)}%
                            </span>
                            <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '6px' }}>dari total anggaran</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail Sisa Nilai Kontrak */}
            {showRemainingModal && (
                <div className="modal-overlay" onClick={() => setShowRemainingModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Rincian Sisa Nilai Kontrak</h2>
                            <button className="modal-close" onClick={() => setShowRemainingModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Total Sisa Nilai Kontrak</p>
                                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                                            {formatCompactCurrency(kpiData.remainingValue)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Jumlah Kontrak</p>
                                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6', margin: 0 }}>{remainingContracts.length}</p>
                                    </div>
                                </div>
                            </div>

                            {remainingContracts.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="assets-table" style={{ fontSize: '14px' }}>
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>ID Kontrak</th>
                                                <th>Nama Kontrak</th>
                                                <th>Vendor</th>
                                                <th>Nilai</th>
                                                <th>Status</th>
                                                <th>Periode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {remainingContracts.map((contract, idx) => (
                                                <tr key={contract.id}>
                                                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                                    <td>{contract.id}</td>
                                                    <td>{contract.name}</td>
                                                    <td>{contract.vendor_name || '-'}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                        {contract.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${contract.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {contract.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '13px' }}>
                                                        {contract.start_date && contract.end_date
                                                            ? `${contract.start_date} - ${contract.end_date}`
                                                            : '-'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    <p>Tidak ada kontrak yang belum terbayar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Kontrak Mendekati Deadline */}
            {showDeadlineModal && (
                <div className="modal-overlay" onClick={() => setShowDeadlineModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Kontrak Mendekati Deadline</h2>
                            <button className="modal-close" onClick={() => setShowDeadlineModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#fff8e1', borderRadius: '12px', border: '1px solid #ffd54f' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: '#f57c00', margin: '0 0 4px 0' }}>Kontrak Berakhir dalam 30 Hari</p>
                                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#e65100', margin: 0 }}>
                                            {deadlineContracts.length} Kontrak
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '14px', color: '#f57c00', margin: '0 0 4px 0' }}>Total Nilai</p>
                                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#f39c12', margin: 0 }}>
                                            {formatCompactCurrency(deadlineContracts.reduce((sum, c) => sum + c.amount, 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {deadlineContracts.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="assets-table" style={{ fontSize: '14px' }}>
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>ID Kontrak</th>
                                                <th>Nama Kontrak</th>
                                                <th>Vendor</th>
                                                <th>Nilai</th>
                                                <th>Status</th>
                                                <th>Tanggal Berakhir</th>
                                                <th>Sisa Hari</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deadlineContracts.map((contract, idx) => {
                                                const now = new Date()
                                                const endDate = new Date(contract.end_date)
                                                const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                                return (
                                                    <tr key={contract.id}>
                                                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                                        <td>{contract.id}</td>
                                                        <td>{contract.name}</td>
                                                        <td>{contract.vendor_name || '-'}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                            {contract.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge status-${contract.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                                {contract.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '13px' }}>
                                                            {contract.end_date ? new Date(contract.end_date).toLocaleDateString('id-ID') : '-'}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '12px',
                                                                fontSize: '13px',
                                                                fontWeight: 600,
                                                                background: daysLeft <= 7 ? '#ffebee' : '#fff3e0',
                                                                color: daysLeft <= 7 ? '#c62828' : '#ef6c00'
                                                            }}>
                                                                {daysLeft} hari
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    <p>Tidak ada kontrak yang mendekati deadline dalam 30 hari ke depan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Vendor Aktif */}
            {showVendorDetailModal && selectedMonthData && (
                <div className="modal-overlay" onClick={() => setShowVendorDetailModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h2 style={{ margin: 0 }}>
                                Detail Vendor Aktif - {selectedMonthData.month} {selectedMonthData.year}
                            </h2>
                            <button className="modal-close" onClick={() => setShowVendorDetailModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px 32px' }}>
                            {/* Summary Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    color: 'white'
                                }}>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Vendor Baru Terdaftar</div>
                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{selectedMonthData.total || 0}</div>
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    color: 'white'
                                }}>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Vendor Aktif Mengerjakan</div>
                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{selectedMonthData.activeVendors || 0}</div>
                                </div>
                            </div>

                            {/* Vendor List */}
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ClipboardList size={20} style={{ color: '#3b82f6' }} /> Daftar Vendor & Kontrak Aktif
                                </h3>

                                {selectedMonthData.activeVendorDetails && selectedMonthData.activeVendorDetails.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {selectedMonthData.activeVendorDetails.map((vendor: any, idx: number) => {
                                            // Get contract details for this vendor
                                            const vendorContracts = allContracts.filter(c => {
                                                const activeStatuses = ['Terkontrak', 'Dalam Proses Pekerjaan', 'Dalam Pemeriksaan', 'Telah Diperiksa'];
                                                if (!activeStatuses.includes(c.status)) return false;
                                                if (c.vendor_name !== vendor.vendorName) return false;

                                                const startDate = new Date(c.start_date);
                                                const endDate = new Date(c.end_date);
                                                const checkDate = new Date(selectedMonthData.year, selectedMonthData.monthIndex, 15);

                                                return checkDate >= startDate && checkDate <= endDate;
                                            });

                                            return (
                                                <div key={idx} style={{
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    background: '#f8fafc'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'start',
                                                        marginBottom: '12px'
                                                    }}>
                                                        <div>
                                                            <div style={{
                                                                fontSize: '16px',
                                                                fontWeight: '600',
                                                                color: '#1e293b',
                                                                marginBottom: '4px'
                                                            }}>
                                                                {idx + 1}. {vendor.vendorName}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                                {vendor.contractCount} kontrak aktif
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Contract Details */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                                                        {vendorContracts.map((contract: any, cIdx: number) => {
                                                            const startDate = new Date(contract.start_date);
                                                            const endDate = new Date(contract.end_date);

                                                            return (
                                                                <div key={cIdx} style={{
                                                                    background: 'white',
                                                                    padding: '12px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'start',
                                                                        gap: '12px'
                                                                    }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{
                                                                                fontSize: '14px',
                                                                                fontWeight: '600',
                                                                                color: '#334155',
                                                                                marginBottom: '6px'
                                                                            }}>
                                                                                {contract.name || contract.contract_number || 'Nama kontrak tidak tersedia'}
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: '12px',
                                                                                color: '#64748b',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '6px',
                                                                                marginBottom: '4px'
                                                                            }}>
                                                                                <Calendar size={14} style={{ flexShrink: 0 }} /> {startDate.toLocaleDateString('id-ID', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric'
                                                                                })} - {endDate.toLocaleDateString('id-ID', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: '12px',
                                                                                color: '#64748b',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '6px'
                                                                            }}>
                                                                                <DollarSign size={14} style={{ flexShrink: 0 }} /> {new Intl.NumberFormat('id-ID', {
                                                                                    style: 'currency',
                                                                                    currency: 'IDR',
                                                                                    minimumFractionDigits: 0
                                                                                }).format(contract.amount || 0)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span style={{
                                                                                fontSize: '11px',
                                                                                padding: '4px 10px',
                                                                                borderRadius: '6px',
                                                                                fontWeight: '600',
                                                                                background:
                                                                                    contract.status === 'Terkontrak' ? 'rgba(59, 130, 246, 0.12)' :
                                                                                        contract.status === 'Dalam Proses Pekerjaan' ? 'rgba(245, 158, 11, 0.12)' :
                                                                                            contract.status === 'Dalam Pemeriksaan' ? 'rgba(139, 92, 246, 0.12)' :
                                                                                                'rgba(6, 182, 212, 0.12)',
                                                                                color:
                                                                                    contract.status === 'Terkontrak' ? '#2563eb' :
                                                                                        contract.status === 'Dalam Proses Pekerjaan' ? '#d97706' :
                                                                                            contract.status === 'Dalam Pemeriksaan' ? '#7c3aed' :
                                                                                                '#0891b2',
                                                                                whiteSpace: 'nowrap'
                                                                            }}>
                                                                                {contract.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px',
                                        color: '#64748b',
                                        background: '#f8fafc',
                                        borderRadius: '12px'
                                    }}>
                                        <p>Tidak ada vendor yang aktif mengerjakan kontrak di bulan ini</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default Laporan
