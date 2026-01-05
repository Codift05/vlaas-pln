'use client'
import { useState, useEffect } from 'react'
import { Briefcase, CheckCircle, Clock, Users, FileText, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import * as vendorService from '../../../services/vendorService'
import './Dashboard.css'

export default function DashboardPage() {
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
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            await Promise.all([
                fetchContractData(),
                fetchVendorData()
            ])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    const fetchVendorData = async () => {
        const result = await vendorService.getAllVendors()
        if (result.success && 'data' in result) {
            const vendors = result.data as any[]
            setAllVendors(vendors)
            setStats(prev => ({
                ...prev,
                totalVendors: vendors.length
            }))
            // Take top 5 vendors
            setRecentVendors(vendors.slice(0, 5))
            // Process vendor chart data
            processVendorChartData(vendors, selectedYear)
        }
    }

    const fetchContractData = async () => {
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                console.log('Dashboard Data:', data) // Debug log
                processStatsAndActivities(data)
            }
        } catch (error) {
            console.error('Error fetching contract data:', JSON.stringify(error, null, 2))
        }
    }

    const processStatsAndActivities = (contracts: any[]) => {
        // 1. Calculate Stats
        const totalContracts = contracts.length
        let activeContracts = 0
        let pendingContracts = 0

        // Status breakdown for Pie Chart
        let dist = { terkontrak: 0, onprogress: 0, selesai: 0, terbayar: 0, total: totalContracts }

        contracts.forEach(c => {
            const status = (c.status || '').toLowerCase()
            if (status === 'terkontrak') {
                activeContracts++
                dist.terkontrak++
            } else if (status.includes('proses') || status.includes('pekerjaan') || status.includes('pemeriksaan') || status.includes('diperiksa')) {
                pendingContracts++
                dist.onprogress++
            } else if (status === 'selesai') {
                dist.selesai++
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

    const handleYearChange = (year: number) => {
        setSelectedYear(year)
        processVendorChartData(allVendors, year)
    }

    // Generate available years from vendor data
    const getAvailableYears = () => {
        const years = new Set<number>()
        allVendors.forEach(vendor => {
            if (vendor.created_at) {
                years.add(new Date(vendor.created_at).getFullYear())
            }
        })
        const yearArray = Array.from(years).sort((a, b) => b - a)
        if (yearArray.length === 0) yearArray.push(currentYear)
        return yearArray
    }

    const statCards = [
        { title: 'Total Kontrak', value: stats.totalContracts, icon: Briefcase, className: 'stat-blue' },
        { title: 'Kontrak Aktif', value: stats.activeContracts, icon: CheckCircle, className: 'stat-green' },
        { title: 'Proses / Review', value: stats.pendingContracts, icon: Clock, className: 'stat-orange' },
        { title: 'Total Vendor', value: stats.totalVendors, icon: Users, className: 'stat-purple' },
    ]

    // Pie Chart Calculations
    const getPieRotation = (percentage: number) => percentage * 3.6 // 360deg / 100%

    // Pie Slices (Simplified for visual distribution)
    // We will use CSS Conic Gradients for a cleaner multi-segment donut
    const pieGradient = `conic-gradient(
        #2ecc71 0% ${getPieRotation((contractStatusDist.terkontrak / contractStatusDist.total) * 100 || 0)}deg, 
        #3b82f6 ${getPieRotation((contractStatusDist.terkontrak / contractStatusDist.total) * 100 || 0)}deg ${getPieRotation(((contractStatusDist.terkontrak + contractStatusDist.selesai) / contractStatusDist.total) * 100 || 0)}deg,
        #f39c12 ${getPieRotation(((contractStatusDist.terkontrak + contractStatusDist.selesai) / contractStatusDist.total) * 100 || 0)}deg ${getPieRotation(((contractStatusDist.terkontrak + contractStatusDist.selesai + contractStatusDist.onprogress) / contractStatusDist.total) * 100 || 0)}deg,
        #e74c3c ${getPieRotation(((contractStatusDist.terkontrak + contractStatusDist.selesai + contractStatusDist.onprogress) / contractStatusDist.total) * 100 || 0)}deg 100%
    )`

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
                                {getAvailableYears().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <TrendingUp size={20} className="card-icon" />
                        </div>
                    </div>
                    <div className="chart-placeholder">
                        <div className="bar-chart">
                            {chartData.map((data, index) => {
                                const maxTotal = Math.max(...chartData.map(d => d.total), 1);
                                const heightPercentage = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
                                // Dynamic minHeight based on data value
                                const dynamicMinHeight = data.total > 0 ? Math.max(data.total * 8, 12) : 0;

                                return (
                                    <div key={index} className="bar-wrapper">
                                        <div className="bar-stack-container" style={{ 
                                            height: `${heightPercentage}%`, 
                                            minHeight: data.total > 0 ? `${dynamicMinHeight}px` : '0' 
                                        }}>
                                            <div className="bar-tooltip">
                                                <div className="tooltip-header">{data.month} {selectedYear}</div>
                                                <div className="tooltip-total">Vendor Baru: {data.total}</div>
                                            </div>
                                            {data.total > 0 && <div className="bar-segment active" style={{ height: '100%' }}></div>}
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
                            <span className="legend-color" style={{ background: '#2ecc71' }}></span>
                            <span className="legend-text">Terkontrak</span>
                            <span className="legend-value">{contractStatusDist.terkontrak}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#3b82f6' }}></span>
                            <span className="legend-text">Selesai</span>
                            <span className="legend-value">{contractStatusDist.selesai}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#f39c12' }}></span>
                            <span className="legend-text">OnProgress</span>
                            <span className="legend-value">{contractStatusDist.onprogress}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#e74c3c' }}></span>
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
                                <div key={index} className="activity-item">
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
                            <div key={index} className="vendor-item">
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
