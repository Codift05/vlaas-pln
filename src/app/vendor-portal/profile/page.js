'use client'
import { useState, useEffect } from 'react'
import { Building2, MapPin, Phone, User, Mail, Save, Edit2 } from 'lucide-react'
import './VendorProfile.css'

function VendorProfile() {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [profileData, setProfileData] = useState({
        companyName: '',
        companyType: 'PT',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        phone: '',
        fax: '',
        email: '',
        picName: '',
        picPosition: '',
        picPhone: '',
        picEmail: '',
        npwp: '',
        siup: '',
        tdp: '',
        established: ''
    })

    // Load data from localStorage on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('vendorProfile')
        const vendorEmail = localStorage.getItem('vendorEmail')

        if (savedProfile) {
            setProfileData(JSON.parse(savedProfile))
        } else if (vendorEmail) {
            setProfileData(prev => ({ ...prev, email: vendorEmail }))
            setIsEditing(true) // Force edit mode on first login
        }
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('vendorProfile', JSON.stringify(profileData))
            setLoading(false)
            setIsEditing(false)
            alert('Profil perusahaan berhasil disimpan!')
        }, 1000)
    }

    const handleCancel = () => {
        const savedProfile = localStorage.getItem('vendorProfile')
        if (savedProfile) {
            setProfileData(JSON.parse(savedProfile))
            setIsEditing(false)
        }
    }

    const isProfileComplete = () => {
        return profileData.companyName && profileData.address &&
            profileData.phone && profileData.picName
    }

    return (
        <div className="vendor-profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div>
                        <h1>Profil Perusahaan</h1>
                        <p>Kelola informasi perusahaan dan data kontak Anda</p>
                    </div>
                    {!isEditing && (
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>
                            <Edit2 size={18} /> Edit Profil
                        </button>
                    )}
                </div>

                {!isProfileComplete() && !isEditing && (
                    <div className="warning-banner">
                        <span className="warning-icon">⚠️</span>
                        <div>
                            <strong>Profil Belum Lengkap</strong>
                            <p>Lengkapi profil perusahaan Anda untuk dapat mengajukan surat.</p>
                        </div>
                        <button className="btn-complete" onClick={() => setIsEditing(true)}>
                            Lengkapi Sekarang
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="profile-sections">
                        {/* Company Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <Building2 size={20} className="section-icon" />
                                <h2>Informasi Perusahaan</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group span-2">
                                    <label htmlFor="companyName">Nama Perusahaan <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={profileData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="PT. Nama Perusahaan"
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="companyType">Jenis Badan Usaha <span className="required">*</span></label>
                                    <select
                                        id="companyType"
                                        name="companyType"
                                        value={profileData.companyType}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    >
                                        <option value="PT">PT (Perseroan Terbatas)</option>
                                        <option value="CV">CV (Commanditaire Vennootschap)</option>
                                        <option value="Firma">Firma</option>
                                        <option value="UD">UD (Usaha Dagang)</option>
                                        <option value="Koperasi">Koperasi</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="established">Tahun Berdiri</label>
                                    <input
                                        type="number"
                                        id="established"
                                        name="established"
                                        value={profileData.established}
                                        onChange={handleInputChange}
                                        placeholder="2020"
                                        disabled={!isEditing}
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="npwp">NPWP</label>
                                    <input
                                        type="text"
                                        id="npwp"
                                        name="npwp"
                                        value={profileData.npwp}
                                        onChange={handleInputChange}
                                        placeholder="00.000.000.0-000.000"
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="siup">No. SIUP</label>
                                    <input
                                        type="text"
                                        id="siup"
                                        name="siup"
                                        value={profileData.siup}
                                        onChange={handleInputChange}
                                        placeholder="Nomor SIUP"
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Address Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <MapPin size={20} className="section-icon" />
                                <h2>Alamat Perusahaan</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group span-2">
                                    <label htmlFor="address">Alamat Lengkap <span className="required">*</span></label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleInputChange}
                                        placeholder="Jalan, Nomor, RT/RW, Kelurahan, Kecamatan"
                                        disabled={!isEditing}
                                        rows="3"
                                        required
                                        className="form-textarea"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="city">Kota/Kabupaten <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={profileData.city}
                                        onChange={handleInputChange}
                                        placeholder="Jakarta"
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="province">Provinsi <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="province"
                                        name="province"
                                        value={profileData.province}
                                        onChange={handleInputChange}
                                        placeholder="DKI Jakarta"
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="postalCode">Kode Pos</label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={profileData.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="12345"
                                        disabled={!isEditing}
                                        maxLength="5"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <Phone size={20} className="section-icon" />
                                <h2>Kontak Perusahaan</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="phone">Telepon <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleInputChange}
                                        placeholder="021-12345678"
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fax">Fax</label>
                                    <input
                                        type="tel"
                                        id="fax"
                                        name="fax"
                                        value={profileData.fax}
                                        onChange={handleInputChange}
                                        placeholder="021-12345679"
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group span-2">
                                    <label htmlFor="email">Email Perusahaan <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        placeholder="info@perusahaan.com"
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* PIC Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <User size={20} className="section-icon" />
                                <h2>Penanggung Jawab</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="picName">Nama Lengkap <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="picName"
                                        name="picName"
                                        value={profileData.picName}
                                        onChange={handleInputChange}
                                        placeholder="Budi Santoso"
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="picPosition">Jabatan</label>
                                    <input
                                        type="text"
                                        id="picPosition"
                                        name="picPosition"
                                        value={profileData.picPosition}
                                        onChange={handleInputChange}
                                        placeholder="Direktur"
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="picPhone">No. Telepon <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        id="picPhone"
                                        name="picPhone"
                                        value={profileData.picPhone}
                                        onChange={handleInputChange}
                                        placeholder="0812-3456-7890"
                                        disabled={!isEditing}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="picEmail">Email</label>
                                    <input
                                        type="email"
                                        id="picEmail"
                                        name="picEmail"
                                        value={profileData.picEmail}
                                        onChange={handleInputChange}
                                        placeholder="budi@perusahaan.com"
                                        disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                    {/* Form Actions */}
                    {isEditing && (
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={handleCancel}>
                                Batal
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default VendorProfile
