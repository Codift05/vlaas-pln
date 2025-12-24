import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Eye, Edit, Trash2, Search, ChevronDown, Plus, Save } from 'lucide-react'
import './ManajemenAset.css'

function ManajemenAset() {
      const [sidebarMini, setSidebarMini] = useState(false)
    // State untuk file yang dipilih per kontrak
    const [selectedFiles, setSelectedFiles] = useState({});
    // Handler saat file dipilih
    const handleFileChange = (e, assetId) => {
      setSelectedFiles(prev => ({
        ...prev,
        [assetId]: e.target.files[0]
      }));
    };

    // Handler simpan file (dummy, bisa dihubungkan ke backend/Supabase)
    const handleSaveFile = (assetId) => {
      const file = selectedFiles[assetId];
      if (!file) {
        alert('Pilih file terlebih dahulu!');
        return;
      }
      // TODO: Upload file ke server/Supabase di sini
      alert(`File untuk kontrak ${assetId} berhasil disimpan!`);
      // Reset file input jika perlu
      setSelectedFiles(prev => ({ ...prev, [assetId]: null }));
    };
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const dropdownRef = useRef(null)
  const columnSelectorRef = useRef(null)
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    name: true,
    budgetType: true,
    contractType: true,
    category: true,
    location: true,
    status: true,
    startDate: true,
    endDate: true
  })
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
  })

  const assets = [
    { id: 'AST001', name: 'Transformer 500KVA', budgetType: 'AI', contractType: 'PJ', category: 'Trafo', location: 'Gardu Induk Jakarta', status: 'Aktif', startDate: '01/01/2025', endDate: '31/12/2025' },
    { id: 'AST002', name: 'Generator Set Diesel', budgetType: 'AO', contractType: 'SPK', category: 'Generator', location: 'PLTD Surabaya', status: 'Aktif', startDate: '15/02/2025', endDate: '15/08/2025' },
    { id: 'AST003', name: 'Circuit Breaker 20KV', budgetType: 'AI', contractType: 'PO', category: 'CB', location: 'Gardu Induk Bandung', status: 'Perbaikan', startDate: '01/03/2025', endDate: '30/06/2025' },
    { id: 'AST004', name: 'Panel Distribusi', budgetType: 'AO', contractType: 'PJ', category: 'Panel', location: 'Gardu Distribusi A12', status: 'Aktif', startDate: '10/01/2025', endDate: '10/07/2025' },
    { id: 'AST005', name: 'Kabel XLPE 150mm', budgetType: 'AI', contractType: 'SPK', category: 'Kabel', location: 'Jaringan Tegangan Menengah', status: 'Aktif', startDate: '20/02/2025', endDate: '20/11/2025' },
    { id: 'AST006', name: 'Transformer 1000KVA', budgetType: 'AO', contractType: 'PO', category: 'Trafo', location: 'Gardu Induk Semarang', status: 'Tidak Aktif', startDate: '05/01/2025', endDate: '05/05/2025' },
  ]

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'Aktif', label: 'Aktif' },
    { value: 'Perbaikan', label: 'Perbaikan' },
    { value: 'Tidak Aktif', label: 'Tidak Aktif' }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target)) {
        setShowColumnSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStatusSelect = (value) => {
    setFilterStatus(value)
    setDropdownOpen(false)
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

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} isMini={sidebarMini} onClose={() => setSidebarOpen(false)} onLogoClick={() => { setSidebarMini(true); setSidebarOpen(false); }} onHamburgerClick={() => { setSidebarMini(false); setSidebarOpen(true); }} />
      <div className="main-content">
        <Header title="Manajemen Kontrak" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="content-area">
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
                  className="btn-secondary" 
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                >
                  <Eye size={25} /> Pilih Kolom ({getVisibleColumnsCount()}/9)
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
                  {columnVisibility.budgetType && <th>Tipe Anggaran</th>}
                  {columnVisibility.contractType && <th>Tipe Kontrak</th>}
                  {columnVisibility.category && <th>Kategori</th>}
                  {columnVisibility.location && <th>Lokasi</th>}
                  {columnVisibility.status && <th>Status</th>}
                  {columnVisibility.startDate && <th>Tanggal Mulai</th>}
                  {columnVisibility.endDate && <th>Tanggal Selesai</th>}
                  <th>File</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id}>
                      {columnVisibility.id && <td className="asset-id">{asset.id}</td>}
                      {columnVisibility.name && <td className="asset-name">{asset.name}</td>}
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
                      {/* Kolom File & Simpan */}
                      <td>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, asset.id)}
                          style={{ marginBottom: 4 }}
                        />
                        <button
                          className="btn-icon btn-save"
                          title="Simpan File"
                          onClick={() => handleSaveFile(asset.id)}
                          style={{ marginLeft: 4 }}
                        >
                          <Save size={16} />
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon btn-view" title="Lihat Detail"><Eye size={16} /></button>
                          <button className="btn-icon btn-edit" title="Edit"><Edit size={16} /></button>
                          <button className="btn-icon btn-delete" title="Hapus"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={getVisibleColumnsCount() + 2} className="no-data">
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
          )}
        </div>

        {/* Modal Tambah Aset */}
        {showModal && (
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
                      <option value="">Pilih Kategori</option>
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
        )}
      </div>
    </div>
  )
}

export default ManajemenAset
