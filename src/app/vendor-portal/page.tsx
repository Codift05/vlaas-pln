'use client'
import React, { useState } from 'react';
import { Download, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import './VendorDashboard.css';

export default function VendorDashboard() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Data surat dengan struktur asli
    const suratData = [
        {
            id: 1,
            nomorSurat: 'SRT/VND/2025/001',
            perihal: 'Pengajuan Kontrak Maintenance Transformator',
            tanggalPengajuan: '2025-01-15',
            periodeKontrak: '2025-02-01 s/d 2025-07-31',
            status: 'PENDING',
            alasanPenolakan: null
        },
        {
            id: 2,
            nomorSurat: 'SRT/VND/2025/002',
            perihal: 'Pengajuan Kontrak Instalasi Kabel',
            tanggalPengajuan: '2025-01-20',
            periodeKontrak: '2025-03-01 s/d 2025-08-31',
            status: 'APPROVED',
            alasanPenolakan: null
        },
        {
            id: 3,
            nomorSurat: 'SRT/VND/2025/003',
            perihal: 'Pengajuan Kontrak Perawatan Gardu',
            tanggalPengajuan: '2025-01-25',
            periodeKontrak: '2025-02-15 s/d 2025-12-31',
            status: 'REJECTED',
            alasanPenolakan: 'Dokumen tidak lengkap'
        },
        {
            id: 4,
            nomorSurat: 'SRT/VND/2025/004',
            perihal: 'Pengajuan Kontrak Instalasi Panel',
            tanggalPengajuan: '2025-02-01',
            periodeKontrak: '2025-03-01 s/d 2025-09-30',
            status: 'PENDING',
            alasanPenolakan: null
        },
        {
            id: 5,
            nomorSurat: 'SRT/VND/2025/005',
            perihal: 'Pengajuan Kontrak Maintenance Jaringan',
            tanggalPengajuan: '2025-02-05',
            periodeKontrak: '2025-04-01 s/d 2025-10-31',
            status: 'APPROVED',
            alasanPenolakan: null
        },
        {
            id: 6,
            nomorSurat: 'SRT/VND/2025/006',
            perihal: 'Pengajuan Kontrak Instalasi Meter',
            tanggalPengajuan: '2025-02-10',
            periodeKontrak: '2025-03-15 s/d 2025-11-30',
            status: 'PENDING',
            alasanPenolakan: null
        }
    ];

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
                        <div className="stat-value">6</div>
                        <div className="stat-label">Total Pengajuan</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">3</div>
                        <div className="stat-label">Menunggu Persetujuan</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon approved">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">2</div>
                        <div className="stat-label">Disetujui</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon rejected">
                        <XCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">1</div>
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
                            <th>Periode Kontrak</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((surat) => (
                            <tr key={surat.id}>
                                <td>{surat.nomorSurat}</td>
                                <td>{surat.perihal}</td>
                                <td>{surat.tanggalPengajuan}</td>
                                <td>{surat.periodeKontrak}</td>
                                <td>{getStatusBadge(surat.status)}</td>
                                <td>
                                    <button className="btn-download">
                                        <Download size={16} />
                                        Unduh
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        ← Sebelumnya
                    </button>
                    <span className="page-info">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Selanjutnya →
                    </button>
                </div>
            </div>
        </div>
    );
}
