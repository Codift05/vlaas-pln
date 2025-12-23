import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Users, CheckCircle, Search, Eye, Edit, Trash2, PauseCircle, ClipboardList, Plus, Save, X } from 'lucide-react'
import './DataVendor.css'

function DataVendor() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
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

  // Data dummy vendors - nanti bisa diganti dengan fetch dari API/database
  const vendorsData = [
    { 
      id: 'VND001', 
      nama: 'PT Elektrindo Jaya', 
      alamat: 'Jl. Sudirman No. 123, Jakarta', 
      telepon: '021-5551234',
      email: 'info@elektrindo.com',
      kategori: 'Peralatan Listrik',
      kontakPerson: 'Budi Santoso',
      status: 'Aktif',
      tanggalRegistrasi: '15/01/2024'
    },
    { 
      id: 'VND002', 
      nama: 'CV Maju Bersama Electric', 
      alamat: 'Jl. Gatot Subroto No. 45, Bandung', 
      telepon: '022-7771234',
      email: 'contact@majubersama.com',
      kategori: 'Transformator',
      kontakPerson: 'Siti Nurhaliza',
      status: 'Aktif',
      tanggalRegistrasi: '20/02/2024'
    },
    { 
      id: 'VND003', 
      nama: 'PT Sentosa Generator', 
      alamat: 'Jl. Ahmad Yani No. 78, Surabaya', 
      telepon: '031-8881234',
      email: 'sales@sentosagen.com',
      kategori: 'Generator',
      kontakPerson: 'Agus Wijaya',
      status: 'Aktif',
      tanggalRegistrasi: '05/03/2024'
    },
    { 
      id: 'VND004', 
      nama: 'CV Kabel Utama Indonesia', 
      alamat: 'Jl. Diponegoro No. 90, Semarang', 
      telepon: '024-6661234',
      email: 'info@kabelutama.com',
      kategori: 'Kabel & Aksesoris',
      kontakPerson: 'Rina Melati',
      status: 'Tidak Aktif',
      tanggalRegistrasi: '10/04/2024'
    },
    { 
      id: 'VND005', 
      nama: 'PT Teknindo Power System', 
      alamat: 'Jl. Pemuda No. 234, Yogyakarta', 
      telepon: '0274-5551234',
      email: 'support@teknindopower.com',
      kategori: 'Panel Distribusi',
      kontakPerson: 'Dedi Kurniawan',
      status: 'Aktif',
      tanggalRegistrasi: '25/04/2024'
    },
    { 
      id: 'VND006', 
      nama: 'CV Harapan Elektrindo', 
      alamat: 'Jl. Veteran No. 56, Medan', 
      telepon: '061-4441234',
      email: 'cs@harapanelektrindo.com',
      kategori: 'Peralatan Listrik',
      kontakPerson: 'Lina Wijayanti',
      status: 'Aktif',
      tanggalRegistrasi: '12/05/2024'
    },
    { 
      id: 'VND007', 
      nama: 'PT Graha Transformer', 
      alamat: 'Jl. Imam Bonjol No. 67, Palembang', 
      telepon: '0711-3331234',
      email: 'info@grahatrafo.com',
      kategori: 'Transformator',
      kontakPerson: 'Bambang Sutrisno',
      status: 'Aktif',
      tanggalRegistrasi: '18/06/2024'
    },
    { 
      id: 'VND008', 
      nama: 'CV Karya Mandiri Electric', 
      alamat: 'Jl. Pahlawan No. 89, Malang', 
      telepon: '0341-2221234',
      email: 'sales@karyamandiri.com',
      kategori: 'Generator',
      kontakPerson: 'Dewi Lestari',
      status: 'Tidak Aktif',
      tanggalRegistrasi: '03/07/2024'
    },
    { 
      id: 'VND009', 
      nama: 'PT Nusantara Cable Industry', 
      alamat: 'Jl. Gajah Mada No. 112, Denpasar', 
      telepon: '0361-7771234',
      email: 'contact@nusantaracable.com',
      kategori: 'Kabel & Aksesoris',
      kontakPerson: 'Made Suartika',
      status: 'Aktif',
      tanggalRegistrasi: '22/08/2024'
    },
    { 
      id: 'VND010', 
      nama: 'CV Berkah Panel Elektrik', 
      alamat: 'Jl. Hayam Wuruk No. 145, Makassar', 
      telepon: '0411-5551234',
      email: 'info@berkahpanel.com',
      kategori: 'Panel Distribusi',
      kontakPerson: 'Abdul Rahman',
      status: 'Aktif',
      tanggalRegistrasi: '15/09/2024'
    },
    { 
      id: 'VND011', 
      nama: 'PT Mitra Energi Nusantara', 
      alamat: 'Jl. Thamrin No. 200, Jakarta', 
      telepon: '021-9991234',
      email: 'info@mitraenergi.com',
      kategori: 'Peralatan Listrik',
      kontakPerson: 'Iwan Setiawan',
      status: 'Aktif',
      tanggalRegistrasi: '10/10/2024'
    },
    { 
      id: 'VND012', 
      nama: 'CV Sejahtera Power', 
      alamat: 'Jl. Asia Afrika No. 88, Bandung', 
      telepon: '022-8881234',
      email: 'sales@sejahterapower.com',
      kategori: 'Generator',
      kontakPerson: 'Sri Handayani',
      status: 'Aktif',
      tanggalRegistrasi: '05/11/2024'
    },
  ]

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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Di sini nanti bisa ditambahkan logika untuk menyimpan ke database
    console.log('Data vendor baru:', formData)
    alert('Vendor berhasil ditambahkan!')
    setShowModal(false)
    // Reset form
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
  }

  const handleCloseModal = () => {
    setShowModal(false)
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
  }

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header title="Data Vendor" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="content-area">
          {/* Stats Cards */}
          <div className="stats-grid">
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
              {
                title: 'Kategori Vendor',
                value: [...new Set(vendorsData.map(v => v.kategori))].length,
                icon: ClipboardList,
                color: '#9b59b6',
                bgColor: '#f3e5f5',
              },
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="stat-card">
                  <div className="stat-icon-wrapper" style={{ background: stat.bgColor }}>
                    <IconComponent className="stat-icon-svg" style={{ color: stat.color }} strokeWidth={2.5} size={28} />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
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

            <button className="btn-primary-vendor" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Tambah Vendor Baru
            </button>
          </div>

          {/* Vendors Table */}
          <div className="table-container-vendor">
            <table className="vendors-table">
              <thead>
                <tr>
                  <th>ID Vendor</th>
                  <th>Nama Vendor</th>
                  <th>Kategori</th>
                  <th>Kontak Person</th>
                  <th>Telepon</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentVendors.length > 0 ? (
                  currentVendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="vendor-id">{vendor.id}</td>
                      <td className="vendor-name">
                        <div className="vendor-name-container">
                          <span className="vendor-name-text">{vendor.nama}</span>
                          <span className="vendor-address">{vendor.alamat}</span>
                        </div>
                      </td>
                      <td>
                        <span className="kategori-badge">{vendor.kategori}</span>
                      </td>
                      <td>{vendor.kontakPerson}</td>
                      <td>{vendor.telepon}</td>
                      <td className="vendor-email">{vendor.email}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-vendor">
                          <button className="btn-icon-vendor btn-view" title="Lihat Detail"><Eye size={16} /></button>
                          <button className="btn-icon-vendor btn-edit" title="Edit"><Edit size={16} /></button>
                          <button className="btn-icon-vendor btn-delete" title="Hapus"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
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
                  className="pagination-btn-vendor"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹ Sebelumnya
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-btn-vendor ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className="pagination-btn-vendor"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya ›
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Tambah Vendor */}
        {showModal && (
          <div className="modal-overlay-vendor" onClick={handleCloseModal}>
            <div className="modal-content-vendor" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-vendor">
                <h2>Tambah Vendor Baru</h2>
                <button className="modal-close-vendor" onClick={handleCloseModal}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form-vendor">
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
      </div>
    </div>
  )
}

export default DataVendor
