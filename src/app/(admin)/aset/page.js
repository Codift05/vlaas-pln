'use client'
import { useState, useRef, useEffect } from 'react'

import { Eye, Edit, Trash2, Search, ChevronDown, Plus, Save, Upload, Calendar, Clock, ArrowRight, FileText } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import './ManajemenAset.css'

function ManajemenAset() {
    // Debug log to help diagnose blank page
    console.log('ManajemenAset render start');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const columnSelectorRef = useRef(null);
    const [columnVisibility, setColumnVisibility] = useState({
        id: true,
        name: true,
        vendorName: true,
        budgetType: true,
        contractType: true,
        // category: true, // kategori dihapus
        location: true,
        status: true,
        startDate: true,
        endDate: true
    });
    // State untuk Detail Modal
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedAsset, setSelectedAsset] = useState(null)

    const handleViewDetail = (asset) => {
        setSelectedAsset(asset)
        setShowDetailModal(true)
    }
    // State untuk upload PDF
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [uploadSuccess, setUploadSuccess] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [selectedContractId, setSelectedContractId] = useState(null)

    // Buka modal upload
    function openUploadModal(contractId) {
        setSelectedContractId(contractId)
        setUploadError('')
        setUploadSuccess('')
        setSelectedFile(null)
        setShowUploadModal(true)
    }

    // Handle upload PDF
    async function handleUpload() {
        setUploading(true)
        setUploadError('')
        setUploadSuccess('')
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('contract_id', selectedContractId)
            const res = await fetch('/functions/v1/upload_pdf_to_drive', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload gagal')
            // Simpan ke Supabase table
            const { error } = await supabase
                .from('contract_files')
                .insert([{ contract_id: selectedContractId, file_url: data.webViewLink }])
            if (error) throw new Error(error.message)
            setUploadSuccess('Upload berhasil! Link: ' + data.webViewLink)
        } catch (err) {
            setUploadError(err.message)
        } finally {
            setUploading(false)
        }
    }
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        recipient: '',
        invoiceNumber: '',
        amount: '',
        budgetType: '',
        contractType: '',
        // category: '', // kategori dihapus
        location: '',
        status: 'Aktif',
        startDate: '',
        endDate: ''
    });

    const assets = [
        { id: 'AST001', name: 'Transformer 500KVA', vendorName: 'PT Elektrindo Jaya', recipient: 'Divisi Operasi PLN', invoiceNumber: 'INV-2025-001', amount: 1500000000, budgetType: 'AI', contractType: 'PJ', category: 'Trafo', location: 'Gardu Induk Jakarta', status: 'Aktif', startDate: '01/01/2025', endDate: '31/12/2025' },
        { id: 'AST002', name: 'Generator Set Diesel', vendorName: 'CV Maju Bersama Electric', recipient: 'Divisi Pemeliharaan', invoiceNumber: 'INV-2025-002', amount: 900000000, budgetType: 'AO', contractType: 'SPK', category: 'Generator', location: 'PLTD Surabaya', status: 'Aktif', startDate: '15/02/2025', endDate: '15/08/2025' },
        { id: 'AST003', name: 'Circuit Breaker 20KV', vendorName: 'PT Sentosa Generator', recipient: 'Divisi Proteksi', invoiceNumber: 'INV-2025-003', amount: 500000000, budgetType: 'AI', contractType: 'PO', category: 'CB', location: 'Gardu Induk Bandung', status: 'Perbaikan', startDate: '01/03/2025', endDate: '30/06/2025' },
        { id: 'AST004', name: 'Panel Distribusi', vendorName: 'CV Kabel Utama Indonesia', recipient: 'Divisi Distribusi', invoiceNumber: 'INV-2025-004', amount: 700000000, budgetType: 'AO', contractType: 'PJ', category: 'Panel', location: 'Gardu Distribusi A12', status: 'Aktif', startDate: '10/01/2025', endDate: '10/07/2025' },
        { id: 'AST005', name: 'Kabel XLPE 150mm', vendorName: 'PT Teknindo Power System', recipient: 'Divisi Jaringan', invoiceNumber: 'INV-2025-005', amount: 1200000000, budgetType: 'AI', contractType: 'SPK', category: 'Kabel', location: 'Jaringan Tegangan Menengah', status: 'Aktif', startDate: '20/02/2025', endDate: '20/11/2025' },
        { id: 'AST006', name: 'Transformer 1000KVA', vendorName: 'PT Elektrindo Jaya', recipient: 'Divisi Investasi', invoiceNumber: 'INV-2025-006', amount: 2000000000, budgetType: 'AO', contractType: 'PO', category: 'Trafo', location: 'Gardu Induk Semarang', status: 'Tidak Aktif', startDate: '05/01/2025', endDate: '05/05/2025' },
    ]
    // Countdown timer for detail modal
    const [timeRemaining, setTimeRemaining] = useState('');
    useEffect(() => {
        if (!showDetailModal || !selectedAsset) return;
        function updateCountdown() {
            const now = new Date();
            const end = new Date(selectedAsset.endDate.split('/').reverse().join('-'));
            const diff = end - now;
            if (diff <= 0) {
                setTimeRemaining('Sudah melewati tenggat!');
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeRemaining(`${days} hari ${hours} jam ${minutes} menit ${seconds} detik`);
        }
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [showDetailModal, selectedAsset]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target)) {
                setShowColumnSelector(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])


    const toggleColumnVisibility = (column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column]
        }))
    }

    const getVisibleColumnsCount = () => {
        return Object.values(columnVisibility).filter(Boolean).length
    }

    // Filter assets berdasarkan search term dan status
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || asset.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusClass = (status) => {
        switch (status) {
            case 'Aktif': return 'status-active'
            case 'Perbaikan': return 'status-maintenance'
            case 'Tidak Aktif': return 'status-inactive'
            default: return ''
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Di sini nanti bisa ditambahkan logika untuk menyimpan ke database
        console.log('Data Kontrak baru:', formData)
        alert('Kontrak berhasil ditambahkan!')
        setShowModal(false)
        // Reset form
        setFormData({
            id: '',
            name: '',
            budgetType: '',
            contractType: '',
            category: '',
            location: '',
            status: 'Aktif',
            startDate: '',
            endDate: ''
        })
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setFormData({
            id: '',
            name: '',
            budgetType: '',
            contractType: '',
            category: '',
            location: '',
            status: 'Aktif',
            startDate: '',
            endDate: ''
        })
    }

    try {
        return (
            <>
                {/* Action Bar */}
                <div className="action-bar">
                    <div className="filter-section">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Semua Status</option>
                            <option value="Aktif">Aktif</option>
                            <option value="Perbaikan">Perbaikan</option>
                            <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Cari Kontrak berdasarkan nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-table"
                        />

                        {searchTerm && (
                            <span className="search-result-count">
                                Ditemukan {filteredAssets.length} kontrak
                            </span>
                        )}
                    </div>

                    <div className="action-buttons-group">
                        <div className="column-selector" ref={columnSelectorRef}>
                            <button
                                className="column-selector-btn"
                                onClick={() => setShowColumnSelector(!showColumnSelector)}
                            >
                                <Eye size={18} /> Pilih Kolom ({getVisibleColumnsCount()}/9)
                            </button>
                            {showColumnSelector && (
                                <div className="column-dropdown">
                                    <div className="column-dropdown-header">
                                        <span>Tampilkan Kolom</span>
                                    </div>
                                    <div className="column-options">
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.id}
                                                onChange={() => toggleColumnVisibility('id')}
                                            />
                                            <span>Nomor Kontrak</span>
                                        </label>
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.name}
                                                onChange={() => toggleColumnVisibility('name')}
                                            />
                                            <span>Nama Kontrak</span>
                                        </label>
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.vendorName}
                                                onChange={() => toggleColumnVisibility('vendorName')}
                                            />
                                            <span>Nama Vendor</span>
                                        </label>
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.budgetType}
                                                onChange={() => toggleColumnVisibility('budgetType')}
                                            />
                                            <span>Tipe Anggaran</span>
                                        </label>
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.contractType}
                                                onChange={() => toggleColumnVisibility('contractType')}
                                            />
                                            <span>Tipe Kontrak</span>
                                        </label>

                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.location}
                                                onChange={() => toggleColumnVisibility('location')}
                                            />
                                            <span>Lokasi</span>
                                        </label>
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.status}
                                                onChange={() => toggleColumnVisibility('status')}
                                            />
                                            <span>Status</span>
                                        </label>
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.startDate}
                                                onChange={() => toggleColumnVisibility('startDate')}
                                            />
                                            <span>Tanggal Mulai</span>
                                        </label>
                                        <label className="column-option">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility.endDate}
                                                onChange={() => toggleColumnVisibility('endDate')}
                                            />
                                            <span>Tanggal Selesai</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Tambah Kontrak Baru
                        </button>
                    </div>
                </div>

                {/* Assets Table */}
                <div className="table-container">
                    <table className="assets-table">
                        <thead>
                            <tr>
                                {columnVisibility.id && <th>Nomor Kontrak</th>}
                                {columnVisibility.name && <th>Nama Kontrak</th>}
                                {columnVisibility.vendorName && <th>Nama Vendor</th>}
                                {columnVisibility.budgetType && <th>Tipe Anggaran</th>}
                                {columnVisibility.contractType && <th>Tipe Kontrak</th>}

                                {columnVisibility.location && <th>Lokasi</th>}
                                {columnVisibility.status && <th>Status</th>}
                                {columnVisibility.startDate && <th>Tanggal Mulai</th>}
                                {columnVisibility.endDate && <th>Tanggal Selesai</th>}
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id}>
                                        {columnVisibility.id && <td className="asset-id">{asset.id}</td>}
                                        {columnVisibility.name && <td className="asset-name">{asset.name}</td>}
                                        {columnVisibility.vendorName && <td className="asset-vendor">{asset.vendorName}</td>}
                                        {columnVisibility.budgetType && (
                                            <td>
                                                <span className={`budget-badge budget-${asset.budgetType.toLowerCase()}`}>
                                                    {asset.budgetType}
                                                </span>
                                            </td>
                                        )}
                                        {columnVisibility.contractType && (
                                            <td>
                                                <span className={`contract-badge contract-${asset.contractType.toLowerCase()}`}>
                                                    {asset.contractType}
                                                </span>
                                            </td>
                                        )}

                                        {columnVisibility.location && <td>{asset.location}</td>}
                                        {columnVisibility.status && (
                                            <td>
                                                <span className={`status-badge ${getStatusClass(asset.status)}`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                        )}
                                        {columnVisibility.startDate && <td>{asset.startDate}</td>}
                                        {columnVisibility.endDate && <td>{asset.endDate}</td>}
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon btn-view" title="Lihat Detail" onClick={() => handleViewDetail(asset)}><Eye size={16} /></button>
                                                <button className="btn-icon btn-edit" title="Edit"><Edit size={16} /></button>
                                                <button className="btn-icon btn-delete" title="Hapus"><Trash2 size={16} /></button>
                                                <button className="btn-icon btn-upload" title="Upload PDF" onClick={() => openUploadModal(asset.id)}><Upload size={16} /></button>
                                            </div>
                                            {/* Modal Upload PDF */}
                                            {showUploadModal && (
                                                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                                                    <div className="modal-upload-content" onClick={e => e.stopPropagation()}>
                                                        <div className="modal-upload-title">Upload PDF Kontrak</div>
                                                        <input
                                                            className="modal-upload-input"
                                                            type="file"
                                                            accept="application/pdf"
                                                            onChange={e => setSelectedFile(e.target.files[0])}
                                                        />
                                                        <button
                                                            onClick={handleUpload}
                                                            disabled={!selectedFile || uploading}
                                                            className="modal-upload-btn"
                                                        >
                                                            {uploading ? 'Uploading...' : 'Upload'}
                                                        </button>
                                                        {uploadError && <div className="modal-upload-status" style={{ color: 'red' }}>{uploadError}</div>}
                                                        {uploadSuccess && <div className="modal-upload-status" style={{ color: 'green' }}>{uploadSuccess}</div>}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={getVisibleColumnsCount() + 1} className="no-data">
                                        <div className="no-data-message">
                                            <span className="no-data-icon"><Search size={48} /></span>
                                            <p>Tidak ada kontrak yang ditemukan</p>
                                            <small>Coba gunakan kata kunci yang berbeda atau ubah filter status</small>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAssets.length > 0 && (
                    <div className="table-pagination">
                        <span className="pagination-info">
                            Menampilkan 1-{filteredAssets.length} dari {filteredAssets.length} data
                        </span>
                        <div className="pagination-controls">
                            <button className="pagination-btn">‹ Sebelumnya</button>
                            <button className="pagination-btn active">1</button>
                            <button className="pagination-btn">2</button>
                            <button className="pagination-btn">3</button>
                            <button className="pagination-btn">Selanjutnya ›</button>
                        </div>
                    </div>

                )
                }

                {/* Modal Detail Kontrak */}
                {
                    showDetailModal && selectedAsset && (
                        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Detail Kontrak</h2>
                                    <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
                                </div>
                                <div className="modal-body">
                                    <div className="detail-section">
                                        <h3 className="detail-section-title">
                                            <FileText size={20} /> Informasi Pekerjaan
                                        </h3>

                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label className="detail-label">Nomor Kontrak</label>
                                                <div className="detail-value">{selectedAsset.id}</div>
                                            </div>
                                            <div className="detail-item">
                                                <label className="detail-label">Status Saat Ini</label>
                                                <div>
                                                    <span className={`status-badge ${getStatusClass(selectedAsset.status)}`}>
                                                        {selectedAsset.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <label className="detail-label">Nomor Tagihan</label>
                                                <div className="detail-value">{selectedAsset.invoiceNumber}</div>
                                            </div>
                                            <div className="detail-item">
                                                <label className="detail-label">Nilai Kontrak</label>
                                                <div className="detail-value">Rp {selectedAsset.amount?.toLocaleString('id-ID')}</div>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label className="detail-label">Nama Pekerjaan / Kontrak</label>
                                                <div className="detail-value detail-value-lg">{selectedAsset.name}</div>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label className="detail-label">Pelaksana (Vendor)</label>
                                                <div className="detail-value">{selectedAsset.vendorName}</div>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label className="detail-label">Ditujukan Kepada</label>
                                                <div className="detail-value">{selectedAsset.recipient}</div>
                                            </div>
                                        </div>

                                        <div className="time-range-title">
                                            <Calendar size={18} /> Rentang Waktu Pelaksanaan
                                        </div>
                                        <div className="time-range-container">
                                            <div className="time-box">
                                                <div className="time-label">Tanggal Mulai</div>
                                                <div className="time-value">{selectedAsset.startDate}</div>
                                            </div>
                                            <div className="time-arrow">
                                                <ArrowRight size={24} strokeWidth={1.5} />
                                            </div>
                                            <div className="time-box">
                                                <div className="time-label">Tanggal Selesai</div>
                                                <div className="time-value">{selectedAsset.endDate}</div>
                                            </div>
                                        </div>
                                        <div className="time-remaining-info" style={{marginTop:8, fontWeight:500, color: timeRemaining.includes('melewati') ? 'red' : '#219150'}}>
                                            Sisa waktu: {timeRemaining}
                                        </div>
                                        {timeRemaining.includes('melewati') && (
                                            <div className="deadline-notif" style={{color:'red',fontWeight:700,marginTop:4}}>
                                                ⚠️ Kontrak ini sudah melewati tenggat waktu!
                                            </div>
                                        )}

                                        <div className="detail-table-wrapper">
                                            <table className="detail-table">
                                                <tbody>
                                                    <tr>
                                                        <td>Tipe Anggaran</td>
                                                        <td><span className={`budget-badge budget-${selectedAsset.budgetType.toLowerCase()}`}>{selectedAsset.budgetType}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Tipe Kontrak</td>
                                                        <td><span className={`contract-badge contract-${selectedAsset.contractType.toLowerCase()}`}>{selectedAsset.contractType}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Kategori Aset</td>
                                                        <td>{selectedAsset.category}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Lokasi Pekerjaan</td>
                                                        <td>{selectedAsset.location}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Modal Tambah Aset */}
                {
                    showModal && (
                        <div className="modal-overlay" onClick={handleCloseModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Tambah Kontrak Baru</h2>
                                    <button className="modal-close" onClick={handleCloseModal}>✕</button>
                                </div>

                                <form onSubmit={handleSubmit} className="modal-form">
                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label htmlFor="id">Nomor Kontrak <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                id="id"
                                                name="id"
                                                value={formData.id}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: KTR007"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="name">Nama Kontrak <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: Kontrak Pemeliharaan Transformer"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="recipient">Ditujukan Kepada <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                id="recipient"
                                                name="recipient"
                                                value={formData.recipient}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: Divisi Operasi PLN"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="invoiceNumber">Nomor Tagihan <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                id="invoiceNumber"
                                                name="invoiceNumber"
                                                value={formData.invoiceNumber}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: INV-2025-001"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="amount">Nilai Kontrak (Rp) <span className="required">*</span></label>
                                            <input
                                                type="number"
                                                id="amount"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: 1500000000"
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="budgetType">Tipe Anggaran <span className="required">*</span></label>
                                            <select
                                                id="budgetType"
                                                name="budgetType"
                                                value={formData.budgetType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Pilih Tipe Anggaran</option>
                                                <option value="AI">AI (Anggaran Investasi)</option>
                                                <option value="AO">AO (Anggaran Operasional)</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="contractType">Tipe Kontrak <span className="required">*</span></label>
                                            <select
                                                id="contractType"
                                                name="contractType"
                                                value={formData.contractType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Pilih Tipe Kontrak</option>
                                                <option value="PJ">PJ (Perjanjian)</option>
                                                <option value="SPK">SPK (Surat Perintah Kerja)</option>
                                                <option value="PO">PO (Purchase Order)</option>
                                            </select>
                                        </div>



                                        <div className="form-group">
                                            <label htmlFor="location">Lokasi <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: Gardu Induk Jakarta"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="status">Status <span className="required">*</span></label>
                                            <select
                                                id="status"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="Aktif">Aktif</option>
                                                <option value="Perbaikan">Perbaikan</option>
                                                <option value="Tidak Aktif">Tidak Aktif</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="startDate">Tanggal Mulai <span className="required">*</span></label>
                                            <input
                                                type="date"
                                                id="startDate"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="endDate">Tanggal Selesai <span className="required">*</span></label>
                                            <input
                                                type="date"
                                                id="endDate"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                            Batal
                                        </button>
                                        <button type="submit" className="btn-submit">
                                            <Save size={18} /> Simpan Kontrak
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </>
        )
    } catch (err) {
        // Fallback UI if error occurs
        return (
            <div style={{ padding: 40, color: 'red', fontSize: 18 }}>
                <b>Terjadi error saat render halaman Manajemen Kontrak:</b>
                <pre style={{ color: 'black', background: '#fff', padding: 16, borderRadius: 8, marginTop: 16 }}>{String(err)}</pre>
            </div>
        )
    }
}

export default ManajemenAset
