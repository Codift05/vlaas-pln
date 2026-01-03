"use client"
import { useState, useRef, useEffect, useCallback } from 'react'
import { Users, CheckCircle, Search, Eye, Edit, Trash2, PauseCircle, ClipboardList, Plus, Save, X } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import './DataVendor.css'

function DataVendor() {
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    // State untuk form tambah/edit vendor
    const [formData, setFormData] = useState({
        id: '',
        nama: '',
        alamat: '',
        telepon: '',
        email: '',
        kontakPerson: '',
        status: 'Aktif',
        tanggalRegistrasi: ''
    });
    // State untuk file yang dipilih
    const [selectedFile, setSelectedFile] = useState(null);
    // Handler saat file dipilih
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0] || null);
    };
    // Handler upload file ke backend (Google Drive)
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Pilih file PDF terlebih dahulu!');
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                alert('Upload ke Google Drive berhasil!');
            } else {
                alert('Upload gagal: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Upload error: ' + err.message);
        }
    }
    // const [sidebarOpen, setSidebarOpen] = useState(false) // Removed as handled by layout
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [showModal, setShowModal] = useState(false)
    // Kolom selector
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
        id: true,
        nama: true,
        kontakPerson: true,
        telepon: true,
        email: true,
        status: true,
    });
    const columnSelectorRef = useRef(null);

    const fetchVendors = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            // Map DB columns (snake_case) to frontend (camelCase)
            const formattedData = data.map(vendor => ({
                id: vendor.id, // Display ID e.g VND001
                nama: vendor.name || vendor.nama, // Handle potential inconsistent naming
                alamat: vendor.alamat || vendor.address, // Fix: use alamat from DB
                telepon: vendor.telepon || vendor.phone,
                email: vendor.email,
                kategori: vendor.kategori || vendor.category || '-',
                kontakPerson: vendor.kontak_person || vendor.contact_person,
                status: vendor.status,
                tanggalRegistrasi: vendor.tanggal_registrasi || vendor.registration_date // Format if needed
            }))

            setVendors(formattedData)
        } catch (err) {
            console.error('Error fetching vendors:', err)
            setError('Gagal mengambil data vendor')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchVendors()
    }, [fetchVendors])

    // Use fetched data instead of mock
    const vendorsData = vendors

    // Filter vendors berdasarkan search term
    const filteredVendors = vendorsData.filter(vendor =>
        vendor.nama.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem)

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    const getStatusClass = (status) => {
        return status === 'Aktif' ? 'status-active' : 'status-inactive'
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset ke halaman pertama saat search
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                id: formData.id,
                nama: formData.nama, // Fix name -> nama
                alamat: formData.alamat, // Fix address -> alamat
                telepon: formData.telepon, // Fix phone -> telepon
                email: formData.email,
                kategori: formData.kategori, // Fix category -> kategori
                kontak_person: formData.kontakPerson,
                status: formData.status,
                tanggal_registrasi: formData.tanggalRegistrasi // Fix registration_date -> tanggal_registrasi
            }

            if (isEditing) {
                // Update existing vendor using editId to locate the record
                const { error } = await supabase
                    .from('vendors')
                    .update(payload)
                    .eq('id', editId)

                if (error) throw error
                // If ID was changed, we might want to warn or handle it, but for now we try to update it.
                alert('Vendor berhasil diperbarui!')
            } else {
                // Insert new vendor
                const { error } = await supabase
                    .from('vendors')
                    .insert([payload])

                if (error) throw error
                alert('Vendor berhasil ditambahkan!')
            }

            setShowModal(false)
            fetchVendors() // Refresh data
            resetForm()
        } catch (err) {
            console.error('Error saving vendor:', err)
            alert('Gagal menyimpan vendor: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            id: '',
            nama: '',
            alamat: '',
            telepon: '',
            email: '',
            kategori: '',
            kontakPerson: '',
            status: 'Aktif',
            tanggalRegistrasi: ''
        })
        setIsEditing(false)
        setEditId(null)
        setSelectedFile(null)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        resetForm()
    }

    const handleEdit = (vendor) => {
        setEditId(vendor.id)
        setFormData({
            id: vendor.id,
            nama: vendor.nama,
            alamat: vendor.alamat,
            telepon: vendor.telepon,
            email: vendor.email,
            kategori: vendor.kategori,
            kontakPerson: vendor.kontakPerson,
            status: vendor.status,
            tanggalRegistrasi: vendor.tanggalRegistrasi
        })
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus vendor ini?')) return

        try {
            setLoading(true)
            const { error } = await supabase
                .from('vendors')
                .delete()
                .eq('id', id)

            if (error) throw error

            alert('Vendor berhasil dihapus')
            fetchVendors()
        } catch (err) {
            console.error('Error deleting vendor:', err)
            alert('Gagal menghapus vendor')
        } finally {
            setLoading(false)
        }
    }

    // Kolom selector logic
    const toggleColumnVisibility = (column) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column]
        }))
    }
    const getVisibleColumnsCount = () => Object.values(columnVisibility).filter(Boolean).length;

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

    return (
        <>
            {/* Stats Cards */}
            {/* Stats Cards */}
            <div className="stats-grid-vendor">
                {[
                    {
                        title: 'Total Vendor',
                        value: vendorsData.length,
                        icon: Users,
                        color: '#3498db',
                        bgColor: '#e3f2fd',
                    },
                    {
                        title: 'Vendor Aktif',
                        value: vendorsData.filter(v => v.status === 'Aktif').length,
                        icon: CheckCircle,
                        color: '#2ecc71',
                        bgColor: '#e8f5e9',
                    },
                    {
                        title: 'Vendor Tidak Aktif',
                        value: vendorsData.filter(v => v.status === 'Tidak Aktif').length,
                        icon: PauseCircle,
                        color: '#e74c3c',
                        bgColor: '#ffebee',
                    },
                    // ...existing stat cards only, no empty object...
                ].map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div key={index} className="stat-card-vendor">
                            <div className="stat-icon-wrapper-vendor" style={{ background: stat.bgColor }}>
                                <IconComponent className="stat-icon-svg-vendor" style={{ color: stat.color }} strokeWidth={2.5} size={28} />
                            </div>
                            <div className="stat-info-vendor">
                                <h3 className="stat-value-vendor">{stat.value}</h3>
                                <p className="stat-title-vendor">{stat.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Bar */}
            <div className="action-bar-vendor">
                <div className="search-section-vendor">
                    <div className="search-box-vendor">
                        <span className="search-icon-vendor"><Search size={18} /></span>
                        <input
                            type="text"
                            placeholder="Cari vendor berdasarkan nama..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input-vendor"
                        />
                    </div>
                    {searchTerm && (
                        <span className="search-result-count">
                            Ditemukan {filteredVendors.length} vendor
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="column-selector-vendor" ref={columnSelectorRef}>
                        <button
                            className="column-selector-btn-vendor"
                            onClick={() => setShowColumnSelector(!showColumnSelector)}
                            type="button"
                        >
                            <Eye size={18} /> Pilih Kolom ({getVisibleColumnsCount()}/6)
                        </button>
                        {showColumnSelector && (
                            <div className="column-dropdown-vendor">
                                <div className="column-dropdown-header-vendor">
                                    <span>Tampilkan Kolom</span>
                                </div>
                                <div className="column-options-vendor">
                                    <label className="column-option-vendor">
                                        <input type="checkbox" checked={columnVisibility.id} onChange={() => toggleColumnVisibility('id')} />
                                        <span>ID Vendor</span>
                                    </label>
                                    <label className="column-option-vendor">
                                        <input type="checkbox" checked={columnVisibility.nama} onChange={() => toggleColumnVisibility('nama')} />
                                        <span>Nama Vendor</span>
                                    </label>
                                    <label className="column-option-vendor">
                                        <input type="checkbox" checked={columnVisibility.kontakPerson} onChange={() => toggleColumnVisibility('kontakPerson')} />
                                        <span>Kontak Person</span>
                                    </label>
                                    <label className="column-option-vendor">
                                        <input type="checkbox" checked={columnVisibility.telepon} onChange={() => toggleColumnVisibility('telepon')} />
                                        <span>Telepon</span>
                                    </label>
                                    <label className="column-option-vendor">
                                        <input type="checkbox" checked={columnVisibility.email} onChange={() => toggleColumnVisibility('email')} />
                                        <span>Email</span>
                                    </label>
                                    <label className="column-option-vendor">
                                        <input type="checkbox" checked={columnVisibility.status} onChange={() => toggleColumnVisibility('status')} />
                                        <span>Status</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="btn-primary-vendor" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Tambah Vendor Baru
                    </button>
                </div>
            </div>

            {/* Vendors Table */}
            <div className="table-container-vendor">
                <table className="vendors-table">
                    <thead>
                        <tr>
                            {columnVisibility.id && <th>ID Vendor</th>}
                            {columnVisibility.nama && <th>Nama Vendor</th>}
                            {columnVisibility.kategori && <th>Kategori</th>}
                            {columnVisibility.kontakPerson && <th>Kontak Person</th>}
                            {columnVisibility.telepon && <th>Telepon</th>}
                            {columnVisibility.email && <th>Email</th>}
                            {columnVisibility.status && <th>Status</th>}
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading data...</td>
                            </tr>
                        ) : currentVendors.length > 0 ? (
                            currentVendors.map((vendor) => (
                                <tr key={vendor.id}>
                                    {columnVisibility.id && <td className="vendor-id">{vendor.id}</td>}
                                    {columnVisibility.nama && (
                                        <td className="vendor-name">
                                            <div className="vendor-name-container">
                                                <span className="vendor-name-text">{vendor.nama}</span>
                                                <span className="vendor-address">{vendor.alamat}</span>
                                            </div>
                                        </td>
                                    )}
                                    {/* Removed Kategori column */}
                                    {columnVisibility.kontakPerson && <td>{vendor.kontakPerson}</td>}
                                    {columnVisibility.telepon && <td>{vendor.telepon}</td>}
                                    {columnVisibility.email && <td className="vendor-email">{vendor.email}</td>}
                                    {columnVisibility.status && (
                                        <td>
                                            <span className={`status-badge ${getStatusClass(vendor.status)}`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                    )}
                                    <td>
                                        <div className="action-buttons-vendor">
                                            <button className="btn-icon-vendor btn-view" title="Lihat Detail"><Eye size={16} /></button>
                                            <button className="btn-icon-vendor btn-edit" title="Edit" onClick={() => handleEdit(vendor)}><Edit size={16} /></button>
                                            <button className="btn-icon-vendor btn-delete" title="Hapus" onClick={() => handleDelete(vendor.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={getVisibleColumnsCount() + 1} className="no-data">
                                    <div className="no-data-message">
                                        <span className="no-data-icon"><Search size={48} /></span>
                                        <p>Tidak ada vendor yang ditemukan</p>
                                        <small>Coba gunakan kata kunci yang berbeda</small>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredVendors.length > 0 && (
                <div className="table-pagination-vendor">
                    <span className="pagination-info-vendor">
                        Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredVendors.length)} dari {filteredVendors.length} vendor
                    </span>
                    <div className="pagination-controls-vendor">
                        <button
                            className={`pagination-btn-vendor${totalPages <= 1 ? ' disabled-btn' : ''}`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={totalPages <= 1 || currentPage === 1}
                            style={{ cursor: totalPages <= 1 ? 'not-allowed' : 'pointer', opacity: totalPages <= 1 ? 0.5 : 1, textAlign: 'center', justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                        >
                            ‹ Sebelumnya
                        </button>

                        {totalPages > 1 ? (
                            [...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    className={`pagination-btn-vendor ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))
                        ) : (
                            <button
                                className="pagination-btn-vendor active"
                                style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                                disabled
                            >
                                1
                            </button>
                        )}

                        <button
                            className={`pagination-btn-vendor${totalPages <= 1 ? ' disabled-btn' : ''}`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={totalPages <= 1 || currentPage === totalPages}
                            style={{ cursor: totalPages <= 1 ? 'not-allowed' : 'pointer', opacity: totalPages <= 1 ? 0.5 : 1, textAlign: 'center', justifyContent: 'center', alignItems: 'center', display: 'flex' }}
                        >
                            Selanjutnya ›
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Tambah Vendor */}
            {showModal && (
                <div className="modal-overlay-vendor" onClick={handleCloseModal}>
                    <div className="modal-content-vendor" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-vendor">
                            <h2>Tambah Vendor Baru</h2>
                            <button className="modal-close-vendor" onClick={handleCloseModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form-vendor">
                            <div className="form-group-vendor full-width">
                                <label>Upload PDF Kontrak (opsional)</label>
                                <div className="upload-file-group-vendor">
                                    <input type="file" id="file-upload-vendor" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                                    <label htmlFor="file-upload-vendor" className="btn-upload-vendor">Pilih File</label>
                                    <span className="file-upload-name-vendor">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                                    {selectedFile && (
                                        <button type="button" className="btn-upload-action-vendor" onClick={handleUpload}>Upload</button>
                                    )}
                                </div>
                            </div>
                            <div className="form-grid-vendor">
                                <div className="form-group-vendor">
                                    <label htmlFor="id">ID Vendor <span className="required-vendor">*</span></label>
                                    <input
                                        type="text"
                                        id="id"
                                        name="id"
                                        value={formData.id}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: VND013"
                                        required
                                    />
                                </div>
                                <div className="form-group-vendor">
                                    <label htmlFor="nama">Nama Vendor <span className="required-vendor">*</span></label>
                                    <input
                                        type="text"
                                        id="nama"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: PT ABC Elektrik"
                                        required
                                    />
                                </div>
                                <div className="form-group-vendor full-width">
                                    <label htmlFor="alamat">Alamat <span className="required-vendor">*</span></label>
                                    <textarea
                                        id="alamat"
                                        name="alamat"
                                        value={formData.alamat}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Jl. Merdeka No. 123, Jakarta"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="form-group-vendor">
                                    <label htmlFor="telepon">Telepon <span className="required-vendor">*</span></label>
                                    <input
                                        type="tel"
                                        id="telepon"
                                        name="telepon"
                                        value={formData.telepon}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 021-1234567"
                                        required
                                    />
                                </div>
                                <div className="form-group-vendor">
                                    <label htmlFor="email">Email <span className="required-vendor">*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: info@vendor.com"
                                        required
                                    />
                                </div>
                                <div className="form-group-vendor">
                                    <label htmlFor="kategori">Kategori <span className="required-vendor">*</span></label>
                                    <select
                                        id="kategori"
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        <option value="Peralatan Listrik">Peralatan Listrik</option>
                                        <option value="Transformator">Transformator</option>
                                        <option value="Generator">Generator</option>
                                        <option value="Kabel & Aksesoris">Kabel & Aksesoris</option>
                                        <option value="Panel Distribusi">Panel Distribusi</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div className="form-group-vendor">
                                    <label htmlFor="kontakPerson">Kontak Person <span className="required-vendor">*</span></label>
                                    <input
                                        type="text"
                                        id="kontakPerson"
                                        name="kontakPerson"
                                        value={formData.kontakPerson}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: John Doe"
                                        required
                                    />
                                </div>
                                <div className="form-group-vendor">
                                    <label htmlFor="status">Status <span className="required-vendor">*</span></label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Tidak Aktif">Tidak Aktif</option>
                                    </select>
                                </div>
                                <div className="form-group-vendor">
                                    <label htmlFor="tanggalRegistrasi">Tanggal Registrasi <span className="required-vendor">*</span></label>
                                    <input
                                        type="date"
                                        id="tanggalRegistrasi"
                                        name="tanggalRegistrasi"
                                        value={formData.tanggalRegistrasi}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer-vendor">
                                <button type="button" className="btn-cancel-vendor" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-submit-vendor">
                                    <Save size={18} /> Simpan Vendor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default DataVendor
