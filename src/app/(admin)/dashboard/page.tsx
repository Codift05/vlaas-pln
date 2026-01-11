'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, CheckCircle, Clock, Users, FileText, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import * as vendorService from '../../../services/vendorService'
import './Dashboard.css'

export default function DashboardPage() {
    const router = useRouter()
    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [allVendors, setAllVendors] = useState<any[]>([])
    const [chartData, setChartData] = useState(Array(12).fill(null).map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][i],
        total: 0
    })))

    const [stats, setStats] = useState({
        totalContracts: 0,
        activeContracts: 0,
        pendingContracts: 0,
        totalVendors: 0
    })

    const [recentActivities, setRecentActivities] = useState<any[]>([])
    const [recentVendors, setRecentVendors] = useState<any[]>([])
    const [contractStatusDist, setContractStatusDist] = useState({
        terkontrak: 0,
        onprogress: 0,
        selesai: 0,
        terbayar: 0,
        total: 0
    })

    useEffect(() => {
        let mounted = true

        const loadData = async () => {
            await fetchDashboardData()
        }

        // Initial load
        loadData()

        return () => {
            mounted = false
        }
    }, [])

    // Re-process vendor chart data saat allVendors atau year berubah
    useEffect(() => {
        if (allVendors.length > 0) {
            processVendorChartData(allVendors, selectedYear)
        }
    }, [selectedYear, allVendors])

    const fetchDashboardData = async () => {
        try {
            const results = await Promise.all([
                fetchContractData(),
                fetchVendorData()
            ])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    const fetchVendorData = async () => {
        try {
            const result = await vendorService.getDashboardVendorData()

            if (result.success && 'data' in result) {
                const { total, recent, allVendors: vendorsForChart } = result.data
                setStats(prev => ({
                    ...prev,
                    totalVendors: total || 0
                }))
                setRecentVendors(recent || [])

                if (vendorsForChart && vendorsForChart.length > 0) {
                    // Cek tahun yang tersedia dari data
                    const years = new Set<number>()
                    vendorsForChart.forEach((v: any) => {
                        if (v.created_at) years.add(new Date(v.created_at).getFullYear())
                    })
                    const yearArray = Array.from(years).sort((a, b) => b - a)

                    // Jika tahun sekarang tidak ada datanya, gunakan tahun terbaru yang ada datanya
                    if (yearArray.length > 0 && !yearArray.includes(selectedYear)) {
                        setSelectedYear(yearArray[0])
                    }

                    // Set vendors LAST - useEffect will handle chart processing
                    setAllVendors(vendorsForChart)
                }
            }
        } catch (error) {
            console.error('Error in fetchVendorData:', error)
        }
    }


    const fetchContractData = async () => {
        try {
            const { data, error } = await supabase
                .from('contracts')
                // Optimized query: Only fetch columns needed for stats & charts
                .select('id, name, status, start_date, created_at, vendor_name')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase query error:', error)
                throw error
            }

            if (data) {
                processStatsAndActivities(data)
            }
        } catch (error: any) {
            const errorMsg = error?.message || error?.error_description || 'Unknown error'
            console.error('Error fetching contract data:', errorMsg)
            console.error('Full error object:', error)
            // Set empty data to prevent UI crash
            processStatsAndActivities([])
        }
    }

    const processStatsAndActivities = (contracts: any[]) => {
        // 1. Calculate Stats
        const totalContracts = contracts.length
        let activeContracts = 0
        let pendingContracts = 0

        // Status breakdown for Pie Chart
        let dist = { selesai: 0, telahdiperiksa: 0, terbayar: 0, total: totalContracts }

        contracts.forEach(c => {
            const status = (c.status || '').toLowerCase()
            if (status === 'selesai') {
                activeContracts++
                dist.selesai++
            } else if (status.includes('diperiksa')) {
                dist.telahdiperiksa++
            } else if (status === 'terbayar') {
                dist.terbayar++
            }
        })

        setStats(prev => ({
            ...prev,
            totalContracts,
            activeContracts,
            pendingContracts
        }))

        setContractStatusDist(dist)

        // 2. Recent Activities (Latest 4)
        const latest = contracts.slice(0, 4).map(c => ({
            contractId: c.id,
            action: 'Kontrak Baru',
            item: c.name || 'Tanpa Judul',
            vendor: c.vendor_name || 'Vendor Unknown',
            time: new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            icon: Briefcase
        }))
        setRecentActivities(latest)
    }

    const processVendorChartData = (vendors: any[], year: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const newChartData = months.map(m => ({ month: m, total: 0 }))

        vendors.forEach(vendor => {
            if (!vendor.created_at) return

            const date = new Date(vendor.created_at)
            const vendorYear = date.getFullYear()
            const monthIndex = date.getMonth() // 0-11

            if (vendorYear === year && monthIndex >= 0 && monthIndex < 12) {
                newChartData[monthIndex].total += 1
            }
        })

        setChartData(newChartData)
    }

    // Memoize handlers to prevent unnecessary re-renders
    const handleYearChange = useCallback((year: number) => {
        setSelectedYear(year)
    }, [])

    // Memoize available years - only recalculate when allVendors changes
    const availableYears = useMemo(() => {
        const years = new Set<number>()
        allVendors.forEach(vendor => {
            if (vendor.created_at) {
                years.add(new Date(vendor.created_at).getFullYear())
            }
        })
        const yearArray = Array.from(years).sort((a, b) => b - a)
        if (yearArray.length === 0) yearArray.push(currentYear)
        return yearArray
    }, [allVendors, currentYear])

    const handleContractClick = useCallback((contractId: string) => {
        router.push(`/aset?id=${contractId}`)
    }, [router])

    const handleVendorClick = useCallback(() => {
        router.push('/vendor')
    }, [router])

    // Memoize statCards to prevent recreation on each render
    const statCards = useMemo(() => [
        { title: 'Total Kontrak', value: stats.totalContracts, icon: Briefcase, className: 'stat-blue' },
        { title: 'Kontrak Aktif', value: stats.activeContracts, icon: CheckCircle, className: 'stat-green' },
        { title: 'Proses / Review', value: stats.pendingContracts, icon: Clock, className: 'stat-orange' },
        { title: 'Total Vendor', value: stats.totalVendors, icon: Users, className: 'stat-purple' },
    ], [stats])

    // Pie Chart Calculations
    const getPieRotation = (percentage: number) => percentage * 3.6 // 360deg / 100%

    // Memoize pieGradient to prevent recalculation on each render
    const pieGradient = useMemo(() => `conic-gradient(
        #f39c12 0% ${getPieRotation((contractStatusDist.selesai / contractStatusDist.total) * 100 || 0)}deg, 
        #9333ea ${getPieRotation((contractStatusDist.selesai / contractStatusDist.total) * 100 || 0)}deg ${getPieRotation(((contractStatusDist.selesai + contractStatusDist.telahdiperiksa) / contractStatusDist.total) * 100 || 0)}deg,
        #2ecc71 ${getPieRotation(((contractStatusDist.selesai + contractStatusDist.telahdiperiksa) / contractStatusDist.total) * 100 || 0)}deg 100%
    )`, [contractStatusDist])

    return (
        <div>
            {/* Stats Cards */}
            <div className="stats-grid">
                {statCards.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="stat-card">
                            <div className={`stat-icon-wrapper ${stat.className}`}>
                                <IconComponent className="stat-icon-svg" strokeWidth={2.5} size={28} />
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
                        <h3 className="card-title">Tren Vendor Baru Bulanan</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#334155',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <TrendingUp size={20} className="card-icon" />
                        </div>
                    </div>
                    <div className="chart-placeholder">
                        <div className="bar-chart">
                            {chartData.map((data, index) => {
                                // Fixed height: 200px jika ada data, 0 jika tidak
                                const barHeight = data.total > 0 ? 200 : 0;

                                return (
                                    <div key={`${data.month}-${data.total}-${selectedYear}`} className="bar-wrapper">
                                        <div
                                            className="bar-stack-container"
                                            style={{
                                                height: `${barHeight}px`,
                                                backgroundColor: data.total > 0 ? '#2ecc71' : 'transparent',
                                                borderRadius: '6px 6px 0 0',
                                                boxShadow: data.total > 0 ? '0 0 10px rgba(46, 204, 113, 0.2)' : 'none'
                                            }}
                                        >
                                            <div className="bar-tooltip">
                                                <div className="tooltip-header">{data.month} {selectedYear}</div>
                                                <div className="tooltip-total">Vendor Baru: {data.total}</div>
                                            </div>
                                        </div>
                                        <span className="bar-label">{data.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Komposisi Status</h3>
                        <Activity size={20} className="card-icon" />
                    </div>
                    <div className="pie-chart-container">
                        <div className="pie-chart" style={{ background: contractStatusDist.total > 0 ? pieGradient : '#e2e8f0' }}>
                            <div className="pie-slice"></div>
                        </div>
                        <div className="pie-center">
                            <div className="pie-total">{contractStatusDist.total}</div>
                            <div className="pie-label">Kontrak</div>
                        </div>
                    </div>
                    <div className="pie-legend">
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#f39c12' }}></span>
                            <span className="legend-text">Selesai</span>
                            <span className="legend-value">{contractStatusDist.selesai}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#9333ea' }}></span>
                            <span className="legend-text">Telah Diperiksa</span>
                            <span className="legend-value">{contractStatusDist.telahdiperiksa}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#2ecc71' }}></span>
                            <span className="legend-text">Terbayar</span>
                            <span className="legend-value">{contractStatusDist.terbayar}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Recent Activities & Vendors */}
            <div className="dashboard-bottom-grid">
                {/* Recent Activities */}
                <div className="activity-section">
                    <div className="card-header">
                        <h3 className="card-title">Kontrak Terbaru</h3>
                        <FileText size={20} className="card-icon" />
                    </div>
                    <div className="activity-list">
                        {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
                            const ActivityIcon = activity.icon
                            return (
                                <div
                                    key={index}
                                    className="activity-item"
                                    onClick={() => handleContractClick(activity.contractId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="activity-icon-wrapper">
                                        <ActivityIcon className="activity-icon-svg" size={20} strokeWidth={2} />
                                    </div>
                                    <div className="activity-details">
                                        <p className="activity-action">{activity.action} - {activity.vendor}</p>
                                        <p className="activity-item-name">{activity.item}</p>
                                    </div>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            )
                        }) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada aktivitas kontrak terbaru.</div>
                        )}
                    </div>
                </div>

                {/* Vendor List */}
                <div className="vendor-section">
                    <div className="card-header">
                        <h3 className="card-title">Vendor Terbaru</h3>
                        <Users size={20} className="card-icon" />
                    </div>
                    <div className="vendor-list">
                        {recentVendors.length > 0 ? recentVendors.map((vendor, index) => (
                            <div
                                key={index}
                                className="vendor-item"
                                onClick={handleVendorClick}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="vendor-icon-wrapper">
                                    <Users className="activity-icon-svg" size={20} strokeWidth={2} />
                                </div>
                                <div className="activity-details">
                                    <p className="activity-action">{vendor.nama}</p>
                                    <p className="activity-item-name">{vendor.kategori} - {vendor.email}</p>
                                </div>
                                <span className={`vendor-status-badge ${vendor.status === 'Aktif' ? 'vendor-status-active' : 'vendor-status-inactive'}`}>
                                    {vendor.status}
                                </span>
                            </div>
                        )) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada data vendor.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
