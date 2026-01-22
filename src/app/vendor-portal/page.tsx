'use client'
import React, { useState, useEffect } from 'react';
import { Download, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import './VendorDashboard.css';

export default function VendorDashboard() {
    const [currentPage, setCurrentPage] = useState(1);
    const [suratData, setSuratData] = useState([]);
    const itemsPerPage = 5;

    // Load data from localStorage
    useEffect(() => {
        const loadSubmissions = () => {
            const submissions = JSON.parse(localStorage.getItem('vendorSubmissions') || '[]');
            // Reverse to show newest first
            setSuratData(submissions.reverse());
        };

        loadSubmissions();

        // Listen for storage changes
        window.addEventListener('storage', loadSubmissions);
        return () => window.removeEventListener('storage', loadSubmissions);
    }, []);

    // Calculate statistics
    const totalPengajuan = suratData.length;
    const pendingCount = suratData.filter(s => s.status === 'PENDING').length;
    const approvedCount = suratData.filter(s => s.status === 'APPROVED').length;
    const rejectedCount = suratData.filter(s => s.status === 'REJECTED').length;

    // Pagination
    const totalPages = Math.ceil(suratData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = suratData.slice(startIndex, startIndex + itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Status badge dengan icon
    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': {
                className: 'status-pending',
                icon: Clock,
                text: 'Menunggu'
            },
            'APPROVED': {
                className: 'status-approved',
                icon: CheckCircle,
                text: 'Disetujui'
            },
            'REJECTED': {
                className: 'status-rejected',
                icon: XCircle,
                text: 'Ditolak'
            }
        };

        const config = statusConfig[status] || statusConfig['PENDING'];
        const IconComponent = config.icon;

        return (
            <span className={`status-badge ${config.className}`}>
                <IconComponent size={14} />
                {config.text}
            </span>
        );
    };

    return (
        <div className="vendor-dashboard">
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{totalPengajuan}</div>
                        <div className="stat-label">Total Pengajuan</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{pendingCount}</div>
                        <div className="stat-label">Menunggu Persetujuan</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon approved">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{approvedCount}</div>
                        <div className="stat-label">Disetujui</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon rejected">
                        <XCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{rejectedCount}</div>
                        <div className="stat-label">Ditolak</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <h2>Riwayat Pengajuan Surat</h2>
                </div>

                <table className="vendor-table">
                    <thead>
                        <tr>
                            <th>Nomor Surat</th>
                            <th>Perihal</th>
                            <th>Tanggal Pengajuan</th>
                            <th>Tanggal Surat</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                    Belum ada pengajuan surat
                                </td>
                            </tr>
                        ) : (
                            currentData.map((surat, index) => (
                                <tr key={index}>
                                    <td>{surat.nomorSurat}</td>
                                    <td>{surat.perihal}</td>
                                    <td>{surat.tanggalPengajuan}</td>
                                    <td>{surat.tanggalSurat}</td>
                                    <td>{getStatusBadge(surat.status)}</td>
                                    <td>
                                        <button className="btn-download">
                                            <Download size={16} />
                                            Unduh
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {suratData.length > 0 && (
                    <div className="pagination">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            ← Sebelumnya
                        </button>
                        <span className="page-info">
                            Halaman {currentPage} dari {totalPages || 1}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Selanjutnya →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
