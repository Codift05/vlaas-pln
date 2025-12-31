'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, X, CheckCircle, Calendar, AlertCircle } from 'lucide-react'
import './VendorPengajuan.css'

function VendorPengajuan() {
    const router = useRouter()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        nomorSurat: '',
        perihal: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        keterangan: ''
    })

    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [errors, setErrors] = useState({})
    const [isDragging, setIsDragging] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateFile = (file) => {
        const errors = []

        // Check file type
        if (file.type !== 'application/pdf') {
            errors.push('File harus berformat PDF')
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxSize) {
            errors.push('Ukuran file maksimal 5MB')
        }

        return errors
    }

    const handleFileSelect = (file) => {
        const fileErrors = validateFile(file)

        if (fileErrors.length > 0) {
            setErrors(prev => ({
                ...prev,
                file: fileErrors.join(', ')
            }))
            return
        }

        setSelectedFile(file)
        setErrors(prev => ({
            ...prev,
            file: ''
        }))

        // Simulate upload progress
        simulateUpload()
    }

    const handleFileInputChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const simulateUpload = () => {
        setUploadProgress(0)
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 10
            })
        }, 100)
    }

    const removeFile = () => {
        setSelectedFile(null)
        setUploadProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.nomorSurat) {
            newErrors.nomorSurat = 'Nomor surat wajib diisi'
        }

        if (!formData.perihal) {
            newErrors.perihal = 'Perihal wajib diisi'
        }

        if (!formData.tanggalMulai) {
            newErrors.tanggalMulai = 'Tanggal mulai wajib diisi'
        }

        if (!formData.tanggalSelesai) {
            newErrors.tanggalSelesai = 'Tanggal selesai wajib diisi'
        }

        // Validate date range
        if (formData.tanggalMulai && formData.tanggalSelesai) {
            const startDate = new Date(formData.tanggalMulai)
            const endDate = new Date(formData.tanggalSelesai)

            if (endDate < startDate) {
                newErrors.tanggalSelesai = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai'
            }
        }

        if (!selectedFile) {
            newErrors.file = 'File PDF wajib diunggah'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        // Simulate API submission
        setTimeout(() => {
            const newSubmission = {
                ...formData,
                fileName: selectedFile.name,
                status: 'PENDING',
                tanggalPengajuan: new Date().toLocaleDateString('id-ID')
            }

            // Save to localStorage for demo
            const existingSubmissions = JSON.parse(localStorage.getItem('vendorSubmissions') || '[]')
            existingSubmissions.push(newSubmission)
            localStorage.setItem('vendorSubmissions', JSON.stringify(existingSubmissions))

            setIsSubmitting(false)
            alert('Surat berhasil diajukan! Status: Menunggu Persetujuan')
            router.push('/vendor-portal')
        }, 2000)
    }

    const isFormValid = () => {
        return formData.nomorSurat &&
            formData.perihal &&
            formData.tanggalMulai &&
            formData.tanggalSelesai &&
            selectedFile &&
            uploadProgress === 100
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="vendor-pengajuan-page">
            <div className="pengajuan-container">
                <div className="pengajuan-header">
                    <h1>Buat Pengajuan Surat Baru</h1>
                    <p>Lengkapi formulir di bawah ini untuk mengajukan surat kontrak</p>
                </div>

                <form onSubmit={handleSubmit} className="pengajuan-form">
                    <div className="profile-sections">
                        {/* Basic Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <FileText size={20} className="section-icon" />
                                <h2>Informasi Surat</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="nomorSurat">
                                        Nomor Surat <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="nomorSurat"
                                        name="nomorSurat"
                                        value={formData.nomorSurat}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: SRT/VND/2025/001"
                                        className={`form-input${errors.nomorSurat ? ' error' : ''}`}
                                    />
                                    {errors.nomorSurat && (
                                        <span className="error-text">{errors.nomorSurat}</span>
                                    )}
                                </div>
                                <div className="form-group span-2">
                                    <label htmlFor="perihal">
                                        Perihal <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="perihal"
                                        name="perihal"
                                        value={formData.perihal}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Pengajuan Kontrak Pemeliharaan Transformer"
                                        className={`form-input${errors.perihal ? ' error' : ''}`}
                                    />
                                    {errors.perihal && (
                                        <span className="error-text">{errors.perihal}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tanggalMulai">
                                        <Calendar size={16} /> Tanggal Mulai Kontrak <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="tanggalMulai"
                                        name="tanggalMulai"
                                        value={formData.tanggalMulai}
                                        onChange={handleInputChange}
                                        className={`form-input${errors.tanggalMulai ? ' error' : ''}`}
                                    />
                                    {errors.tanggalMulai && (
                                        <span className="error-text">{errors.tanggalMulai}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tanggalSelesai">
                                        <Calendar size={16} /> Tanggal Selesai Kontrak <span className="required">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="tanggalSelesai"
                                        name="tanggalSelesai"
                                        value={formData.tanggalSelesai}
                                        onChange={handleInputChange}
                                        min={formData.tanggalMulai}
                                        className={`form-input${errors.tanggalSelesai ? ' error' : ''}`}
                                    />
                                    {errors.tanggalSelesai && (
                                        <span className="error-text">{errors.tanggalSelesai}</span>
                                    )}
                                </div>
                                <div className="form-group span-2">
                                    <label htmlFor="keterangan">Keterangan Tambahan</label>
                                    <textarea
                                        id="keterangan"
                                        name="keterangan"
                                        value={formData.keterangan}
                                        onChange={handleInputChange}
                                        placeholder="Tambahkan keterangan atau catatan jika diperlukan..."
                                        rows="4"
                                        className="form-textarea"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* File Upload Section */}
                        <section className="profile-section">
                            <div className="section-header">
                                <Upload size={20} className="section-icon" />
                                <h2>Unggah Dokumen</h2>
                            </div>
                            <div className="upload-info-banner">
                                <AlertCircle size={18} />
                                <div>
                                    <strong>Persyaratan File:</strong>
                                    <ul>
                                        <li>Format file harus PDF</li>
                                        <li>Ukuran maksimal 5MB</li>
                                        <li>Pastikan dokumen sudah ditandatangani</li>
                                    </ul>
                                </div>
                            </div>
                            {!selectedFile ? (
                                <div
                                    className={`upload-area${isDragging ? ' dragging' : ''}${errors.file ? ' error' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={48} className="upload-icon" />
                                    <h3>Drag & Drop file PDF di sini</h3>
                                    <p>atau klik untuk memilih file</p>
                                    <span className="upload-hint">Maksimal 5MB • Format PDF</span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileInputChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            ) : (
                                <div className="file-preview">
                                    <div className="file-info">
                                        <FileText size={40} className="file-icon" />
                                        <div className="file-details">
                                            <h4>{selectedFile.name}</h4>
                                            <p>{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                        {uploadProgress === 100 && (
                                            <CheckCircle size={24} className="success-icon" />
                                        )}
                                        <button
                                            type="button"
                                            className="btn-remove-file"
                                            onClick={removeFile}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    {uploadProgress < 100 && (
                                        <div className="upload-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                            <span className="progress-text">{uploadProgress}%</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.file && (
                                <span className="error-text">{errors.file}</span>
                            )}
                        </section>
                    </div>
                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => router.push('/vendor-portal')}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={!isFormValid() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Kirim Pengajuan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VendorPengajuan
