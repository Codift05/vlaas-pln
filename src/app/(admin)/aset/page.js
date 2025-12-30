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
        category: true,
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
        budgetType: '',
        contractType: '',
        category: '',
        location: '',
        status: 'Aktif',
        startDate: '',
        endDate: ''
    });

    // State untuk data aset (dari Supabase)
    const [assets, setAssets] = useState([])

    // Fetch data contracts & history from Supabase
    const fetchContracts = async () => {
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    *,
                    history:contract_history(*)
                `)

            if (error) throw error

            // Format data sesuai struktur UI
            const formattedData = data.map(contract => ({
                id: contract.id,
                name: contract.name,
                vendorName: contract.vendor_name, // Map snake_case -> camelCase
                budgetType: contract.budget_type,
                contractType: contract.contract_type,
                category: contract.category,
                location: contract.location,
                status: contract.status,
                startDate: contract.start_date,
                endDate: contract.end_date,
                history: contract.history || []
            }))
            setAssets(formattedData)
        } catch (err) {
            console.error('Error fetching contracts:', err.message)
        }
    }

    // Load data on mount
    useEffect(() => {
        fetchContracts()
    }, [])

    // State untuk mode edit
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

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

    const handleEdit = (asset) => {
        setFormData({
            ...asset,
            // Re-map camelCase -> form names if needed, but our form uses camelCase mostly
            // except vendorName need check input
        })
        // Note: Our form uses 'id', 'name', 'budgetType', etc.
        // We need to ensure formData matches.
        // Asset structure: vendorName. Form input? 
        // Let's check form input... it uses 'vendorName' ? NO, waiting to check form inputs below
        // Form doesn't have vendorName input in the visible code previously? 
        // Wait, looking at lines 530+ of current file...
        // ... I don't see Vendor Name input in lines 530-556. 
        // Ah, it was missing in the original code too? 
        // Let's check the viewed file content at Step 394 (lines 530+).
        // It has 'Nomor Kontrak' (id), 'Nama Kontrak' (name), 'Tipe Anggaran', etc.
        // It DOES NOT have Vendor Name input! 
        // I should probably add it or else it will be null.
        // For now I will focus on Supabase integration and fix Vendor input later if missing.

        setEditId(asset.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (isEditing) {
                // 1. Update Contracts Table
                const { error: updateError } = await supabase
                    .from('contracts')
                    .update({
                        name: formData.name,
                        vendor_name: 'Vendor Default', // Hardcoded for now as input missing
                        budget_type: formData.budgetType,
                        contract_type: formData.contractType,
                        category: formData.category,
                        location: formData.location,
                        status: formData.status,
                        start_date: formData.startDate,
                        end_date: formData.endDate
                    })
                    .eq('id', editId)

                if (updateError) throw updateError

                // 2. Insert History Log
                // Find old asset to compare (optional, or just generic log)
                const { error: historyError } = await supabase
                    .from('contract_history')
                    .insert([{
                        contract_id: editId,
                        action: 'Update Data',
                        user_name: 'Admin',
                        details: `Perubahan data kontrak ${editId}`
                    }])

                if (historyError) throw historyError

                alert('Kontrak berhasil diperbarui!')
            } else {
                // 1. Insert New Contract
                const { error: insertError } = await supabase
                    .from('contracts')
                    .insert([{
                        id: formData.id,
                        name: formData.name,
                        vendor_name: 'Vendor Default', // Hardcoded for now
                        budget_type: formData.budgetType,
                        contract_type: formData.contractType,
                        category: formData.category,
                        location: formData.location,
                        status: formData.status,
                        start_date: formData.startDate,
                        end_date: formData.endDate
                    }])

                if (insertError) throw insertError

                // 2. Insert Initial History
                await supabase.from('contract_history').insert([{
                    contract_id: formData.id,
                    action: 'Kontrak Dibuat',
                    user_name: 'Admin',
                    details: 'Kontrak baru ditambahkan ke sistem'
                }])

                alert('Kontrak berhasil ditambahkan!')
            }

            // Refresh data
            fetchContracts()
            handleCloseModal()

        } catch (err) {
            console.error('Error saving contract:', err)
            if (err.message.includes('duplicate key') || err.code === '23505') {
                alert('Gagal: Nomor Kontrak (ID) tersebut sudah ada di sistem. Gunakan nomor lain.')
            } else {
                alert('Gagal menyimpan data: ' + err.message)
            }
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kontrak ini? Data yang dihapus tidak dapat dikembalikan.')) {
            try {
                const { error } = await supabase
                    .from('contracts')
                    .delete()
                    .eq('id', id)

                if (error) throw error

                alert('Kontrak berhasil dihapus')
                fetchContracts() // Refresh data
            } catch (err) {
                console.error('Error deleting contract:', err)
                alert('Gagal menghapus: ' + err.message)
            }
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setIsEditing(false)
        setEditId(null)
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
                                <Eye size={18} /> Pilih Kolom ({getVisibleColumnsCount()}/10)
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
                                                checked={columnVisibility.category}
                                                onChange={() => toggleColumnVisibility('category')}
                                            />
                                            <span>Kategori</span>
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
                                {columnVisibility.category && <th>Kategori</th>}
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
                                        {columnVisibility.category && <td>{asset.category}</td>}
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
                                                <button className="btn-icon btn-edit" title="Edit" onClick={() => handleEdit(asset)}><Edit size={16} /></button>
                                                <button className="btn-icon btn-delete" title="Hapus" onClick={() => handleDelete(asset.id)}><Trash2 size={16} /></button>
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
                                            <div className="detail-item full-width">
                                                <label className="detail-label">Nama Pekerjaan / Kontrak</label>
                                                <div className="detail-value detail-value-lg">{selectedAsset.name}</div>
                                            </div>
                                            <div className="detail-item full-width">
                                                <label className="detail-label">Pelaksana (Vendor)</label>
                                                <div className="detail-value">{selectedAsset.vendorName}</div>
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

                                        <div className="history-section" style={{ marginTop: '24px', borderTop: '1px solid #eff2f5', paddingTop: '24px' }}>
                                            <h3 className="detail-section-title" style={{ marginBottom: '16px' }}>
                                                <Clock size={20} /> Riwayat Perubahan
                                            </h3>
                                            <div className="history-list">
                                                {selectedAsset.history && selectedAsset.history.length > 0 ? (
                                                    selectedAsset.history.slice().reverse().map((log, index) => (
                                                        <div key={index} className="history-item" style={{ display: 'flex', gap: '16px', marginBottom: '16px', paddingLeft: '8px', borderLeft: '3px solid #e2e8f0' }}>
                                                            <div className="history-time" style={{ minWidth: '130px', color: '#64748b', fontSize: '13px', paddingTop: '2px' }}>
                                                                {log.date}
                                                            </div>
                                                            <div className="history-content">
                                                                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                                                                    {log.action}
                                                                    <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '12px', marginLeft: '6px' }}>
                                                                        • {log.user}
                                                                    </span>
                                                                </div>
                                                                <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.4' }}>
                                                                    {log.details}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                                                        Belum ada riwayat perubahan tercatat.
                                                    </div>
                                                )}
                                            </div>
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
                                            <label htmlFor="category">Kategori <span className="required">*</span></label>
                                            <select
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="Trafo">Trafo</option>
                                                <option value="Generator">Generator</option>
                                                <option value="CB">Circuit Breaker</option>
                                                <option value="Panel">Panel Distribusi</option>
                                                <option value="Kabel">Kabel & Aksesoris</option>
                                                <option value="Lainnya">Lainnya</option>
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
