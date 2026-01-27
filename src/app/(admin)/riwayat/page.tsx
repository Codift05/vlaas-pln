'use client'
import { useState, useEffect } from 'react'
import { FileText, UserPlus, FileEdit, Clock, History } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import './Riwayat.css'

interface Notification {
    id: string
    type: 'contract' | 'vendor' | 'amendment'
    title: string
    description: string
    time: string
    timestamp: Date
    icon: any
}

export default function RiwayatPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const getRelativeTime = (dateString: string): string => {
        if (!dateString) return 'Baru saja'
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins} menit yang lalu`
        if (diffHours < 24) return `${diffHours} jam yang lalu`
        if (diffDays < 7) return `${diffDays} hari yang lalu`
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const fetchNotifications = async () => {
        try {
            setLoading(true)

            // Fetch contract history with limit 50 for page
            const { data: contractHistory } = await supabase
                .from('contract_history')
                .select('*, contracts(name)')
                .order('created_at', { ascending: false })
                .limit(50)

            // Fetch vendors with limit 20
            const { data: vendors } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            const notifs: Notification[] = []

            if (contractHistory) {
                contractHistory.forEach((history: any) => {
                    const isAmendment = history.action.includes('Amandemen')
                    notifs.push({
                        id: `contract-${history.id}`,
                        type: isAmendment ? 'amendment' : 'contract',
                        title: history.action,
                        description: `${history.contracts?.name || 'Kontrak'} - ${history.details}`,
                        time: getRelativeTime(history.created_at),
                        timestamp: new Date(history.created_at),
                        icon: isAmendment ? FileEdit : FileText
                    })
                })
            }

            if (vendors) {
                vendors.forEach((vendor: any) => {
                    notifs.push({
                        id: `vendor-${vendor.id}`,
                        type: 'vendor',
                        title: 'Vendor Baru Terdaftar',
                        description: `${vendor.nama} telah ditambahkan sebagai vendor baru.`,
                        time: getRelativeTime(vendor.created_at),
                        timestamp: new Date(vendor.created_at),
                        icon: UserPlus
                    })
                })
            }

            // Sort by timestamp descending
            notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            setNotifications(notifs)
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="riwayat-container">
            <div className="riwayat-header">
                <h1 className="riwayat-title">Riwayat Aktivitas</h1>
                <p className="riwayat-subtitle">Log aktivitas sistem, perubahan kontrak, dan pendaftaran vendor terbaru.</p>
            </div>

            <div className="timeline-container">
                {loading ? (
                    <div className="empty-state">Loading...</div>
                ) : notifications.length > 0 ? (
                    notifications.map((item) => {
                        const Icon = item.icon
                        return (
                            <div key={item.id} className="timeline-item">
                                <div className={`timeline-icon-wrapper ${item.type}`}>
                                    <Icon size={20} strokeWidth={2} />
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <div className="timeline-title">{item.title}</div>
                                        <div className="timeline-time">{item.time}</div>
                                    </div>
                                    <div className="timeline-desc">{item.description}</div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="empty-state">
                        <History size={48} className="empty-icon" strokeWidth={1} />
                        <p>Belum ada riwayat aktivitas.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
