import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './ManajemenAset.css'

function ManajemenAset() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    location: '',
    status: 'Aktif',
    lastMaintenance: ''
  })

  const assets = [
    { id: 'AST001', name: 'Transformer 500KVA', category: 'Trafo', location: 'Gardu Induk Jakarta', status: 'Aktif', lastMaintenance: '15/11/2025' },
    { id: 'AST002', name: 'Generator Set Diesel', category: 'Generator', location: 'PLTD Surabaya', status: 'Aktif', lastMaintenance: '10/11/2025' },
    { id: 'AST003', name: 'Circuit Breaker 20KV', category: 'CB', location: 'Gardu Induk Bandung', status: 'Perbaikan', lastMaintenance: '01/11/2025' },
    { id: 'AST004', name: 'Panel Distribusi', category: 'Panel', location: 'Gardu Distribusi A12', status: 'Aktif', lastMaintenance: '20/11/2025' },
    { id: 'AST005', name: 'Kabel XLPE 150mm', category: 'Kabel', location: 'Jaringan Tegangan Menengah', status: 'Aktif', lastMaintenance: '05/11/2025' },
    { id: 'AST006', name: 'Transformer 1000KVA', category: 'Trafo', location: 'Gardu Induk Semarang', status: 'Tidak Aktif', lastMaintenance: '25/10/2025' },
  ]

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
    console.log('Data aset baru:', formData)
    alert('Aset berhasil ditambahkan!')
    setShowModal(false)
    // Reset form
    setFormData({
      id: '',
      name: '',
      category: '',
      location: '',
      status: 'Aktif',
      lastMaintenance: ''
    })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      id: '',
      name: '',
      category: '',
      location: '',
      status: 'Aktif',
      lastMaintenance: ''
    })
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Manajemen Aset" />
        
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
                placeholder="Cari aset berdasarkan nama..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-table"
              />
              
              {searchTerm && (
                <span className="search-result-count">
                  Ditemukan {filteredAssets.length} aset
                </span>
              )}
            </div>

            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <span>➕</span> Tambah Aset Baru
            </button>
          </div>

          {/* Assets Table */}
          <div className="table-container">
            <table className="assets-table">
              <thead>
                <tr>
                  <th>ID Aset</th>
                  <th>Nama Aset</th>
                  <th>Kategori</th>
                  <th>Lokasi</th>
                  <th>Status</th>
                  <th>Pemeliharaan Terakhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="asset-id">{asset.id}</td>
                      <td className="asset-name">{asset.name}</td>
                      <td>{asset.category}</td>
                      <td>{asset.location}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td>{asset.lastMaintenance}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon btn-view" title="Lihat Detail">👁️</button>
                          <button className="btn-icon btn-edit" title="Edit">✏️</button>
                          <button className="btn-icon btn-delete" title="Hapus">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      <div className="no-data-message">
                        <span className="no-data-icon">🔍</span>
                        <p>Tidak ada aset yang ditemukan</p>
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
                <h2>Tambah Aset Baru</h2>
                <button className="modal-close" onClick={handleCloseModal}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="id">ID Aset <span className="required">*</span></label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      placeholder="Contoh: AST007"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Nama Aset <span className="required">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Contoh: Transformer 750KVA"
                      required
                    />
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
                    <label htmlFor="lastMaintenance">Pemeliharaan Terakhir <span className="required">*</span></label>
                    <input
                      type="date"
                      id="lastMaintenance"
                      name="lastMaintenance"
                      value={formData.lastMaintenance}
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
                    <span>💾</span> Simpan Aset
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
