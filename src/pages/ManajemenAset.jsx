import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import './ManajemenAset.css'

function ManajemenAset() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const assets = [
    { id: 'AST001', name: 'Transformer 500KVA', category: 'Trafo', location: 'Gardu Induk Jakarta', status: 'Aktif', lastMaintenance: '15/11/2025' },
    { id: 'AST002', name: 'Generator Set Diesel', category: 'Generator', location: 'PLTD Surabaya', status: 'Aktif', lastMaintenance: '10/11/2025' },
    { id: 'AST003', name: 'Circuit Breaker 20KV', category: 'CB', location: 'Gardu Induk Bandung', status: 'Perbaikan', lastMaintenance: '01/11/2025' },
    { id: 'AST004', name: 'Panel Distribusi', category: 'Panel', location: 'Gardu Distribusi A12', status: 'Aktif', lastMaintenance: '20/11/2025' },
    { id: 'AST005', name: 'Kabel XLPE 150mm', category: 'Kabel', location: 'Jaringan Tegangan Menengah', status: 'Aktif', lastMaintenance: '05/11/2025' },
    { id: 'AST006', name: 'Transformer 1000KVA', category: 'Trafo', location: 'Gardu Induk Semarang', status: 'Tidak Aktif', lastMaintenance: '25/10/2025' },
  ]

  const getStatusClass = (status) => {
    switch (status) {
      case 'Aktif': return 'status-active'
      case 'Perbaikan': return 'status-maintenance'
      case 'Tidak Aktif': return 'status-inactive'
      default: return ''
    }
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
                placeholder="Cari aset..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-table"
              />
            </div>

            <button className="btn-primary">
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
                {assets.map((asset) => (
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination">
            <span className="pagination-info">Menampilkan 1-6 dari 6 data</span>
            <div className="pagination-controls">
              <button className="pagination-btn">‹ Sebelumnya</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn">Selanjutnya ›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManajemenAset
