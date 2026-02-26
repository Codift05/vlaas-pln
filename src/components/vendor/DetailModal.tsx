
import React from 'react';
import { X, Calendar, FileText, Briefcase, Hash, AlertCircle } from 'lucide-react';
import '../../app/vendor-portal/VendorDashboard.css';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function DetailModal({ isOpen, onClose, data }: DetailModalProps) {
    if (!isOpen || !data) return null;

    const isRejected = data.status === 'REJECTED';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Detail Pengajuan</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {isRejected && (
                        <div className="rejection-alert">
                            <div className="alert-icon">
                                <AlertCircle size={20} />
                            </div>
                            <div className="alert-content">
                                <h4>Pengajuan Ditolak</h4>
                                <p>{data.alasanPenolakan || 'Tidak ada alasan yang diberikan.'}</p>
                            </div>
                        </div>
                    )}

                    <div className="detail-group">
                        <label>Nomor Surat</label>
                        <div className="detail-value">
                            <Hash size={16} />
                            <span>{data.nomorSurat}</span>
                        </div>
                    </div>

                    <div className="detail-group">
                        <label>Perihal</label>
                        <div className="detail-value">
                            <FileText size={16} />
                            <span>{data.perihal}</span>
                        </div>
                    </div>

                    <div className="detail-group">
                        <label>Nama Pekerjaan</label>
                        <div className="detail-value">
                            <Briefcase size={16} />
                            <span>{data.namaPekerjaan || '-'}</span>
                        </div>
                    </div>

                    <div className="detail-group">
                        <label>Nomor Kontrak</label>
                        <div className="detail-value">
                            <Hash size={16} />
                            <span>{data.nomorKontrak || '-'}</span>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="detail-group">
                            <label>Tanggal Pengajuan</label>
                            <div className="detail-value">
                                <Calendar size={16} />
                                <span>{data.tanggalPengajuan}</span>
                            </div>
                        </div>

                        <div className="detail-group">
                            <label>Tanggal Surat</label>
                            <div className="detail-value">
                                <Calendar size={16} />
                                <span>{data.tanggalSurat}</span>
                            </div>
                        </div>
                    </div>

                    {data.keterangan && (
                        <div className="detail-group">
                            <label>Keterangan Tambahan</label>
                            <p className="detail-text">{data.keterangan}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Tutup
                    </button>
                    {data.fileUrl && (
                        <a
                            href={data.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                        >
                            Unduh Dokumen
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
