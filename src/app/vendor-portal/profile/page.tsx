'use client'
import { useState, useEffect } from 'react'
import { Building2, MapPin, Phone, User, Mail, Save, Edit2 } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import './VendorProfile.css'

function VendorProfile() {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [vendorId, setVendorId] = useState('')
    const [showIncompleteModal, setShowIncompleteModal] = useState(false)
    const [profileImage, setProfileImage] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)
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

    // Load data from Supabase based on logged-in vendor
    useEffect(() => {
        const loadVendorProfile = async () => {
            // Check if running in browser
            if (typeof window === 'undefined') return

            const vendorEmail = localStorage.getItem('vendorEmail')
            const vendorUserId = localStorage.getItem('vendorUserId')

            if (!vendorEmail || !vendorUserId) return

            try {
                // Fetch user data from vendor_users
                const { data: userData, error: userError } = await supabase
                    .from('vendor_users')
                    .select('id, email, profile_image')
                    .eq('id', parseInt(vendorUserId))
                    .single()

                if (userError) {
                    console.error('Error fetching user:', userError)
                    return
                }

                // Fetch vendor profile data
                const { data: vendorData, error: vendorError } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('user_id', parseInt(vendorUserId))
                    .single()

                if (vendorError) {
                    console.error('Error fetching vendor:', vendorError)
                    return
                }

                if (userData && vendorData) {
                    setVendorId(vendorData.id)
                    setProfileImage(userData.profile_image || '')
                    setProfileData({
                        companyName: vendorData.nama || '',
                        companyType: 'PT',
                        address: vendorData.alamat || '',
                        city: '',
                        province: '',
                        postalCode: '',
                        phone: vendorData.telepon || '',
                        fax: '',
                        email: userData.email || '',
                        picName: vendorData.kontak_person || '',
                        picPosition: '',
                        picPhone: vendorData.telepon || '',
                        picEmail: userData.email || '',
                        npwp: '',
                        siup: '',
                        tdp: '',
                        established: ''
                    })

                    // Update localStorage for header
                    localStorage.setItem('vendorProfile', JSON.stringify({
                        userId: userData.id,
                        vendorId: vendorData.id,
                        companyName: vendorData.nama,
                        picName: vendorData.kontak_person,
                        profileImage: userData.profile_image || ''
                    }))
                    window.dispatchEvent(new Event('profileUpdated'))

                    // Show incomplete modal if profile is not complete
                    if (!vendorData.nama || !vendorData.alamat || !vendorData.telepon || !vendorData.kontak_person) {
                        setShowIncompleteModal(true)
                    }
                }
            } catch (err) {
                console.error('Error loading vendor profile:', err)
            }
        }

        loadVendorProfile()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file maksimal 2MB')
            return
        }

        setUploadingImage(true)

        try {
            const vendorUserId = localStorage.getItem('vendorUserId')
            if (!vendorUserId) {
                throw new Error('Session expired. Silakan login ulang.')
            }

            // Create unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${vendorUserId}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`  // Simplified path

            console.log('Uploading file:', filePath)

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('vendor-profiles')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true  // Allow overwrite
                })

            if (uploadError) {
                console.error('Upload error details:', uploadError)
                if (uploadError.message.includes('not found')) {
                    throw new Error('Bucket "vendor-profiles" belum dibuat di Supabase Storage. Silakan buat bucket terlebih dahulu.')
                }
                throw uploadError
            }

            console.log('Upload success:', uploadData)

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('vendor-profiles')
                .getPublicUrl(filePath)

            console.log('Public URL:', publicUrl)

            // Update vendor_users table (not vendors table)
            const { error: updateError } = await supabase
                .from('vendor_users')
                .update({ profile_image: publicUrl })
                .eq('id', parseInt(vendorUserId))

            if (updateError) {
                console.error('Database update error:', updateError)
                throw updateError
            }

            // Update state and localStorage
            setProfileImage(publicUrl)
            const currentProfile = JSON.parse(localStorage.getItem('vendorProfile') || '{}')
            localStorage.setItem('vendorProfile', JSON.stringify({
                ...currentProfile,
                profileImage: publicUrl
            }))
            window.dispatchEvent(new Event('profileUpdated'))

            alert('Foto profil berhasil diupload!')
        } catch (err) {
            console.error('Error uploading image:', err)
            const errorMessage = err instanceof Error ? err.message : 'Gagal upload foto profil. Silakan coba lagi.'
            alert(errorMessage)
        } finally {
            setUploadingImage(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Update vendor data in Supabase
            const { error } = await supabase
                .from('vendors')
                .update({
                    nama: profileData.companyName,
                    alamat: profileData.address,
                    telepon: profileData.phone,
                    kontak_person: profileData.picName
                })
                .eq('id', vendorId)

            if (error) throw error

            // Update localStorage for header
            localStorage.setItem('vendorProfile', JSON.stringify({
                companyName: profileData.companyName,
                picName: profileData.picName
            }))

            // Trigger custom event to update header
            window.dispatchEvent(new Event('profileUpdated'))
            setLoading(false)
            setIsEditing(false)
            alert('Profil perusahaan berhasil disimpan!')
        } catch (err) {
            console.error('Error saving profile:', err)
            alert('Gagal menyimpan profil. Silakan coba lagi.')
            setLoading(false)
        }
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

                {/* Incomplete Profile Modal */}
                {showIncompleteModal && !isEditing && (
                    <div className="modal-overlay" onClick={() => setShowIncompleteModal(false)}>
                        <div className="incomplete-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-icon">
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="32" cy="32" r="32" fill="#FEF3C7" />
                                    <path d="M32 20V36M32 44H32.02" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Profil Belum Lengkap</h3>
                            <p>Lengkapi profil perusahaan Anda untuk dapat mengajukan surat.</p>
                            <div className="modal-buttons">
                                <button
                                    className="btn-complete-now"
                                    onClick={() => {
                                        setShowIncompleteModal(false)
                                        setIsEditing(true)
                                    }}
                                >
                                    Lengkapi Sekarang
                                </button>
                                <button
                                    className="btn-later"
                                    onClick={() => setShowIncompleteModal(false)}
                                >
                                    Nanti Saja
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="profile-form">
                    {/* Profile Image Upload */}
                    <div className="profile-image-section">
                        <div className="profile-image-container">
                            <div className="profile-image-wrapper">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="profile-image" />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="profile-image-info">
                                <h3>Foto Profil Perusahaan</h3>
                                <p>Upload foto atau logo perusahaan Anda</p>
                                <div className="profile-image-actions">
                                    <label htmlFor="profileImageInput" className="btn-upload-image">
                                        {uploadingImage ? 'Mengupload...' : 'Upload Foto'}
                                    </label>
                                    <input
                                        id="profileImageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        style={{ display: 'none' }}
                                    />
                                    {profileImage && (
                                        <button
                                            type="button"
                                            className="btn-remove-image"
                                            onClick={async () => {
                                                if (confirm('Hapus foto profil?')) {
                                                    try {
                                                        await supabase
                                                            .from('vendors')
                                                            .update({ profile_image: null })
                                                            .eq('id', vendorId)
                                                        setProfileImage('')
                                                        const currentProfile = JSON.parse(localStorage.getItem('vendorProfile') || '{}')
                                                        localStorage.setItem('vendorProfile', JSON.stringify({
                                                            ...currentProfile,
                                                            profileImage: ''
                                                        }))
                                                        window.dispatchEvent(new Event('profileUpdated'))
                                                    } catch (err) {
                                                        alert('Gagal menghapus foto')
                                                    }
                                                }
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                                <small>Format: JPG, PNG, WEBP. Maksimal 2MB</small>
                            </div>
                        </div>
                    </div>

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
                                        rows={3}
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
                                        maxLength={5}
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
            </div >
        </div >
    )
}

export default VendorProfile
