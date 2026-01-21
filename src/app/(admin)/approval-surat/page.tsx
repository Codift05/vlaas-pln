'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react'
import './ApprovalSurat.css'

interface SuratPengajuan {
    nomorSurat: string
    perihal: string
    tanggalPengajuan: string
    tanggalSurat: string
    namaPekerjaan?: string
    nomorKontrak?: string
    keterangan?: string
    fileName?: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    alasanPenolakan?: string
}

export default function ApprovalSurat() {
    const [suratList, setSuratList] = useState<SuratPengajuan[]>([])
    const [filteredList, setFilteredList] = useState<SuratPengajuan[]>([])
    const [filter, setFilter] = useState<string>('ALL')
    const [selectedSurat, setSelectedSurat] = useState<SuratPengajuan | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Load data from localStorage
    useEffect(() => {
        loadData()
    }, [])

    // Filter data when filter changes
    useEffect(() => {
        filterData()
    }, [filter, suratList])

    const loadData = () => {
        const data = JSON.parse(localStorage.getItem('vendorSubmissions') || '[]')
        setSuratList(data)
    }

    const filterData = () => {
        if (filter === 'ALL') {
            setFilteredList(suratList)
        } else {
            setFilteredList(suratList.filter(surat => surat.status === filter))
        }
        setCurrentPage(1)
    }

    const updateSuratStatus = (index: number, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        const updatedList = [...suratList]
        const actualIndex = suratList.findIndex(
            s => s.nomorSurat === filteredList[index].nomorSurat &&
                s.tanggalPengajuan === filteredList[index].tanggalPengajuan
        )

        if (actualIndex !== -1) {
            updatedList[actualIndex] = {
                ...updatedList[actualIndex],
                status,
                alasanPenolakan: reason || ''
            }

            localStorage.setItem('vendorSubmissions', JSON.stringify(updatedList))
            setSuratList(updatedList)
        }
    }

    const handleApprove = (index: number) => {
        if (confirm('Apakah Anda yakin ingin menyetujui surat ini?')) {
            updateSuratStatus(index, 'APPROVED')
        }
    }

    const handleReject = (index: number) => {
        setSelectedSurat(filteredList[index])
        setShowRejectModal(true)
        setRejectReason('')
    }

    const confirmReject = () => {
        if (!rejectReason.trim()) {
            alert('Alasan penolakan wajib diisi')
            return
        }

        const index = filteredList.findIndex(
            s => s.nomorSurat === selectedSurat?.nomorSurat &&
                s.tanggalPengajuan === selectedSurat?.tanggalPengajuan
        )

        if (index !== -1) {
            updateSuratStatus(index, 'REJECTED', rejectReason)
            setShowRejectModal(false)
            setSelectedSurat(null)
            setRejectReason('')
        }
    }

    const handleDetail = (surat: SuratPengajuan) => {
        setSelectedSurat(surat)
        setShowDetailModal(true)
    }

    // Statistics
    const stats = {
        pending: suratList.filter(s => s.status === 'PENDING').length,
        approved: suratList.filter(s => s.status === 'APPROVED').length,
        rejected: suratList.filter(s => s.status === 'REJECTED').length
    }

    // Pagination
    const totalPages = Math.ceil(filteredList.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentData = filteredList.slice(startIndex, startIndex + itemsPerPage)

    const getStatusBadge = (status: string) => {
        const config = {
            'PENDING': { className: 'status-pending', icon: Clock, text: 'Menunggu' },
            'APPROVED': { className: 'status-approved', icon: CheckCircle, text: 'Disetujui' },
            'REJECTED': { className: 'status-rejected', icon: XCircle, text: 'Ditolak' }
        }
        const { className, icon: Icon, text } = config[status] || config['PENDING']
        return (
            <span className={`status-badge ${className}`}>
                <Icon size={14} />
                {text}
            </span>
        )
    }

    return (
        <div className="approval-surat-container">
            <div className="approval-header">
                <h1>Approval Surat Pengajuan</h1>
                <p>Kelola persetujuan surat pengajuan dari vendor</p>
            </div>

            {/* Statistics */}
            <div className="approval-stats">
                <div className="approval-stat-card">
                    <div className="approval-stat-icon pending">
                        <Clock size={24} />
                    </div>
                    <div className="approval-stat-info">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Menunggu Approval</div>
                    </div>
                </div>
                <div className="approval-stat-card">
                    <div className="approval-stat-icon approved">
                        <CheckCircle size={24} />
                    </div>
                    <div className="approval-stat-info">
                        <div className="stat-value">{stats.approved}</div>
                        <div className="stat-label">Disetujui</div>
                    </div>
                </div>
                <div className="approval-stat-card">
                    <div className="approval-stat-icon rejected">
                        <XCircle size={24} />
                    </div>
                    <div className="approval-stat-info">
                        <div className="stat-value">{stats.rejected}</div>
                        <div className="stat-label">Ditolak</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="approval-table-container">
                <div className="approval-table-header">
                    <h2>Daftar Pengajuan Surat</h2>
                    <div className="approval-table-actions">
                        <select
                            className="filter-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="PENDING">Menunggu</option>
                            <option value="APPROVED">Disetujui</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                    </div>
                </div>

                {currentData.length === 0 ? (
                    <div className="empty-state">
                        <FileText className="empty-state-icon" size={64} />
                        <h3>Tidak ada data</h3>
                        <p>Belum ada pengajuan surat yang tersedia</p>
                    </div>
                ) : (
                    <>
                        <table className="approval-table">
                            <thead>
                                <tr>
                                    <th>Nomor Surat</th>
                                    <th>Perihal</th>
                                    <th>Tanggal Pengajuan</th>
                                    <th>Tanggal Surat</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((surat, index) => (
                                    <tr key={index}>
                                        <td>{surat.nomorSurat}</td>
                                        <td>{surat.perihal}</td>
                                        <td>{surat.tanggalPengajuan}</td>
                                        <td>{surat.tanggalSurat}</td>
                                        <td>{getStatusBadge(surat.status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-detail"
                                                    onClick={() => handleDetail(surat)}
                                                >
                                                    <Eye size={14} />
                                                    Detail
                                                </button>
                                                {surat.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            className="btn-approve"
                                                            onClick={() => handleApprove(startIndex + index)}
                                                        >
                                                            <CheckCircle size={14} />
                                                            Setuju
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => handleReject(startIndex + index)}
                                                        >
                                                            <XCircle size={14} />
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    ← Sebelumnya
                                </button>
                                <span className="page-info">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Selanjutnya →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedSurat && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Detail Surat Pengajuan</h3>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <div className="detail-label">Nomor Surat</div>
                                <div className="detail-value">{selectedSurat.nomorSurat}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Perihal</div>
                                <div className="detail-value">{selectedSurat.perihal}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Tanggal Pengajuan</div>
                                <div className="detail-value">{selectedSurat.tanggalPengajuan}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Tanggal Surat</div>
                                <div className="detail-value">{selectedSurat.tanggalSurat}</div>
                            </div>
                            {selectedSurat.namaPekerjaan && (
                                <div className="detail-row">
                                    <div className="detail-label">Nama Pekerjaan</div>
                                    <div className="detail-value">{selectedSurat.namaPekerjaan}</div>
                                </div>
                            )}
                            {selectedSurat.nomorKontrak && (
                                <div className="detail-row">
                                    <div className="detail-label">Nomor Kontrak</div>
                                    <div className="detail-value">{selectedSurat.nomorKontrak}</div>
                                </div>
                            )}
                            {selectedSurat.keterangan && (
                                <div className="detail-row">
                                    <div className="detail-label">Keterangan</div>
                                    <div className="detail-value">{selectedSurat.keterangan}</div>
                                </div>
                            )}
                            {selectedSurat.fileName && (
                                <div className="detail-row">
                                    <div className="detail-label">File Lampiran</div>
                                    <div className="detail-value">{selectedSurat.fileName}</div>
                                </div>
                            )}
                            <div className="detail-row">
                                <div className="detail-label">Status</div>
                                <div className="detail-value">{getStatusBadge(selectedSurat.status)}</div>
                            </div>
                            {selectedSurat.alasanPenolakan && (
                                <div className="detail-row">
                                    <div className="detail-label">Alasan Penolakan</div>
                                    <div className="detail-value">{selectedSurat.alasanPenolakan}</div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedSurat && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tolak Pengajuan Surat</h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                Surat: {selectedSurat.nomorSurat}
                            </p>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Alasan Penolakan <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Masukkan alasan penolakan..."
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                                Batal
                            </button>
                            <button className="btn-confirm danger" onClick={confirmReject}>
                                Tolak Surat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
