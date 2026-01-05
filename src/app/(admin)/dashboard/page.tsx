'use client'
import { useState, useEffect } from 'react'
import { Briefcase, CheckCircle, Clock, Users, FileText, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import * as vendorService from '../../../services/vendorService'
import './Dashboard.css'

export default function DashboardPage() {
    const [chartData, setChartData] = useState(Array(12).fill(null).map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][i],
        active: 0,
        warning: 0,
        danger: 0,
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
        active: 0,
        completed: 0,
        pending: 0,
        problem: 0,
        total: 0
    })

    const [isLoading, setIsLoading] = useState(true)

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
        } finally {
            setIsLoading(false)
        }
    }

    const fetchVendorData = async () => {
        const result = await vendorService.getDashboardVendorData()
        if (result.success && 'data' in result) {
            const { total, recent } = result.data
            setStats(prev => ({
                ...prev,
                totalVendors: total || 0
            }))
            setRecentVendors(recent || [])
        }
    }

    const fetchContractData = async () => {
        try {
            const { data, error } = await supabase
                .from('contracts')
                // Optimized query: Only fetch columns needed for stats & charts
                .select('id, name, status, start_date, created_at, vendor_name')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                console.log('Dashboard Data:', data) // Debug log
                processChartData(data)
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
        let dist = { active: 0, completed: 0, pending: 0, problem: 0, total: totalContracts }

        contracts.forEach(c => {
            const status = (c.status || '').toLowerCase()
            if (status === 'aktif' || status === 'terkontrak') {
                activeContracts++
                dist.active++
            } else if (status.includes('selesai') || status.includes('terbayar') || status.includes('diperiksa')) {
                dist.completed++
            } else if (status.includes('proses') || status.includes('perbaikan') || status.includes('amandemen')) {
                pendingContracts++
                dist.pending++
            } else {
                dist.problem++
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

    const processChartData = (contracts: any[]) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const newChartData = months.map(m => ({ month: m, active: 0, warning: 0, danger: 0, total: 0 }))

        contracts.forEach(contract => {
            if (!contract.start_date) return

            const date = new Date(contract.start_date)
            const monthIndex = date.getMonth() // 0-11

            if (monthIndex >= 0 && monthIndex < 12) {
                const status = (contract.status || '').toLowerCase()

                if (['aktif', 'selesai', 'terbayar', 'telah diperiksa'].includes(status)) {
                    newChartData[monthIndex].active += 1
                } else if (status.includes('proses') || status.includes('perbaikan') || status.includes('amandemen') || status.includes('terkontrak')) {
                    newChartData[monthIndex].warning += 1
                } else {
                    newChartData[monthIndex].danger += 1
                }
                newChartData[monthIndex].total += 1
            }
        })

        setChartData(newChartData)
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
        #2ecc71 0% ${getPieRotation((contractStatusDist.active / contractStatusDist.total) * 100 || 0)}deg, 
        #3b82f6 ${getPieRotation((contractStatusDist.active / contractStatusDist.total) * 100 || 0)}deg ${getPieRotation(((contractStatusDist.active + contractStatusDist.completed) / contractStatusDist.total) * 100 || 0)}deg,
        #f39c12 ${getPieRotation(((contractStatusDist.active + contractStatusDist.completed) / contractStatusDist.total) * 100 || 0)}deg ${getPieRotation(((contractStatusDist.active + contractStatusDist.completed + contractStatusDist.pending) / contractStatusDist.total) * 100 || 0)}deg,
        #e74c3c ${getPieRotation(((contractStatusDist.active + contractStatusDist.completed + contractStatusDist.pending) / contractStatusDist.total) * 100 || 0)}deg 100%
    )`

    return (
        <div>
            {/* Loading Overlay */}
            {isLoading && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="spinner" style={{
                        width: '40px', height: '40px', border: '3px solid #f3f3f3',
                        borderTop: '3px solid #3b82f6', borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <style jsx>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

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
                        <h3 className="card-title">Tren Kontrak Bulanan</h3>
                        <TrendingUp size={20} className="card-icon" />
                    </div>
                    <div className="chart-placeholder">
                        <div className="bar-chart">
                            {chartData.map((data, index) => {
                                const maxTotal = Math.max(...chartData.map(d => d.total), 1);
                                const heightPercentage = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
                                const activeHeigth = data.total > 0 ? (data.active / data.total) * 100 : 0;
                                const warningHeight = data.total > 0 ? (data.warning / data.total) * 100 : 0;
                                const dangerHeight = data.total > 0 ? (data.danger / data.total) * 100 : 0;

                                return (
                                    <div key={index} className="bar-wrapper">
                                        <div className="bar-stack-container" style={{ height: `${heightPercentage}%`, minHeight: data.total > 0 ? '4px' : '0' }}>
                                            <div className="bar-tooltip">
                                                <div className="tooltip-header">{data.month}</div>
                                                <div className="tooltip-row"><span className="dot active"></span> Selesai/Aktif: {data.active}</div>
                                                <div className="tooltip-row"><span className="dot warning"></span> Proses/Rev: {data.warning}</div>
                                                <div className="tooltip-row"><span className="dot danger"></span> Batal/Masalah: {data.danger}</div>
                                                <div className="tooltip-total">Total: {data.total}</div>
                                            </div>
                                            {data.danger > 0 && <div className="bar-segment danger" style={{ height: `${dangerHeight}%` }}></div>}
                                            {data.warning > 0 && <div className="bar-segment warning" style={{ height: `${warningHeight}%` }}></div>}
                                            {data.active > 0 && <div className="bar-segment active" style={{ height: `${activeHeigth}%` }}></div>}
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
                            <span className="legend-text">Aktif</span>
                            <span className="legend-value">{contractStatusDist.active}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#3b82f6' }}></span>
                            <span className="legend-text">Selesai</span>
                            <span className="legend-value">{contractStatusDist.completed}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#f39c12' }}></span>
                            <span className="legend-text">Proses</span>
                            <span className="legend-value">{contractStatusDist.pending}</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: '#e74c3c' }}></span>
                            <span className="legend-text">Masalah</span>
                            <span className="legend-value">{contractStatusDist.problem}</span>
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
