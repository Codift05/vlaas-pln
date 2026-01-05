'use client'
import { useState, useRef, useEffect, Fragment } from 'react'

import { Eye, Edit, Trash2, Search, ChevronDown, ChevronUp, Plus, Save, Upload, Calendar, Clock, ArrowRight, FileText, AlertCircle, AlertTriangle, FileCheck, History } from 'lucide-react'
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
        amount: true, // Nilai Kontrak
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
        vendorName: '', // added missing field
        amount: '',
        budgetType: '',
        contractType: '',
        category: '', // added missing field
        location: '',
        status: 'Aktif',
        startDate: '',
        endDate: '',
        amendmentDocNumber: '', // New field
        amendmentDescription: '' // New field
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

            console.log('Raw data from Supabase:', data) // Debug log

            // Format data sesuai struktur UI
            const formattedData = data.map(contract => ({
                id: contract.id || '',
                name: contract.name || '',
                vendorName: contract.vendor_name || '', // Map snake_case -> camelCase
                recipient: contract.recipient || '',
                invoiceNumber: contract.invoice_number || '',
                amount: contract.amount ? parseFloat(contract.amount) : 0,
                budgetType: contract.budget_type || '',
                contractType: contract.contract_type || '',
                category: contract.category || '',
                location: contract.location || '',
                status: contract.status || 'Aktif',
                startDate: contract.start_date || '',
                endDate: contract.end_date || '',
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

    const getBadgeClass = (status) => {
        if (!status) return ''
        const normalized = status.toLowerCase()
        if (normalized === 'aktif') return 'status-active' // Legacy mapping
        if (normalized === 'perbaikan') return 'status-maintenance'
        if (normalized === 'tidak aktif') return 'status-inactive'

        // Slugify for new statuses
        return `status-${normalized.replace(/\s+/g, '-')}`
    }

    // State untuk mode edit
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isAmendment, setIsAmendment] = useState(false); // State for amendment option

    // Countdown timer for detail modal
    const [timeRemaining, setTimeRemaining] = useState('');
    useEffect(() => {
        if (!showDetailModal || !selectedAsset || !selectedAsset.endDate) return;
        function updateCountdown() {
            const now = new Date();
            let end;
            // Handle YYYY-MM-DD (Supabase) or DD/MM/YYYY (Legacy)
            if (selectedAsset.endDate.includes('/')) {
                end = new Date(selectedAsset.endDate.split('/').reverse().join('-'));
            } else {
                end = new Date(selectedAsset.endDate);
            }

            const diff = end.getTime() - now.getTime();
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


    // State for expanded row (Amendment view)
    const [expandedContractId, setExpandedContractId] = useState(null)

    const toggleExpand = (id) => {
        if (expandedContractId === id) {
            setExpandedContractId(null)
        } else {
            setExpandedContractId(id)
        }
    }

    // State for Custom Confirmation Modal
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingAmendment, setPendingAmendment] = useState(null)

    // State for Progress Tracker
    const [showProgressModal, setShowProgressModal] = useState(false)
    const [progressFormData, setProgressFormData] = useState({
        contractId: '',
        title: '',
        description: '',
        status: 'In Progress'
    })
    const [activeHistoryTab, setActiveHistoryTab] = useState('all') // 'all', 'amendments', 'progress'

    const handleCreateAmendment = (asset) => {
        // Calculate amendment number
        const existingAmendments = asset.history ? asset.history.filter(h => h.action.includes('Amandemen')).length : 0;
        const nextAmendmentNum = existingAmendments + 1;

        setPendingAmendment({ asset, nextAmendmentNum })
        setShowConfirmModal(true)
    }

    const handleConfirmAmendment = () => {
        if (!pendingAmendment) return

        const { asset, nextAmendmentNum } = pendingAmendment

        setFormData({
            ...asset,
            amount: asset.amount ? String(asset.amount) : '',
            category: asset.category || '',
            vendorName: asset.vendorName || '',
            amendmentDocNumber: `AMD-${asset.id}-${String(nextAmendmentNum).padStart(3, '0')}`, // Auto-generate suggestion
            amendmentDescription: ''
        })
        setEditId(asset.id)
        setIsEditing(true)
        setIsAmendment(true)
        setShowModal(true)

        // Close confirmation modal
        setShowConfirmModal(false)
        setPendingAmendment(null)
    }

    const handleCreateProgressTracker = (asset) => {
        setProgressFormData({
            contractId: asset.id,
            title: '',
            description: '',
            status: 'In Progress'
        })
        setShowProgressModal(true)
    }

    const handleProgressSubmit = async (e) => {
        e.preventDefault()

        try {
            const { error } = await supabase
                .from('contract_history')
                .insert([{
                    contract_id: progressFormData.contractId,
                    action: `Progress Tracker: ${progressFormData.title}`,
                    user_name: 'Admin',
                    details: `Status: ${progressFormData.status}. ${progressFormData.description || 'Tidak ada keterangan tambahan.'}`
                }])

            if (error) throw error

            alert('Progress tracker berhasil ditambahkan!')
            fetchContracts()
            setShowProgressModal(false)
            setProgressFormData({
                contractId: '',
                title: '',
                description: '',
                status: 'In Progress'
            })
        } catch (err) {
            console.error('Error adding progress tracker:', err)
            alert('Gagal menambahkan progress tracker: ' + err.message)
        }
    }

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
            amount: asset.amount ? String(asset.amount) : '', // Ensure amount is string for input
            category: asset.category || '',
            vendorName: asset.vendorName || '',
            amendmentDocNumber: '',
            amendmentDescription: ''
        })
        setEditId(asset.id)
        setIsEditing(true)
        setIsAmendment(false) // Reset amendment state
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
                        recipient: formData.recipient,
                        invoice_number: formData.invoiceNumber,
                        vendor_name: formData.vendorName,
                        amount: formData.amount ? parseFloat(formData.amount) : 0,
                        budget_type: formData.budgetType,
                        contract_type: formData.contractType,
                        category: formData.category || '-',
                        location: formData.location,
                        status: formData.status,
                        start_date: formData.startDate,
                        end_date: formData.endDate
                    })
                    .eq('id', editId)

                if (updateError) throw updateError

                // 2. Insert History Log (Detailed Amandemen)
                const oldData = assets.find(a => a.id === editId)
                let changeDetails = []

                if (oldData) {
                    if (oldData.name !== formData.name) changeDetails.push(`Nama Kontrak: "${oldData.name}" ➝ "${formData.name}"`)
                    if (oldData.vendorName !== formData.vendorName) changeDetails.push(`Vendor: "${oldData.vendorName}" ➝ "${formData.vendorName}"`)

                    const oldAmount = Number(oldData.amount || 0)
                    const newAmount = Number(formData.amount || 0)
                    if (oldAmount !== newAmount) {
                        changeDetails.push(`Nilai: ${oldAmount.toLocaleString('id-ID')} ➝ ${newAmount.toLocaleString('id-ID')}`)
                    }

                    if (oldData.status !== formData.status) changeDetails.push(`Status: "${oldData.status}" ➝ "${formData.status}"`)
                    if (oldData.startDate !== formData.startDate) changeDetails.push(`Tgl Mulai: ${oldData.startDate} ➝ ${formData.startDate}`)
                    if (oldData.endDate !== formData.endDate) changeDetails.push(`Tgl Selesai: ${oldData.endDate} ➝ ${formData.endDate}`)
                    if (oldData.location !== formData.location) changeDetails.push(`Lokasi: "${oldData.location}" ➝ "${formData.location}"`)
                }

                const actionTitle = isAmendment
                    ? `Amandemen Kontrak ${formData.amendmentDocNumber ? `(No. ${formData.amendmentDocNumber})` : ''}`
                    : (changeDetails.length > 0 ? 'Update Data' : 'Update Data (Tanpa Perubahan)')

                let actionDetails = ''
                if (isAmendment) {
                    const changes = changeDetails.length > 0 ? ` Perubahan: ${changeDetails.join(', ')}` : ''
                    actionDetails = `${formData.amendmentDescription ? `Ket: ${formData.amendmentDescription}.` : ''}${changes}` || 'Amandemen tercatat.'
                } else {
                    actionDetails = changeDetails.length > 0
                        ? `Perubahan: ${changeDetails.join(', ')}`
                        : `Update data kontrak ${editId} tanpa perubahan signifikan`
                }

                const { error: historyError } = await supabase
                    .from('contract_history')
                    .insert([{
                        contract_id: editId,
                        action: actionTitle,
                        user_name: 'Admin',
                        details: actionDetails
                    }])

                if (historyError) throw historyError

                alert('Kontrak berhasil diperbarui!')
            } else {
                // 1. Insert New Contract
                const payload = {
                    id: formData.id,
                    name: formData.name,
                    recipient: formData.recipient || '',
                    invoice_number: formData.invoiceNumber || '',
                    vendor_name: formData.vendorName || '',
                    amount: formData.amount ? parseFloat(formData.amount) : 0,
                    budget_type: formData.budgetType,
                    contract_type: formData.contractType,
                    category: formData.category || '-',
                    location: formData.location,
                    status: formData.status,
                    start_date: formData.startDate,
                    end_date: formData.endDate
                }

                const { error: insertError } = await supabase
                    .from('contracts')
                    .insert([payload])

                if (insertError) throw insertError

                // 2. Insert Initial History
                const { error: historyError } = await supabase.from('contract_history').insert([{
                    contract_id: formData.id,
                    action: 'Kontrak Dibuat',
                    user_name: 'Admin',
                    details: 'Kontrak baru ditambahkan ke sistem'
                }])

                if (historyError) console.error('Warning: Failed to create history log', historyError)

                alert('Kontrak berhasil ditambahkan!')
            }

            // Refresh data
            fetchContracts()
            handleCloseModal()

        } catch (err) {
            console.error('Error saving contract:', err)
            console.error('Error details:', JSON.stringify(err, null, 2))

            const errorMessage = err.message || err.error_description || 'Terjadi kesalahan yang tidak diketahui.'

            if (errorMessage.includes('duplicate key') || err.code === '23505') {
                alert('Gagal: Nomor Kontrak (ID) tersebut sudah ada di sistem. Gunakan nomor lain.')
            } else {
                alert('Gagal menyimpan data: ' + errorMessage)
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
        setIsAmendment(false)
        setFormData({
            id: '',
            name: '',
            recipient: '',
            invoiceNumber: '',
            vendorName: '',
            amount: '',
            budgetType: '',
            contractType: '',
            category: '',
            location: '',
            status: 'Aktif',
            startDate: '',
            endDate: '',
            amendmentDocNumber: '',
            amendmentDescription: ''
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
                            <option value="Terkontrak">Terkontrak</option>
                            <option value="Dalam Proses Pekerjaan">Dalam Proses Pekerjaan</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dalam Pemeriksaan">Dalam Pemeriksaan</option>
                            <option value="Telah Diperiksa">Telah Diperiksa</option>
                            <option value="Terbayar">Terbayar</option>
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
                                                checked={columnVisibility.amount}
                                                onChange={() => toggleColumnVisibility('amount')}
                                            />
                                            <span>Nilai Kontrak</span>
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
                                <th style={{ width: '50px', padding: '16px 8px' }}></th>
                                {columnVisibility.id && <th>Nomor Kontrak</th>}
                                {columnVisibility.name && <th>Nama Kontrak</th>}
                                {columnVisibility.vendorName && <th>Nama Vendor</th>}
                                {columnVisibility.amount && <th>Nilai Kontrak</th>}
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
                                    <Fragment key={asset.id}>
                                        <tr style={{ background: expandedContractId === asset.id ? '#f8fafc' : undefined }}>
                                            <td style={{ padding: '16px 8px', textAlign: 'center', width: '50px' }}>
                                                <button
                                                    onClick={() => toggleExpand(asset.id)}
                                                    className="btn-icon"
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                                >
                                                    {expandedContractId === asset.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            </td>
                                            {columnVisibility.id && <td className="asset-id">{asset.id}</td>}
                                            {columnVisibility.name && <td className="asset-name">{asset.name}</td>}
                                            {columnVisibility.vendorName && <td className="asset-vendor">{asset.vendorName}</td>}
                                            {columnVisibility.amount && <td>{asset.amount?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>}
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
                                                        {asset.contractType === 'NON-PO' ? 'NON-PO' : asset.contractType}
                                                    </span>
                                                </td>
                                            )}

                                            {columnVisibility.location && <td>{asset.location}</td>}
                                            {columnVisibility.status && (
                                                <td>
                                                    <span className={`status-badge ${getBadgeClass(asset.status)}`}>
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

                                            </td>
                                        </tr>
                                        {expandedContractId === asset.id && (
                                            <tr className="expanded-row-content">
                                                <td colSpan={getVisibleColumnsCount() + 2} style={{ padding: '0 24px 24px 24px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                    <div className="amendment-card-container" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                                                                        <FileText size={20} className="text-blue-500" style={{ color: '#3b82f6' }} />
                                                                    </div>
                                                                    Riwayat Amandemen & Perubahan
                                                                </h4>
                                                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b', marginLeft: '48px' }}>
                                                                    Kelola riwayat perubahan dan amandemen untuk kontrak ini
                                                                </p>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                                <button
                                                                    className="btn-primary"
                                                                    onClick={() => handleCreateProgressTracker(asset)}
                                                                    style={{ padding: '10px 18px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                >
                                                                    <Plus size={18} /> Buat Progress Tracker
                                                                </button>
                                                                <button
                                                                    className="btn-primary"
                                                                    onClick={() => handleCreateAmendment(asset)}
                                                                    style={{ padding: '10px 18px', fontSize: '14px' }}
                                                                >
                                                                    <Plus size={18} /> Buat Amandemen
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Tab Filter */}
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                                                            <button
                                                                onClick={() => setActiveHistoryTab('all')}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    background: activeHistoryTab === 'all' ? '#3b82f6' : 'transparent',
                                                                    color: activeHistoryTab === 'all' ? 'white' : '#64748b',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                Semua
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveHistoryTab('amendments')}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    background: activeHistoryTab === 'amendments' ? '#3b82f6' : 'transparent',
                                                                    color: activeHistoryTab === 'amendments' ? 'white' : '#64748b',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                Amandemen
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveHistoryTab('progress')}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    background: activeHistoryTab === 'progress' ? '#3b82f6' : 'transparent',
                                                                    color: activeHistoryTab === 'progress' ? 'white' : '#64748b',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                Progress Tracker
                                                            </button>
                                                        </div>

                                                        <div className="amendment-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            {
                                                                (() => {
                                                                    let filteredHistory = asset.history || [];
                                                                    if (activeHistoryTab === 'amendments') {
                                                                        filteredHistory = filteredHistory.filter(h => h.action.includes('Amandemen'));
                                                                    } else if (activeHistoryTab === 'progress') {
                                                                        filteredHistory = filteredHistory.filter(h => h.action.includes('Progress Tracker'));
                                                                    }
                                                                    if (filteredHistory.length > 0) {
                                                                        return filteredHistory.slice().reverse().map((log, idx) => (
                                                                            <div key={idx} className="amendment-item" style={{ display: 'flex', gap: '20px', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#fff', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                                                                <div style={{ minWidth: '140px', fontSize: '13px', color: '#64748b', borderRight: '1px solid #f1f5f9', paddingRight: '16px' }}>
                                                                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>{log.date}</div>
                                                                                    <div style={{ fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                        <div style={{ width: '20px', height: '20px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px', color: '#64748b' }}>
                                                                                            {(log.user || 'Admin').charAt(0).toUpperCase()}
                                                                                        </div>
                                                                                        {log.user || 'Admin'}
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ flex: 1 }}>
                                                                                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '15px' }}>{log.action}</div>
                                                                                    <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                                                                        {/* Simple rendering of details, can be enhanced like in modal */}
                                                                                        {log.details.split('Perubahan:').map((part, i) => (
                                                                                            <div key={i} style={{ marginBottom: i === 0 ? '4px' : '0' }}>
                                                                                                {i === 1 ? (
                                                                                                    <div>
                                                                                                        <span style={{ fontWeight: 600, color: '#334155' }}>Perubahan: </span>
                                                                                                        {part}
                                                                                                    </div>
                                                                                                ) : part}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '8px' }}>
                                                                                    <span style={{ fontSize: '12px', padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontWeight: 600, border: '1px solid #dbeafe' }}>
                                                                                        Dokumen Tersimpan
                                                                                    </span>
                                                                                    <button style={{ fontSize: '12px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                                                                        Lihat Detail
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ));
                                                                    } else {
                                                                        return (
                                                                            <div style={{ textAlign: 'center', padding: '40px 24px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                                                                <div style={{ display: 'inline-flex', padding: '16px', background: '#f1f5f9', borderRadius: '50%', marginBottom: '16px' }}>
                                                                                    <History size={32} style={{ opacity: 0.5 }} />
                                                                                </div>
                                                                                <p style={{ margin: 0, fontWeight: 500 }}>
                                                                                    {activeHistoryTab === 'amendments' ? 'Belum ada amandemen' : activeHistoryTab === 'progress' ? 'Belum ada progress tracker' : 'Belum ada riwayat'}
                                                                                </p>
                                                                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
                                                                                    {activeHistoryTab === 'amendments' ? 'Klik tombol "Buat Amandemen" untuk memulai revisi kontrak.' : activeHistoryTab === 'progress' ? 'Klik tombol "Buat Progress Tracker" untuk menambahkan progress.' : 'Klik tombol di atas untuk menambahkan riwayat.'}
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                })()
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
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
                            <button
                                className={`pagination-btn${filteredAssets.length <= 10 ? ' disabled-btn' : ''}`}
                                disabled={filteredAssets.length <= 10}
                                style={{ cursor: filteredAssets.length <= 10 ? 'not-allowed' : 'pointer', opacity: filteredAssets.length <= 10 ? 0.5 : 1, position: 'relative', textAlign: 'center', justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                            >
                                ‹ Sebelumnya
                            </button>
                            {filteredAssets.length > 10 ? (
                                <>
                                    <button className="pagination-btn active">1</button>
                                    <button className="pagination-btn">2</button>
                                    <button className="pagination-btn">3</button>
                                </>
                            ) : (
                                <button className="pagination-btn active">1</button>
                            )}
                            <button
                                className={`pagination-btn${filteredAssets.length <= 10 ? ' disabled-btn' : ''}`}
                                disabled={filteredAssets.length <= 10}
                                style={{ cursor: filteredAssets.length <= 10 ? 'not-allowed' : 'pointer', opacity: filteredAssets.length <= 10 ? 0.5 : 1, position: 'relative', textAlign: 'center', justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                            >
                                Selanjutnya ›
                            </button>
                        </div>
                    </div>
                )}

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
                                                    <span className={`status-badge ${getBadgeClass(selectedAsset.status)}`}>
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
                                        {selectedAsset.status?.toLowerCase() !== 'selesai' && selectedAsset.status?.toLowerCase() !== 'terbayar' && (
                                            <>
                                                <div className="time-remaining-info" style={{ marginTop: 8, fontWeight: 500, color: timeRemaining.includes('melewati') ? 'red' : '#219150' }}>
                                                    Sisa waktu: {timeRemaining}
                                                </div>
                                                {timeRemaining.includes('melewati') && (
                                                    <div className="deadline-notif" style={{ color: 'red', fontWeight: 700, marginTop: 4 }}>
                                                        ⚠️ Kontrak ini sudah melewati tenggat waktu!
                                                    </div>
                                                )}
                                            </>
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
                                                                {(() => {
                                                                    const details = log.details || '';
                                                                    let note = '';
                                                                    let changes = [];

                                                                    // Parse "Ket:"
                                                                    const ketMatch = details.match(/Ket:\s*(.*?)(?=\.?\s*Perubahan:|$)/);
                                                                    if (ketMatch) note = ketMatch[1];

                                                                    // Parse "Perubahan:"
                                                                    const changesMatch = details.match(/Perubahan:\s*(.*)/);
                                                                    if (changesMatch) {
                                                                        // Split by comma, but be careful of commas inside values? 
                                                                        // Assuming our generator uses ", " to separate fields.
                                                                        // A better split might be needed if values contain commas. 
                                                                        // complex regex: split by comma that is likely a separator (followed by space and Uppercase usually? no field names are varied)
                                                                        // For now simpler split:
                                                                        changes = changesMatch[1].split(', ').map(c => c.trim());
                                                                    } else if (!ketMatch && details) {
                                                                        // Fallback if no specific format
                                                                        note = details;
                                                                    }

                                                                    return (
                                                                        <div style={{ marginTop: '4px' }}>
                                                                            {note && (
                                                                                <div style={{
                                                                                    background: '#f1f5f9',
                                                                                    padding: '8px 12px',
                                                                                    borderRadius: '6px',
                                                                                    fontSize: '13px',
                                                                                    color: '#334155',
                                                                                    marginBottom: changes.length > 0 ? '8px' : '0',
                                                                                    display: 'inline-block',
                                                                                    border: '1px solid #e2e8f0'
                                                                                }}>
                                                                                    <span style={{ fontWeight: 600 }}>Catatan:</span> {note}
                                                                                </div>
                                                                            )}

                                                                            {changes.length > 0 && (
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                                    {changes.map((change, i) => {
                                                                                        // Highlight values: "Field: Old -> New"
                                                                                        const parts = change.split('➝');
                                                                                        if (parts.length === 2) {
                                                                                            const fieldPart = parts[0].split(':');
                                                                                            const fieldName = fieldPart[0].trim();
                                                                                            const oldValue = fieldPart[1] ? fieldPart[1].trim() : '';
                                                                                            const newValue = parts[1].trim();
                                                                                            return (
                                                                                                <div key={i} style={{ fontSize: '13.5px', color: '#475569', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                                    <span style={{ minWidth: '8px', marginRight: '8px', color: '#cbd5e1' }}>•</span>
                                                                                                    <span style={{ fontWeight: 500, marginRight: '6px', color: '#1e293b' }}>{fieldName}:</span>
                                                                                                    <span style={{ color: '#ef4444', textDecoration: 'line-through', marginRight: '6px', fontSize: '13px', background: '#fef2f2', padding: '0 4px', borderRadius: '4px' }}>{oldValue.replace(/^"|"$/g, '')}</span>
                                                                                                    <span style={{ color: '#cbd5e1', margin: '0 6px' }}>➝</span>
                                                                                                    <span style={{ color: '#22c55e', fontWeight: 600, background: '#f0fdf4', padding: '0 4px', borderRadius: '4px' }}>{newValue.replace(/^"|"$/g, '')}</span>
                                                                                                </div>
                                                                                            )
                                                                                        }
                                                                                        return (
                                                                                            <div key={i} style={{ fontSize: '13.5px', color: '#475569', display: 'flex', alignItems: 'start' }}>
                                                                                                <span style={{ minWidth: '8px', marginRight: '8px', color: '#cbd5e1', marginTop: '4px' }}>•</span>
                                                                                                {change}
                                                                                            </div>
                                                                                        )
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })()}
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
                                    <h2>{isEditing ? 'Edit Kontrak' : 'Tambah Kontrak Baru'}</h2>
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
                                                readOnly={isEditing}
                                                style={isEditing ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
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
                                                placeholder="Contoh: Pekerjaan Jasa Pembangunan Gardu Induk"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="vendorName">Nama Vendor <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                id="vendorName"
                                                name="vendorName"
                                                value={formData.vendorName}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: PT Elektrindo Jaya"
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
                                                <option value="NON-PO">NON-PO</option>
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
                                                <option value="Terkontrak">Terkontrak</option>
                                                <option value="Dalam Proses Pekerjaan">Dalam Proses Pekerjaan</option>
                                                <option value="Selesai">Selesai</option>
                                                <option value="Dalam Pemeriksaan">Dalam Pemeriksaan</option>
                                                <option value="Telah Diperiksa">Telah Diperiksa</option>
                                                <option value="Terbayar">Terbayar</option>
                                            </select>
                                        </div>

                                        {/* Tanggal hanya muncul di form tambah, di edit akan masuk ke amandemen */}
                                        {!isEditing && (
                                            <>
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
                                            </>
                                        )}

                                    </div>

                                    {isAmendment && (
                                        <div className="amendment-section" style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                                                <div style={{ background: '#dbeafe', padding: '6px', borderRadius: '6px' }}>
                                                    <FileText size={18} color="#2563eb" />
                                                </div>
                                                <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Detail Amandemen</h4>
                                            </div>

                                            <div className="amendment-fields" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                                    <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Nomor Surat Amandemen <span className="required">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="amendmentDocNumber"
                                                        value={formData.amendmentDocNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="Contoh: AMD/001/2025"
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                                        required={isAmendment}
                                                    />
                                                </div>

                                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                                        <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Tanggal Mulai <span className="required">*</span></label>
                                                        <input
                                                            type="date"
                                                            id="startDate"
                                                            name="startDate"
                                                            value={formData.startDate}
                                                            onChange={handleInputChange}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                                            required={isAmendment}
                                                        />
                                                    </div>

                                                    <div className="form-group" style={{ marginBottom: '0' }}>
                                                        <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Tanggal Selesai <span className="required">*</span></label>
                                                        <input
                                                            type="date"
                                                            id="endDate"
                                                            name="endDate"
                                                            value={formData.endDate}
                                                            onChange={handleInputChange}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                                            required={isAmendment}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group" style={{ marginBottom: '0' }}>
                                                    <label style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Keterangan / Alasan Perubahan <span className="required">*</span></label>
                                                    <textarea
                                                        name="amendmentDescription"
                                                        value={formData.amendmentDescription}
                                                        onChange={handleInputChange}
                                                        placeholder="Jelaskan alasan amandemen (misal: Perpanjangan waktu, penambahan nilai, dll)"
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' }}
                                                        required={isAmendment}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                    <div className="modal-footer">
                                        <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                            Batal
                                        </button>
                                        <button type="submit" className="btn-submit">
                                            <Save size={18} /> {isAmendment ? 'Simpan Amandemen' : 'Simpan Kontrak'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

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

                {/* Confirm Amendment Modal */}
                {showConfirmModal && (
                    <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowConfirmModal(false)}>
                        <div
                            className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100"
                            style={{ maxWidth: '420px', background: 'white', borderRadius: '16px', padding: '24px', animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%', background: '#fff7ed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                                    border: '6px solid #ffedd5'
                                }}>
                                    <AlertTriangle size={32} color="#f97316" />
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                                    Konfirmasi Amandemen
                                </h3>
                                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                                    Apakah Anda yakin ingin membuat <strong>Amandemen ke-{pendingAmendment?.nextAmendmentNum}</strong> untuk kontrak ini?
                                    <br /><br />
                                    Tindakan ini akan membuka editor kontrak dalam mode amandemen.
                                </p>
                                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db',
                                            background: 'white', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleConfirmAmendment}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                            background: '#f97316', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                            boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)'
                                        }}
                                    >
                                        Ya, Buat Amandemen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Tracker Modal */}
                {showProgressModal && (
                    <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2>Buat Progress Tracker</h2>
                                <button className="modal-close" onClick={() => setShowProgressModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleProgressSubmit} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="progressTitle">Judul Progress <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="progressTitle"
                                        name="title"
                                        value={progressFormData.title}
                                        onChange={(e) => setProgressFormData({ ...progressFormData, title: e.target.value })}
                                        placeholder="Contoh: Pengerjaan Tahap 1 Selesai"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="progressStatus">Status <span className="required">*</span></label>
                                    <select
                                        id="progressStatus"
                                        name="status"
                                        value={progressFormData.status}
                                        onChange={(e) => setProgressFormData({ ...progressFormData, status: e.target.value })}
                                        required
                                    >
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Delayed">Delayed</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="progressDescription">Keterangan (Opsional)</label>
                                    <textarea
                                        id="progressDescription"
                                        name="description"
                                        value={progressFormData.description}
                                        onChange={(e) => setProgressFormData({ ...progressFormData, description: e.target.value })}
                                        placeholder="Tambahkan keterangan lebih lanjut tentang progress ini..."
                                        rows={4}
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setShowProgressModal(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        <Save size={18} /> Simpan Progress
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
