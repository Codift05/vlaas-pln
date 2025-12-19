import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './DataVendor.css'

function DataVendor() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Data Vendor" />
        
        <div className="content-area">
          {/* Stats Cards */}
          <div className="stats-grid-vendor">
            <div className="stat-card-vendor" style={{ borderLeftColor: '#3498db' }}>
              <div className="stat-icon-vendor" style={{ background: '#3498db' }}>
                👥
              </div>
              <div className="stat-info-vendor">
                <h3 className="stat-value-vendor">{vendorsData.length}</h3>
                <p className="stat-title-vendor">Total Vendor</p>
              </div>
            </div>

            <div className="stat-card-vendor" style={{ borderLeftColor: '#2ecc71' }}>
              <div className="stat-icon-vendor" style={{ background: '#2ecc71' }}>
                ✅
              </div>
              <div className="stat-info-vendor">
                <h3 className="stat-value-vendor">
                  {vendorsData.filter(v => v.status === 'Aktif').length}
                </h3>
                <p className="stat-title-vendor">Vendor Aktif</p>
              </div>
            </div>

            <div className="stat-card-vendor" style={{ borderLeftColor: '#e74c3c' }}>
              <div className="stat-icon-vendor" style={{ background: '#e74c3c' }}>
                ⏸️
              </div>
              <div className="stat-info-vendor">
                <h3 className="stat-value-vendor">
                  {vendorsData.filter(v => v.status === 'Tidak Aktif').length}
                </h3>
                <p className="stat-title-vendor">Vendor Tidak Aktif</p>
              </div>
            </div>

            <div className="stat-card-vendor" style={{ borderLeftColor: '#9b59b6' }}>
              <div className="stat-icon-vendor" style={{ background: '#9b59b6' }}>
                📋
              </div>
              <div className="stat-info-vendor">
                <h3 className="stat-value-vendor">
                  {[...new Set(vendorsData.map(v => v.kategori))].length}
                </h3>
                <p className="stat-title-vendor">Kategori Vendor</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="action-bar-vendor">
            <div className="search-section-vendor">
              <div className="search-box-vendor">
                <span className="search-icon-vendor">🔍</span>
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

            <button className="btn-primary-vendor">
              <span>➕</span> Tambah Vendor Baru
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
                          <button className="btn-icon-vendor btn-view" title="Lihat Detail">👁️</button>
                          <button className="btn-icon-vendor btn-edit" title="Edit">✏️</button>
                          <button className="btn-icon-vendor btn-delete" title="Hapus">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      <div className="no-data-message">
                        <span className="no-data-icon">🔍</span>
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
      </div>
    </div>
  )
}

export default DataVendor
