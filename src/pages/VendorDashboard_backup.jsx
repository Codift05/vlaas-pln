import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Download, Calendar, CheckCircle, XCircle, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import './VendorDashboard.css'

function VendorDashboard() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const itemsPerPage = 5
  
  // Data dummy surat vendor
  const suratData = [
    { 
      id: 1, 
      nomorSurat: 'SRT001', 
      namaKontrak: 'Transformer 500KVA',
      tipeAnggaran: 'AI',
      tipeKontrak: 'PJ',
      kategori: 'Trafo',
      lokasi: 'Gardu Induk Jakarta',
      tanggalMulai: '01/01/2025',
      tanggalSelesai: '31/12/2025',
      status: 'Aktif',
      alasanPenolakan: null
    },
    { 
      id: 2, 
      nomorSurat: 'SRT002', 
      namaKontrak: 'Generator Set Diesel',
      tipeAnggaran: 'AO',
      tipeKontrak: 'SPK',
      kategori: 'Generator',
      lokasi: 'PLTD Surabaya',
      tanggalMulai: '15/02/2025',
      tanggalSelesai: '15/08/2025',
      status: 'Aktif',
      alasanPenolakan: null
    },
    { 
      id: 3, 
      nomorSurat: 'SRT003', 
      namaKontrak: 'Circuit Breaker 20KV',
      tipeAnggaran: 'AI',
      tipeKontrak: 'PO',
      kategori: 'CB',
      lokasi: 'Gardu Induk Bandung',
      tanggalMulai: '01/03/2025',
      tanggalSelesai: '30/06/2025',
      status: 'Perbaikan',
      alasanPenolakan: null
    },
    { 
      id: 4, 
      nomorSurat: 'SRT004', 
      namaKontrak: 'Panel Distribusi',
      tipeAnggaran: 'AO',
      tipeKontrak: 'PJ',
      kategori: 'Panel',
      lokasi: 'Gardu Distribusi A12',
      tanggalMulai: '10/01/2025',
      tanggalSelesai: '10/07/2025',
      status: 'Aktif',
      alasanPenolakan: null
    },
    { 
      id: 5, 
      nomorSurat: 'SRT005', 
      namaKontrak: 'Kabel XLPE 150mm',
      tipeAnggaran: 'AI',
      tipeKontrak: 'SPK',
      kategori: 'Kabel',
      lokasi: 'Jaringan Tegangan Menengah',
     Filter data based on search
  const filteredData = suratData.filter(surat =>
    surat.namaKontrak.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surat.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surat.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filtered
    { 
      id: 6, 
      nomorSurat: 'SRT006', 
      namaKontrak: 'Transformer 1000KVA',
      tipeAnggaran: 'AO',
      tipeKontrak: 'PO',
      kategori: 'Trafo',
      lokasi: 'Gardu Induk Semarang',
      tanggalMulai: '05/01/2025',
      tanggalSelesai: '05/05/2025',
      status: 'Tidak Aktif',
      alasanPenolakan: null
    },
  ]

  // Pagination logic
  const totalPages = Math.ceil(suratData.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = suratData.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNeMap = {
      'Aktif': 'status-active',
      'Tidak Aktif': 'status-inactive',
      'Perbaikan': 'status-maintenance'
    }
    return <span className={`status-badge ${statusMap[status]}`}>{status}</span>
  }

  const getTipeAnggaranBadge = (tipe) => {
    return <span className={`budget-badge budget-${tipe.toLowerCase()}`}>{tipe}</span>
  }

  const getTipeKontrakBadge = (tipe) => {
    return <span className={`contract-badge contract-${tipe.toLowerCase()}`}>{tipe}</span>onst config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon
    
    return (
      <span className={`status-badge-vendor ${config.class}`}>
        <Icon size={14} /> {config.label}
      </span>
    )
  }

  const handleBuatPengajuan = () => {
    navigate('/vendor-portal/pengajuan')
  }

  const handleViewDetail = (surat) => {
    setSelectedLetter(surat)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedLetter(null)
  }

  return (
    <div className="vendor-dashboard">
      {/* Main Content */}
      <main className="vendor-main">
        <div className="vendor-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div>
              <h1>Selamat Datang di Portal Vendor</h1>
              <p>Kelola pengajuan surat dan pantau status dokumen Anda</p>
            </div>
            <button className="btn-primary-vendor" onClick={handleBuatPengajuan}>
              <Plus size={20} /> Buat Pengajuan Baru
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon pending">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <h3>{suratData.filter(s => s.status === 'PENDING').length}</h3>
                <p>Menunggu Persetujuan</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon approved">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <h3>{suratData.filter(s => s.status === 'APPROVED').length}</h3>
                <p>Disetujui</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon rejected">
                <XCircle size={24} />
              </div>
              <div className="stat-content">
                <h3>{suratData.filter(s => s.status === 'REJECTED').length}</h3>
                <p>Ditolak</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <h3>{suratData.length}</h3>
                <p>Total Pengajuan</p>
              </div>
            </div>
          </div>

          {/* Riwayat Surat Table */}
          <div className="section-header">
            <h2>Riwayat Pengajuan Surat</h2>
          </div>
          
          <div className="table-container">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Nomor Surat</th>
                  <th>Perihal</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Periode Kontrak</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((surat) => (
                  <tr key={surat.id}>
                    <td className="asset-id">{surat.nomorSurat}</td>
                    <td className="asset-name">{surat.perihal}</td>
                    <td>{surat.tanggalPengajuan}</td>
                    <td>
                      <div className="periode-kontrak">
                        <Calendar size={14} />
                        <span>{surat.tanggalMulai} - {surat.tanggalSelesai}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(surat.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-view" 
                          title="Lihat Detail"
                          onClick={() => handleViewDetail(surat)}
                        >
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon btn-edit" title="Download PDF">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="table-pagination">
              <div className="pagination-info">
                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, suratData.length)} dari {suratData.length} data
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="pagination-btn"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rejected Letters with Reasons */}
          {suratData.filter(s => s.status === 'REJECTED').length > 0 && (
            <div className="rejected-section">
              <h2>⚠️ Surat yang Ditolak</h2>
              <div className="rejected-list">
                {suratData
                  .filter(s => s.status === 'REJECTED')
                  .map(surat => (
                    <div key={surat.id} className="rejected-card">
                      <div className="rejected-header">
                        <h3>{surat.nomorSurat}</h3>
                        <span className="rejected-date">{surat.tanggalPengajuan}</span>
                      </div>
                      <p className="rejected-perihal">{surat.perihal}</p>
                      <div className="rejected-reason">
                        <strong>Alasan Penolakan:</strong>
                        <p>{surat.alasanPenolakan}</p>
                      </div>
                      <button className="btn-resubmit">Ajukan Ulang</button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedLetter && (
        <div className="modal-overlay-vendor" onClick={handleCloseModal}>
          <div className="modal-content-vendor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-vendor">
              <h2>Detail Pengajuan Surat</h2>
              <button className="modal-close-vendor" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body-vendor">
              <div className="detail-row">
                <label>Nomor Surat:</label>
                <span className="detail-value">{selectedLetter.nomorSurat}</span>
              </div>

              <div className="detail-row">
                <label>Perihal:</label>
                <span className="detail-value">{selectedLetter.perihal}</span>
              </div>

              <div className="detail-row">
                <label>Tanggal Pengajuan:</label>
                <span className="detail-value">{selectedLetter.tanggalPengajuan}</span>
              </div>

              <div className="detail-row">
                <label>Periode Kontrak:</label>
                <span className="detail-value">
                  <Calendar size={14} style={{ marginRight: '6px' }} />
                  {selectedLetter.tanggalMulai} - {selectedLetter.tanggalSelesai}
                </span>
              </div>

              <div className="detail-row">
                <label>Status:</label>
                {getStatusBadge(selectedLetter.status)}
              </div>

              {selectedLetter.status === 'REJECTED' && selectedLetter.alasanPenolakan && (
                <div className="detail-rejection">
                  <label>Alasan Penolakan:</label>
                  <div className="rejection-box">
                    <p>{selectedLetter.alasanPenolakan}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-vendor">
              <button className="btn-download-vendor">
                <Download size={16} /> Download PDF
              </button>
              {selectedLetter.status === 'REJECTED' && (
                <button className="btn-resubmit-vendor" onClick={() => navigate('/vendor-portal/pengajuan')}>
                  Ajukan Ulang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDashboard
